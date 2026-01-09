---
title: Installation
sidebar:
  order: 1
---

There are several ways to start a project.

## Empty local project

Create an empty project on your machine with this script:

```
npx create-wallace-app
```

You will be given a choice of TypeScript or JavaScript. We highly recommend TypeScript, even if you plan to use JavaScript.

Note: use this instead of npm.

## Stackblitz

[StackBlitz](https://stackblitz.com) lets you try Wallace in the browser without installing anything on your machine. You can choose:

- Click counter in [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx)
- Click counter in [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)

Stackblitz sometimes fails to load for its own reasons, so this is perhaps not the most reliable method. Additionally the way it renders markdown tooltips isn't great. 

However it is a great way to test out Wallace, and you can always download the project and transition to working locally.

## Clone an example

The Wallace github repository contains some [examples](https://github.com/wallace-js/wallace/tree/master/examples) which all have a [StackBlitz](https://stackblitz.com) link in their README so you can play around online, then download a fully working project.

## Add to existing project

To install into an existing project run:

```
npm i wallace -D
```

This also installs `babel-plugin-wallace` which you need to add to your **babel.config.cjs** or equivalent like so:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
};
```

Then configure your bundler to apply those to jsx/tsx files. 

Here is an example **webpack.config,js**:

```js
const path = require("path");

const config = {
  entry: "./src/index.tsx",
  devServer: {
    static: "./",
    hot: true,
    historyApiFallback: true
  },
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
        /*
        Ensures we process the wallace package, but not others
        in node_modules.
        Note that this will not take effect if your babel config
        is in package.json or .babelrc - it must be in here or in
        babel.config.cjs, and the latter is better as it allows
        you to inspect files by running them through 
        `npx babel` in the terminal.
        */
        exclude: /node_modules\/(?!(wallace)\/).*/,
        use: [
          {
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

 As the comments state, the reason for putting the plugins in **babel.config.cjs** is that these will be picked up when running `babel` as a command, which allows you to see what your transformed code looks like in case you run into issues:

```
npx babel src/index.tsx
```
