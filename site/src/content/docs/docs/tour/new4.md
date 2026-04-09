---
title: Tour
sidebar:
  order: 2
---

## Introduction

Front-end frameworks create a layer between you and the DOM which lets you focus the high-level "what" without worrying about the low-level "how". This helps you develop apps faster, but there are some downsides too. The layer does a lot for you and inevitably ends up rather fat, complex and opaque - which causes several problems:

##### Visibility

It can be difficult to see exactly what the layer is doing, which slows down debugging. It can also produce (and hide) unintended behaviours, especially around reactivity.

##### Constraints

Working via this layer forces you to do things a certain way, which can sometimes be a problem. It also works at the speed it works, and if that's too slow you may be in a pickle. You can sometimes bypass the layer and deal with the resulting DOM directly, but that's messy at best.

##### Complexity

Your work involves interacting with the layer, which brings its own complexity and expertise.

The two big questions are:

- How much time does this really cost?
- How does Wallace solve this problem?

To answer that we're going to create an app which lets you track how many minutes you spend on different activities in a day:

```tsx
import { mount } from "wallace";

const Activity = ({ name, minutes }) => (
  <div>
    <label>{name}</label>
    <input bind-as:range={minutes} max={24 * 60} />
    {minutes}
  </div>
);

const ActivityTracker = (activities) => (
  <div watch>
    Total: {getTotal(activities)}
    <Activity.repeat models={activities} />
  </div>
);

const getTotal = (items) => items.reduce((t, i) => t + i.minutes, 0);

mount("main", ActivityTracker, [
  { name: "Reading", minutes: 0 },
  { name: "Writing", minutes: 0 },
]);
```

links

If you were to use this app to track time spent in your editor as you develop a real app with your favourite framework, dividing time two categories:

- **Moving** - you are typing away and churning out changes.
- **Stalled** - you haven't typed anything for 30 seconds because you're stuck in "wait, what, why, how, but, what if, but then, hmmm..." territory.

You'd notice that in the early stages most of your time is in the moving category, and the stalling is mostly future proofing, so it's productive. But as the project grows, the ratio shifts and your velocity plummets.

Wallace works by creating several thin layers.

Here is

The overall approach is similar to other frameworks, in that you:

- Define a tree of components with declarative syntax.
- Mount the root component with some data.
- Let the framework do its magic.

Where Wallace differs from other frameworks is in how it implements that magic.

### Magic

We call it "magic" because it looks impressive and we tend not to understand how it works. This lets us focus on the _what_ without worrying about _how_, and develop much faster as a result, but there's a catch.

If you were to use this app to track time spent in your editor as you develop a real app with your favourite framework, dividing time two categories:

- **Moving** - you are typing away and churning out changes.
- **Stalled** - you haven't typed anything for 30 seconds because you're stuck in "wait, what, why, how, but, what if, but then, hmmm..." territory.

You'd notice that in the early stages most of your time is in the moving category, and the stalling is mostly future proofing, so it's productive. But as the project grows, the ratio shifts and your velocity plummets.

There are many reasons for this, but one that's overlooked is the framework itself, which stalls you by:

- Forcing you to find workarounds to the various constraints it imposes.
- Slowing down debugging with layers of behaviour you can't see.
- Causing unintended behaviour (very common with reactivity).

To understand why frameworks do this, and why Wallace doesn't, we need to talk about engines.

### Engines

A framework is a set of engines: one interprets your syntax, another manages the DOM, and another deals with reactivity. Most of the time these engines are fused into one big engine whose internals are too complex to work with.

We accept that converting high-level declarative syntax into low-level DOM operations is a very tricky business.

That's a big gap to span, full of tricky complexities that need to be handled and the way frameworks bridge it is by building a very clever bridge.

The way Wallace does this is by picking islands between the two shores and building really simple bridges between them.

Where Wallace differs is how it implements that magic, which impacts your velocity, particularly as your project grows in complexity.

that its magic is open, rather than closed, which lets you drop down

, which has far reaching implications on developer productivity/solves all the problems of using a framework.

creates a layer of abstraction between you and the DOM so you can work with the high level "what" without worrying about the low-level "how". The problem is that this layer gets very complex.

## Overview

Naturally, this example was picked to illustrate what goes wrong, and how Wallace solves this.

#### Where it goes wrong

To understand where this goes wrong, imagine using this app to track time spent at your editor, in two categories:

- **Moving** - you are typing away and churning out changes.
- **Stalled** - you haven't typed anything for 30 seconds because you're muttering "wait, what, why, how, but, what if, but then, hmmm..."

In the early stages of a project you'll spend most of your time moving, and the stalling is mostly setting up reusable patterns for later, so it's productive. But as the project grows more complex, the ratio shifts, you stall on annoying, unexpected and unproductive problems, and your velocity plummets.

There are many contributing factors, some of which are unavoidable, but one that is overlooked is the framework itself. The hidden magic which gave you such a boost when moving becomes an increasing liability with complexity through:

- Unintended behaviour - most common with reactivity.
- Decreased visibility, leading to slower debugging.
- Convoluted constraints that require workarounds.

You'd be amazed at how this all adds up.

#### How Wallace solves this

A frameworks coordinates the foot soldiers (DOM operations) so you can work like a general (high level instructions: what not how)

---

A framework sits between you and the DOM, so you can focus on the what and forget about the how. This has advantages and disadvantages.

(list them)

Instead of a black box, Wallace puts layers, which you can peel back, getting progressively closer to the low-level operations.

This simplifies, makes debugging a lot easier, and imposes virtually no restrictions

You work at a high level, or a very low level. A fat opaque layer.

It obviously uses intermediate steps, but those are hidden framework internals. With Wallace they are not. It is an open framework.

---

3 points then general vs soldier analogy.

- can't speak to the corporals or sargents. At best you can step out of your bunker and give the soldiers direct orders, but that's not ideal.

All these things slow you down, to an unknown extent, because we don't measure time minute by minute in this categorisation.

So despite working much faster than you would without a framework, each framework also adds its own slow down.

-
- The framework converts the declarative instructions into DOM operations.

Where Wallace differs is in what the magic tries to do. A framework must bridge

-

The idea being that you can develop functionality a whole lot quicker than without a framework.

But it's not a walk in the park. Magic has a way of backfiring with:

-

problem with magic is that although it boosts your velocity initially, but eventually comes back to bite you

The framework takes care of the rest.

```
example
much like others
	magic
magic bad (long)
declarative
	bridge
```

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
const ExerciseList = (activities) => (
  <div watch>
    Total: {sumCount(activities)}
    <Exercise.repeat models={activities} />
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

(aside from cleaner syntax, smaller bundles and better performance)

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
