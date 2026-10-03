---
title: Tour
sidebar:
  order: 2
---

## Introduction

Front end frameworks speed up development by:

1. Letting us work at a higher level (focus on what rather than how).
2. Reducing how much boilerplate code we write.
3. Restricting scopes, which massively reduces errors.
4. Providing structure, which reduces decisions.

But frameworks also add new problems and impositions which slow down development. The meta problem is that it's very difficult to assess just how much, because these are always exceptions.

### Flexibility

The framework's mechanism (aka engine) restricts what you can do with the DOM. For example, you couldn't move a React component until they added "portals", and you also can't update part of a component.

Sometimes these restrictions simply prevent you from implementing a logical solution and you'll waste time trying to find a way round it. Sometimes they cause performance issues, which waste time as you attempt to solve that , if you even can.

These are not very common problems, but you never know when your project will need that flexibility.

### Clarity

The engine's internals are hidden from view, and this can make it difficult to see what's going on. This is mostly a problem when implementing reactivity in a complex UI, where it is difficult to detect when updates firing over each other. 

These bits of the project often consume disproportionate resources over the years.

### Organisation

Hooks, functions not classes or prototypes.



## Mechanism

Here is a button which displays how many times it has been clicked:

```tsx
import { mount } from "wallace";

const Counter = ({ count }) => (
  <div watch>
    <button onClick={count++}>{count}</button>
  </div>
);

mount("main", Counter, { count: 0 });
```

It looks very similar like React in that we appear to be defining a component as a function that returns JSX, which we then mount to the page with some data.





1. Define a component called `Counter` as a function that returns JSX.
2. Mount it to the page with some data (replacing the element with id `main`).







# ------------------------

This tour covers how to use Wallace, how it works, and how it solves many of the problems inherent in using frameworks.

We'll start with a button which displays how many times it has been clicked:

```tsx
import { mount } from "wallace";

const Counter = ({ count }) => (
  <div watch>
    <button onClick={count++}>{count}</button>
  </div>
);

mount("main", Counter, { count: 0 });
```

All we did was:

1. Define a component called `Counter` as a function that returns JSX.
2. Mount it to the page with some data, replacing the element with id `main`.

So far it looks very much like React, but if you try placing JavaScript before or around JSX elements, you'll find that's not allowed:

```tsx
const Counter = ({ count }) => {
  // Code before the JSX is not allowed.
  const addClearBtn = count > 3;
  return (
    <div watch>
      <button onClick={count++}>{count}</button>
      {/* Code around JSX elements is not allowed. */}
      {addClearBtn && <button onClick={(count = 0)}>clear</button>}
    </div>
  );
};
```

At this point Wallace feels like a React clone with its most basic capabilities removed, and you may be wondering:

1. How on earth you get anything done.
2. How on earth this could be better than React.

To answer these questions we first need to understand how Wallace works.

## Mechanism

React uses a runtime engine to update the DOM based on the virtual DOM returned by component functions. Other frameworks like Angular and Svelte use different mechanisms, but still engage an engine.

React translates JSX into code that returns virtual DOM during compilation. At runtime an engine calls your component functions, compares the returned virtual DOM to the real DOM (or cached copy) and updates it.

There are several issues with this approach.

#### Inefficient

The entire component's virtual DOM needs to be returned at each render, even though it only has a couple of dynamic parts nested within it.

#### Atomic

You re-render the whole component or you don't.

#### Restrictive

The engine doesn't let you do certain things, such as reparenting.

#### Locked

You can't override how the engine works for a certain component. And because it's atomic, you

Components vs vdom. Freedom. Atomic. Inefficient.

Then do JSX. Then updates. Then structure.

## JSX

Wallace uses a restricted JSX syntax. You are not allowed to put code around elements:

```tsx
// Won't work in Wallace!
const CounterList = (counters) => (
  <div>
    {counters.length ? (
      counters.map((c) => <Counter props={c} />)
    ) : (
      <div>No counters</div>
    )}
  </div>
);
```

Instead you use special syntax for nesting and repeating:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter model={counters[0]} />
    <Counter.repeat models={counters} />
  </div>
);
```

And directives like `if` for conditional display:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
    <div if={counters.length === 0}>No counters</div>
  </div>
);
```

The main reason for this that Wallace doesn't use virtual DOM. The secondary reason is that by putting code around XML you loose one of the main advantages of XML which is clarity and structure.

So Wallace doesn't give you the absolute freedom of virtual DOM, but:

