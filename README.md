# Rollup plugin postcss lit

Rollup plugin to load postcss processed stylesheets in LitElement components

![](https://img.shields.io/npm/v/rollup-plugin-postcss-lit.svg)
![](https://github.com/umbopepato/rollup-plugin-postcss-lit/workflows/Node.js%20CI/badge.svg)

## Install

```bash
$ npm i -D rollup-plugin-postcss-lit
```

## Usage

Add the `postcssLit` plugin _after_ `postcss`. This wraps postcss exported style strings with LitElement's `css`
template literal tag so you can import them directly in your components. 

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

Enjoy postcss processed styles in your LitElement components!

```typescript
import {customElement, LitElement, css} from 'lit-element';
import myStyles from './styles.css';
import otherStyles from './other-styles.scss';

@customElement('my-component')
export class MyComponent extends LitElement {
  
  // Add a single style
  static styles = myStyles;
  
  // Or more!
  static styles = [myStyles, otherStyles, css`
    .foo {
      padding: ${...};
    }
  `];
  
  render() {
      // ...
  }
}
```

## Options

```javascript
postcssLit({
  // A glob (or array of globs) of files to include.
  // By default this corresponds to the default extensions
  // handled by postcss ('**/*.{css,sss,pcss}'). Make sure
  // to set this if you want to load other extensions
  // such as .scss, .less etc.
  include: '**/*.{css,scss}',
  // A glob (or array of globs) of files to exclude.
  // Default: undefined
  exclude: ...,
}),
```

## When should I use it?

This plugin is meant to be used with [`rollup-plugin-postcss`](https://github.com/egoist/rollup-plugin-postcss).
If you only need to load plain css files in your LitElement components,
consider using [`rollup-plugin-lit-css`](https://github.com/bennypowers/rollup-plugin-lit-css).

## Contributors

Many thanks to:

[@ThatJoeMoore](https://github.com/ThatJoeMoore)

👍

### License

This project is licensed under the MIT License, see [LICENSE](./LICENSE) file for details. 
