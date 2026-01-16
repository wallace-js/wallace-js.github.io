---
title : Prerequisites
sidebar:
  order: 1
---

> Wallace is a front-end framework which uses ES6, JSX and Babel, and plays well with TypeScript.

If you're comfortable with all the terms used in that sentence, you can skip ahead to the [next section](/docs/guide/setup). If not, let's go through them and the prerequisites they entail.

### Front end framework

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

This is all covered in the next section: [setup](/docs/guide/setup).

##### Prerequisites

You don't need to understand how Babel or bundlers work, just that you need them for it to work.

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

None as it is optional, but we recommend reading the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).