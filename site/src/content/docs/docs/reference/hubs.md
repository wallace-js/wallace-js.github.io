---
title: Hubs
sidebar:
  order: 14
---

## Overview

The `render` method accepts an optional second argument after `model` called `hub`:

```tsx
function render (model, hub) {
  this.set(model, hub);
  this.update();
}
```

It gets saved on the component instance during `set` just like `model`:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

What makes `hub` special is that it is automatically propagated to nested components, meaning the whole tree from that point down shares the same `hub` object, which is why we call it a hub, as it connects distant components.

Although you can set any object as a component's hub, you'd typically use a custom object with methods, getters and setters built from a class.

## Usage

### Setting

All functions which accept the `model` argument (such as `mount`, `render`, `set`, `createComponent`) also accepts an optional `hub` argument right after it:

```tsx
mount('main', CounterList, model, hub);
const c = createComponent(CounterList, model, hub);
c.render(model, hub);
```

A component pass its own hub every time it calls `render` on its nested components, which it does during `update` thereby propagating it down the tree, until a different hub is set.

For example if you have component tree `App > CounterList > Counter` with a hub passed to `App`:

```tsx
mount('main', App, null, new AppHub());
```

Then the following code would overwrite `hub` for the `CounterList` and consequently for its nested `Counters`:

```tsx
CounterList.methods = {
  render (model, parentHub) {
    this.set(model, new CounterListHub(this, parentHub));
    this.update();
  }
};
```

> It is common to give the lower level hub a reference to the parent hub as well as the component.

You can also specify a hub when nesting or repeating components:

```tsx
const CounterList = (counters, { self }) => (
  <div>
    <Counter.repeat models={counters} hub={self.otherHub} />
  </div>
);

CounterList.methods = {
  render (model, parentHub) {
    this.otherHub = new OtherHub(this);
    this.set(model, parentHub);
    this.update();
  }
};
```

In this case the `CounterList` would have a different hub to its nested `Counter` components.

### Accessing

Component definitions access their `hub` through their xargs:

```tsx
const CounterList = (counters, { hub }) => (
  <div>
    <button onClick={hub.addCounter()} >
      Add Counter
    </button>
    <Counter.repeat models={counters} />
  </div>
);
```

In methods or elsewhere the hub is accessed as the `hub` property on the instance. Note that assigning to `hub` doesn't instantly propagate it to nested components, this happens when you call `update` which then calls `render` on nested components.

### Annotation

Components annotate the shape of the hub they accept with `Takes` or `Uses` - the latter being useful when the component doesn't use a model:

```tsx
import type { Takes, Uses } from 'wallace';

interface Hub {
  addCounter(): void;
}

interface CounterModel {
  count: number;
}

const CounterList: Takes<CounterModel[], Hub> = (counters, { hub }) => (
  <div></div>
);

const CounterListAlt: Uses<{hub: Hub}> = (_, { hub }) => (
   <div></div>
);
```

Note that you don't need to define an interface if the hub is a class, as classes implicitly define their own interface:

```tsx
import type { Uses } from 'wallace';

const CounterList: Uses<{hub: Hub}> = (_, { hub }) => (
   <div></div>
);

class Hub {
  addCounter() {
    /*...*/
  }
}
```

### Linking

A hub often requires a reference to one or more components so it can update them. This is easily done when instantiating the hub inside `render` as shown above, but if the hub is instantiated before being passed to the component:

```tsx
mount('main', CounterList, model, new Hub());
```

Then you must set assign the component to it, which you can either do during `render`:

```tsx
CounterList.methods = {
  render (model, hub) {
    hub.root = this;
    this.set(model, hub);
    this.update();
  }
};
```

Or using the `assign` directive:

```tsx
const CounterList = (counters, { hub }) => (
  <div assign={hub.root}>
    <Counter.repeat models={counters} />
  </div>
);
```

Which causes it to happen in `set`:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
  hub.root = this;
}
```

Two objects referencing each other is a perfectly normal pattern, both will garbage collected once there are no more references to them. The only place this kind of things gets tricky is with type imports, which is fortunately not an issue if you define your model types in a separate module.

Here is **types.ts**:

```tsx
export interface CounterModel {
  count: number;
}
```

Here is **hub.ts**:

```tsx
import type { ComponentInstance } from 'wallace';
import type { CounterModel } from './types';

type ComponentType = ComponentInstance<CounterModel[]>;

export class Hub {
  root: ComponentType;
  constructor(root: ComponentType) {
    this.root = root;
  }
  addCounter () {
    // the type of `root.model` is known:
    this.root.model.push({count: 1});
  }
}
```

Here is **component.tsx**:

```tsx
import { mount } from 'wallace';
import type { Takes } from 'wallace';
import type { CounterModel } from './types';
import { Hub } from './hub';

const CounterList: Takes<CounterModel[], Hub> = (counters, { hub }) => (
  <div>
    {/* the type of `hub` is known: */}
    <button onClick={hub.addCounter()} >
      Add Counter
    </button>
    <Counter.repeat models={counters} />
  </div>
);

mount('main', CounterList, model, new Hub());
```

As you can see, you get full type visibility. Now lets explore the various uses for hubs.

## Uses

Hubs are useful for multiple concerns.

### State

State is ephemeral data that should be kept separate from persistent data, and hubs are a great place to store that, as state is often accessed up and down the tree.

In React you often encapsulate state inside the component that needs it, then discover it needs to be managed a level or two up, which is why they emphasise the concept of [lifting state up](https://react.dev/learn/managing-state).

In Wallace you don't attach that anything to the component. You attach it to the model, unless it doesn't logically fit (such as state) then you'd attach it to a hub. When you're working on low-level components, you'll often have an existing hub passed in from above, so you simply attach it to that, no lifting required.

If things get crowded at the top, you simply use composition in your classes, which only entails minor changes in your components:

```tsx
class Hub {
  constructor(root) {
    this.root = root;
    this.uiState = watch({...}, () => this.root.update());
    this.gridFilters = watch({}, () => this.root.part.grid.update());
    this.gameState = new GameState();
  }
}
```

### Functionality

Hubs are also a great place to store all functionality used in that corner of the app.

Just like state, you'll often need to change the level at which you access functions. With the same hub available to the whole tree, you don't need to think about this, whereas if you implemented those functions on the component definitions you'd have more work to do.

### Data

Data doesn't have to come from the model, it can also come from the hub:

```tsx
const CounterList: Uses<{hub: Hub}> = (_, { hub }) => (
  <div>
    <Counter.repeat models={hub.getCounters()} />
  </div>
);

mount('main', CounterList, null, new Hub());
```

Alternatively you can set the component's model from within the hub:

```tsx
class Hub {
  onDataFetch(data) {
    this.root.model = data.counters;
    this.root.update();
  }
}
```

Remember these are all normal objects with normal properties, so you can do whatever you like. If you find you need multiple hubs with similar features, you can use inheritance.

A hub may combine state, data and functionality, and again, composition is your friend if things get crowded:

```tsx
class Hub {
  constructor(root) {
    this.root = root;
    this.ui = new UIController();
    this.data = new DataStore();
  }
}
```

## Summary

Hubs are a very useful pattern, but not the only one. You may find you don't need hubs if you follow alternative patterns in [models](/docs/reference/models), though you can of course combine the two.

Note that hubs aren't part of Wallace, they are your objects. All Wallace does is propagate them to nested components. This means you don't have to learn a new framework construct, suspect framework interference when things break, or battle the framework limitations with regards how you structure, reuse or organise these objects.

Moving logic out of your components into hubs also simplifies your components, making them less likely to contain bugs, and easier to read and modify.