1. You can still create the same UIs (you didn't need that freedom).
2. Your JSX ends up more compact (around ~50% line count).
3. Your JSX ends up far more readable (so hides fewer bugs).
4. You actually gain freedom (because of how components work).
5. You also gain more power (thanks to directives).

## Components

Wallace uses components, but again, differently to React, even though they often look similar:

```tsx
import { mount } from "wallace";

const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const root = mount("main", Counter, { count: 0 });
```

Wallace replaces that arrow function with a completely different function during compilation, which is then used as a constructor function to create component _instances_ at run time:

```tsx
const root = new Counter();
```

We normally use `mount` which does that for us, then attaches its element to the DOM and calls its `render` method, before returning it.

So `root` is a component _instance_ of `Counter` which is a component _definition_. It is an ordinary object with properties and methods:

```tsx
root.render({ count: 1 });
console.log(root.el); // <div>...</div>
```

This differs from React, where "root" is a special object which coordinates the whole tree, and you never access individual component instances.

Wallace doesn't have a central coordinating engine, just a tree of component instances which sits on top of the tree of DOM nodes. When you nest components like so:

```tsx
import { mount } from "wallace";

const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
  </div>
);

const counters = [{ count: 0 }, { count: 0 }];
const root = mount("main", CounterList, counters);
```

You end up with one instance of `CounterList` (accessible as `root`) and two instances of `Counter` (not accessible in this example).

It's a very simple model to work with, yet also very flexible.

## Updates

Taking the last two lines from the previous example:

```tsx
const counters = [{ count: 0 }, { count: 0 }];
const root = mount("main", CounterList, counters);
```

You could update the DOM by passing a new model to `render`:

```tsx
root.render([{ count: 1 }, { count: 0 }]);
```

But you could also update the model in place, then call `update`:

```tsx
root.model[0].count = 2;
root.update();
```

That's because the `render` method essentially does this:

```tsx
render(model) {
  this.model = model;
  this.update();
}
```

You could also make the component update automatically when the model is modified by overriding `render` and using the `watch` helper function:

```tsx
import { watch } from "wallace";

CounterList.methods = {
  render(model) {
    this.model = watch(model, () => this.update());
    this.update();
  },
};
```

You now have a reactive component which updates when you click the buttons. You can check it works by adding a total field:

```tsx
const CounterList = (counters) => (
  <div>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <Counter.repeat models={counters} />
  </div>
);
```

## Control

In React you put most of your logic in components, often as hooks. In Wallace you put as little logic as possible in components.

## Engines

Every framework uses an "engine" to translate high level instructions into low level DOM operations. This pattern lets you develop simple functionality much faster, but also creates its own problems, which then slow you down.

engine is an opaque box that you can't see into or modify, and this creates a problem.

Unless you want to manually update the DOM, you must work through this engine, and that

You must either work with it and accept its shortcomings, or bypass it completely and manually update the DOM, which gets ugly.

While this generally saves you time, it can also get in your way in certain situations.

The problem is that this

Some frameworks do part of this during compilation, but still use a runtime engine.

This engine is opaque, cannot be modified, and

This is mostly done through a runtime engine that controls the DOM.

make you more productive by allowing you to

high to DOM. All use engine.
Engine is opaque, and can't be modified.
Creates problems. Reparent without portals.

Wallace has no engine. All that exists at runtime is a tree of components, each of which is an normal object with methods you can override.

Directives are concise wrappers for very crude low level operations.

When you get stuck you can debug, or take progressively more control.

Open architecture.

The question isn't how does this help me, but rather: why on earth would you use a framework that doesn't have this?

## Productivity

The key to understanding productivity is to think of coding time as jumping between two modes:

- **Normal**: adding functionality in a straightforward manner.
- **Tricky**: you need to pause and really think.

Frameworks speed up **normal** mode with structure, abstraction, syntactic sugar and automation. But they _increase_ the time you spend in **tricky** mode by getting in your way, and creating tricky situations of their own.

Unfortunately your brain (and your team lead) often won't realise this as it views tricky mode as "exceptional" and excludes it from its assessment of how fast you're coding!

Wallace has a simple solution to this problem:

> All high level features (abstraction, syntactic sugar and automation) can be peeled back _progressively_ and _completely_.

### Progressively

Reactivity is really convenient, but can also be a source of subtle bugs because you can't readily seen or control when things update.

With Wallace you might start with the `watch` directive, and when you want a bit more control, you customise the callback:

```tsx
<div watch={(target, key, value) => whatever()}></div>
```

If you need even more control you can drop the directive and implement watch manually in the `render` method as we saw above.

Or you may decide to abandon the watch pattern and create dynamic models that bind to a component instance (ActiveRecord pattern).

### Completely

- which no other framework does.

The reason Wallace beats other frameworks is because _all_ its

beats other frameworks on productivity because its

gives you similar abstraction, syntactic sugar and automation as other frameworks. The difference is that:

1. You can peel these layers back to work at progressively lower levels.
2. You can reach the bottom.

On complex projects the extra time spent in **tricky** mode may exceed the savings made in **normal** mode, and you hit the point where you'd have been quicker with jQuery.

## More fun

hubs, override \* inherit, custom directives, pool control, feature strip.

The way to make frameworks more productive is to focus on tricky mode, and that's _precisely_ what Wallace does.

- Tricky is less visible
-

Most frameworks focus on making the **normal** mode more efficient with snazy syntax and better automation. But their design often exacerbate **tricky** mode, and that's what really kills your productivity.

Wallace matches or exceeds other frameworks in **normal** mode,

With Wallace you start off using snazy syntax and full automation and you'll code as fast if not faster than other frameworks. Then, as you encounter tricky situations, you progressively peel back the convenience layers to get more visibility or control.

Let's illustarate this with two examples.

### Reactivity

Reactivity is really convenient, but can also be a source of subtle bugs because you can't readily seen or control when things update.

With Wallace you might start with the `watch` directive, and when you want a bit more control, you customise the callback:

```tsx
<div watch={(target, key, value) => whatever()}></div>
```

If you need even more control you can drop the directive and implement watch manually in the `render` method as we saw above.

Or you may decide to abandon the watch pattern and create dynamic models that bind to a component instance (ActiveRecord pattern).

### Directives

You start with a high-level compact directive:

```tsx
<input bind-as:range={count} />
```

But then decide you want to use a different event:

```tsx
<input bind-as:range={count} event:onblur />
```

The decide you need to do something more complex, so you drop right down:

```tsx
const Counter = ({ count }, { element }) => (
  <div>
    <input type="range" value={count} onBlur={doSomething(element)} />
    {count}
  </div>
);
```

Wallace provides convenience

That's when the framework gets in your way.

Wallace was designed for productivity, then performance - and the way it achieves this is through **progressive control**.

The idea is to start off with high-level compact syntax and ignore internal operations.

The reason Wallace works the way it does is

---

# Old

Points:

- Layers of abstraction

## Code

We'll reuse the code sample from the home page, but with two tweaks that help us cover more topics:

1. Replace the counter's button with a range input.
2. Add an interface and type annotations - but you can omit these if you don't want to use TypeScript.

Here is the modified code:

```tsx
import { mount } from "wallace";
import type { Takes } from "wallace";

interface CounterModel {
  count: number;
}

const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input bind-as:range={count} />
    {count}
  </div>
);

const CounterList: Takes<CounterModel[]> = (counters) => (
  <div watch>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <button onClick={counters.push({ count: 1 })}>Add Counter</button>
    <Counter.repeat models={counters} />
  </div>
);

mount("main", CounterList, [{ count: 0 }]);
```

In here we:

1. Define two components as functions which return JSX.
2. Nest one component within the other.
3. Mount the root component with some data.

It may look similar to React, but Wallace works very differently, and this affects how you use it.

You can code along:

- **Online** with StackBlitz using [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).
- **Locally** with `npx create-wallace-app`

## JSX

Rather than mangling your JSX with JavaScript and losing all sense of structure:

```tsx
// React code - won't work in Wallace!
const CounterList = (counters) => (
  <div>
    {counters.length ? (
      counters.map((c) => <Counter props={c} />)
    ) : (
      <div>No counters</div>
    )}
  </div>
);
```

Wallace uses _directives_ and special syntax for nesting and repeating:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
    <div if={!counters.length}>No counters</div>
  </div>
);
```

You loose some of the flexibility of React, but:

1. Your JSX ends up more compact (around ~50% line count).
2. Your JSX is more readable, and hides fewer bugs.
3. Directives bring more power than plain JSX.
4. You actually gain more freedom, as we'll see later.

You only need to memorise one directive: `help` whose tool tip is a cheat sheet listing all the other directives:

```tsx
const Counter = () => <div help></div>;
```

The module's tool tip covers everything else, so you can access full documentation without leaving your IDE:

```tsx
import {} from "wallace";
```

## Components

During compilation, functions that return JSX get replaced with very different functions that are used as constructors to create objects we call components:

```tsx
const component = new CounterList();
```

You don't usually see this code. In this case it happens in the `mount` which essentially does this:

```tsx
const component = new CounterList();
const target = document.getElementById("main");
component.render([{ count: 0 }]);
target.parentNode.replaceChild(component.el, target);
```

During `render` this `component` object will:

1. Update its own DOM (the total calculation).
2. Create (or reuse) an instance of `Counter` for every item in the array passed to `render` and tell those components to `render` their item.

There is no central coordination, DOM engine or global state. Each component updates its own DOM directly and instructs its nested components to do the same, and so on.

What you end up with is a tree of component objects controlling the DOM tree:

```html
CounterList1 |
<div>
  | | Total: <span>2</span> | | <button>Add Counter</button> | Counter1 |
  <div>| | | <input type="range" />1 | | |</div>
  | Counter2 |
  <div>| | | <input type="range" />1 | | |</div>
  | |
