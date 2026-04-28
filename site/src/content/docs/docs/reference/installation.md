---
title: Installation
sidebar:
  order: 1
---

## Overview

Wallace is not a library you can import directly into your page like [jQuery](https://jquery.com/). Instead you write code in ES6/JSX modules which your transpile (transform and compile) using a bundler such as [WebPack](https://webpack.js.org/), [Vite](https://vite.dev/) or similar to produce a bundle which the browser can read.

Wallace has two parts.

1. A babel plugin which transforms your JSX files.
2. A library which contains:
   1. Functions used by the transformed code.
   2. Functions you can import into your code.

You will need [Node](https://nodejs.org/en) version 18 or above.

## Quick start

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

See [flags](/docs/reference/flags) and custom [directives](/docs/reference/directives).

## Samples

Below are example configurations for Webpack and Vite based on the following directory structure:

```
index.html
package.json
babel.config.js
tsconfig.json
src/
  index.tsx
```

Where **ts.config.json** might look like this:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "moduleResolution": "node",
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.spec.ts"]
}
```

If using another bundler you'll need to adapt accordingly, paying attention to the points mentioned above.

### Webpack

Script tag in **index.html**:

```html
<script src="index.js"></script>
```

Relevant pieces of **package.json**:

```json
{
  "scripts": {
    "build-prod": "NODE_ENV=production webpack",
    "build-dev": "NODE_ENV=development webpack",
    "start": "webpack serve",
  },
  "devDependencies": {
    "@babel/cli": "^7.25.9",
    "@babel/preset-env": "^7.22.14",
    "@babel/preset-typescript": "^7.28.5",
    "babel-loader": "^9.1.3",
    "webpack": "^5.88.2",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "wallace": "0.18.0"
  }
}
```

The **webpack.config.js** file:

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

Script tag in **index.html**:

```html
<script type="module" src="src/index.js"></script>
```

Relevant pieces of **package.json**:

```json
{   
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@babel/cli": "^7.25.9",
    "@babel/preset-env": "^7.22.14",
    "@babel/preset-typescript": "^7.25.7",
    "vite": "^6.4.2",
    "vite-plugin-babel": "^1.6.0",
    "wallace": "0.18.0",
  }
}
```

The **vite.config.ts** file:

```js
import { defineConfig } from "vite";
import path from "path";
import babel from "vite-plugin-babel";

export default defineConfig(({ mode }) => ({
  plugins: [
    babel({
      babelConfig: {
        babelrc: true,
        configFile: true,
      },
      filter: (id: string) => {
        return id.includes("/src/") || id.includes("/node_modules/wallace/");
      },
    }),
  ],

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },

  build: {
    outDir: "dist",
    sourcemap: mode !== "production",
    minify: mode === "production",
    rollupOptions: {
      input: path.resolve(__dirname, "src/index.tsx"),
      output: {
        entryFileNames: "index.js",
      },
    },
  },

  optimizeDeps: {
    include: ["wallace"],
  },
}));
```



