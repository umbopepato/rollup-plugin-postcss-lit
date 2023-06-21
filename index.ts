import {createFilter} from '@rollup/pluginutils';
import * as transformAst from 'transform-ast';
import {PluginOption} from 'vite';

interface PostcssLitOptions {
  /**
   * A glob (or array of globs) of files to include
   *
   * @default: '**&#47;*.{css,sss,pcss,styl,stylus,sass,scss,less}?(*)'
   */
  include?: string | string[];

  /**
   * A glob (or array of globs) of files to exclude
   *
   * The default filter is used to prevent `<style>` HTML tags from being processed in Vite contexts
   * @default '**&#47;*\?direct*'
   */
  exclude?: string | string[];

  /**
   * A string denoting the name of the package from which to import the `css`
   * template tag function. For lit-element this can be changed to 'lit-element'
   *
   * @default 'lit'
   */
  importPackage?: string;
}

const escape = (str: string): string => str
  .replace(/`/g, '\\`')
  .replace(/\\(?!`)/g, '\\\\');

export = function postcssLit(options: PostcssLitOptions = {}): PluginOption {
  const defaultOptions: PostcssLitOptions = {
    include: '**/*.{css,sss,pcss,styl,stylus,sass,scss,less}?(*)',
    exclude: '**/*\?direct*',
    importPackage: 'lit',
  };

  const opts: PostcssLitOptions = {...defaultOptions, ...options};
  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'postcss-lit',
    enforce: 'post',
    transform(code, id) {
      if (!filter(id)) return;
      const ast = this.parse(code, {});
      // export default const css;
      let defaultExportName;

      // export default '...';
      let isDeclarationLiteral = false;
      const magicString = transformAst(code, {ast: ast},
        node => {
          if (node.type === 'ExportDefaultDeclaration') {
            defaultExportName = node.declaration.name;

            isDeclarationLiteral = node.declaration.type === 'Literal';
          }
        },
      );

      if (!defaultExportName && !isDeclarationLiteral) {
        return;
      }
      magicString.walk(node => {
        if (defaultExportName && node.type === 'VariableDeclaration') {
          const exportedVar = node.declarations.find(d => d.id.name === defaultExportName);
          if (exportedVar) {
            exportedVar.init.edit.update(`cssTag\`${escape(exportedVar.init.value)}\``);
          }
        }

        if (isDeclarationLiteral && node.type === 'ExportDefaultDeclaration') {
          node.declaration.edit.update(`cssTag\`${escape(node.declaration.value)}\``)
        }
      });
      magicString.prepend(`import {css as cssTag} from '${opts.importPackage}';\n`);
      return {
        code: magicString.toString(),
        map: magicString.generateMap({
          hires: true,
        }),
      };
    },
  };
};
