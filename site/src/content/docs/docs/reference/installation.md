---
title: Installation
sidebar:
  order: 1
---

## Prerequisites

You will need [node](https://nodejs.org/en) version 18 or above, which should come with npm and npx commands.

## Create a new project

To create an empty project use the `create-wallace-app` script, which you can run without manually installing it using the [npx](https://docs.npmjs.com/cli/v8/commands/npx) command:

```
npx create-wallace-app
```

You will be asked to choose between TypeScript or JavaScript. If you select TypeScript you can still use JavaScript files, so that is the recommended option.

The new project will have some feature flags set in the **babel.config.cjs** so check that these are what you want. See [configuration](/docs/reference/configuration) for more details.

## Add to existing project

To install into an existing project run:

```
npm i wallace -D
```

This also installs a compatible version of `babel-plugin-wallace` which you need to add to your Babel plugins. These may be set in your **babel.config.cjs**, **.babelrc.json** or bundler (e.g. **webpack.config.js**) 

The [configuration](/docs/reference/configuration) section advises you on which file is best, and additional flags you may want to set.

