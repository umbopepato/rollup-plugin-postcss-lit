import virtual from '@rollup/plugin-virtual';
import { strict as assert } from 'assert';
import { readFileSync, rmSync } from 'fs';
import { globSync } from 'glob';
import { CSSResult } from 'lit';
import * as rollup from 'rollup';
import postcss from 'rollup-plugin-postcss';
import postcssLit from '../dist/index.js';

const cssFile = './test/test.css';
const entry = './test/entry.mjs';
const readFile = path => readFileSync(path, 'utf-8');

describe('rollup-plugin-postcss-lit', () => {
  it('should wrap an exported style string in the css template literal tag', async () => {
    const outFile = 'out.mjs';
    const cssText = readFile(cssFile);
    await renderFile(entry, `./test/${outFile}`, [
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

  it('should support different export expressions', async () => {
    for (const intermediateFile of globSync('./intermediate-?(*).mjs', {
      cwd: './test',
    })) {
      const outFile = intermediateFile.replace('intermediate', 'out');
      const input = 'virtual-entry.mjs';
      const bundle = await rollup.rollup({
        input,
        plugins: [
          virtual({
            [input]: `import test from './test/${intermediateFile}'; export default test;`,
          }),
          postcssLit({ include: `**/${intermediateFile}` }),
        ],
      });
      await bundle.write({
        file: `./test/${outFile}`,
        format: 'es',
      });
      const cssText = await import(`./${intermediateFile}`).then(
        m => m.default,
      );
      const litStyle = await import(`./${outFile}`).then(m => m.default);
      assert.ok(litStyle instanceof CSSResult);
      assert.equal(litStyle.cssText, cssText);
    }
  });

  it('should wrap Vite asset expressions in double quotes', async () => {
    const intermediateFile = 'vite-assets.mjs';
    const outFile = 'out-vite-assets.mjs';
    const input = 'virtual-entry.mjs';
    const bundle = await rollup.rollup({
      input,
      plugins: [
        virtual({
          [input]: `import test from './test/${intermediateFile}'; export default test;`,
        }),
        postcssLit({ include: `**/${intermediateFile}` }),
      ],
    });
    await bundle.write({
      file: `./test/${outFile}`,
      format: 'es',
    });
    const litStyle = await import(`./${outFile}`).then(m => m.default);
    assert.ok(litStyle instanceof CSSResult);
    const buildOutput = readFile(`./test/${outFile}`);
    assert.ok(buildOutput.includes('${unsafeCSS("__VITE_ASSET__12345678__")}'));
  });

  it('should accept a different import package', async () => {
    const outFile = './test/out-import.mjs';
    await renderFile(entry, outFile, [
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

  after(() => {
    globSync('./test/out*').forEach(f => rmSync(f));
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
