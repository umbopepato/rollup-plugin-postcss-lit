import {createFilter} from 'rollup-pluginutils';

export interface PostcssLitOptions {
    include: string | string[];
    exclude: string | string[];
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
            let result = 'import {css as cssTag} from \'lit-element\';\n';
            result += code.replace(/"((?:\\"|.)*)"/g, 'cssTag`$1`');
            return {
                code: result,
                map: {
                    mappings: '',
                },
            };
        }
    };
};
