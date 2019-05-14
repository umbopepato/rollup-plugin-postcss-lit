import postcssLit from '../index';
import postcss from 'rollup-plugin-postcss';
import * as rollup from 'rollup';
import assert from 'assert';

describe('rollup-plugin-postcss-lit', function() {
    it('should intercept stylesheets', function () {
        return rollup.rollup({
            input: 'test/entry.js',
            plugins: [
                postcss({
                    inject: false,
                    namedExports: true,
                }),
                postcssLit(),
            ],
        }).then(value => {
            console.log('Value\n', value);
        });
    });
});
