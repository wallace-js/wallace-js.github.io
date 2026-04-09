---
title: Tour
sidebar:
  order: 2
---

This tour:

- Assumes you are familiar with front end development.
- Covers almost everything you need to know.
- Should take 15-20 minutes.

It's not a tutorial, but you can code along:

- **Online** with StackBlitz using [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).
- **Locally** with `npx create-wallace-app`.

## Overview

(aside from cleaner syntax, smaller bundles and better performance)

Here is a simple exercise tracker:

```tsx
import { mount } from "wallace";

const Exercise = ({ name, count }) => (
  <div>
    <label>{name}</label>
    <input bind-as:range={count} />
    {count}
  </div>
);

const ExerciseList = (exercises) => (
  <div watch>
    Total: {sumCount(exercises)}
    <Exercise.repeat models={exercises} />
  </div>
);

const sumCount = (items) => items.reduce((acc, e) => acc + e.count, 0);

mount("main", ExerciseList, [
  { name: "Pushups", count: 0 },
  { name: "Chinups", count: 0 },
]);
```

The overall structure is much like your average modern framework:

- You define a tree of components using declarative JSX.
- You mount the root component with some data.
- Some hidden magic wires it all together.

What sets Wallace apart from other frameworks is its attitude towards magic.

### Magic

By magic we mean those bits which deliver a lot for very little, without needing to understand how it works. A good example is the `watch` directive in `ExerciseList` which essentially makes our app reactive.

Magic saves time by reducing the amount of code and thinking required, but can also steal time back in several ways:

##### Unintended behaviour

This mainly affects reactivity, which is a major source of glitches, bugs and performance sinks in any framework.

##### Confusion

Magic can make it much harder to determine why something is happening, even if it's nothing to do with the magic.

##### Restrictions

Automation imposes constraints. For several years it was impossible to "reparent" a React component, which was bummer if your app suddenly found itself needing to do that (this is now resolved, but involves portal guns or something like that). Another generic restriction is performance: a framework typically runs as fast as it runs, and if that's not fast enough, you could end up in a pickle.

The problem with these problems is that they're mostly invisible:

1. Frameworks don't advertise them.
2. Projects don't anticipate them.
3. Developers don't measure them.

Velocity is less about how fast you can code when it's smooth-sailing,

But they add up, and slow you down.

These hidden costs add up, and often reveal themselves late in the project, by which time it's far too late to switch framework.

### Bridges

A framework must translate user-level syntax into DOM-level instructions. In order to bridge that gap and deal with the many quirks and complexities in between, most frameworks build a very sophisticated bridge.

Wallace picks islands between these two shores and builds very simple little bridges between them. This reduces complexity, and gives you full control as you can choose which island you work from.

To see how this approach solves the problems of using a framework, we're going to dismantle our example bit by bit.

#### mount

Don't often need to bypass, but it shows how Wallace works, so it's a useful exercise.

```tsx
mount("main", ExerciseList, [
  { name: "Pushups", count: 0 },
  { name: "Chinups", count: 0 },
]);
```

The call to `mount` attaches the `ScoreApp` to the document and kicks off the

```tsx
const root = new ExerciseList();
document.body.appendChild(root.el);
root.render([{ score: 1 }, { score: 1 }]);
```

It's a component. Compilation.

#### placeholders

```tsx
const Exercise = ({ name, count }) => (
  <div>
    <label>{name}</label>
    <input bind-as:range={count} />
    {count}
  </div>
);
```

```tsx
const Exercise = ({ name, count }) => (
  <div>
    <label ref:lbl></label>
    <input bind-as:range={count} />
    {count}
  </div>
);

Exercise.methods = {
  update() {
    this.base.update.call(this);
    this.ref.lbl.textContent = this.model.name;
  },
};
```

Manual DOM using ref.

Speed.

Apply

#### bind

The `bind-as` directive:

```tsx
<input bind-as:range={count} />
```

Is just a shorthand for setting the type and binding to the property you most likely want for that type:

```tsx
<input type="range" bind:valueAsNumber={count} />
```

Which in turn is shorthand for this:

```tsx
<input type="range" value={count} onChange={(count = element.valueAsNumber)} />
```

