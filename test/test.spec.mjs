import {readFileSync} from 'fs';
import postcss from 'rollup-plugin-postcss';
import * as rollup from 'rollup';
import {CSSResult} from 'lit';
import {strict as assert} from 'assert';
import postcssLit from '../dist/index.js';

const cssFile = './test/test.css';
const entry = './test/entry.mjs';
const readFile = (path) => readFileSync(path, 'utf-8');

describe('rollup-plugin-postcss-lit', () => {
    it('should wrap an exported style string in the css template literal tag', async () => {
        const outFile = 'out.mjs';
        const cssText = readFile(cssFile);
        await renderFile(entry, `./test/${outFile}`,[
            postcss({
                inject: false,
            }),
            postcssLit(),
        ]);
        const litStyle = await import(`./${outFile}`).then(m => m.default);
        assert.ok(litStyle instanceof CSSResult);
        assert.equal(litStyle.cssText, cssText);

        const outFileText = readFile(`./test/${outFile}`);
        const hasLitImport = outFileText.includes(`from 'lit';`);
        assert.ok(hasLitImport);
    });

    it('should wrap a default export literal', async () => {
        const outFile = 'out-literal.mjs';
        const intermediateFile = 'test-literal.mjs';
        await renderFile('./test/entry-literal.mjs', `./test/${outFile}`,[
            postcssLit({ include: `**/${intermediateFile}` }),
        ]);
        const cssText = await import(`./${intermediateFile}`).then(m => m.default);
        const litStyle = await import(`./${outFile}`).then(m => m.default);
        assert.ok(litStyle instanceof CSSResult);
        assert.equal(litStyle.cssText, cssText);
    });

    it('can accept a different import package', async () => {
        const outFile = './test/out-import.mjs';
        await renderFile(entry, outFile,[
            postcss({
                inject: false,
            }),
            postcssLit({
                importPackage: 'lit-element',
            }),
        ]);

        const outFileText = readFile(outFile);
        const hasLitElementImport = outFileText.includes(`from 'lit-element';`);
        assert.ok(hasLitElementImport);
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
