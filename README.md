# Rollup plugin postcss lit

Rollup plugin to load PostCSSed stylesheets in LitElement components

![Node.js CI](https://github.com/umbopepato/rollup-plugin-postcss-lit/workflows/Node.js%20CI/badge.svg)
[![Npm release](https://img.shields.io/npm/v/rollup-plugin-postcss-lit.svg)](https://npmjs.org/package/rollup-plugin-postcss-lit)
[![MIT License](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)

## Install

```bash
$ npm i -D rollup-plugin-postcss-lit
```

## Usage

Add `postcssLit` plugin _after_ `postcss`. This wraps PostCSSed styles in Lit's `css`
template literal tag, so you can import them directly in your components.

```javascript
// rollup.config.js
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';

export default {
  input: 'entry.js',
  output: {
    // ...
  },
  plugins: [
    postcss({
      // ...
    }),
    postcssLit(),
  ],
}
```

Add PostCSSed stylesheets to your LitElement components:

```typescript
import {LitElement, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import myStyles from './styles.css';
import otherStyles from './other-styles.scss';

@customElement('my-component')
export class MyComponent extends LitElement {

  // Add a single style
  static styles = myStyles;

  // Or more!
  static styles = [myStyles, otherStyles, css`
    .foo {
      color: ${...};
    }
  `];

  render() {
    // ...
  }
}
```

<details>
<summary>JS version</summary>

```javascript
import {LitElement, css} from 'lit';
import myStyles from './styles.css';
import otherStyles from './other-styles.scss';

export class MyComponent extends LitElement {

  // Add a single style
  static get styles() {
    return myStyles;
  }

  // Or more!
  static get styles() {
    return [myStyles, otherStyles, css`
      .foo {
        color: ${...};
      }
    `];
  }

  render() {
    // ...
  }
}

customElements.define('my-component', MyComponent);
```

</details>

### Usage with lit-element

If you're using the `lit-element` package, set the [`importPackage` option](#options) accordingly:

```javascript
// rollup.config.js
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';

export default {
  input: 'entry.js',
  output: {
    // ...
  },
  plugins: [
    postcss({
      // ...
    }),
    postcssLit({
      importPackage: 'lit-element',
    }),
  ],
}
```

### Usage with Vite

This plugin is pre-configured to work with Vite, just add it to `plugins` and your styles will be Lit-ified ✨

```javascript
// vite.config.js/ts
import postcssLit from 'rollup-plugin-postcss-lit';

export default {
  plugins: [
    postcssLit(),
  ],
};
```

## Options

```javascript
postcssLit({

  // A glob (or array of globs) of files to include.
  // Default: **/*.{css,sss,pcss,styl,stylus,sass,scss,less}
  include: ...,

  // A glob (or array of globs) of files to exclude.
  // Default: null
  exclude: ...,

  // A string denoting the name of the package from which to import the `css`
  // template tag function. For lit-element this can be changed to 'lit-element'
  // Default: 'lit'
  importPackage: ...,
}),
```

## PostCSS plugin setup

`rollup-plugin-postcss` injects all the imported stylesheets in `<head>` by default: this causes an unnecessary style
duplication if you're using the default [ShadowDOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
-based style encapsulation in your Lit components. Unless you're using
[Light DOM](https://lit.dev/docs/components/shadow-dom/#implementing-createrenderroot),
consider disabling the `inject` option:

```javascript
// rollup.config.js

export default {
  ...
  plugins: [
    postcss({
      inject: false,
    }),
    postcssLit(),
  ],
};
```

> ℹ️ This does not apply to Vite, see [#40](https://github.com/umbopepato/rollup-plugin-postcss-lit/issues/40).

## When should I use it?

This plugin is meant to be used with [`rollup-plugin-postcss`](https://github.com/egoist/rollup-plugin-postcss).
If you only need to load plain css files in your LitElement components,
consider using [`rollup-plugin-lit-css`](https://github.com/bennypowers/rollup-plugin-lit-css).

### Contributors

<a href="https://github.com/umbopepato/rollup-plugin-postcss-lit/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=umbopepato/rollup-plugin-postcss-lit" height="40"/>
</a>


### License

This project is licensed under the MIT License, see [LICENSE](./LICENSE) for details.
