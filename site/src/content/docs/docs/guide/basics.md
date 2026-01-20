---
title : Basics
sidebar:
  order: 3
---

## Components

Wallace controls the DOM using "components" which look like React components, but work very differently.

You define components as functions which accept props and return JSX:

```tsx
const Counter = ({ clicks }) => (
  <div>
    <span>Count: {clicks}</span>
    <button onClick={clicks++}>Click me</button>
  </div>
);
```

Components can be nested and repeated using custom JSX syntax:

```tsx
const CounterList = (props) => (
  <div>
    <Counter.repeat items={props} />
  </div>
);
```

And mounted to the document using a helper function:

```tsx
import { mount } from 'wallace';

// Components as above...

const counters = [{clicks: 0}, {clicks: 0}];
mount('main', CounterList, counters);
```

> `mount` passes `counters` as the props to `CounterList` which then nests a `Counter` for every item in `counters`.

Your page should now display two click counters:

<div style="border: 1px solid grey; padding: 10px;">
  <div>
    <span>Count: <span>0</span></span>
    <button>Click me</button>
  </div> <div>
    <span>Count: <span>0</span></span>
    <button>Click me</button>
  </div>
</div>


Clicking on the buttons doesn't do anything yet. Before we tackle that, let's look at what Wallace did behind the scenes.

## Compilation

Wallace uses a special Babel plugin to replace functions that returns JSX with generated code which equates to this:

```tsx
const Counter = function () {/*...*/};
Counter.prototype = {/*...*/};
```

These functions are used internally as constructors to create objects we call components:

```js
const component = new Counter();
```

Theses objects have properties, including functions which come from the prototype, like `render`:

```js
component.render({ count: 0 });
```

You don't usually create components manually, but doing it once helps you understand they are just ordinary objects with methods that updates their DOM, which you can attach to the document like any other DOM element:

```js
const componment = new CounterList();
document.body.appendChild(componment.el);
componment.render([{clicks: 1}, {clicks: 2}]);
```

> During `render` the `CounterList` created two instances of `Counter` and attached them to its DOM.

You should now see two click counters with values set:

<div style="border: 1px solid grey; padding: 10px;">
  <div>
    <span>Count: <span>1</span></span>
    <button>Click me</button>
  </div> <div>
    <span>Count: <span>2</span></span>
    <button>Click me</button>
  </div>
</div>
There's nothing magic, no virtual DOM, no hidden engine or run time complexity - just normal objects which:

- Update their own DOM.
- Coordinate nested components.

## Mounting

A Wallace application is composed of one or more trees of nested DOM elements (e.g. one tree for the menu, another for the main content). 

The root element of each tree must be attached to the DOM using the `mount` function which:

1. Creates the root component instance.
2. Calls its `render` method.
3. Replaces the supplied element (you can pass an id string) with the component's DOM.
4. Returns the component instance.

You often want to keep a reference to the root component so that you can update the tree:

``` tsx
const root = mount('main', CounterList, []);
root.render([{clicks: 0}, {clicks: 0}]);
```

> `root` is an instance of `CounterList`. 

## Updates

The render function actually looks like this:

```tsx
(Component).prototype.render = function (props) {
  this.props = props;
  this.update();
}
```

This tells us we could also update the DOM by modifying the props in-place, then calling the `update` method:

```tsx
const root = mount('main', CounterList, []);
root.props.push({ count: 0 });
root.update();
```

And this is really useful for coordinating updates.

```tsx
import { mount, watch } from 'wallace';

const counters = [{ clicks: 0 }, { clicks: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```







It also tells us we could override `render` for a given component and modify its props before calling `udpate`, for example to add functions:

```tsx
const CounterList = ({ counters, incrementAll, total }) => (
  <div>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <button onClick={incrementAll()}>All +1</button>
    <div>Total: {total()}</div>
  </div>
);

CounterList.prototype.render = function (counters) {
  this.props = {
    counters: counters,
    incrementAll: () => counters.forEach(c => c.clicks++),
    total: () => counters.reduce((a, c) => a + c.clicks, 0)
  };
  this.update();
};
```

None of the buttons update the DOM yet, so let's fix that by using the `watch` helper function, which takes an object + callback, and returns a proxy (a special kind of wrapper) that calls the callback whenever it is modified:

```tsx
import { mount, watch } from 'wallace';

CounterList.prototype.render = function (counters) {
  const update = () => this.update();
  const countersProxy = watch(counters, update);
  this.props = {
    counters: countersProxy,
    incrementAll: () => countersProxy.forEach(c => c.clicks++),
    total: () => counters.reduce((a, c) => a + c.clicks, 0)
  };
  update();
};

mount('main', CounterList, [{ count: 0 }, { count: 0 }]);
```

Clicking any of the buttons now triggers the `update` callback, making our app fully reactive.

## Advantages

If you've used other frameworks you will know just how awkward their reactivity is.





Why does Wallace reactivity work this way?



## Philosophy

Wallace goes against two big trends in frameworks:

#### Functional programming

If components are functions, you don't have a reference to them, and need to use hooks - one of the ugliest patterns in web development. Less than 10% of React developers understand how they work, only how to use them.

forces you to use hooks or signals, which are horrible patterns that no one quite knows how they work.



1. Built-in reactivity.

Many frameworks have reactivity built-in, and many push functional components. 









We made a reactive app without confusing patterns like hooks or signals, just a proxy with a callback, whose operation is not linked to components.

You can see clearly when and why the DOM updates just 



But there's a subtle bug: `incrementAll` triggers `update` once for every item in `counters`. It's not noticeable with a small sample, and shows just how easy it is to make mistakes with reactive programming.

Wallace makes reactivity explicit, rather than hidden or built into the components so that these mistakes are easier to notice, debug and fix. All we need to do is work with the original `counters` instead and call `update` once we're done:

```tsx
import { watch } from 'wallace';

CounterList.prototype.render = function (counters) {
  const update = () => this.update();
  this.props = {
    counters: watch(counters, update),
    incrementAll: () => {
      counters.forEach(c => c.clicks++);
      update();
    }
  };
  update();
};
```

You can confirm this works by adding logging to `update`.

In other situations we might pass the `update` callback to nested components.
