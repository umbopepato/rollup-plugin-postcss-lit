export default function postcssLit(options = {
    include: /\.css|\.sss|\.pcss|\.sass|\.scss$/i,
    exclude: null,
}) {
    return {
        name: 'postcss-lit',
        transform(code, filename) {
            return null;
        }
    };
};
