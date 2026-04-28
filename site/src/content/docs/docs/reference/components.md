---
title: "Components"
sidebar:
  order: 6
---

## Overview

A component is an object which manages its own section of the DOM. It is built from a component definition, or you could say it is an instance of a component class. The term component is often used interchangeably to refer to component definitions and component instances.

You define a component as a function which returns JSX, and usually assign it to a variable:

```tsx
const Greeting = ({ name }) => (
  <div>Hello {name}</div>
);
```

The entire function (including arguments) is replaced with a completely different function during compilation, which can then be used to create component instances:

```tsx
const component = new Greeting();
```

These objects are called components, and they control the DOM through methods that come from the prototype, like `render`:

```tsx
component.render({ count: 99 });
```

This is mostly hidden from view, 

This is mostly hidden from view, but it's important to understand what is happening. 

This is different to React, which only has component definitions.

## Component definitions

Component functions must follow a specific format. Bear in mind that these functions are completely replaced during compilation, so they aren't real, and neither are their parameters.

### Parameters

The function may specify 2 parameters, both of which are optional:

- `model` - the data object passed into the component. This may be destructured.
- `xargs` - various extras you might find useful. This _must_ be destructured. See the [xargs](/docs/reference/xargs) page for specifics.

Only one level of destructuring is supported, and you may not rename parameters. All of the following are valid:

```tsx
// No args
const Counter = () => <div>...</div>;

// Model only
const Counter = ( model ) => <div>...</div>;

// Model with different name
const Counter = ( user ) => <div>...</div>;

// Model destructured
const Counter = ({ name, age }) => <div>...</div>;

// Model and xargs
const Counter = (model, { self, hub }) => <div>...</div>;

// Xargs but no model
const Counter = (_, { self, hub }) => <div>...</div>;
```

But the following are not:

```tsx
// Xargs is not destructured
const Counter = (model, xargs) => <div>...</div>;

// More than 2 args
const Counter = (model, { self, hub }, whatever) => <div>...</div>;

// Destructured to more than one level
const Counter = ({ user: {name, age} }) => <div>...</div>;

// Parameter renamed
const Counter = ({userName: name, age}) => <div>...</div>;
```

### Body

The body of the function must be a single JSX expression, returned, and nothing else. All of the following are valid:

```tsx
const Greeting = ({ name }) => (
  <div>Hello {name}</div>
);

const Greeting = ({ name }) => {
  return <div>Hello {name}</div>
};

const Greeting = function ({ name }) {
  return <div>Hello {name}</div>
};
```

But the following are not:

```tsx
const Greeting = ({ name }) => {
  const name = name.toUpperCase();
  return <div>Hello {name}</div>
};

const Greeting = ({ name }) => (
  name ? <div>Hello {name}</div> : <div>No name</div>
);
```

Remember these are not real functions, and returning the JSX is really just to help TypeScript.

## Component instances

The generated function will be used to create objects with `new`:

```tsx
const component = new Counter();
```

This is generally hidden from view, but it is important you realise this is what happens as you will be interacting with components and their properties, and also need to be mindful of how they are reused.

### Properties

Component instances have several of their own properties and "inherit" several more from their prototype, which are predominantly functions which you can treat as methods.

If you're unclear about all this, read our [prototypes](/docs/misc/prototypes) page which explains it at just the detail you need.

#### Own

##### el

##### model

##### hub

##### part

##### ref

#### Prototype

##### render

##### update

##### set

##### base

#### Internal

Component have several properties which consist of an undersore and single letter (`_o`, `_w`, `_q` etc...) which are used internally. You are strongly advised not to access these, and not to add any properties to components using that format.

#### Custom

You are allowed to add properties to a component instance:

```tsx
component.total = calculateTotal();
```

But that is generally not recommended as components are reused, so you're best saving such properties on the model.

If you must save properties on the component instance you should ensure it is reset during `render`, `set` or `update` as appropriate:

```tsx
Counter.prototype.update = function () {
  this.total = calculateTotal();
  this.base.update.call();
}
```

### Reuse



Mention lifecycle too.



The function will be replaced by a very different one during compilation, therefore:

1. Do not call it from your own code.
2. Do not do weird things with it or within it.





Wallace controls the DOM with components, which you define as functions that return JSX:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);
```

During compilation the Babel plugin replaces such functions with generated functions which are used as constructors to create objects:

```tsx
const component = new Counter();
```

These objects (called component _instances_ or just _components_) have methods, like `render` which updates its DOM instantly:

```tsx
component.render({ count: 99 });
console.log(component.el); // <div><button>99</button></div>
```

You won't see anything on the page as `el` is not attached to the document.

Note that the function you see in your source code no longer exists at run time, so it never _runs_. It is just a placeholder for JSX, which gets _parsed_ during compilation. The function may only contain one JSX expression, and nothing else.

## Methods
