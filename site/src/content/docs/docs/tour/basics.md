---
title : Basics
sidebar:
  order: 1
---

## Overview

Wallace controls the DOM using components, which you define as functions that accept props and return JSX:

```tsx
const Counter = ({ clicks }) => (
  <div>
    <div>Count: {clicks}</div>
    <button onClick={clicks++}>Click me</button>
  </div>
);
```

Component definitions can be nested or repeated using the following syntax:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.nest props={counters[0]} />
    <hr/>
    <div>
   	  <Counter.repeat items={counters.slice(1)} />
    </div>
  </div>
);
```

Nested components forms a tree, the root of which is attached to the document using the `mount` function, which also allows setting initial props:

```tsx
import { mount } from 'wallace';

const counters = [{clicks: 0}, {clicks: 0}];
mount(
  document.getElementById('main'), 
  CounterList,
  counters
);
```

> You should now see two click counters on the page, but clicking the button doesn't update the DOM yet.

To make it reactive, we use `watch` which returns a proxy of an object (which can be an array) which calls a callback when it (or any objects within it) are modified:

```tsx
import { mount, watch } from 'wallace';

const counters = [{clicks: 0}, {clicks: 0}];
const root = mount(
  document.getElementById('main'), 
  CounterList,
  watch(counters, () => root.update())
);
```

> Clicking on a button changes the `click` property of the object in the array, which triggers the callback, which updates the `CounterList` component, which updates the `Counter` components.

This may feel like a rather clunky approach to reactivity, but we'll come back to this later.

To make things more interesting, let's add a total, and a button to add more counters:

```tsx
const CounterList = (counters) => (
  <div>
    <div>
      Total: {counters.reduce((a, c) => a + c.clicks, 0)}
    </div>
    <div>
   	  <Counter.repeat items={counters} />
    </div>
    <button onClick={counters.push({clicks: 1})}>
      Add Counter
    </button>
  </div>
);
```

> Clicking on a button now updates the total.

It might look a bit like React, but Wallace does things very differently, starting with JSX.

## JSX

Instead of mangling your JSX with JavaScript, you control dynamic aspects using directives (attributes with special behaviour) like `if`:

```tsx
const Counter = ({ clicks }) => (
  <div>
    <div>Count: {clicks}</div>
    <button onClick={clicks++}>Click me</button>
    <button if={count > 2} onClick={(clicks = 0)} >
      Reset
    </button>
  </div>
);
```

> The second button will only become visible when `clicks > 2`

And special syntax for nesting components:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.nest props={counters[0]} />
    <Counter.nest props={counters[1]} />
  </div>
);
```


And for repeating components:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat items={counters} />
  </div>
);
```

You are not allowed to put JavaScript *before* or *around* JSX as you would in React:

```tsx
const CounterList = (counters) => {
  counters.sort(); // NO ALLOWED
  return <div>
    {counters.map((counter) => // NO ALLOWED
       <Counter.nest props={counter} />
    )}
  </div>
}; 
```

The only place you're allowed JavaScript in the JSX is inside `{curly}` brackets, and it may not return further JSX.

If you're used to React, this may take some adjustment. Just remember Wallace is different, which comes with benefits, including:

#### Clarity

Your JSX stays neat and compact, with correct indentation, which helps you see the larger DOM structure you're working with, and spot mistakes more easily.

#### Power

Static JSX allows things like partial updates, defining reusable stubs when extending components and other useful things through directives.

Here is a list of the available directives:

- `apply` runs a callback to modify an element.
- `bind` updates a value when an input is changed.
- `class:xyz` defines a set of classes to be toggled.
- `css` shorthand for `fixed:class`.
- `fixed:xyz` sets a attribute from an expression at definition.
- `hide` sets an element or component's hidden property.
- `html` Set the element's `innnerHTML` property.
- `if` excludes an element from the DOM.
- `key` specifies a key for repeated items.
- `items` set items for repeated component, must be an array of props.
- `on[EventName]` creates an event handler (note the code is copied).
- `part:xyz` saves a reference to part of a component so it can be updated.
- `props` specifies props for a nested components.
- `ref:xyz` saves a reference to an element or nested component.
- `show` sets and element or component's hidden property.
- `style:xyz` sets a specific style property.
- `toggle:xyz` toggles `xyz` as defined by `class:xyz` on same element, or class `xyz`.
- `unique` can be set on components which are only used once for better performance.

You don't need to remember these as they are covered in the tool tips.

## Tool tips

Wallace has rich tool tips which pop up in in several places:

#### JSX elements

Hovering over any JSX element (like `<div>`) will display a reminder of the nesting syntax, and a list of all the directives.

#### Directives

Hovering over a directives in the JSX shows you how to use that directive.

#### Module

Hovering over the module import shows a complete cheat sheet, which means you can look up 99% of docs without leaving your IDE.

#### Props

You will also get type documentation for props and other bits if you use TypeScript.

## TypeScript

Wallace has amazing type support, but you need to set it up right. Instead of annotating props like this:

```tsx
interface iCounter {
  clicks: number;
}

const Counter = (props: iCounter) => (
  <div>
    <div>Count: {clicks}</div>
    <button onClick={clicks++}>Click me</button>
  </div>
);
```

You use a special type called `Uses`:

```tsx
import { Uses } from 'wallace';

interface iCounter {
  clicks: number;
}

const Counter: Uses<iCounter> = ({ clicks }) => (
  <div>
    <div>Count: {clicks}</div>
    <button onClick={clicks++}>Click me</button>
  </div>
);

const CounterList: Uses<iCounter[]> = (counters) => (
  <div>
    <Counter.repeat items={counters} />
  </div>
);
```

This annotates the props within the function, and elsewhere such as during nesting and mounting. 

The `Uses` type also lets us annotate controllers and methods as we'll see later.