By default `bind` binds to the input's `value` which is a string, so this would totally mess up the total:

```tsx
<input type="range" bind={count} />
```

By default, bind responds to the `change` event, which fires once the input loses focus. If you want to update the UI in live time you could use the `input` event:

```tsx
<input bind-as:range={count} event:input />
```

The idea is to use high-level concise syntax for default behaviour, and drop to progressively longer forms as you need to deviate from defaults.

Directives operate during compilation, so both of these result in the exact same code:

```tsx
<input bind-as:range={count} />
<input type="range" value={count} onChange={count = element.valueAsNumber} />
```

You can add endless custom directives without increasing bundle size:

```tsx
<input range-input={count} />
```

Talk about directives.

Change to event, use xargs.

#### watch

The watch directive acts on the component, not the element, and must only be used on the root element:

```tsx
const ExerciseList = (exercises) => (
  <div watch>
    Total: {sumCount(exercises)}
    <Exercise.repeat models={exercises} />
  </div>
);
```

What this does is it modifies that component's `set` method (which gets called at each `render`) from the default:

```tsx
ExerciseList.methods = {
  set(model, hub) {
    this.model = model;
    this.hub = hub;
  },
};
```

To this:

```tsx
ExerciseList.methods = {
  set(model, hub) {
    this.model = watch(model, () => this.update());
    this.hub = hub;
  },
};
```

And `watch` is just a helper function that returns a proxy of the original which fires a callback when it is modified:

```tsx
import { watch } from "wallace";

const original = [{ count: 1 }];
const arr = watch(original, () => console.log("Array changed"));

// Each of these fire the callback:
arr.push({ count: 1 });
arr[0].count = 2;
arr.reverse();
```

Here is another way you could have structured the app.

```tsx
const data = [
  { name: "Pushups", count: 0 },
  { name: "Chinups", count: 0 },
];
const reactiveData = watch(data, () => root.update());
const root = mount("main", ExerciseList, reactiveData);
```

Of course you'd only watch the entire data and update the root component in small applications.

So it's not the components that are reactive. Components deal with the DOM.

In fact you should only use the `watch` directive for simple things like forms. If you're working with real data you can use smart models, or hubs, covered below.

```tsx
ExerciseList.methods = {
  render(model, hub) {
    this.set(
      watch(model, () => this.update()),
      hub
    );
    this.udpate();
  },
};
```

Wallace avoids these pitfalls, not by being oh-so-clever, but by being very dumb. Every bit that feels magic is actually

### Enter Wallace

Wallace was designed by a back-end developer who loves front end work, but was thoroughly annoyed at the awkwardness of React, and refused to use reactive frameworks due to residual trauma from his days of Angular.

### How Wallace Works

Most frameworks do their magic in a hidden engine which you're not supposed to peek into. Others like Svelte translate declarative code into a blob of optimised DOM operations during compilation. Wallace also compiles,

Wallace does it's clever stuff during compilation, like Svelte, except that the clever stuff is

Whenever something feels like magic in Wallace, it's just syntactic sugar over a rather simple operation, and you can easily drop to the lower level of abstraction (sometimes several) to diagnose a malfunction or take more manual control of operations.

### Conclusion

The difference in knowing how your framework works.

Avoids the disadvantages common to all other frameworks.

End with freedom.

## Other tricks

### Help

### TypeScript

### Parts

### Hubs

### Stubs

### Directives

- If you've seen this kind of thing before you should be able to deduce a fw
- It's similar to many o
- The overall structure is similar

There is obviously some kind of magic involved in translating this declarative syntax into DOM update.

```
Observations
	like react
	magic
	declarative

	magic bad
		debugging
		performance
		freedom
```

Wallace mirrors React's overall structure in that you:

1. Define components as functions that return JSX.
2. Nest components to form a tree.
3. Attach the root component to the document.

For example:

##### Learning

You not only need to learn how to use the framework and the libraries you use with it, but also how to solve design problems in the context of the framework.

1. You can't predict which will hit your project.
2. As developers we tend to see time spent on these problems as exceptional: it was unplanned, shouldn't have happened and hopefully won't happen again.
