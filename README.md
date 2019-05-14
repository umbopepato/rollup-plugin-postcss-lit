# Rollup plugin postcss lit

A Rollup plugin to load postcss processed stylesheets in LitElement components

## Install

```bash
$ npm i -D rollup-plugin-postcss-lit
```

## Usage

Add the `postcssLit` plugin _after_ `postcss`. This wraps postcss exported style strings with LitElement's `css`
template literal tag. 

```ecmascript 6
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
      inject: false,
    }),
    postcssLit(),
  ],
}
```

Enjoy postcss processed styles in your LitElement components!

```typescript
import {customElement, LitElement} from 'lit-element';
import myStyles from './styles.css';

@customElement('my-component')
export class MyComponent extends LitElement {
    
    static styles = [myStyles];
    
    render() {
        // ...
    }
}
```

## Options

The plugin accepts the following options:

```ecmascript 6
postcssLit({
  // A glob (or array of globs) of files to include.
  // By default this corresponds to the default extensions
  // handled by postcss ('**/*.{css,sss,pcss}'). Make sure
  // to set this if want to load other extensions such as
  // .scss, .less etc.
  include,
  // A glob (or array of globs) of files to exclude.
  // Default: undefined
  exclude,
}),
```

### License

This project is licensed under the MIT License, see [LICENSE](./LICENSE) file for details. 
