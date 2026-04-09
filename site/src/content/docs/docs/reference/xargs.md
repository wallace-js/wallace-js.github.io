---
title: Xargs
sidebar:
  order: 9
---

Component functions can specify a second parameter after **model** called **xargs**:

```tsx
const Counter = (model, xargs) => <div></div>;
```

However it must always be destructured:

```jsx
const Counter = (model, { hub }) => <div></div>;
```

Bear in mind component functions are dismantled during compilation, and never get called, so these aren't real parameter. They just make things available to use in the JSX expression.

Here are the available xargs:

### element

A reference to the element for use in directives which allow access to the element, such as `apply` and `event`:

```tsx
const Counter = (_, { element }) => (
  <div>
    <button onClick={print(element)}></button>
  </div>
);

const print = (element) => console.log(element.tagName);
// Prints:
("BUTTON");
```

It always refers to the element where it is used, meaning you can use it in multiple places:

```tsx
const Counter = (_, { element }) => (
  <div>
    <button apply={print(element)}></button>
    <span apply={print(element)}></span>
  </div>
);

const print = (element) => console.log(element.tagName);
// Prints:
("BUTTON");
("SPAN");
```

If you need to make the element of a specific type, do it at point of use rather than in the signature:

```tsx
const Counter = (_, { element }) => (
  <div>
    <imr src="/icon.jpg"
       apply={printSrc(element as HTMLImageElement)}
    />
    <a href="/"
      apply={printHref(element as HTMLAnchorElement)}
    ></span>
  </div>
);

const printSrc = (element: HTMLImageElement) => (
  console.log(element.src);
)
const printHref = (element: HTMLAnchorElement) => (
  console.log(element.href);
)
```

### event

A reference to the element for use in `event` handing directives:

```tsx
const Counter = (_, { event }) => (
  <div>
    <button onClick={print(event)}></button>
  </div>
);

const print = (event) => console.log(event.type);
// Prints:
("click");
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

### self

A reference to the component instance, useful for accessing methods:

```tsx
const Counter = ({ count }, { self }) => (
  <div>
    <button onClick={(count++, self.update())}>{count}</button>
  </div>
);
```

Unfortunately we can't use `this` in arrow functions, which makes it a bit annoying transitioning from code in JSX and code in methods, where you need to use `this`:

```js
Counter.methods.render = function (model) {
  this.model = model;
  this.update();
};
```

### model

The model as a complete object, which is useful as the original model is usually destructured:

```tsx
const Counter = ({ count, id }, { model }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={removeCounter(model)}>Remove</button>
  </div>
);
```

This does not result in the model getting passed into the function twice - as there is no function. Both get compiled to access the `model` property of the component.

Note that you generally want to avoid passing the entire model object to external functions, as it may not be the object you think it is, particularly if using `watch`. Try to rely on identifying keys instead.

Note that you cannot destructure any xarg.

### hub

The hub:

```jsx
const Counter = ({ count, id }, { hub }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={hub.removeCounter(id)}>Remove</button>
  </div>
);
```

Note that you cannot destructure any xarg.
