---
title: Pooling
sidebar:
  order: 18
---

# Overview

Creating DOM is expensive, and mature frameworks typically have a strategy for recycling discarded DOM.

Wallace recycles component instances by pooling them (rather than recycle raw DOM fragments like some other frameworks do) and you need to be aware of this as there are:

1. Implications
2. Opportunities.

## Operation

Each component definition has a `pool` property which is an array of instances that have been detached and returned to it by repeaters and detachers (internal objects which handle conditional nesting) which can be therefore be reused:

```tsx
// Assuming there are instances in the pool.
const counter = Counter.pool.pop();
```

When repeaters or detachers need to create new instances, they will take from the pool first.

Note that only nested components detached by their parent are returned to the pool. Detaching a component from the DOM manually will not return it, or its nested components to their respective pools. To return a component's nested components to their respective pools, you must call `dismount`:

```tsx
counter.dismount();
```

Note that this doesn't return `counter` to the pool - as its parent would usually do that.

## Implications

The major implication is that component instances get reused without any kind of clean-up, which means that they must never hold state that isn't reset during `render`. This is no  different to the situation of components being reused within a sequential repeater. See [state](/docs/reference/state) for further details.

A secondary implication is that using pools isn't free, and in certain rare cases you may be better off not doing that. You can either disable this behaviour across the board using [flags](/docs/reference/flags), or override the `dismount` method of specific components to alter the behaviour.

## Opportunities

Any framework that recycles DOM presents an opportunity to potentially speed up initial page loading, but Wallace makes this even easier.

The default sequence of operations for a page which displays remote data is as follows:

1. Initialise framework.
2. Send asynchronous call to fetch data from API.
3. Display temporary UI while waiting for data.
4. Update UI with data returned from fetch.

Say step 2 takes 2000ms and step 4 takes 1000ms because it creates a lot of DOM. That's 3000ms added to your page load because you're starting step 4 after step 2 returns. If you create that DOM while waiting for step 2 to return, then you might be able to populate it in 100ms, cutting 900ms off your loading time.

> This is an illustration, not an indication of the kind of ratios to expect, which will vary massively according to the DOM structure, data, logic, styles, device and network. As with all things performance related - measure first using representative devices and network.

The way you'd do this in most frameworks is by rendering DOM with dummy data in a hidden state, which is a bit of a pain. With Wallace you can use the `seed` method to create instances in the pool. This method returns a promise, which makes it convenient to use:

```tsx
// Display progress bar...
const root = mount("main", App);

Promise.all([
  // All these run async...
  fetchData(),
  CounterList.seed(50),
  Counter.seed(1000),
]).then(() => {
  // Update with data...
  root.update();
})
```

Even if you create some of the DOM needed, or even too much, you may get a performance boost. Then again you may not, which is why it's important to take representative measurements.



