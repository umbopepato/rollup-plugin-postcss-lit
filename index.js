export default function postcssLit(options = {
    include: /\.css|\.sss|\.pcss|\.sass|\.scss$/i,
    exclude: null,
}) {
    return {
        name: 'postcss-lit',
        transform(code, filename) {
            if (filename.match(options.include) && !filename.match(options.exclude)) {
                let result = 'import {css as cssTag} from \'lit-element\';\n';
                result += code.replace(/"((?:\\"|.)*)"/g, 'cssTag`$1`');
                return result;
            }
            return null;
        }
    };
};
