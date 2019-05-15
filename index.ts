import {createFilter} from 'rollup-pluginutils';
import MagicString from 'magic-string';

export interface PostcssLitOptions {
    include?: string | string[];
    exclude?: string | string[];
}

export default function postcssLit(options: PostcssLitOptions = {
    include: '**/*.{css,sss,pcss}',
    exclude: null,
}) {
    const filter = createFilter(options.include, options.exclude);
    return {
        name: 'postcss-lit',
        transform(code, id) {
            if (!filter(id)) return;
            const pattern = /"((?:\\"|.)*)"/g;
            const magicString = new MagicString(code);
            magicString.prepend('import {css as cssTag} from \'lit-element\';\n');
            let match;
            while ((match = pattern.exec(code))) {
                const start = match.index;
                const end = start + match[0].length;
                magicString.overwrite(start, end, `cssTag\`${match[1]}\``);
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
