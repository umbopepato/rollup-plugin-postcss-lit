import 'jsdom-global/register';
import postcss from 'rollup-plugin-postcss';
import * as rollup from 'rollup';
import {CSSResult} from 'lit-element';
import * as fs from 'fs';
import {strict as assert} from 'assert';
import postcssLit from '../dist';

describe('rollup-plugin-postcss-lit', () => {
    it('should wrap an exported style string in the css template literal tag', async () => {
        const outFile = './test/out.js';
        const cssText = fs.readFileSync('./test/test.css', 'UTF-8');
        await renderFile('./test/entry.js', outFile,[
            postcss({
                inject: false,
            }),
            postcssLit(),
        ]);
        const litStyle = await import('./out').then(m => m.default);
        assert.ok(litStyle instanceof CSSResult);
        assert.equal(litStyle.cssText, cssText);
    });
});

const renderFile = async (inFile, outFile, plugins) => {
    const bundle = await rollup.rollup({
        input: inFile,
        plugins,
    });
    await bundle.write({
        file: outFile,
        format: 'es',
    });
};
