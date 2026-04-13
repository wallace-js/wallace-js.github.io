---
title: Tour
sidebar:
  order: 2
---

## Introduction

This tour will show you how Wallace works, and once you understand that you'll know how to use it.

To do this we're going to reuse the code sample from the home page, but with two tweaks that help us cover more topics:

1. Replace the counter's button with a range input.
2. Add an interface and type annotations - but you can omit these if you don't want to use TypeScript.

Here is the modified code:

```tsx
import { mount } from 'wallace';
import type { Takes } from 'wallace';

interface CounterModel {
  count: number;
}

const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input bind-as:range={count} />{count}
  </div>
);

const CounterList: Takes<CounterModel[]> = (counters) => (
  <div watch>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <button onClick={counters.push({ count: 1 })}> 
      Add Counter
    </button>
    <Counter.repeat models={counters} />
  </div>
);

mount('main', CounterList, [{ count: 0 }]);
```

In here we:

1. Define two components as functions which return JSX.
2. Nest one component within the other. 
3. Mount the root component with some data.

It may look similar to React, but Wallace works differently in a few critical ways, starting with how it treats JSX.

You can code along:

- **Online** with StackBlitz using [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).
- **Locally** with `npx create-wallace-app`.

## JSX

Wallace doesn't use virtual DOM, and functions containing the JSX never get *called*. Instead they are *replaced* with component definitions during compilation, which act more like classes than functions.

The function is essentially just a scope for a single JSX statement, and cannot contain anything else:

```tsx
const Counter = ({ count }) => {
  // NOT ALLOWED
  const double = count * 2;
  return <div>
    <input bind-as:range={count} />{double}
  </div>
};
```

The JSX is *read* during compilation and therefore cannot have any logic that changes its structure:

```tsx
const Counter = ({ count }) => (
  // NOT ALLOWED
  <div>
    {count > 2 ? (
      <input bind-as:range={count} />
    ) : (
      <span></span>
    )}
  </div>
);
```

The only code allowed in the function is inside JSX `{expressions}` and these may not return further JSX. Code in expressions is copied to the generated component definition, which is why we can supply raw code to events rather than callbacks:

```tsx
<button onClick={counters.push({ count: 1 })}> 
```

At this point Wallace may feel like a React clone with all its power and freedom removed, however:

1. You get a lot more power thanks to *directives*.
2. Your JSX ends up more readable and more compact (around ~50% line count).
3. You actually get more freedom, as we'll see later.

And don't worry, you don't need to memorise new syntax or lists of directives. You only need to remember one:

```tsx
const Counter = () => <div help ></div>;
```

The `help` directive's tool tip contains a cheat sheet which includes a list of available directives. Alternatively use the tool tip on the module import: 

```tsx
import {} from 'wallace';
```

That contains the complete reference documentation, so you can look things up without leaving your editor.

## Components

The best way to understand what these generated component definitions look like is to substitute this line:

```tsx
mount('main', CounterList, [{ count: 0 }]);
```

With these lines, which do the exact same thing:

```tsx
const target = document.getElementById('main');
const component = new CounterList();
component.render([{ count: 0 }]);
target.parentNode.replaceChild(component.el, target);
```

> Your editor may warn you that `Only a void function can be called with the 'new' keyword` but ignore this for now.

