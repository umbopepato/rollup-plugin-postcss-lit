import {createFilter} from '@rollup/pluginutils';
import {Plugin} from 'rollup';
import * as transformAst from 'transform-ast';

export interface PostcssLitOptions {
  include?: string | string[];
  exclude?: string | string[];
}

const escape = (str: string): string => str
  .replace(/`/g, '\\`')
  .replace(/\\(?!`)/g, '\\\\');

export default function postcssLit(options: PostcssLitOptions = {
  include: '**/*.{css,sss,pcss,styl,stylus,sass,scss,less}',
  exclude: null,
}): Plugin {
  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'postcss-lit',
    transform(code, id) {
      if (!filter(id)) return;
      const ast = this.parse(code, {});
      // export default const css;
      let defaultExportName;

      // export default '...';
      let isDeclarationLiteral = false;
      const magicString = transformAst(code, {ast: ast},
        node => {
          console.log (node.type);
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
      magicString.prepend('import {css as cssTag} from \'lit-element\';\n');
      return {
        code: magicString.toString(),
        map: magicString.generateMap({
          hires: true,
        }),
      };
    },
  };
};
