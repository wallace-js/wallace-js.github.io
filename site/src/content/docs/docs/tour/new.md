---
title: Tour
sidebar:
  order: 2
---

This tour:

- Assumes you are familiar with front end development.
- Covers everything in 7 short sections.
- Should take 15-20 minutes.

It's not a tutorial, but you can code along:

- **Online** with StackBlitz using [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).
- **Locally** with `npx create-wallace-app`.

There's a separate page explaining [why](/docs/why) Wallace exist. The TLDR is that none of the alternatives met the author's four basic criteria:

1. No **ugly** syntax or patterns.
2. No **magic** DOM updates that are hard to follow, debug or control.
3. No **bloat**, so it works for landing pages and apps with frequent page switches etc...
4. No **learning** beyond an initial 15-30 minutes.

The result is a delightfully simple framework which also happens to beat most of the others on performance.

## Overview

Wallace is a compiled framework which requires a tool like Webpack to transform the jsx/tsx files in which you define components:

```jsx
const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);
```

It looks like React, and due to its similarity and popularity we'll be using that as a base for comparison. Just remember Wallace works differently, and is used differently too.

It's more fun learning with an interactive UI so let's set this up first, and explain how it works later:

```tsx
import { mount, watch } from 'wallace';

const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);

const root = mount(
  'main',
  Counter,
  watch({ count: 0 }, () => root.update()
);
```

> This replaces the element with `id="main"` with an instance of `Counter`.

## Assistance

#### Tool tips

Wallace has extensive the documentation in its tool tips, which you'll get by hovering over:

1. The  `wallace` module in the import statement which covers almost everything.
2. Helper functions like `mount` and `watch` which cover their respective usage.
3. JSX elements like `div` which shows the JSX syntax cheat sheet.
4. Directives in the JSX (like `if`) which have detailed notes on their usage.

In a modern editor which renders JSDoc Markdown correctly it should look like this:

![](/img/div-tooltip.jpg)

This helps you work faster by not having to leave your editor as often.

#### TypeScript

You will have a more enjoyable time if you use TypeScript for your components, even if you don't use it in your other modules.

The main thing you'll be annotating are the props that each component accepts which you do with the `Uses` type:

```tsx
import { mount, watch, Uses } from 'wallace';

interface iCounter {
  count: number;
}

const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <div>Count: {count}</div>
    <button onClick={count++}>Click me</button>
  </div>
);

const root = mount(
  'main',
  Counter,
  watch({ count: 0 }, () => root.update()
);
```

Make sure you use `Uses` as shows above, rather than annotating the props parameter, which is only useful inside that function:

```tsx
// WRONG
const Counter = ({ count }: iCounter) => (...);
```

`Uses` can annotate more than just props, as covered in [TypeScript](/docs/reference/typescript/).

For brevity we'll omit type annotations from the rest of the tour.

## JSX

Instead of putting JavaScript around JSX elements, you place *directives* (like `if`) inside elements:

```jsx
const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
    <button if={count > 3} onClick={(count=0)}>
      Reset
    </button>
  </div>
);
```

You loose the full flexibility of React, but:

1. You rarely need that flexibility.
2. You can still achieve the same end result.
3. Your JSX will be less cluttered (and easier to debug) and more compact (~50% fewer lines).
4. You don't create false indentation.
5. More power.

Nesting syntax is also different: you pass props in a single directive, which means you can use other directives:

```jsx
const DoubleCounter = (counters) => (
  <div>
    <Counter props={counters[0]} />
    <Counter props={counters[1]} if={counters.length > 1}/>
  </div>
);
```

To repeat a nested component you just add `.repeat` after the name:

```jsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat props={counters} />
  </div>
);
```

Both Wallace and TypeScript understands that `props` should now be an Array.

Lastly, you can't put any code before the JSX:

```jsx
const CounterList = (counters) => {
  counters.sort() // << No code allowed here!
  return <div>
    <Counter.repeat props={counters} />
  </div>
};
```

If you're use to React this might seem like madness, but once you see how Wallace does it,  then React might seem the madder of the two.

### Components

