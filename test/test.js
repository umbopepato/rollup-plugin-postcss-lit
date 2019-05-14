import postcssLit from '../index';
import postcss from 'rollup-plugin-postcss';
import * as rollup from 'rollup';
import assert from 'assert';

const expectedCode = `
import {css as css$1} from 'lit-element';

export var css$1\`.test {
    color: white;
    background: url("./prova.jpg");
}\`
`;

describe('rollup-plugin-postcss-lit', () => {
    it('should wrap an exported style string in the css template literal tag', async () => {
        const bundle = await rollup.rollup({
            input: 'test/entry.js',
            plugins: [
                postcss({
                    inject: false,
                    namedExports: true,
                }),
                postcssLit(),
            ],
        });
        const result = await bundle.generate({format: 'es'});
        assert(result.output[0].code, expectedCode);
    });
});