</div>
```

It's a simple model that's easier to visualise and interact with than the functional components typical of virtual DOM based frameworks, which often require awkward patterns like hooks.

## Rendering

The `render` method we saw above looks like this:

```tsx
function render(model, hub) {
  this.set(model, hub);
  this.update();
}
```

The `model` is the main data object passed to a component (the equivalent of React props, but it's one object) and `hub` is an optional second object which can safely ignore for now as we're not using it.

Both are saved as properties on the component during `set`:

```tsx
function set(model, hub) {
  this.model = model;
  this.hub = hub;
}
```

The `update` method coordinates the DOM updates, which we won't display here as it's more complex.

Splitting the flow into three methods lets us do useful things, such as updating a component by modifying its model in-place then calling `update`:

```tsx
const component = new Counter();
component.render({ count: 0 });

const click = () => {
  component.model.count = 1;
  component.update();
};
```

This comes in very handy for reactivity as we'll see later. It also bypasses `render` and `set` which would then only be called from the parent component, allowing us to override those methods to set things up for the "lifecycle" of the component, such as timeouts:

```tsx
CounterList.methods.render = function (model, hub) {
  setTimeout(() => {
    model.timedOut = true;
    this.update();
  }, 3000);
  this.set(model, hub);
  this.update();
};
```

Here `methods` is just a proxy for `prototype` which lets you use more compact syntax without accidentally overwritting the prototype:

```tsx
CounterList.methods = {
  render(model, hub) {},
  udpate() {},
  foo() {},
};
```

Overriding the `update` method is occasionally useful, but you shouldn't override `set` as that gets customised by directives such as `watch`.

## DOM

When you call a component constructor function:

```tsx
new Counter();
```

It creates that component instance's initial DOM and saves references to any dynamic elements so they can be accessed later without traversing the DOM, which is costly.

During `update` the component will read each value used, compare it to the previous value, and only update the element if it has changed since last update.

This is both highly efficient and robust, as you can layer in manual operations without breaking the component. To illustrate this let's use a `ref` to manually disable the input if `count` exceeds three:

```tsx
const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input ref:input bind-as:range={count} />
    {count}
  </div>
);

