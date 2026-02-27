---
title: "Components"
sidebar:
  order: 5
---

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

### 1.1 Defining

You define a component by assigning a JSX function to a value:

```tsx
const MyComponent = () => <div>Hello</div>;
```

The function body must be a single JSX expression, returned, and nothing else.

The function takes two arguments, both optional:

1. **props** - which *may* be destructured.
2. **xargs** - which *must* be destructured to exactly one level, as shown:

```tsx
const MyComponent = ({title}, {ctrl, event}) => (
  <button onClick={ctrl.doSomething(event)}>
    {title}
  </button>
);
```

The **xargs** contains:

- `ctrl` refers to the controller.
- `props` refers to the props, in case you want the non-destructured version too.
- `self` refers to the component instance (as `this` is not allowed).
- `event` refers to the event in an event callback.
- `element` refers to the element in an event callback, or in `apply`.

The function will be replaced by a very different one during compilation, therefore:

1. Do not call it from your own code.
2. Do not do weird things with it or within it.
