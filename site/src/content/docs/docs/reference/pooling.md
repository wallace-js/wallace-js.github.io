---
title: Pooling
sidebar:
  order: 19
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

## Reusing component instances

When enabled by the `allowDismount` Babel plugin flag, Wallace returns nested component instances removed by repeaters or conditional nesting to a pool associated with their component definition. A later repeater can reuse a pooled instance instead of constructing a new one. See [Flags](/docs/reference/flags).

## Dismounting

A component is dismounted when its parent removes it through Wallace's conditional or repeat lifecycle. Removing an element manually from the DOM does not automatically dismount its component tree. If you manually detach a component and want its nested components to run their dismount lifecycle, call `dismount()`:

```ts
component.dismount();
```

Calling `dismount` on an instance does not itself return that instance to a pool; a parent repeater manages that part of the lifecycle.

## Reuse implications

A component instance can be rendered with a different model after reuse. Do not keep per-model state on the instance unless it is recalculated or reset when the component renders. Likewise, avoid leaving DOM properties in a manually changed state; express them as dynamic attributes or restore them during updates. See [State](/docs/reference/state).

You can override `dismount` to clean up external resources such as timers. If you override it, call the base implementation when nested components also need dismounting:

```tsx
Counter.methods = {
  dismount() {
    clearInterval(this.interval);
    this.base.dismount.call(this);
  },
};
```

Pooling is an implementation detail that most applications do not need to manage directly. Measure before tuning it or disabling related flags.



