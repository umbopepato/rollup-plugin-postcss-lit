import {createFilter} from '@rollup/pluginutils';
import {Plugin} from 'rollup';
import * as transformAst from 'transform-ast';

export interface PostcssLitOptions {
  include?: string | string[];
  exclude?: string | string[];
}

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
      let defaultExportName;
      const magicString = transformAst(code, {ast: ast},
        node => {
          if (node.type === 'ExportDefaultDeclaration') {
            defaultExportName = node.declaration.name;
          }
        },
      );
      if (!defaultExportName) {
        this.error('Default export not found');
      }
      magicString.walk(node => {
        if (node.type === 'VariableDeclaration') {
          const exportedVar = node.declarations.find(d => d.id.name === defaultExportName);
          if (exportedVar) {
            exportedVar.init.edit.update(`cssTag\`${exportedVar.init.value}\``);
          }
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
