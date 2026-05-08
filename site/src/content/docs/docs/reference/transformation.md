---
title: Transformation
sidebar:
  order: 3
---

## Overview

Wallace use its own Babel plugin to find JSX in your source code, which is only allowed in one context: the return expression of a function with nothing else in it. The function is then deemed to be a component definition and replaced with component definition generated from the JSX.

For example, the following code contains JSX in a valid location, thereby marking it as a component definition:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);
```

The plugin will therefore replace the entire function definition (including its parameters) with a call to `defineComponent` which is imported from the wallace library:

```tsx
import { defineComponent } from 'wallace';

const Counter = defineComponent(
 /* Arguments generated from the JSX */
);
```

The original function is never *executed*, as it no longer exists at run time. Its only job is to store a JSX expression so that it can be *read* during compilation.

Component definition functions and their JSX must follow certain rules which are covered in the [JSX](/docs/reference/jsx) and [Components](/docs/reference/components) sections, which also explains what `defineComponent` returns.

This is very different to React which translates the JSX without touching the surrounding code.

## Disconnect

At run time `Counter` will point to the whatever is returned by `defineComponent` and not the arrow function with JSX, so we have a disconnect.

The `defineComponent` call returns a function with no parameters that gets used as a constructor (with the `new` keyword) to create objects:

```tsx
const component = new Counter();
```

But placing that line in your source code will cause TypeScript to raise this warning:

```
Only a void function can be called with the 'new' keyword.
```

As it doesn't know that `Counter` will be transformed, and still sees it as the original arrow function that returns JSX.

Wallace get around this with an elaborate type system which essentially lies to TypeScript to bridge this disconnect while providing full type support when using components:

```tsx
import type { Takes } from 'wallace';

interface CounterModel {
  count: number;
}

const Counter = Takes<CounterModel> ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList: Takes<CounterModel[]> = (counter) => (
  <div>
    <Counter.repeat models={counters} />
  </div>
);

mount('main', CounterList, [{count: 1}]);
```

TypeScript will now warn you if you use components incorrectly or pass in an invalid model etc. You'll find more details in the [Types](/docs/reference/types) section.

## Inspecting

You may occasionally want to inspect the transformed code, which you can do by running a file through Babel. Bear in mind that Babel modifies the code for one file at a time without any awareness of imports.

Provided you the plugins are specified in your **babel.config.js** (as opposed to solely in the bundler) they will be picked up with the `babel` command:

```
npx babel src/index.tsx
```

Although the overall structure will be confusing, you will recognise snippets and be able to observe the effects of making changes to the JSX.

Here is the annotated output for our `Counter` definition:

```tsx
const Counter = defineComponent(
  // 1: The HTML for the initial DOM.
  "<div><button></button></div>",
  // 2: Instructions for dynamic elements.
  [
    {
      e: 0,
      c: {
        0: (element, p, c, n) => {
          element.textContent = n;
        }
      }
    }
  ],
  // 3: Lookup functions.
  [(_model, _component) => _model.count],
  // 4: The new `Counter` function.
  function () {
    const _this = this,
      el = (_this.el = _this._t.cloneNode(true));
    _this.hub = {};
    _this.model = {};
    _this._l = _this._w.length;
    _this._p = [{}];
    _this._e = [
      onEvent(findElement(el, [0]), "click", event => {
        _this.model.count++;
      })
    ];
  },
  // 5: The custom `set` method.
  undefined,
  // 6: Dismount keys - used for detachable parts.
  undefined,
  // 7: The base component to inherit from.
  undefined 
);
```

Some comments:

1. The HTML string is only used to build DOM once, that DOM is then cloned thereafter.
2. This code will be further transformed when minifying and concatenating bundles.
3. The last 3 arguments are shown for illustration, and will typically be missing if not used.