The second difference is that these functions are never *called* - they are *replaced* with a constructor function during compilation, which lets us create component objects:

```jsx
const component = new Counter();
```

However you don't usually do that yourself, instead you define a tree of nested components:

```jsx
const CounterList = (counters) => (
  <div>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <Counter.repeat props={counters} />
  </div>
);
```

And mount the root component to the DOM:

```jsx
import { mount } from 'wallace';

/*...*/

const counters = [{ count: 0 }, { count: 0 }];
const root = mount('main', CounterList, counters);
```

The root component is a component like any other, which:

1. Updates its own DOM.
2. Manages its nested components.

So your DOM is controlled by a tree of very simple objects which you can customise and interact with.

Before we look at what we can do with that, let's quickly cover the JSX rules.

#### 1. Static JSX

Wallace doesn't allow JavaScript around JSX elements, only inside `{expressions}`. You do the interesting things using directives and special syntax for nesting and repeating components:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat props={counters} />
    <div if={counters.length > 5}>Calm down</div>
  </div>
);
```

This approach means your JSX:

1. Doesn't turn into an mangled mess which:
   1. Obscures the DOM structure.
   2. Creates false indentation.
   3. Conceals bugs.
2. Is a lot more compact, often needing half as many lines as React.
3. Allows for more powerful syntax and behaviour like partial updates, two-way binding and overridable stubs.

#### 2. Real Components

Wallace components are real objects. The `mount` function creates the root component of the tree:

```jsx
import { mount } from "wallace";

/*...*/

const counters = [{ count: 0 }, { count: 0 }];
const root = mount("main", CounterList, counters);
```

> Passing `'main'` equates to passing `document.getElementById('main')`.

Each component manages its own DOM and nested components. So `root` (which is an instance of `CounterList`) creates one instances of `Counter` for each item in `counters`.

The DOM is controlled entirely by components, there's no virtual DOM, global state or hidden engine, just a tree of component objects.

Why this matters will become evident later.

#### 3. Sane Reactivity

Wallace is not reactive like Angular or Svelte, nor is it unreactive like React. Instead you use `watch` which returns a proxy of an object that fires a callback when it is modified, from which you can update a component:

```js
import { mount, watch } from "wallace";

/*...*/

const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

It feels rather manual, but this has several advantages:

