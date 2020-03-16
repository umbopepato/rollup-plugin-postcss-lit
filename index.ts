import {createFilter} from 'rollup-pluginutils';
import MagicString from 'magic-string';
import {Plugin} from 'rollup';

export interface PostcssLitOptions {
    include?: string | string[];
    exclude?: string | string[];
}

export default function postcssLit(options: PostcssLitOptions = {
    include: '**/*.{css,sss,pcss}',
    exclude: null,
}): Plugin {
    const filter = createFilter(options.include, options.exclude);
    return {
        name: 'postcss-lit',
        transform(code, id) {
            if (!filter(id)) return;
            const exportNameMatch = /^export +default +([^\s;]+)/gm.exec(code);
            if (!exportNameMatch) return;
            const exportName = exportNameMatch[1];
            const pattern = new RegExp(`^var +${exportName}.+?"((?:\\"|.)*)"`, 'g');
            const magicString = new MagicString(code);
            magicString.prepend('import {css as cssTag} from \'lit-element\';\n');
            let match;
            if ((match = pattern.exec(code))) {
                const start = match.index;
                const end = start + match[0].length;
                magicString.overwrite(start, end, `var ${exportName} = cssTag\`${match[1]}\``);
            }
            return {
                code: magicString.toString(),
                map: magicString.generateMap({
                    hires: true,
                }),
            };
        }
    };
};
