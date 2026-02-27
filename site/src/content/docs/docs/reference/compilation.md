---
title: Compilation
sidebar:
  order: 5
---

Wallace uses a custom Babel plugin which looks for functions that return JSX, like this:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);
```

And replaces them with component definitions generated from the JSX, which equate to something like this:

```tsx
function Counter () {
  // generated code
};
Counter.prototype = {
  // generated code
};
```

> The actual generated code doesn't look like this, but produces the same structure.

These functions are used internally to create objects like this:

```tsx
const component = new Counter();
```

These objects are called components, and they control the DOM through methods that come from the prototype, like `render`:

```tsx
component.render({ count: 99 });
```

You don't usually create components manually like this yourself, but it's vital you understand that components are ordinary JavaScript objects.

This differs from React and similar functional frameworks where "component" really means "component definition" but there are no actual component objects you can work with.

## Rules

For the plugin to work, the code must follow a few rules.

### JSX rules

There are two rule concerning JSX:

- JSX is only allowed in functions which contain (and return) a single JSX expression and nothing else.
- No JavaScript is allowed in the function body, except in JSX placeholders, so long as it doesn't return further JSX.

Note that the original function with JSX is completely replaced, and therefore never runs. It is just a placeholder for a JSX expression enclosed in a scope with the variables it will need. The JSX only needs to be returned for TypeScript reasons. 

Here are some examples of invalid code:

```tsx
// JSX is not inside a function:
const btn = <button onClick={count++}>{doubleCount}</button>;

// Function does not actually return the JSX expression:
const Counter = ({ count }) => {
  <div>
    <button onClick={count++}>{doubleCount}</button>
  </div>
};

// JavaScript found outside of JSX expressions:
const Counter = ({ count }) => (
  const doubleCount = count * 2;
  <div>
    <button onClick={count++}>{doubleCount}</button>
  </div>
);

// JavaScript within JSX expression but returns JSX:
const Counter = ({ count }) => {
  <div>
    <button onClick={count++}>{count}</button>
    {count > 3 && <div>Warning</div>}
  </div>
};
```

If you're used to React you might be wondering how you get anything done with these restrictions, but don't worry. The coming sections will explain this.

### Parameter rules

The function may specify 2 parameters, both of which are optional:

- `props` - the data passed into the component.
- `xargs` - provides access to extras you might need, such as:
  - A reference to the component instance (`self` as `this` isn't allowed in arrow functions)
  - A reference to the controller (`ctrl`)

If `xargs` is used, it must be the 2nd argument, and must be destructured. So all of the following are valid:

```tsx
const Counter = () => (
  <div>...</div>
);

const Counter = (props, { self, ctrl }) => (
  <div>...</div>
);

const Counter = ({ name }, { self, ctrl }) => (
  <div>...</div>
);

const Counter = (_, { self, ctrl }) => (
  <div>...</div>
);
```

But the following are not valid:

```tsx
// xargs must be destructured
const Counter = (_, xargs) => (
  <div>...</div>
);

// Only 2 args allowed
const Counter = (props, { self, ctrl }, whatever) => (
  <div>...</div>
);
```

Note the use of `_` when `props` are not used, but `xargs` is.