1. You can clearly see why and when something updates, which saves tons of time given how easily reactivity goes wrong.
2. It is totally separate from the component, which helps with testing/debugging/not breaking when things change.
3. You can easily change what data you watch, or what the callback does, such as:
   1. Update different components.
   2. Update parts of components.
   3. Persisting data.
   4. Debouncing.
   5. Undo/redo state (example [here](https://github.com/wallace-js/wallace/tree/master/examples/undo)).
4. Works well with 2-way data binding.

Here is the full listing with a few bits added to show it working:

```jsx
import { mount, watch } from "wallace";

const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
    <input type="number" bind={count} />
  </div>
);

const CounterList = (counters) => (
  <div>
    <div>Total: {total()}</div>
    <Counter.repeat props={counters} />
    <button onClick={counters.push({ count: 1 })}>Add counter</button>
  </div>
);

const total = () => counters.reduce((a, c) => a + c.count, 0);
const counters = [{ count: 0 }, { count: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

Wallace was designed to produce code that's easy to follow and easy to change, the insane performance came later.

## Support

### Directives

Directives are special attributes that do something, such as `if` which conditionally attaches an element, and `bind` which creates two-way binding between an element and data, and also takes a _qualifier_ to specify which event fires the change:

```jsx
const Counter = ({ count }) => (
  <div>
    <button if={count > 3} onClick={(count = 0)}>
      Reset
    </button>
    <div>Count: {count}</div>
    <input type="number" bind:keyup={count} />
  </div>
);
```

You don't need to remember all the directives, as they are listed in the tool tip for JSX elements which also includes a reminder of JSX syntax rules:

![](/img/div-tooltip.jpg)

Hovering over the directive itself gives you more detailed documentation. Wallace has tool tips for everything, and even a full cheat sheet on the module:

![](/img/cheat-sheet.jpg)

So you can code away in remote locations without Internet - great for a rainy day in the Highlands!

You can also define as many custom directives as you like, which won't impact bundle size as they operate during compilation.

### TypeScript

Wallace provides its own type to annotate components, which lets you specify the props and a couple of other bits that we'll cover later. Functions like `mount` and `watch` are all type-aware too:

```tsx
import { mount, watch, Uses } from "wallace";

interface iCounter {
  count: number;
}

const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <div>Count: {count}</div>
    <button onClick={count++}>Click me</button>
  </div>
);

const CounterList: Uses<iCounter[]> = (counters) => (
  <div>
    <Counter.repeat props={counters} />
  </div>
);

const counters = [{ count: 0 }, { count: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

> Try passing invalid props...

### Components

During compilation a special Babel plugin replaces component functions with generated functions:

```js
var CounterList = function () {
  // Generated code...
};
```

Wallace uses these functions as constructors to create objects, which are the actual components:

```js
const component = new CounterList();
```

> You don't usually create components this way yourself.

A component creates its own DOM (whose root element is stored as `el`) and provides a method to update it:

```js
document.body.appendChild(component.el);
component.render([{ count: 0 }, { count: 0 }]);
```

> You should now see two click counters on the page.

The `mount` function does exactly what we've just seen, except it replaces the specified element, then returns the component.

Note that all the nested `Counter` components are created by `CounterList`. Components control their own DOM and nested components - there is no special root object, no central engine, or anything else - just a tree of components.

### Updates

The `render` function simply does this:

```tsx
function render(props) {
  this.props = props;
  this.update();
}
```

So you can also update a component by setting/modifying its `props` then calling `update`:

```js
component.props[0].count++;
component.update();
```

Which is how we've been handling reactivity:

```js
const counters = [{ count: 0 }, { count: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

You can override these methods as they live on the prototype:

```js
Counter.prototype.render = function (props) {
  this.props = props;
  this.update();
  console.log("Rendered Counter with", props);
};
```

> The type of `props` carries through from `Use<iCounter>`.

But working with the prototype directly has some quirks, so Wallace provides a neater way:

```js
Counter.methods = {
  render(props) {
    this.props = props;
    this.update();
    this.base.render.call(this, props);
    console.log("Rendered Counter with", props);
  },
};
```

You can also shorten the above to this:

```js
Counter.methods = {
  render(props) {
    this.base.render.call(this, props);
    console.log("Rendered Counter with", props);
  },
};
```

### Reactivity

Reactivity is a major source or bugs, glitches and performance issues on the front-end, because it is:

1. Easy to trigger more updates than intended.
2. Hard to notice this happening (especially on a typical developer's high spec device).
3. Hard to guard against with tests.

And depending on how the framework implements reactivity, it can also be hard to prevent this from happening.

To illustrate this let's add a total, and a button that increments each counter:

```jsx
const total = (counters) => counters.reduce((a, c) => a + c.count, 0);

const incrementAll = (counters) => counters.forEach((c) => c.count++);

const CounterList = (counters) => (
  <div>
    <div>Total: {total(counters)}</div>
    <button onClick={incrementAll(counters)}>++</button>
    <div>
      <Counter.repeat props={counters} />
    </div>
  </div>
);
```

> The total should update as you click on counter buttons or **++**.

It works great, but if you add 1000 counters:

```js
for (let i = 0; i < 1000; i++) {
  counters.push({ count: 0 });
}
```

You'll notice a delay when clicking the **++** button. If you add some logging, which is easy to do as you control the callback:

```js
const root = mount(
  "main",
  CounterList,
  watch(counters, (target, key, value) => {
    console.log("updated", target, key, value);
    root.update();
  })
);
```

You'll see that `incrementAll` triggers the callback once for every item in counters. Despite only causing in two DOM elements to update each time (the `Total` and one `Count`) doing it 1000 time is slow because:

- There is work involved in determining which DOM elements should change, both within the component, and calculations like `total()`.
- It causes the page to repaint multiple time in quick succession (aka DOM thrashing) which is a sure way to drain battery and kill performance.

Way can easily fix this by working on the original array rather than the proxy returned by `watch` so it doesn't trigger the update, and then `calling update` once we're done:

```js
const incrementAll = () => {
  counters.forEach((c) => c.count++);
  root.update();
};
```

> The total (and the 1000 `Counter` components) now update instantaneously, even if you keep clicking in rapid succession.

Although reactivity by explicit callback feels a bit verbose, it saves time in the long run by making it easy to diagnose and fix issues.

You can also use the callback to do other things such as:

- Updating only certain components.
- Updating parts within components.
- Setting up undo/redo state.
- Rejecting the change (and rolling back).
- Persisting data changes.

However, if you're persisting data you probably don't want your UI to be reactive, but to follow an **action>save>update** flow instead. And you'd want your data to be immutable.

### Immutability

Let's create a store (nothing to do with Wallace) with counters:

```ts
interface iCounter {
  id: number;
  count: number;
}

class Store {
  counters: iCounter[];
  constructor() {
    this.counters = [
      { id: 1, count: 0 },
      { id: 2, count: 0 },
    ];
  }
  setCount(id: number, count: number) {
    // First save to local storage or server etc...
    this.counters.find((c) => c.id === id).count = count;
  }
}

const store = new Store();
```

You don't want the UI to modify `counter` or a copy of `counters` without going via `setCount`. We can do this:

```js
import { mount, protect } from "wallace";

mount("main", CounterList, protect(store.counters));
```

> Clicking on any of the buttons now throws an error.

We need to change the buttons to use `setCount` then update the `root` which could get messy, and this is where controllers come in.

### Controllers

When enabled, the `render` function changes to this:

```tsx
function render(props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
}
```

And functions which forward `props` to `render` (such as `mount`) now forward a `ctrl` as well, so let's create a `Controller` and pass it to `mount` :

```ts
class Controller {
  setCount(id: number, count: number, update = true) {
    store.setCount(id, count);
    if (update) root.update();
  }
}

const root = mount(
  "main",
  CounterList,
  protect(store.counters),
  new Controller()
);
```

> Don't worry, we'll get rid of the global variables later.

The controller gets passed to `CounterList.render` which stores it as `this.ctrl` - and (here's the neat part) also passes it to `render` for each of its nested components, which do the same, and so on all the way down the tree.

We access `ctrl` in the JSX function via a second argument called **xargs** which has several useful things in it. Remember this function is replaced during compilation so these aren't real arguments, but `Uses` lets us set their types:

```tsx
const Counter: Uses<iCounter, Controller> = ({ id, count }, { ctrl }) => (
  <div>
    <div>Count: {count}</div>
    <button onClick={ctrl.setCount(id, count + 1)}>Click me</button>
  </div>
);
```

Here the controller acts as a small "hub" with functions which all components in the tree have access to, but there's a reason they're called controllers rather than hubs.

As your app grows, you'll need different controllers for different parts of the tree. Dialog boxes, menus, tables and forms all get their own controller, and typically maintain a link back to their parent controller:

```js
SettingsDialog.methods = {
  render(props, appController) {
    this.ctrl = new SettingsDialogController(this, appController);
    this.props = props;
    this.update();
  },
};
```

So the tree of DOM elements is managed by a tree of components which is managed by a tree of controllers. This tree of controllers coordinates updates between components and services like stores, so it becomes the locus of control, with components being pushed to the outer layer.

Controllers help you in several ways:

##### Keeping props clean

Having controllers means that props mostly contain unmodified data, as you don't need to add things into them at every step like you do in React, and this reduces:

1. How much code you need to write.
2. How much computation happens at each render.
3. How many extra types you need to create.

##### Keeping components clean

Moving logic out of components into controllers leaves you with very simple components, which are less likely to hide bugs.

##### Keeping logic clean

Controllers are just ordinary classes, which aside from calling `update`, have nothing to do with Wallace. You have the full power and freedom of OOP at your disposal to deal with state, logging, caching, side effects etc...

In React you do all this inside component functions before returning JSX, which has several limitations.

##### Faster debugging

Another subtle benefit of your logic living in ordinary classes that aren't under framework "jurisdiction" is that when things break, you don't waste time suspecting the framework.

Our brain knows that frameworks do a bit of "magic" - so when things break, we often suspect it relates to that. But

n't affected by the framework, they're just ordinary classes, and you locate the source of error much quicker when you know there's no "magic" involved.

And because they are ordinary classes, not framework artefacts, you can do whatever you like.

we know that's not the case and find the issue quicker.

When your logic lives in normal code which the framework doesn't touch, there's one less thing to suspect when things break.

There are three advantage of doing this:

1. The components become so simple they're unlikely to malfunction or hide bugs.
2. It's easier to control or add logic, like caching, logging etc...
3. The logic

segway into updates

### Updates

So far we've only been updating the root component, which is easy as `mount` returns a reference to it. Let's see how we get a reference to a nested component. First let's give the controller a register of `Counter` components:

```tsx
import { Component } from "wallace";

class Controller {
  counterComponents: { [key: number]: Component<iCounter> };
  constructor() {
    this.counterComponents = {};
  }
  /*...*/
}
```

Then override the `Counter.render` method to assign itself:

```tsx
Counter.methods = {
  render(props, ctrl) {
    ctrl.counterComponents[props.id] = this;
    this.base.render.call(this, props, ctrl);
  },
};
```

The controller can now update any `Counter` in isolation, which isn't very useful as that doesn't update the total. However Wallace lets you update part of a component:

```tsx
const CounterList = ({ counters, total }) => (
  <div>
    <div part:total>Total: {tota}</div>
    ...
  </div>
);

class Controller {
  counterComponents: { [key: number]: Component<iCounter> };
  constructor() {
    this.counterComponents = {};
  }
  setCount(id: number, count: number, update = true) {
    store.setCount(id, count);
    if (update) {
      this.counterComponents[id].update();
      root.props.total = total(store.counters);
      root.part.total.update();
    }
  }
}
```

This lets you run very narrow updates anywhere in the tree, which is the key to high performance. Of course this a bit less safe, but not as unsafe as direct DOM manipulation (which is often the only way to make a framework fast) for two reasons:

1. You're not passing data, just calling `update()`
2. Updating a part updates everything in it.

```jsx
<div part:total class={total > 5 ? "red" : "black"}>
  Total: {total(counters)} (from {counters.lenght} counters).
</div>
```

- You can do DOM updates (show in overriden update) but best use apply(link)
- Another thing you can do in render on high-level is create the controller and/or props - because update...

```jsx
CounterList.methods = {
  render() {
    this.ctrl = new Controller(this);
    this.props = {
      total: 0, // TODO remove
      counters: protect(store.counters),
    };
    this.update();
  },
};

mount("main", CounterList);
```

### Binding

You might think you're far away from needing to worry about performance, but there's one case where it hits sooner, typing, because you type a lot quicker than you push buttons.

```jsx
const CounterList = ({ counters, total, things }) => (
  <div>
    <div part:total>
      Total {things.value}: {total}
    </div>
    <div>
      <Counter.repeat props={counters} />
    </div>
    <input type="text" bind:keyup={things.value} />
  </div>
);
```

At this point it's easier managing the props on the controller:

```ts
CounterList.methods = {
  render () {
    this.ctrl = new Controller(this);
    this.update();
  }
}

class Controller {
  counterComponents: {[key: number]: Component<iCounter>};
  root:  Component<iCounterList>;
  constructor(root:  Component<iCounterList>) {
    this.counterComponents = {};
    this.root: root;
    root.props = {
      counters: protect(store.counters),
      total: 0,
      things: watch({value: 'sheep'}, () => this.updateTotal()),
    };
    this.updateTotal(false);
  }
  setCount(id: number, count: number, update = true) {
    store.setCount(id, count);
    if (update) {
      this.counterComponents[id].update();
      this.updateTotal();
    }
  }
  updateTotal(update = true) {
    this.root.props.total = total(store.counters);
    if (update) this.root.part.total.update();
  }
}
```

- parts
- controllers setting props
- methods

- events
- stubs
