---
title : Introduction
sidebar:
  order: 0
---

Welcome to Wallace documentation. This page covers a few things you need to know before diving in.

## Prerequisites

Wallace is a front end framework which uses ES6, JSX and Babel, and plays a lot nicer if you use TypeScript. Let's look at these terms one by one and the prerequisites they entail.

### Front end

Wallace is used for front end development (runs on the browser, not the server) which makes it comparable to Angular, React, Svelte etc...

You will need a separate tool for the back end.

##### Prerequisites

A basic understanding of HTML, CSS, JavaScript and general web development.

### ES6

Wallace makes use of several ES6 (aka "modern JavaScript") syntax features, such as argument destructuring:

```tsx
import { mount } from 'wallace';

const Greeting = ({ name, msg }) => (
  <h1>
    {name} says {msg}!
  </h1>
);

mount('main', Greeting, {name: 'Wallace', msg: 'Hello'});
```

> This is a working example which will replace the element with id "main" with the h1 tag.

##### Prerequisites

If you haven't used JavaScript in the last decade, you'll need to brush up (you can use this guide on [w3chools](https://www.w3schools.com/js/js_es6.asp)).

### JSX

Wallace uses JSX, but differently to React. Unfortunately the [w3schools](https://www.w3schools.com/react/react_jsx.asp) (and just about every other) guide to JSX focuses exclusively on JSX in the context of React, which is neither accurate or helpful for our purposes.

Fortunately, JSX is so easy, and IDE support so universal that it doesn't require much explanation.

##### Prerequisites

Remembering that Wallace has its own JSX rules, and if you try to use it like React you will get an error.

This is all covered in the section on [JSX](/docs/jsx).

### Babel

[Babel](https://babeljs.io/) is a tool which transpiles (transforms + compiles) code from one syntax to another using plugins. Wallace supplies such a plugin which replaces JSX with generated JavaScript code which is central to making everything work.

This means you can't just load wallace on your page via a script tag, you need to build the bundle first using a bundler such as [webpack](https://webpack.js.org/) which runs your files through Babel before gluing them together in a bundle which you can import with a script tag.

This is all covered in the next section: [installation](/docs/installation).

##### Prerequisites

A modern version of [node](https://nodejs.org/en) (20+ is recommended, but a few versions back will likely still work).

### TypeScript

Wallace doesn't need [TypeScript](https://www.typescriptlang.org/), but you will have a far nicer time if you use it. TypeScript only inspects files with the appropriate extensions (ts/tsx) meaning you can bring it into a project gradually. So you could use it for your component definitions and use plain ES6 elsewhere if you wanted.

Here is the above example using TypeScript to control the type:

```tsx
import { mount, Uses } from 'wallace';

interface iGreeting {
  msg: string;
  name: string;
}

const Greeting: Uses<iGreeting> = ({ name, msg }) => (
  <h1>
    {name} says {msg}!
  </h1>
);

mount('main', Greeting, {
  name: 'Wallace',
  message: 'Hello' // << TypeScript warning here 
});
```

##### Prerequisites

None, but we recommend reading the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

## Getting help
