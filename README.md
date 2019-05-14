# Rollup plugin postcss lit

A Rollup plugin to load postcss processed stylesheets in LitElement components

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
      inject: false, // Injecting is not necessary if you only need to
                     // import styles in LitElement components
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

The plugin accepts the following options:

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
  exclude,
}),
```

## When should I use this?

This plugin is meant to be used with [`rollup-plugin-postcss`](https://github.com/egoist/rollup-plugin-postcss).
If you only need to load plain css files in your LitElement components,
consider using [`rollup-plugin-lit-css`](https://github.com/bennypowers/rollup-plugin-lit-css).

### License

This project is licensed under the MIT License, see [LICENSE](./LICENSE) file for details. 
