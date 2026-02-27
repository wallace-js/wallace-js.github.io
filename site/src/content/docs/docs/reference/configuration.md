---
title: Configuration
sidebar:
  order: 2
---

You'll need to configure Babel, your bundler and Wallace itself.

## Babel configuration

Your project needs a bundler (such as [webpack](https://webpack.js.org/)) to transform and compile your code, and you need to tell the bundler which Babel plugins to use.

The best place to specify your plugins is in a **babel.config.cjs** file at the root of your project, which needs the following plugins:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
};
```

Note that plugin order matters - see [Babel plugin docs](https://babeljs.io/docs/plugins).

The advantage of putting your plugins in this file is that it gets picked up by things other than your bundler, such as your test runner. It also allows you to run `babel` directly over a file, which can be useful for debugging more serious issues:

```
npx babel src/index.tsx
```

Note that Babel transforms individual files, it doesn't process imports or bundle them.

You should be able to tell your bundler to read from your **babel.config.cjs** to avoid duplication, which will just cause pain.

## Bundler configuration

You need to configure your bundler to:

1. Load the plugins.
2. Apply them to:
   1. Source files which contain component definitions.
   2. The source files in the wallace library, which will be in your **node_modules**, however, you should not apply them to other files in **node_modules**.
3. Display useful source maps.

How you do this is specific to your bundler. Here is an example **webpack.config.js**:

```js
const path = require("path");

const config = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(wallace)\/).*/,
        use: [
          {
            // loads from webpack.config.js
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
};

module.exports = function () {
  config.mode = process.env.NODE_ENV || "development";
  if (config.mode === "production") {
    config.optimization = {
      minimize: true,
    };
  } else {
    config.devtool = "eval-source-map";
    // alternative
    // config.devtool = "inline-source-map";
  }
  return config;
};
```

If using different bundler such as [vite](https://vite.dev/) or [parcel](https://parceljs.org/) then you will need to adjust accordingly.

## Wallace configuration

### Feature flags

You can shave a few bytes off your bundle, or get a very small performance boost by disabling features you don't use. Wallace is tiny and insanely fast as it is, and the gains are really small, so this is only something you need special cases.

If you load the plugin without options:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
};
```

All features flags are will be **enabled**, as this is what you want most of the time. But if you specify `flags` in the plugin options:

```js
module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {},
      },
    ],
    "@babel/plugin-syntax-jsx",
  ],
};
```

Then they are all **disabled** unless you add them back in:

```js
module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {
          allowCtrl: true,
          allowStubs: false,
        },
      },
    ],
    "@babel/plugin-syntax-jsx",
  ],
};
```

Notes:

- Disabling features doesn't affect the type system (and therefore tool tips) which will always show these features to be available.
- Where possible, you will receive a compiler error if you attempt to use a feature which you disabled.

List of feature flags:

#### allowBase

Adds the `base` property to components:

```js
Counter.prototype.render = function (props) {
  this.base.render.call(this, props);
};
```

Note that `base` is not the same as `super` which is used in classes.

#### allowCtrl

Enables the `ctrl` property in components, so that the `render` method looks like this:

```js
function render(props, ctrl) {
  this.props = propsl;
  this.ctrl = ctrl;
  this.update();
}
```

Helper functions which forward `props` to `render` (such as `mount` and `createComponent`) now forward `ctrl` as well:

```js
mount(element, def, props, ctrl);
createComponent(def, props, ctrl);
```

#### allowMethods

Add the `methods` property to component definitions:

```js
Counter.methods = {
  render(props) {
    this.base.render.call(this, props);
  },
  doSomething() {
    console.log("something");
  },
};
```

You can always create or override methods via the prototype:

```js
Counter.prototype.render = function (props) {
  this.base.render.call(this, props);
};
Counter.prototype.doSomething = function (props) {
  console.log("something");
};
```

#### allowParts

Allows you to declare parts in a component:

```jsx
const CounterList () => (
  <div>
    <div part:stats>Total: {total}</div>
    <div>
      <Counter.repeat props={counters} />
    </div>
  </div>
);
```

#### allowRepeaterSiblings

Allows you to place a repeater under a node with other children:

```jsx
const CounterList ({ total, counters }) => (
  <div>
    <div>Total: {total}</div>
    <Counter.repeat props={counters} />
  </div>
);
```

Otherwise you;d need to place it under another node on its own:

```jsx
const CounterList ({ total, counters }) => (
  <div>
    <div>Total: {total}</div>
    <div>
      <Counter.repeat props={counters} />
    </div>
  </div>
);
```

#### allowStubs

Enables the use of stubs:

```jsx
const CounterList () => (
  <div>
    <stub.stats />
    <stub.counters />
  </div>
);
```

### Directives

You can overwrite or add new directives in the configuration:

```js
const { MyCustomDirective } = require("./src/directives.js");

module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {},
        directives: [MyCustomDirective],
      },
    ],
    "@babel/plugin-syntax-jsx",
  ],
};
```

See [Custom Directives](/docs/reference/directives#custom-directives) for more details.
