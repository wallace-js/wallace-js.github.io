---
title: Installation
sidebar:
  order: 1
---

## Overview

Wallace source files need to be transformed and compiled using a bundler such as [webpack](https://webpack.js.org/), [vite](https://vite.dev/) or [parcel](https://parceljs.org/) which runs each files through Babel, which uses plugins to transform the syntax.

Wallace supplies its own plugin, which requires [node](https://nodejs.org/en) version 18 or above.

## Easy

The easy way to get started is with the `create-wallace-app` script, which you can run directly with the [npx](https://docs.npmjs.com/cli/v8/commands/npx) command (no additional installation needed):

```
npx create-wallace-app
```

You will be asked to choose between TypeScript or JavaScript. If you select TypeScript you can still use JavaScript files, so that is the recommended option.

## Manual

### Installation

Install with:

```
npm i wallace -D
```

This also installs a compatible version of `babel-plugin-wallace` which you must instruct Babel to use.

Bear in mind Wallace is pre-alpha, meaning the API can break at any time, so you are advised to lock a version and check all release notes before upgrading.

### Babel plugins

Although your bundler likely lets you configure Babel within its own configuration file, it is better to do this in **babel.config.cjs** at the root of your project and load that from the bundler.

All you need in **babel.config.cjs** is this:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
};
```

And if using TypeScript:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
  presets: ["@babel/preset-typescript"],
};
```

Note that plugin order matters - see [Babel plugin docs](https://babeljs.io/docs/plugins).

The advantage of using **babel.config.cjs** is that this file gets picked up by more than just your bundler. A test runner will likely detect it, as will the raw `babel` command, which lets you check the generated code for a given file, which can be useful for debugging:

```
npx babel src/index.tsx
```

Bear in mind that Babel transforms syntax on individual files, it has no awareness of what is in other files.

### Coverage

You *must* run the following files through Babel:

1. All source files in your project that contain Wallace code.
2. All source files in the wallace library itself.
3. All source files in the third party wallace libraries.

Although the plugin primarily transforms JSX code, it is not sufficient to target **jsx/tsx** files, for two reasons:

1. The plugin also modifies `extendComponent`.
2. Libraries (including Wallace) must put JSX code in js files.

How you do this is specific to your bundler. Here is an example for **webpack.config.js**:

```js
module: {
  rules: [
    {
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules\/(?!(wallace)\/).*/,
      use: [
        {
          // loads from babel.config.js
          loader: "babel-loader",
        },
      ],
    },
  ],
}
```

### Stack traces

Lastly you generally want to see stack traces point to your source code, not the generated code, although that can also be useful. 

How you do this is specific to your bundler. Here are some options for **webpack.config.js**:

```js
config.devtool = "eval-source-map";
config.devtool = "inline-source-map";
```

### Wallace configuration

Wallace's plugin has some configuration options, which you set by passing an array instead of a string, whose second argument is an object:

```js
module.exports = {
  plugins: [
    ["babel-plugin-wallace", {}],
    "@babel/plugin-syntax-jsx"
  ]
};
```

See [flags](/docs/ref/flags) and custom [directives](/docs/ref/directives).

## Examples

### Webpack

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
            // loads from babel.config.js
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

### Vite

To be added.

### Parcel

To be added.
