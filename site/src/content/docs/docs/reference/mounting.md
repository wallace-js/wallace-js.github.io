---
title: Mounting*
sidebar:
  order: 8
---

## Overview

DOM elements start life in a detached state, and don't affect the document until they are mounted to it:

```js
const root = document.createElement("div");
root.appendChild(document.createElement("span"));
root.appendChild(document.createElement("span"));

const target = document.getElementById("main");
// mount root as last child of target
target.appendChild(root);
```

Mounting an element also attaches its nested elements (which form a tree) to the document.

The same applies to the tree of elements created by nesting components, whose root node must be mounted to the document:

```tsx
import { mount } from "wallace";

const Counter = ({ count }) => <button>{count}</button>;
const root = mount("app", Counter, { count: 0 });
```

The first argument can be an element ID or an `HTMLElement`. The target element is replaced, so attributes on the target (including its ID) are not copied to the component's root element. The returned value is the root component instance.

The arguments are, in order:

1. The target element or its ID.
2. The component definition.
3. The model (optional).
4. The hub (optional).

The model and hub are separate values. To provide a hub without a model, pass `null` for the model:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);
```

## mount

The `mount` function

You mount the root component of your tree using `mount`:

```tsx
import { createComponent } from "wallace";

const counter = createComponent(Counter, { count: 0 });
document.body.appendChild(counter.el);
```

Use this when another part of the application controls where the component is inserted. For ordinary root components, prefer `mount`.

## Multiple roots

Each call to `mount` creates an independent component tree. You can mount multiple components into different target elements. Nested component trees are managed by their parent component; mount only the root of each tree.
