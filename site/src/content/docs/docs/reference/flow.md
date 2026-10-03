---
title: Flow*
sidebar:
  order: 7
---

## Overview

This section covers how the methods and properties interact, as this is integral to how you do things in Wallace, especially with regards to reactivity.





Which actually just saves the argument as `this.model` then calls `update`, meaning you can subsequently bypass `render` and just modify the model in place then call `update`:

```tsx
component.model.count ++;
component.update();
```

This may seem trivial, but it 

### Normal

Let's look at what happens without any reactive behaviour:

```tsx
import { mount } from 'wallace';

const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const data = { count: 0 };
const root = mount('main', Counter, data);
```

The `mount` function creates an instance of `Counter` and calls its `render` method passing the model argument given to `mount` (the object stored as variable `data`) then replaces the element with id `"main"` with the instance's DOM.

The `render` method called `set` which saves the model as `this.model` - here are these two methods again:

```tsx
function render (model, hub) {
  this.set(model, hub);
  this.update();
}

function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

So `this.model` and `data` are the same object:

```tsx
root.model === data; // true
```

So as well as updating the component like this:

```tsx
data.count ++;
root.render(data);
```

We can also update it like this:

```tsx
data.count ++;
root.update();
```

Which is the same as doing this:

```tsx
root.model.count ++;
root.update();
```



It is perfectly acceptable for components and hubs to modify models like this. But what you should *not* do is assign to the `model` field.

```tsx
// Don't do this
root.model = {count: 2};
root.update();
```

Although you can do this, it breaks if the component becomes reactive.

### Reactive

If we add `watch` like so:

```tsx
const Counter = ({ count }) => (
  <div watch>
    <button onClick={count++}>{count}</button>
  </div>
);
```

It modifies `set` to look like this:

```tsx
import { watch } from 'wallace';

function set (model, hub) {
  this.model = watch(model, () => this.update());
  this.hub = hub;
}
```

The `watch` function returns a proxy which calls `this.update` when it is modified, so we don't need to call `update` ourselves:

```tsx
root.model.count ++;
// root.update()  -- no longer required
```

But the proxy is not the exact same object:

```tsx
root.model === data; // false
```

So if we overwrite `model` like this

```tsx
// Don't do this
root.model = {count: 2};
```

Then we'd loose its reactive behaviour. You can however use either `render` or `set` which would create a new proxy:

```
root.render({count: 2});
root.set({count: 2});
```







# DDD

```tsx
import { mount } from 'wallace';

const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList = (counters) => (
  <div>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <Counter.repeat models={counters} />
  </div>
);

const data = [{ count: 0 }, { count: 0 }];

// 1st pass
const root = mount('main', CounterList, data);

// 2nd pass
data.unshift({count: 1});
root.update();
```

Let's go though what actually happens.

### 1st pass

##### mount

The `mount` function creates an instance of `CounterList`, calls its `render` method (passing `data` as its model) and attaches its DOM (the `el` property) to the DOM. We then save that instance as `root` as we'll be using it again.

##### render

When `render` got called inside `mount` it received the array we called `data` as its `model` arguments, then called `set` which saved that array as `this.model`, and finally called `update` - here are these two methods again:

```tsx
function render (model, hub) {
  this.set(model, hub);
  this.update();
}

function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

So `this.model` and `data` are the same object for the root component:

```tsx
root.model === data; // true
```

##### update

During `update` the component iterates through its dynamic elements:

- The total calculation.
- The repeated `Counter` declaration.

Repeated components are handled using an internal "repeater" object which creates component instances, calls their `render` passing an element from the array as their model, and attaches their DOM to the correct position.

In this case one instances of `Counter` is created for each element in the array. So if we somehow got access to the first `Counter` and saved it as `FirstCounter` then the following would be true:

```tsx
FirstCounter.model === data[0]; // true
```

At this point the UI displays two counters, but isn't reactive as we're not watching any data.

### 2nd pass

For the 2nd pass we insert new counter at the start of the array and update the root component:

```tsx
data.unshift({count: 1});
root.update();
```

As `data` and `root.model` are the exact same object, `root.model` now contains 3 elements.

As before the `update` method updates the total and instructs the repeater to `patch`, passing the array back in (it doesn't care that it is the same object).

The repeater is a sequential repeater, meaning it reuses its previous instances sequentially:

| Element | Data       | Component  | Change |
| ------- | ---------- | ---------- | ------ |
| data[0] | {count: 1} | 0 (reused) | Yes    |
| data[1] | {count: 0} | 1 (reused) | No     |
| data[2] | {count: 0} | 2 (new)    | Yes    |

Each Counter instance gets a new model passed into its `render` method, which assigns it to its `model` field during `set`. 

During `update` the DOM will only be updated if it has to:

1. The first component updates its DOM as the `count` changed from 0 to 1.
2. The second component doesn't change. Even though the model it receives is a different object, the count of that object is also 0 so no DOM gets updated.
3. The third component updates its DOM as this is its first render.



# TMP

 Review flow.



This updates the UI to display three counters, but it's important to understand what happened.

Firstly `data` and `root.model` point to the same object in memory, which is the array that now has three elements.

We then called `root.update` which will update the total, and then instruct the repeater to run its patch operation, which in this case recycles component instances sequentially. 

```tsx
{count: 1} // recycle component 0
{count: 0} // recycle component 1
{count: 0} // create new component
```

Component 0 previously displayed count 0 and will now be updated to display count of 1.

Note that we updated `root` without calling `render` - just `root.update` - in fact `root.render` only gets called once in its lifetime. However, calling `root.update` results in calls to `render` on all the nested `Counter` components.

Of course we could have called `render` passing the same object back in:

```
data.push({count: 1});
root.render(data);
```

But the point is that we can avoid doing this, which means the `render` method of higher level components only gets called at predictable points, and this lets us use it to set things up for the current life span.