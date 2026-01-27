---
title : DOM operations
sidebar:
  order: 3
---

To show just how simple Wallace is, let's create an instance of `Counter` and manually attach it to the DOM instead of using `mount`:

```tsx
const Counter = ({ clicks }) => (
  <div>
    <div>Count: {clicks}</div>
    <button onClick={clicks++}>Click me</button>
  </div>
);

const component = new Counter();
document.body.appendChild(component.el);
```

> TypeScript will complain because it thinks `Counter` is an arrow function with JSX, which it won't be at run time, so just ignore that. 

The Counter's DOM will now be attached to the page. This tells us that `root.el` is a real DOM element that was created during object construction.

Now let's call `render` with some data:

```js
component.render({clicks: 1});
```

> It should now display the count. 

To understand how the component updated the DOM let's replace the placeholder with a span with a ref directive:

```tsx
const Counter = ({ clicks }) => (
  <div>
    <div>
      Count: <span ref:count></span>
    </div>
    <button onClick={clicks++}>Click me</button>
  </div>
);
```

And then override the `render` method on the prototype:

```jsx
Counter.prototype.render = function (props) {
  this.ref.count.textContent = props.clicks * 3;
};
```

> It should now display "Count: 3"

This works because `this.ref.count` points to the real span element in the DOM, so setting its `textContent` updates it directly. This is essentially how a component updates its DOM normally, the only difference being that:

- It uses a hidden internal ref.
- It checks whether the value has changed since last update before modifying the DOM.
- It skips the element if it, or a parent element, is hidden or excluded by directives like `show`, `hide` or `if`.

This is much faster than virtual DOM as it doesn't touch DOM (real or virtual) that doesn't change.

It also makes it really easy to run manual DOM operations alongside the component's operations, which is occasionally necessary for things like animations or third party charts etc...

## Nested components

Nested and repeated components work a bit differently:

```jsx
const CounterList = (counters) => (
  <div>
    <Counter.nest props={counters[0]} />
    <hr/>
    <div>
   	  <Counter.repeat items={counters.slice(1)} />
    </div>
  </div>
);

const component = new CounterList();
document.body.appendChild(component.el);
component.render([{clicks: 0}, {clicks: 0});
```

They are processes alongside normal dynamic elements, and skipped if they, or a parent node, is hidden - but there is no check to see if the data has changed as we are dealing with objects rather than primitives.

In the case of a nested component, it will call `render` and let the nested component decide if DOM needs updated.

The  `<Counter.repeat />` is a bit different as it attaches itself to its parent element and uses an internal "repeater" object to create the nested components, call their `render` method and attach their DOM.

By default it uses a sequential

```jsx
<Counter.repeat items={counters} key="id" />
```



You can provide your own repeater:

```jsx
<Counter.repeat items={counters} repeater={MyRepeater} />
```





in that it skips them if they, or a parent element, is hidden or excluded by directives like `show`, `hide` or `if`.

 the same way as other dynamic 

and calls its `render` method instead of a DOM operation like `textContent`.



The `CounterList` updates its own DOM as described above, and treats `Counter.repeat` (or rather its parent node) as a normal element

 and used a *repeater* to create an instance of `Counter` for each item in `counters` and call their `render` methods (passing the item as props) then attached their DOM to the `<div>` element.

And that's it. No global state, no special "app" or "root" object, no "engine" (other than the repeater's algorithm) and no virtual DOM.







## Components

To understand what components do, we're going to create an instance of `CounterList` and manually attach it to the DOM instead of using `mount`:

```tsx
const root = new CounterList();
document.body.appendChild(root.el);
```

> TypeScript will complain because it thinks `CounterList` is an arrow function with JSX, which it won't be at run time, so just ignore that. 

The `CounterList` will now be attached to the page, but may look off as we haven't rendered an data yet (Wallace always render before attaching to avoid this). 

This tells us that `root.el` is a real DOM element that was created during object construction.

Now let's call `render` with some data:

```js
const counters = [{clicks: 1}, {clicks: 2}];
root.render(counters);
```

> You should now see two click counters on the page. 

The `CounterList` updated its own DOM, and used a *repeater* to create an instance of `Counter` for each item in `counters` and call their `render` methods (passing the item as props) then attached their DOM to the `<div>` element.

And that's it. No global state, no special "app" or "root" object, no "engine" (other than the repeater's algorithm) and no virtual DOM.

Component updates its own DOM is also very direct.

Each component keeps references to its dynamic elements, so each `Counter` component:



There's no special root object like 

The components updated the DOM.

Components update their own DOM and coordinated nested components without the help of any 

And that's how simple Wallace is: 

> Components are objects which control their own DOM and manage nested components, which do the same.

There are only components controlling the page. There's no hidden engine, special root object, or global state. This makes things very simple and easy to reason with.

Now let's see what `props` and `update` do.