CounterList.methods = {
  update() {
    this.base.update.call(this);
    this.ref.input.disabled = this.model.count > 3;
  },
};
```

In the above:

- `this.base` lets you call the base methods.
- `this.ref.input` points to the actual DOM element.

We are able to set the `disabled` property manually while letting the component control its value and event handling without any clash.

Of course you could have used an expression with the `disabled` attribute:

```tsx
<input disabled={count > 3} bind-as:range={count} />
```

The end result and underlying opertations would be the same, except the later would not update the element if it was hidden by an `if` statement or similar, as `update` takes this into account.

If you want to the best of both (change the element manually, but only if it is visible) use the `apply` directive:

```tsx
<div apply={doStuff(element)} />
```

This is an example of **progressive control**, which is a concept you'll be seeing throughout Wallace. The idea being that you:

1. Start by using the compact syntax convenience mode, in this case attributes and basic directives.
2. If you need more control, switch to a more powerful directive, like `apply`.
3. If you need even more control, use `ref` and override `update`.

## Freedom

Most components don't override methods or access the DOM directly:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
    <div if={!counters.length}>No counters</div>
  </div>
);
```

In which case it doesn't really matter how the framework implements things under the hood, and you can essentially ignore the last three sections.

Where it does matter is in those pesky little edge cases which consume a disproportionate amount of dev time such as:

