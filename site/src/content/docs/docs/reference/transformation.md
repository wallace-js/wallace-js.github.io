---
title: Transformation
sidebar:
  order: 3
---

## Overview

Wallace use its own Babel plugin to identify component functions in your source code and replace them with generated component definitions.

A component function is any function which returns JSX - usually an arrow function assigned to a constant:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);
```

These functions and their JSX must follow certain rules which are covered in the [JSX](/docs/reference/jsx) and [Components](/docs/reference/components) sections.

The entire function (including its parameters) is replaced with a call to `defineComponent` which is imported from the wallace library:

```tsx
import { defineComponent } from 'wallace';

const Counter = defineComponent(
 /* Arguments generated from the JSX */
);
```

The `defineComponent` function returns a new function based on the instructions passed in its arguments, which are built from directives found in the JSX. This new function is used to create objects:

```tsx
const component = new Counter();
```

These objects are called components, and have various properties and "methods" like `render`:

```tsx
component.render({ count: 99 });
```

This is covered in more detail in [Components](/docs/reference/components). The key thing to understand here is that the function you define in your source code will not exist at run time, and will never be called. It is just a placeholder for a single JSX expression.

## Inspecting

You may occasionally want to inspect the transformed code, which you can do by running a file through Babel. Provided you the plugins are specified in your **babel.config.js** (as opposed to solely in the bundler) they will be picked up with the `babel` command:

```
npx babel src/index.tsx
```

Although the overall structure will be confusing, you will be able to identify specific functions and compare them to equivalents in other components.



The plugin replaces the *entire function* with a generated component definition, which equate to something like this:

```tsx
function Counter() {
  // generated code
}
Counter.prototype = {
  // generated code
};
```

> The actual generated code doesn't look like this, but produces the same structure.

These functions are used internally to create objects like this:

```tsx
const component = new Counter();
```

These objects are called components, and they control the DOM through methods that come from the prototype, like `render`:

```tsx
component.render({ count: 99 });
```

This is mostly hidden from view, but it's important to understand what is happening.

Note that this is very different 





## JSSS

Wallace uses JSX very differently to React and similar frameworks, which transform it into code that yields virtual DOM.

Wallace doesn't use virtual DOM, instead each component gets its initial DOM, along with instructions on how to populate and modifiy it according to the data it receives.

During compilationg, Wallace extracts all the dynamic instructions out of the JSX, leaving behind a bare HTML string. So the following component:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>
      {count}
    </button>
  </div>
);
```

Results in the following HTML string:

```tsx
"<div><button></button></div>"
```



Plus instructions on how to attach the event listener and inject the value as text.



reads the JSX during compilation and extracts information from directives and special sytax, 

Instead of placing logic _around_ elements, you control structure from _within_ elements using directives (attributes with special behaviour) like `if`:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button if={count > 2} onClick={(count = 0)}>
      reset
    </button>
  </div>
);
```

And special syntax for nesting and repeating:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter model={counters[0]} />
    <div>
      <Counter.repeat models={counters} />
    </div>
  </div>
);
```

But you don't need to remember all this. JSX elements have a tool tip which reminds you of syntax rules and lists the available directives, which have their own tool tips detailing their usage.



### JSX rules

There are two rule concerning JSX:

- JSX is only allowed in functions which contain (and return) a single JSX expression and nothing else.
- No JavaScript is allowed in the function body, except in JSX placeholders, so long as it doesn't return further JSX.

Note that the original function with JSX is completely replaced, and therefore never runs. The JSX only needs to be returned to help TypeScript.

Here are some examples of invalid code:

```tsx
// JSX is not inside a function:
const btn = <button onClick={count++}>{doubleCount}</button>;

// Function does not actually return the JSX expression:
const Counter = ({ count }) => {
  <div>
    <button onClick={count++}>{doubleCount}</button>
  </div>
};

// JavaScript found outside of JSX expressions:
const Counter = ({ count }) => (
  const doubleCount = count * 2;
  <div>
    <button onClick={count++}>{doubleCount}</button>
  </div>
);

// JavaScript within JSX expression but returns JSX:
const Counter = ({ count }) => {
  <div>
    <button onClick={count++}>{count}</button>
    {count > 3 && <div>Warning</div>}
  </div>
};
```

