---
title: JSX
sidebar:
  order: 4
---

## Overview

Wallace uses JSX very differently to React, which can be confusing initially.

- **React** replaces JSX with code that yields virtual DOM during compilation, then *calls* these modified component functions at run time.
- **Wallace** replaces the entire function with a component definition generated from the instructions found in the JSX during compilation, then creates components from that definition at run time.

So a function with JSX is never executed, it is a static construct that is read during compilation. This means you can't blend JavaScript in it like you can with React:

```tsx
// React code - won't work in Wallace!
const CounterList = (counters) => (
  <div>
    {counters.length ? (
      counters.map(c => <Counter props={c} />)
    ) : (
      <div>No counters</div>
    )}
  </div>
);
```

Instead you use directives and special syntax:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
    <div if={!counters.length}>No counters</div>
  </div>
);
```

You loose some of the flexibility of React, but gain more power through directives, and often end up with neater and more compact JSX, particularly as you outsource logic to models.

## Rules

There are just two rules:

1. JSX is only allowed as the return value of a function which has nothing else in its body.
2. JSX may not contain JavaScript except inside expression, so long as it doesn't return further JSX.

Here are some examples of invalid code:

```tsx
// JSX is not inside a function:
const btn = <button onClick={count++}>{doubleCount}</button>;

// Function doesn't return the JSX expression:
const Counter = ({ count }) => {
  <div>
    <button onClick={count++}>{count}</button>
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

Remember that these functions never run, the only reason they must return the JSX is to help TypeScript.

Other than that it is regular JSX: you are allowed expressions inside elements, and as attribute values. And you are allowed comments as normal:

```tsx
const Counter = ({ count }) => (
  <div>
    {/* Expression inside an element: */}
    <span>Clicked {count} times</span>
    {/* Expression as attribute value: */}
    <button onClick={count++}>++</button>
  </div>
);
```

## Special syntax

There are just three special syntax cases.

### Nesting

You can nest a component so long as it is assigned to a capitalised variable:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList = (counters) => (
  <div>
    <Counter model={counters[0]} />
    <Counter model={counters[1]} />
  </div>
);
```

Note that Wallace components expect a model, whereas React expects props:

```tsx
// React code - won't work in Wallace!
const CounterList = (counters) => (
  <div>
    <Counter count={counters[0].count} />
  </div>
);
```

This is helpful as you can use other directives:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter model={counters[0]} />
    <Counter if={counters.length > 1} model={counters[1]} />
  </div>
);
```

The allowed directives are  `hub` , `if`, `model`, `part` and `ref`.

You may not use normal attributes, as this is not a real element:

```tsx
// Not allowed!
const CounterList = (counters) => (
  <div>
    <Counter id="counter1" model={counters[0]} />
    <Counter id={counters[1].id} model={counters[1]} />
  </div>
);
```

Instead you would specify normal attributes in the `Counter` component.

### Repeating

You can repeat nested components by adding `repeat` to the component name:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
  </div>
);
```

The same general rules and restrictions apply as with nesting single components, except that a different set of directives is allowed:  `hub` , `key`, `models` and`part`.

### Stubs

You may nest and repeat [stubs](/docs/reference/stubs) just like regular components:

```tsx
const CounterList = (counters, { stub }) => (
  <div>
    <stub.counter model={counters[0]} />
    <stub.counter.repeat models={counters} />
  </div>
);

CounterList.stub.counter = Counter;
```

You don't need to use `stub` in the [xargs](/docs/reference/xargs) - it just helps for type support.

## Code completion

Wallace offers "best effort" code completion support in JSX through its exported types, but it isn't perfect. In fact, getting TypeScript plus JSX to support code that it doesn't know will be compiled into something different was one of the trickiest parts of the library.

The imperfections are survivable. In some cases code completion will appear to allow a directive, yet the compiler throws an error. Naturally, the compiler has the last word.

