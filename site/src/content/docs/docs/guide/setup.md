---
title : Set up
sidebar:
  order: 2
---

There are several ways to start a project.

## Work locally

You will need [node](https://nodejs.org/en) version 18 or above, and a suitable editor like [vscode](https://code.visualstudio.com/).

To create an empty project use the `create-wallace-app` script, which you can run without manual installation using the [npx](https://docs.npmjs.com/cli/v8/commands/npx) command which should come with node:

```
npx create-wallace-app
```

You will be asked to choose between TypeScript or JavaScript. If you select TypeScript you can still use JavaScript files, so that is the recommended option.

Alternatively see [installation](/docs/reference/installation) instructions for adding to an existing project.

## Work online

[StackBlitz](https://stackblitz.com) lets you run node projects in the browser without installing anything on your machine. Wallace has starter projects for [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) and [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).

#### Pros

1. No installation required.
2. Can share with others.
3. Can transition to local development by downloading the project.

#### Cons

1. Stackblitz sometimes fails to load for its own reasons.
2. Stackblitz doesn't render markdown tool tips that well.

## Clone an example

There are also several [examples](https://github.com/wallace-js/wallace/tree/master/examples) which have a [StackBlitz](https://stackblitz.com) link in their README so you can play around online, then download a fully working project.
