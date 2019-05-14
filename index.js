import {createFilter} from 'rollup-pluginutils';

export default function postcssLit(options = {
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
