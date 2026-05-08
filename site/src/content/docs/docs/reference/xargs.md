---
title: Xargs
sidebar:
  order: 7
---

## Overview

Component definition functions may specify a second parameter after `model` called **xargs**, which contains various useful things:

```jsx
const Counter = ({count}, { hub, self }) => <div></div>;
```

This parameter must be destructured to exactly one level as shown above.

Bear in mind component functions are dismantled during compilation, and never get called, so these aren't real parameter. They just make things available to use in the JSX expression.

## Xargs

Here is the list of available xargs:

### element

A reference to the element for use in directives which allow access to the element, such as `apply` and `event`:

```tsx
const Counter = (_, { element }) => (
  <div>
    <button onClick={logEl(element)}></button>
  </div>
);

const logEl = (element) => console.log(element.tagName);
```

It always refers to the element where it is used, meaning you can use it in multiple places:

```tsx
const Counter = (_, { element }) => (
  <div>
    <button apply={logEl(element)}></button>
    <span apply={logEl(element)}></span>
  </div>
);

const logEl = (element) => console.log(element.tagName);
// Logs:
// BUTTON
// SPAN
```

If you need to coerce the element type, do it at point of use rather than in the signature:

```tsx
const Counter = (_, { element }) => (
  <div>
    <imr src="/icon.jpg"
       apply={logSrc(element as HTMLImageElement)}
    />
    <a href="/"
      apply={logHref(element as HTMLAnchorElement)}
    ></span>
  </div>
);

const logSrc = (element: HTMLImageElement) => (
  console.log(element.src);
)
const logHref = (element: HTMLAnchorElement) => (
  console.log(element.href);
)
```

### event

A reference to the event for use in `event` directives which allow access to the event:

```tsx
const Counter = (_, { event }) => (
  <div>
    <button onClick={log(event)}></button>
  </div>
);

const log = (event) => console.log(event.type);
// logs:
// click
```

Like `element` it always refers to the event where it is used, meaning you can use it in multiple places, and assign different types:

```tsx
const Counter = (_, { event }) => (
  <div>
    <button onClick={foo(event as ClickEvent)}>+</button>
    <input onKeyUp={bar(event as KeyUpEvent)} />
  </div>
);

const foo = (event: ClickEvent) => {};
const bar = (event: KeyUpEvent) => {};
```

### hub

The hub:

```jsx
const Counter: Takes<CounterModel, Hub> = ({ count, id }, { hub }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={hub.removeCounter(id)}>Remove</button>
  </div>
);
```

### model

The model as a complete object, which is useful as the original model is usually destructured:

```tsx
const Counter = ({ count, id }, { model }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={logCounter(model)}>Remove</button>
  </div>
);

const logCounter = (counter) => (
  console.log(counter);
)
```

Again these parameters aren't real, all references to the `model` inside the JSX end up the same, regardless of where they come from, so the compiled code will look like this:

```tsx
// lookup
return this.model.count;
// onClick
logCounter(this.model)
```

##### Warning

Avoid passing models *out* of components like we just did - as any parent component could turn the model into a reactive proxy, meaning:

1. The model isn't the object you think it is.
2. The model object, and all nested objects, are reactive.

For example:

```tsx
const CounterList = (counters) => (
  <div watch>
    <Counter.repeat models={counters} />
  </div>
);

const Counter = ({ count }, { model }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={increment(model)}>++</button>
  </div>
);

const increment = (counter) => (
  counter.count ++;
  saveCounter(counter);
)

const saveCounter = (obj) => (
  // causes CounterList to update if id is not set.
  if (!obj.id) obj.id = getNextId();
  localStorage.setItem(obj.id, JSON.stringify(obj));
)

mount('main', CounterList, [{count: 0}]);
```

This produces a subtle glitch whereby the `CounterList` is updated twice on first click for each counter, and once on subsequent clicks. This would likely go unnoticed, but could cause confusion later on.

To avoid this, stick to passing primitives out of components, such as ids, and using those to retrieve original objects.

### self

A reference to the component instance, as TypeScript won't allow `this` in arrow functions. It is useful for accessing methods:

```tsx
const Counter = ({ count }, { self }) => (
  <div>
    <button onClick={(count++, self.update())}>{count}</button>
  </div>
);
```

Note that you must use `this` in methods:

```js
Counter.methods.render = function (model) {
  this.model = model;
  this.update();
};
```

### stub

Provides access to stubs, which are annotated with the `Uses`  [type](/docs/reference/types). This ensures you only pass valid models and hubs when nesting:

```tsx
import type { Takes, Uses } from 'wallace';

interface ParentTypes {
  hub: Hub;
  stub: {
    foo: Takes<iDay>;
    bar: Takes<iDay, Hub>;
  };
}

const Parent: Uses<ParentTypes> = (_, { stub }) => (
  <div>
    <stub.foo model={data[0]} /> 
    <stub.foo.repeat models={data} />
    <stub.bar.repeat models={data} hub={compatibleHub} /> 
  </div>
);
```