During compilation `CounterList` was replaced with a constructor function which lets us create objects with `new` (note how it doesn't take any arguments).

These objects (called components, component instances or component objects) have properties such as `el` which is its root DOM element, and methods like `render` which we'll look into in more detail shortly.

During `render` our component will create as many instances of `Counter` as it needs, reusing existing ones where available, so what you end up with is a tree of component objects controlling the DOM tree:

```html
CounterList1 | <div>
|            |   Total: <span>2</span>
|            |   <button>Add Counter</button>
|  Counter1  |   <div>
|   |        |     <input type="range" />1
|   |        |   </div>
|  Counter2  |   <div>
|   |        |     <input type="range" />1
|   |        |   </div>
|            | </div>
```

Each component manages its own DOM and its nested components, which manage their DOM plus nested components, and so on down the tree.

It's a very simple structure that's easy to visualise and work with. And because component definitions are "classes" rather than functions, you can override their methods, which gives you total freedom:

```tsx
Counter.prototype.render = function () {
  this.el.innerHTML = '<h1>FREEDOM</h1>';
}
```

That's a rather extreme example, and you can actually take control at a far more granular level, without loosing framework functionality.

## Methods

The unadulterated `render` method looks like this:

```tsx
function render (model, hub) {
  this.set(model, hub);
  this.update();
}
```

The `update` method coordinates the DOM updates, which we won't display here. The unadulterated `set` method looks like this:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

We'll cover `hub` later and can safely omit/ignore it for now as we're not using it.

#### Why

This arrangement lets us do things that would not be possible if `render` updated the DOM directly.

We can update a component by modifying its model in-place then calling `update` which bypasses `render`:

```tsx
const component = new Counter();
component.render({ count: 0 });
component.model.count = 1;
component.update();
```

This this helps with reactivity as we'll see later, and lets us treat `render` as a "setup" method as it is only called from above.

Don't worry if this doesn't make sense just yet.

#### Overriding

We could override `render` on `Counter` (perhaps to add some logging) as follows and our app would still work:

```tsx
Counter.prototype.render = function (model) {
  console.log('Rendered Counter');
  this.model = model;
  this.update();
}
```

However if we do that with `CounterList` it would break, because the `watch` directive modifies the `set` method, and we skipped that. So you would have to do this:

```tsx
CounterList.prototype.render = function (model) {
  console.log('Rendering CounterList');
  this.set(model);
  this.update();
}
```

Or you could use the `base` property, to access the unadulterated `render` (note this is not the same as `super` in classes which crawls up the inheritance tree):

```tsx
CounterList.prototype.render = function (model) {
  console.log('Rendering CounterList');
  this.base.render.call(model);
}
```

You won't be overriding methods that often, this is more to illustrate how Wallace works. If you do need to override or add methods, you're best using the `methods` helper:

```tsx
CounterList.methods = {
  render (model) {
    this.log();
    this.base.render.call(model);
  },
  log () {
    console.log('Rendering CounterList');
  }
};
```

As it's more concise and prevents accidental overwriting of prototype methods.

## DOM

To illustrate how the `update` method updates the DOM let's use a `ref` to manually disable the input if `count` exceeds three:

```tsx
const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input ref="input" bind-as:range={count} />{count}
  </div>
);

CounterList.methods = {
  update () {
    this.base.update.call();
    this.ref.input.disabled = this.model.count > 3;
  }
};
```

Note that `this.ref.input` points to the actual DOM element, not a wrapper, and we can manipulate it directly.

We can manually set the `disabled` property, while letting Wallace control its value and event handling without clash because we've essentially replicated how Wallace updates its DOM.

Components create their initial DOM and store references to dynamic elements. During `update` they compare the used values to last update, and modify the corresponding element property if it changes.

This results in minimal DOM operations and less computation than diffing a virtual DOM, which not only makes Wallace insanely fast, but also means you can predictably work with the DOM without breaking it.

You can even move elements around within the component (or outside if you're a lunatic) and they would still safely update.

There is a shorthand for directives like `ref` which simply name things:

```tsx
<input ref:input bind-as:range={count} />
```

And of course you could avoid using a ref altogether by using an expression:

```tsx
<input disabled={count > 5} bind-as:range={count} />
```

The only time you really need to work with the DOM manually is in edge cases, such as [chart.js](https://www.chartjs.org/) which requires `canvas` elements to be attached to the DOM before drawing graphs on them.

### Directives

Talk more about directives.

compilation



### Reactivity

Top level directive.



### Hubs/Patterns





### Reuse

factory, stubs



### Types (slip it in  elsewhere)

```tsx
CounterList.methods = {
  render(model) {
    this.set(model);
    this.udpate();
  }
};

```



- directives
- help
- types
- xargs
- stubs
- hubs
- binding