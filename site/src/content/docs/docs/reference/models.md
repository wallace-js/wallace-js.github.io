---
title: Models*
sidebar:
  order: 13
---

## What is a model?

A model is the value passed to a component when it is rendered. It can be any JavaScript value, although objects and arrays are the usual choices. A model is not a bag of JSX attributes: a component receives one model value.

Pass a model to a root component as the third argument to `mount`:

```tsx
const Counter = ({ count }) => <button>{count}</button>;

const root = mount("app", Counter, { count: 0 });
```

For a nested component, use `model`:

```tsx
const CounterList = (counters) => (
  <ul>
    <Counter model={counters[0]} />
  </ul>
);
```

The component instance stores the current value on `model`. When the instance is rendered again, Wallace sets the new model before updating its DOM. Repeated components receive one item from the `models` array each time they are rendered.

## Setting

Although you access it as a parameter, this code is compiled, and you really access it on the compomenent.

mounting

Render then set...

Don't set directly, but you can modify in place then update.

Note about reuse.

## Linking

Show assign.

## Functionality

setters

encapsulate