- Reparenting components.
- Altering a top level component without updating its nested components.
- Libraries like [chart.js](https://www.chartjs.org/) requires elements be attached to the DOM before it can do anything to them.

These can wreak havoc on frameworks, which are forced to come up with elaborate features (like React's portals) or use plugins which further bloat your bundle. Sometimes there is no neat solution, meaning you are effectively trapped by the framework.

Wallace avoids these problem as it has a fully open architecture: all that exists at run time is a tree of components whose behaviour you can fully override, and whose internal operations are simple enough to interact with.

You will never be trapped by Wallace, or reliant on fixes or plugins to deal with gnarly situations. Wallace essentially comes with an eject button, except that **progressive control** means you rarely have to push the button all the way.

This will make more sense with the coming sections.

## Directives

Directives are JSX attributes which do something special.

They take effect during transpilation, so all the heavy lifting involved in interpreting, validating and combining your instructions happens then, rather than at run time. Similarly, all the code involved in doing this work stays out of your bundle, leaving behind only compact instructions.

This means we can add endless directives, permutations and combinations at no extra cost, which helps us offer progressive control.

The ` bind-as:range` directive is a perfect example:

```tsx
<input bind-as:range={count} />
```

That is just a more compact way of setting the input type and binding to the property you're most likely interested in:

```tsx
<input type="range" bind:valueAsNumber={count} />
```

And binding is just a more compact way of creating a two-way update manually:

```tsx
<input type="range" value={count} onChange={(count = element.valueAsNumber)} />
```

We'll explain where that `element` comes from and why changing `count` updates our component in the next couple of sections. The point here is that all three permutations compile to the _exact_ same code.

Again the idea is to start at the highest level of abstraction with the most compact syntax, and progressively drop to lower levels with lengthier syntax as you need to deviate from default behaviour.

You might want to parse or format a value, or change the event which triggers the change, - although you can do that with `event` which is an example of combining directives:

```tsx
<input bind-as:range={count} event:input />
```

> The total now updates as you move the slider, rather than when you let go.

The part after `:` is called the qualifier, and acts as an extra variable, or for directives which simply require a text value it is interpreted as the value, so `event:input` equates to `event="input"`.

You can also define your own directives or override stock directives if you don't like the defaults:

```tsx
// Just an example - won't work unless you implement it.
<input bind-range:count />
```

## Xargs

Component functions may specify a second parameter called **xargs** which contains various helpful extras, like `element`:

```tsx
const Counter: Takes<CounterModel> = ({ count }, { element }) => (
  <div>
    <input
      type="range"
      value={count}
      onChange={(count = element.valueAsNumber)}
    />
  </div>
);
```

Remember this is not a real function, and these parameters do NOT equate to the arguments passed into `render`:

```tsx
// hub does not become xargs
component.render(model, hub);
```

However, `hub` (which we'll cover soon) is one of the arguments available in xargs, along with:

- `self` - alias for `this` as `this` is not allowed in arrow functions.
- `model` - alias for `this.model` which is useful when the main `model` parameter is destructured (i.e. `{count}` instead of `model`)
- `event` - the event, where applicable.
- `element` - the DOM element, where applicable.

The `model` parameter _may_ be destructured to exactly one level, but the `xargs` parameter _must_ be destructured to exactly one level. Renaming is not supported. If destructured, the model is reassembled in the generated code, so the `onChange` event handler would look like this:

```tsx
function (event) {
  this.model.count = event.element.valueAsNumber;
}
```

This matters for reactivity which we'll look at next.

The `event` and `element` xargs can be referenced multiple times in the component, but it will point to their respective event and element in each location used. You can even give them different types:

```tsx
const Example = (_, { event }) => (
  <div>
    <button onClick={handleClick(event as PointerEvent)}>Click me</button>
    <input onKeyPress={handleKeyPress(event as KeyboardEvent)} />
  </div>
);

const handleClick = (event: PointerEvent) => {};
const handleKeyPress = (event: KeyboardEvent) => {};
```

## Reactivity

The `watch` directive causes the component to update whenver its model is modified by that component or any nested components, thereby making our app reactive:

```tsx
const CounterList = (counters) => (
  <div watch>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <button onClick={counters.push({ count: 1 })}>Add Counter</button>
    <Counter.repeat models={counters} />
  </div>
);
```

It does this by modifying the `set` method to look like this:

```tsx
import { watch } from "wallace";

function set(model, hub) {
  this.model = watch(model, () => this.update());
  this.hub = hub;
}
```

The `watch` function (not to be confused with the `watch` directive) returns a proxy of an object which fires a callback when it (or any of its nested objects) is modified:

```tsx
import { watch } from "wallace";

const original = [{ count: 0 }];
const callback = () => console.log("modified");
const watched = watch(original, callback);

// Each of these lines fires the callback:
watched[0].count = 1;
watched.push({ count: 2 });
watched.reverse();

// And also modifies the original:
console.log(original) > [{ count: 2 }, { count: 1 }];
```

The proxy returns a new proxy for nested elements, which also fire the callback. So `watched[0]` is a proxy of the object at `original[0]` which is why changing the `count` property via the input in `Counter` also makes the `CounterList` update.

The important part of this is that watching of data is totally decoupled from the updating of components, which makes it easy to:

1. Follow exactly how, why and when updates are triggered.
2. Control what gets watched and what happens when parts change.

Reactivity is very prone to confusing, hard to diagnose bugs, so having full visibility and control really helps.

Again the idea is to start out with the basic format, then drop down to lower level when you need different behaviour or (even temporary) visibility, which you can do by passing a callback to the `watch` directive:

```tsx
const CounterList = (counters, { self }) => (
  <div watch={() => countersChanged(self, counters)}>...</div>
);

const countersChanged = (component, counters) => {
  localStorage.setItem("data", JSON.stringify(data));
  component.update();
};
```

If you need even more control you're best removing the `watch` directive and setting it up yourself in `render`. Say you have some UI state in the model which should update the UI but shouldn't trigger a data save:

```tsx
import { mount, watch } from "wallace";
import type { Takes } from "wallace";

interface CounterModel {
  count: number;
}

interface CounterListModel {
  counters: CounterModel[];
  state: {
    showTotal: boolean;
  };
}

const CounterList: Takes<CounterListModel> = ({ counters, state }) => (
  <div>
    <div>
      <label>Show Total</label>
      <input bind-as:checkbox={state.showTotal} />
      <div if={state.showTotal}>
        Total: {counters.reduce((a, c) => a + c.count, 0)}
      </div>
    </div>
    <button onClick={counters.push({ count: 1 })}>Add Counter</button>
    <Counter.repeat models={counters} />
  </div>
);

CounterList.methods = {
  render({ counters, state }) {
    const model = {
      counters: watch(counters, () => countersChanged(this, counters)),
      state: watch(state, () => this.update()),
    };
    this.set(model);
    this.udpate();
  },
};

mount("main", CounterList, {
  counters: [{ count: 0 }],
  state: { showTotal: true },
});
```

We'll look at more fine grained updates in a bit, but first lets look at a nicer way to handle state.

## Hubs

Say we want to access the `state` from the `Counter` components. This gets messy when we only have a single input into a component (the model) and that's where hubs come in.

Any function which accepts a `model` argument (such as `mount`, `render`, `set`) also accepts an optional `hub` argument right after it. Lets move the state to that slot, and add a "mode" which the `Counter` will access.

```tsx
mount(
  "main",
  CounterList,
  [{ count: 0 }], // model
  { showTotal: true, mode: "button" } // hub
);
```

As we saw earlier, this gets saved on the component instance during `set` just like `model`:

```tsx
function set(model, hub) {
  this.model = model;
  this.hub = hub;
}
```

What makes `hub` special is that it is automatically propagated to nested components, meaning the whole tree from that point down shares the same `hub` object.

Components access their `hub` in their **xargs**, whose type you can also annotate with `Takes`:

```tsx
interface Hub {
  showTotal: boolean;
  mode: "range" | "button";
}

const Counter: Takes<CounterModel, Hub> = ({ count }, { hub }) => (
  <div>
    <div if={hub.mode === "range"}>
      <input bind-as:range={count} />
      {count}
    </div>
    <button if={hub.mode === "button"} onClick={count++}>
      {count}
    </button>
  </div>
);
```

Here we used the hub to share a plain object with state, which we can watch it just like we watch the model.

We can also use the hub to share custom objects with methods, getters and setters, which we can think of as controllers. These often have a reference to a component so they can trigger updates:

```tsx
class Controller {
  constructor(root) {
    this.root = root;
    this._showTotal = true;
  }
  get showTotal() {
    return this._showTotal;
  }
  set showTotal(value) {
    this._showTotal = value;
    this.root.update();
  }
}

CounterList.methods = {
  render(counters) {
    this.set(model, new Controller(this));
    this.udpate();
  },
};

mount("main", CounterList, [{ count: 1 }]);
```

Notice how we:

1. Instantiated the controller in `render` rather than passing it in.
2. Used setters to produce reactive behaviour instead of `watch`.

Both of these alternatives are perfectly valid. Use whatever feels best according to your needs.

## Models

Of course we can also use custom objects as models, which is a very powerful pattern. Although it is overkill for our example, let's see what these classes might look like:

```tsx
import type { ComponentInstance } from "wallace";

interface CounterData {
  count: number;
}

class CounterModel {
  data: CounterData;
  controller: Controller;
  constructor(data: CounterData, controller: Controller) {
    this.data = data;
    this.controller = controller;
  }
  get count() {
    return this.data.count;
  }
  set count(count) {
    this.data.count = count;
    this.controller.update();
  }
}

class Controller {
  root: ComponentInstance;
  data: CounterData[];
  counters: CounterModel[];
  constructor(data: CounterData[]) {
    this.data = data;
    this.counters = data.map((d) => new CounterModel(d, this));
  }
  newCounter() {
    const data = { count: 0 };
    this.data.push(data);
    this.counters.push(new CounterModel(data, this));
    this.update();
  }
  update() {
    this.root.update();
  }
  total() {
    return this.counters.reduce((t, c) => t + c.count, 0);
  }
}
```

And here is how they are used in the component:

```tsx
import { mount } from "wallace";
import type { Takes } from "wallace";
import { CounterModel, Controller } from "./models";

const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input bind-as:range={count} />
    {count}
  </div>
);

const CounterList: Takes<Controller> = (ctrl) => (
  <div assign:root>
    Total: {ctrl.total()}
    <button onClick={ctrl.newCounter()}>Add Counter</button>
    <Counter.repeat models={ctrl.counters} />
  </div>
);

mount("main", CounterList, new Controller([{ count: 0 }]));
```

The `assign` directive assigns the component instance to a value, usually a property on the model, in which case we can use the shorthand notation shown, which equates to this:

```tsx
<div assign={ctrl.root}>
```

It works by modifying the `set` function as follows:

```tsx
function set(model, hub) {
  this.model = model;
  this.hub = hub;
  model.root = this;
}
```

Although we end up writing more code, that extra code is free code (nothing to do with the framework) and we actually end with _less_ framework code. Free code is quicker to work with on two counts:

1. It is easier to assess whether it is correct just by looking at it, as we understand it fully and there's no framework operation to take into account.
2. You have the full range of constructs available in that language to organise your code with, whereas framework code may impose some restrictions.

There are two major benefits to this, which relate to the fact different kinds of code have different qualities.

Time to certainty is how long you need to stare at a piece of code to be certain it has no errors. Organisation potential is how much power you have organise your code clearly and without duplication etc.

|           | Time to Certainty | Organisation Potential |
| --------- | ----------------- | ---------------------- |
| Regex     | Terrible          | Terrible               |
| Framework | Average           | Average                |
| Free      | Best              | Best                   |

You will be more efficient working with a codebase

#### Certainty

Different kinds of code

Firstly we tend to suspect framework

This approach has a couple of small benefits:

- We don't need the hub to share the `Controller` as the `CounterModel` has a reference to it.
- We don't need interfaces, as classes are their own interface.
- The `CounterList` has become a lot simpler.

The bigger change is subtle but radical: the locus of control has shifted from the components to our classes. To understand the impact, let's follow what would happen to both as the application grows.

#### Components

The components are now essentially the dumb outer layer of the application concerned only with displaying data and capturing events. All the logic, complexity and coordination is in the models and controller classes.

The code ends up very simple, readable and unlikely to conceal errors.

#### Classes

All your logic now resides in classes whose only coupling to components is by simple references. This code has nothing to do with the framework, which is a good thing as:

1. You have the full freedom of JavaScript to organise your code and reuse through inheritance, composition, factories and more.
2. You don't need to consider the framework when debugging.

This makes your life a lot easier.

Of course your components may need to be organised to prevent duplication too, and there are two main ways to achieve this.

### Stubs

Stubs are slots for nested components that can be overridden when extending the component.

```tsx
import { extendComponent } from "wallace";

const RangeCounter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input bind-as:range={count} />
    {count}
  </div>
);

const ButtonCounter: Takes<CounterModel> = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList: Takes<Controller> = (ctrl) => (
  <div assign:root>
    Total: {ctrl.total()}
    <button onClick={ctrl.newCounter()}>Add Counter</button>
    <stub.counter.repeat models={ctrl.counters} />
  </div>
);

const CounterListWithRange = extendComponent(CounterList);
CounterListWithRange.stub.counter = RangeCounter;

const CounterListWithButton = extendComponent(CounterList);
CounterListWithRange.stub.counter = ButtonCounter;
```

The extended components also inherit methods.

### Factories

Use a function to return a component definition:

```tsx
export function getCounterList<CounterModel>(
  Counter: ComponentFunction<CounterModel>
) {
  const CounterList: Takes<Controller> = (ctrl) => (
    <div>
      Total: {ctrl.total()}
      <button onClick={ctrl.newCounter()}>Add Counter</button>
      <Counter.repeat models={ctrl.counters} />
    </div>
  );
  return CounterList;
}

const CounterListWithRange = getCounterList(RangeCounter);
const CounterListWithButton = getCounterList(ButtonCounter);
```

This allows you to decide what component to nest at run time.

## Updates

So far we have been telling the root component to `udpate` whenever data changes, which is generally fine as it only touches those parts of the DOM that actually need to changed. But in larger apps where performance matters we can streamline this further by combining two approaches.

The `part` directive lets you delineate parts within a component (including repeated components) which you can update independently:

```tsx
const CounterList: Takes<Controller> = (ctrl) => (
  <div>
    <div part:total>Total: {ctrl.total()}</div>
    <button onClick={ctrl.newCounter()}>Add Counter</button>
    <Counter.repeat part:counters models={ctrl.counters} />
  </div>
);

CounterList.methods = {
  updateTotal() {
    this.part.total.update();
  },
  updateCounters() {
    this.part.counters.update();
  },
};
```

We could also update specific `Counter` components by assigning them to a model:

```tsx
const Counter: Takes<CounterModel> = ({ count }) => (
  <div assign:component>
    <input bind-as:range={count} />
    {count}
  </div>
);
```

Or to a register:

```tsx
const Counter: Takes<CounterModel> = ({ count, id }, { hub }) => (
  <div assign={hub.counterComponents[id]}>
    <input bind-as:range={count} />
    {count}
  </div>
);
```

Which lets you target components deeply nested in the tree.

You can combine these two approaches:

```tsx
CounterList.methods = {
  updateCounter(id) {
    this.models.find((counter) => counter.id === id).component.update();
    this.part.total.update();
  },
};
```

These capabilities lets you match the performance of any vanilla app, while keeping your code clean, safe and sane.

## Conclusion

Wallace was designed to provide the benefits of a framework:

- Structure and organisation
- Declarative syntax
- Reactivity

Without the disadvantages:

- Bloated bundles
- Learning curve
- Restricted freedom

That last point is often overlooked. We can't anticipate what the web will throw at us, and handing over control of the DOM to a framework whose operations cannot be modified (as is the case in virtually all frameworks) is a very risk move.

Wallace's basic architecture was designed to let you override _everything_, and though you may not need that freedom day-to-day, knowing you have it is a welcome safety net.

As it turns out, that initial architectural decision led to Wallace becoming a very versatile tool which lends itself to a range of situations:

- Tiny size > good for landing pages.
- Concise syntax and easy reactivity > good for simple apps and prototypes.
- Closeness to the DOM > good for performance-critical pages.
- Built-in documentation > good for those who don't use it every day.
- OOP patterns > good for managing large complex apps.

This emphasis on freedom also explains how Wallace got its name, which makes a lot more sense if you've seen [Braveheart](https://www.imdb.com/title/tt0112573/) (or for a more modern adaptation: this [sketch](https://www.youtube.com/watch?v=HbDnxzrbxn4)).

![](/public/img/braveheart-1.jpg)

Frameworks are integral to modern front end development yet come with obvious downsides:

1. They add **bloat** to your bundle.
2. They **perform** poorly in certain scenarios.
3. They require more **learning**.

But it's the less obvious downsides that really hurt your productivity:

1. They **obscure** operations, which impedes debugging.
2. They force awkward **patterns**, like hooks.
3. They restrict your **freedom**.

This tour shows you how Wallace works, and how it solves these issues.

that your first instinct may be to use it the same way, and get frustrated when you realise you can't.

with its JSX and components, but

## Overview

Wallace initially looks like React with its JSX and components, but

clone with questionable changes.

typical modern reactive framework, but it is unique in that it has a fully open architecture which solves on the major problems of using a framework.

Every framework you've heard of uses an opaque and immutable runtime engine, which can occasionally:

1. Prevent you from doing simple things/force you to do stupid things.
2. Perform poorly.
3. Impede debugging.

Wallace has no engine, just a tree of components objects, which you can fully customise and interact with.

Wallace initially looks like a dysfunctional clone of React with its restricted JSX and stateful components. But once you understand why it's built this way, you'll never look back.

The TLDR is that Wallace is the only framework with an open architecture instead of a DOM engine.

This tour shows you how Wallace works, and how that helps you develop faster. We use plain JavaScript/JSX in the examples, but Wallace includes extensive TypeScript support too.

It assumes you have used a framework such as React before.

Although Wallace itself is very simple to understand and use, understanding how it avoids the problems present in other frameworks is a bit more involved. This tour covers all of this.

No engine
Less framework

At this point you must be wondering why anyone would create a framework that looks like React, yet doesn't support its most basic capabilities - let alone boast that it is better than React.

By the end of this tour

The answer is that Wallace differs from React in how it works and how you use it, and these differences solve many of the problems with React and other framweorks.

This tour answers two questions:

1. What's it like using it?
2. Why should I use it instead of React/Angular/Vue/Svelte etc...

- WHat's in the tour
- Looks like React
- Can't do the same things
- In 2026 the question is really why use it instead of React/others
- what is wrong with others
- all jsx in one file

The main obstacle to learning and understanding Wallace is that it looks like React.

The following snippet mounts a button to the page (replacing the element with id `main`) which displays how many times it has been clicked:

It looks similar to React, which causes a few problems.

The first is that you can't do.

which is a problem for two reasons:

1. You might try to use it like React.

in that we defined a component as a function that returns JSX, but it works _very_ differently.

Wallace may look like React to begin with, but the deeper you go, the more different it gets. Some of it won't make sense until you see the bigger picture, so do keep reading.

Some jargon you'll encounter:

- `Counter` is a _component definition_.
- `watch`, `help` and `onClick` are _directives_.
- `{ count: 0}` is the _model_ we pass to the _component instance_ that will be created by `mount`.

Directives add behaviour to the component, except for `help` which does nothing other than display a tooltip in your IDE which lists all the other directives.

And if you hover over the `"wallace"` import you see a full cheat sheet, so you can look up most things without leaving your IDE.

If you want type support, you must use `Takes` instead of just annotating the argument:

```tsx
import { mount } from "wallace";
import type { Takes } from "wallace";

interface CounterModel {
  count: number;
}

const Counter: Takes<CounterModel> = ({ count }) => (
  <div watch>
    <button onClick={count++} />
    {count}
  </div>
);

mount("main", Counter, { couuunt: 0 });
```

We'll omit types for the rest of the tour to keep things simple.
