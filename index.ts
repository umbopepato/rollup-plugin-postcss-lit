import { createFilter } from '@rollup/pluginutils';
import type {
  ArrowFunctionExpression,
  Identifier,
  Literal,
  Node,
  TemplateLiteral,
} from 'estree';
import * as transformAst from 'transform-ast';
import { PluginOption } from 'vite';

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
   * @default '**&#47;*?direct*'
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

const CSS_TAG_ALIAS = 'cssTag';
const UNSAFE_CSS_TAG_ALIAS = 'unsafeCssTag';
const VITE_ASSET_URL_EXPRESSION =
  /__VITE_ASSET__([a-z\d]{8})__(?:\$_(.*?)__)?/g;

const escape = (str: string): string =>
  wrapViteAssetExpressions(
    str.replace(/`/g, '\\`').replace(/\\(?!`)/g, '\\\\'),
  );

const wrapViteAssetExpressions = (str: string) =>
  str.replace(
    VITE_ASSET_URL_EXPRESSION,
    `$\{${UNSAFE_CSS_TAG_ALIAS}("__VITE_ASSET__$1__$2")}`,
  );

export = function postcssLit(options: PostcssLitOptions = {}): PluginOption {
  const defaultOptions: PostcssLitOptions = {
    include: '**/*.{css,sss,pcss,styl,stylus,sass,scss,less}?(*)',
    exclude: '**/*?direct*',
    importPackage: 'lit',
  };

  const opts: PostcssLitOptions = { ...defaultOptions, ...options };
  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'postcss-lit',
    enforce: 'post',
    transform(code, id) {
      if (!filter(id)) return;
      const ast = this.parse(code, {});

      let defaultExportName: string;
      let cssStringNode: Literal | TemplateLiteral;
      const magicString = transformAst(code, { ast: ast });

      magicString.walk((node: Node) => {
        if (node.type === 'ExportDefaultDeclaration') {
          switch (node.declaration.type) {
            case 'Literal': // export default '...';
            case 'TemplateLiteral': // export default `...`;
              cssStringNode = node.declaration;
              break;
            case 'Identifier': // const css = '...'; export default css;
              defaultExportName = node.declaration.name;
              break;
            case 'CallExpression': {
              // export default (() => '...')();
              const arrowFunctionBody = (
                node.declaration.callee as ArrowFunctionExpression
              ).body;
              if (
                arrowFunctionBody.type === 'Literal' ||
                arrowFunctionBody.type === 'TemplateLiteral'
              ) {
                cssStringNode = arrowFunctionBody;
              }
              break;
            }
            default:
          }
        }
      });

      if (!cssStringNode) {
        if (!defaultExportName) {
          this.warn(`Unrecognized default export in file ${id}`);
          return;
        }
        magicString.walk((node: Node) => {
          if (node.type === 'VariableDeclaration') {
            const exportedVar = node.declarations.find(
              d =>
                (d.id as Identifier)?.name === defaultExportName &&
                (d.init?.type === 'Literal' ||
                  d.init?.type === 'TemplateLiteral'),
            );
            if (exportedVar) {
              cssStringNode = exportedVar.init as typeof cssStringNode;
            }
          }
        });
      }

      if (!cssStringNode) {
        return this.error(`Unrecognized export expression in file ${id}`);
      }

      if (cssStringNode.type === 'Literal') {
        cssStringNode.edit.update(
          `${CSS_TAG_ALIAS}\`${escape(cssStringNode.value as string)}\``,
        );
      } else {
        cssStringNode.edit.update(
          wrapViteAssetExpressions(cssStringNode.getSource()),
        );
        cssStringNode.edit.prepend(CSS_TAG_ALIAS);
      }

      magicString.prepend(
        `import {css as ${CSS_TAG_ALIAS}, unsafeCSS as ${UNSAFE_CSS_TAG_ALIAS}} from '${opts.importPackage}';\n`,
      );

      return {
        code: magicString.toString(),
        map: magicString.generateMap({
          hires: true,
        }),
      };
    },
  };
};
