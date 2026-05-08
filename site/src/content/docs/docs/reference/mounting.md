---
title: Mounting*
sidebar:
  order: 8
---

## Overview

DOM elements start life in a detached state, and don't affect the document until they are mounted to it:

```js
const root = document.createElement('div');
root.appendChild(document.createElement('span'));
root.appendChild(document.createElement('span'));

const target = document.getElementById('main');
// mount root as last child of target
target.appendChild(root)
```

Mounting an element also attaches its nested elements (which form a tree) to the document.

The same applies to the tree of elements created by nesting components, whose root node must be mounted to the document:

```tsx
const root = new CounterList();
const target = document.getElementById('main');
target.appendChild(el);
```

However we usually 





Components create their own tree of elements, 

Components create their own DOM tree



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
const root = mount("root", MyComponent, model, hub);
```

The arguments are:

1. Element or id string.
2. Component definition.
3. model (optional)
4. hub (optional)

`mount` returns the component instance, allowing you to call its methods:

```tsx
root.update();
```

You may mount as many 

Every tree is separate



## Manual
