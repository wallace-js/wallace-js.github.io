---
title: Configuration
sidebar:
  order: 2
---

You'll need to configure Babel, your bundler and Wallace itslef.

## Babel configuration

Your project needs a bundler (such as [webpack](https://webpack.js.org/)) to transform and compile your code, and you need to tell the bundler which Babel plugins to use.

The best place to specify your plugins is in a **babel.config.cjs** file at the root of your project, which needs the following plugins:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"]
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
    filename: "index.js"
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(wallace)\/).*/,
        use: [
          {
            // loads from webpack.config.js
            loader: "babel-loader"
          }
        ]
      }
    ]
  }
};

module.exports = function () {
  config.mode = process.env.NODE_ENV || "development";
  if (config.mode === "production") {
    config.optimization = {
      minimize: true
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

Certain features you may wish to use need to be enabled with flags in the `babel-plugin-wallace` options:

```js
module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {
          useControllers: true,
          useMethods: true,
          useStubs: true
        }
      }
    ],
    "@babel/plugin-syntax-jsx"
  ],
};
```

Note that:

1. Flags default to false if not set.
2. The types (and therefore tool tips) are unaffected by these flags, and will treat them all as being true, and will therefore potentially lie.

Our recommendation is to enable them all, and only remove them if you absolutely need to trim those extra bytes off your bundle or milliseconds off performance.

#### useControllers

Enables use of `ctrl` in components. If disabled, components will neither have the `ctrl` property, nor receive it in `render` or pass it to nested components.

#### useMethods

Enables the use of `Component.methods = {...}` which is a safer way to add things to the prototype.

####  useStubs

Enables the use of stubs.

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
        directives: [MyCustomDirective]
      }
    ],
    "@babel/plugin-syntax-jsx"
  ],
};
```

See the [Custom Directives](/docs/reference/custom-directives) for more details.