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
    <div>Count: {clicks}</div>
    <button onClick={clicks++}>Click me</button>
  </div>
);
```

Components can be nested and repeated using compact syntax:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat items={counters} />
  </div>
);
```

Then mounted to the document using a helper function:

```tsx
import { mount } from 'wallace';

const Counter = ({ clicks }) => (/*...*/);
const CounterList = (counters) => (/*...*/);

mount('main', CounterList, [{clicks: 0}, {clicks: 0}]);
```

You hopefully deduced that:

1. Wallace has its own JSX syntax.
2. You only mount the root component.
3. Clicking on the buttons doesn't do anything yet.

What's not so obvious is that Wallace compiles your code in a very special way.

## Compilation

Wallace uses its own Babel plugin to replace functions which return JSX with generated functions which can be used to create objects, like so:

```tsx
const component = new Counter();
```

You don't usually create components this way, but it's important to understand that this is what happens.

These objects are called components (sometimes called _instances_ to differentiate from the component *definition* which was the function with JSX) and wrap their own DOM element (accessible as `el`) and provide a method called `render` to update it:

```tsx
const component = new Counter();
document.body.appendChild(component.el);
component.render({ count: 99 });
```

Note that a component updates its DOM:

1. Instantly - there is no "render cycle".
2. Directly - there is no virtual DOM involved.
3. By itself - there is no background "engine" or special "root" object.

The `mount` function simply creates a component instance and replaces the supplied element (in this case whichever element has the id `main`) with the component's DOM after rendering it with the supplied props before returning it:

``` tsx
const component = mount('main', CounterList, []);
component.render([{ count: 0 }]);
```

If a component has nested components, that component deals with creating nested component instances and attaching their DOM.

## Updates

The render function comes from the component function's prototype (more on this later) and looks like this:

```tsx
(Component).prototype.render = function (props) {
  this.props = props;
  this.update();
}
```

This tells us we could also update the DOM by modifying the props object in place, then calling `update` like so:

```tsx
const root = mount('main', CounterList, []);
root.props.push({ count: 0 });
root.update();
```

That may be a clunky example, but this design helps us in several ways:

### Simpler code

To update a component from a nested component in a functional framework like React you need to use awful patterns like hooks or signals etc.

With Wallace you can simply pass a reference to that component in the props:

```tsx
import { watch } from 'wallace';

CounterList.prototype.render = function (counters) {
  this.props = counters.map(c => ({ ...c, root: this }));
  this.update();
};
```

Nested components can call `root.update()` or you could pass a callback, but there's an even neater way using controllers.

### Sane reactivity

Wallace gets its reactivity through a helper function called `watch` which returns a proxy of an object (which can be an array) that calls a callback whenever it is modified:

```tsx
import { watch } from 'wallace';

CounterList.prototype.render = function ( counters ) {
  this.props = watch(counters, () => this.update());
  this.update();
}
```

> The CounterList component now updates when the buttons are clicked.

Many frameworks hide their reactivity, or couple it with UI controlling objects, making it very easy to make mistakes. Wallace's approach is:

- Crystal clear: you can tell exactly why and when things update.
- Easy to debug: just add console log in the callback (which takes arguments).
- Powerful:
  - Watch different objects within the props with different callbacks.
  - Do different things depending on what was changed (you can even update parts of a component).

Despite not being as "automatic" as some frameworks, this approach actually saves time in the long run, and helps produce better performing apps.