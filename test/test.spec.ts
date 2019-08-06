import postcssLit from '../index';
import * as postcss from 'rollup-plugin-postcss';
import * as rollup from 'rollup';
import * as assert from 'assert';

describe('rollup-plugin-postcss-lit', () => {
    it('should wrap an exported style string in the css template literal tag', async () => {
        const actual = await renderFile('test/entry.js', [
            postcss({
                inject: false,
            }),
            postcssLit(),
        ]);
        // expected.js contains a semantically-equivalent version of entry.js
        const expected = await renderFile('test/expected.js', []);
        assert.equal(actual, expected);
    });
});

async function renderFile(file, plugins) {
    const bundle = await rollup.rollup({
        input: file,
        plugins
    });
    const result = await bundle.generate({ format: 'es' });
    return result.output[0].code;
}
