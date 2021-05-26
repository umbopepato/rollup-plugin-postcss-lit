import {createFilter} from '@rollup/pluginutils';
import * as transformAst from 'transform-ast';
import {PluginOption} from 'vite';

export interface PostcssLitOptions {
  include?: string | string[];
  exclude?: string | string[];
  importPackage?: string;
}

const escape = (str: string): string => str
  .replace(/`/g, '\\`')
  .replace(/\\(?!`)/g, '\\\\');

export default function postcssLit(options: PostcssLitOptions = {}): PluginOption {
  const defaultOptions = {
    include: '**/*.{css,sss,pcss,styl,stylus,sass,scss,less}',
    exclude: null,
    importPackage: 'lit-element'
  };

  const opts = {...defaultOptions, ...options};
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
