---
title: Tour
sidebar:
  order: 2
---

## Introduction

This tour will show you how Wallace works, and once you understand that you'll know how to use it.

To do this we're going to reuse the code sample from the home page, but with two tweaks that help us cover more topics:

1. Replace the counter's button with a range input.
2. Add an interface and type annotations - but you can omit these if you don't want to use TypeScript.

Here is the modified code:

```tsx
import { mount } from 'wallace';
import type { Takes } from 'wallace';

interface CounterModel {
  count: number;
}

const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input bind-as:range={count} />{count}
  </div>
);

const CounterList: Takes<CounterModel[]> = (counters) => (
  <div watch>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <button onClick={counters.push({ count: 1 })}> 
      Add Counter
    </button>
    <Counter.repeat models={counters} />
  </div>
);

mount('main', CounterList, [{ count: 0 }]);
```

In here we:

1. Define two components as functions which return JSX.
2. Nest one component within the other. 
3. Mount the root component with some data.

It may look similar to React, but Wallace works differently in a few critical ways, starting with how it treats JSX.

You can code along:

- **Online** with StackBlitz using [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).
- **Locally** with `npx create-wallace-app`.

## JSX

Wallace doesn't use virtual DOM, and functions containing the JSX never get *called*. Instead they are *replaced* with component definitions during compilation, which act more like classes than functions.

The function is essentially just a scope for a single JSX statement, and cannot contain anything else:

```tsx
const Counter = ({ count }) => {
  // NOT ALLOWED
  const double = count * 2;
  return <div>
    <input bind-as:range={count} />{double}
  </div>
};
```

The JSX is *read* during compilation and therefore cannot have any logic that changes its structure:

```tsx
const Counter = ({ count }) => (
  // NOT ALLOWED
  <div>
    {count > 2 ? (
      <input bind-as:range={count} />
    ) : (
      <span></span>
    )}
  </div>
);
```

The only code allowed in the function is inside JSX `{expressions}` and these may not return further JSX. Code in expressions is copied to the generated component definition, which is why we can supply raw code to events rather than callbacks:

```tsx
<button onClick={counters.push({ count: 1 })}> 
```

At this point Wallace may feel like a React clone with all its power and freedom removed, however:

1. You get a lot more power thanks to *directives*.
2. Your JSX ends up more readable and more compact (around ~50% line count).
3. You actually get more freedom, as we'll see later.

And don't worry, you don't need to memorise new syntax or lists of directives. You only need to remember one:

```tsx
const Counter = () => <div help ></div>;
```

The `help` directive's tool tip contains a cheat sheet which includes a list of available directives. Alternatively use the tool tip on the module import: 

```tsx
import {} from 'wallace';
```

That contains the complete reference documentation, so you can look things up without leaving your editor.

## Components

The best way to understand what these generated component definitions look like is to substitute this line:

```tsx
mount('main', CounterList, [{ count: 0 }]);
```

With these lines, which do the exact same thing:

```tsx
const component = new CounterList();
component.render([{ count: 0 }]);
const target = document.getElementById('main');
target.parentNode.replaceChild(component.el, target);
```

> Your editor may warn you that `Only a void function can be called with the 'new' keyword` but ignore this for now.

During compilation `CounterList` was replaced with a constructor function which lets us create objects with `new` (note how it doesn't take any arguments).

These objects (called components, component instances or component objects) have properties such as `el` which is its root DOM element, and methods like `render` which we'll look into in more detail shortly.

During `render` our component will create as many instances of `Counter` as it needs, reusing existing ones where available, so what you end up with is a tree of component objects controlling the DOM tree:

```html
CounterList1 | <div>
|            |   Total: <span>2</span>
|            |   <button>Add Counter</button>
|  Counter1  |   <div>
|   |        |     <input type="range" />1
|   |        |   </div>
|  Counter2  |   <div>
|   |        |     <input type="range" />1
|   |        |   </div>
|            | </div>
```

Each component manages its own DOM and its nested components, which manage their DOM plus nested components, and so on down the tree.

It's a very simple structure that's easy to visualise and work with. 

Because component definitions are "classes" rather than functions, you can override their methods:

```tsx
Counter.prototype.render = function () {
  this.el.innerHTML = '<h1>FREEDOM</h1>';
}
```

This lets you customise how any component works, which is a nice safety feature that is sadly absent in almost every other framework.

Of course you can customise in a far more granular manner, without loosing framework functionality.

## Methods

The unadulterated `render` method looks like this:

```tsx
function render (model, hub) {
  this.set(model, hub);
  this.update();
}
```

The `update` method coordinates the DOM updates, which we won't display here. The unadulterated `set` method looks like this:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

We'll cover `hub` later and can safely omit/ignore it for now as we're not using it.

#### Why

This arrangement lets us do things that would not be possible if `render` updated the DOM directly.

We can update a component by modifying its model in-place then calling `update` which bypasses `render`:

```tsx
const component = new Counter();
component.render({ count: 0 });
component.model.count = 1;
component.update();
```

This this helps with reactivity as we'll see later, and lets us treat `render` as a "setup" method as it is only called from above.

Don't worry if this doesn't make sense just yet.

#### Overriding

We could override `render` on `Counter` (perhaps to add some logging) as follows and our app would still work:

```tsx
Counter.prototype.render = function (model) {
  console.log('Rendered Counter');
  this.model = model;
  this.update();
}
```

However if we do that with `CounterList` it would break, because the `watch` directive modifies the `set` method, and we skipped that. So you would have to do this:

```tsx
CounterList.prototype.render = function (model) {
  console.log('Rendering CounterList');
  this.set(model);
  this.update();
}
```

Or you could use the `base` property, to access the unadulterated `render` (note this is not the same as `super` in classes which crawls up the inheritance tree):

```tsx
CounterList.prototype.render = function (model) {
  console.log('Rendering CounterList');
  this.base.render.call(model);
}
```

You won't be overriding methods that often, this is more to illustrate how Wallace works. If you do need to override or add methods, you're best using the `methods` helper:

```tsx
CounterList.methods = {
  render (model) {
    this.log();
    this.base.render.call(model);
  },
  log () {
    console.log('Rendering CounterList');
  }
};
```

As it's more concise and prevents accidental overwriting of prototype methods.

You can add new methods, or override existing ones, but bear in mind that `set` may be modified during compilation, so be careful with that one.

## DOM

To illustrate how the `update` method updates the DOM let's use a `ref` to manually disable the input if `count` exceeds three:

```tsx
const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input ref="input" bind-as:range={count} />{count}
  </div>
);

CounterList.methods = {
  update () {
    this.base.update.call();
    this.ref.input.disabled = this.model.count > 3;
  }
};
```

Here `this.ref.input` points to the actual DOM element, not a wrapper, and we can manipulate it directly.

Note that we can manually control the `disabled` property while letting Wallace control its value and event handling without clashing. That's because we've essentially replicated how Wallace updates its DOM.

Components create their initial DOM and store references to dynamic elements. During `update` they compare the used values to last update, and modify the corresponding element property if the values have changed. It's dead simple, although there is an added check to ignore elements if they are hidden by `show`, `hide` or `if`. 

This results in minimal DOM operations and less computation than diffing a virtual DOM, which not only makes Wallace insanely fast, but also means you can predictably work with the DOM without breaking it. You could even move elements around within the component (or outside if you're a lunatic) and they would still safely update.

There is a shorthand for directives like `ref` which simply name things:

```tsx
<input ref:input bind-as:range={count} />
```

And of course you could avoid using a ref altogether by using an expression:

```tsx
<input disabled={count > 5} bind-as:range={count} />
```

The point is that you can work with individual elements while letting the component control the rest in those edge cases where you need to, such as [chart.js](https://www.chartjs.org/) which requires `canvas` elements to be attached to the DOM before drawing graphs on them, which they won't be on first render.

Other frameworks often end up with third party libraries for such cases. With Wallace you'd probably use the `apply` directive, or create a custom directive if you really needed to.

## Directives

Directives are JSX attributes which add instructions to the generated component definition, meaning the task of interpreting, validating and combining your instructions happens during compilation, not execution

All the code involved in these steps stays out of the bundle too, except for the ultra compact instructions they leave behind.

This means we can add endless directives, permutations and combinations without adding bloat, which lets us create richer syntax. Take the ` bind-as:range` from our example:


```tsx
<input bind-as:range={count} />
```

Which is just a more compact way of doing this:

```tsx
<input type="range" bind:valueAsNumber={count} />
```


Which is just a more compact way of doing this:

```tsx
<input
  type="range"
  value={count}
  onChange={(count = element.valueAsNumber)}
/>
```

All three permutations compile to the exact same code. We'll explain where that `element` comes from and why changing `count` updates our component in the next couple of sections.

You'd use the longer version to do extra things like parse or format a value, or override defaults such as the event, although you can do that by combing `bind` or `bind-as` with `event`:

```tsx
<input bind-as:range={count} event:input />
```

The part after `:` is called the qualifier, and acts as an extra variable, or in cases like `event` it is interpreted as the value, so equates to `event="input"`. They can be required, as they are for `bind-as`, or optional as they are for `bind`:

```tsx
<input type="range" bind={count} />
```

The latter would set `count` to the element's `value` property, which is a string.

You can also define your own directives.

## Parameters

Component definition functions may specify up to two parameters:

```tsx
const Counter: Takes<CounterModel> = ({ count }, { element }) => (
  <div>
    <input
      type="range"
      value={count}
      onChange={(count = element.valueAsNumber)}
    />
  </div>
);
```

The first corresponds the model which is passed to `render` and saved as `this.model` by `set`. The second is an assortment of extra variables (called xargs) that may be useful such as:

- `self` - alias for `this` as `this` is not allowed in arrow functions.
- `model` - alias for `this.model`  which is useful when the main `model` parameter is destructured (i.e. `{count}` instead of `model`)
- `event` - the event, where applicable.
- `element` - the DOM element, where applicable.

The `model` parameter *may* be destructured to exactly one level, and the `xargs` parameter *must* be destructured to exactly one level. Renaming is not supported. If destructured, the model is reassembled in the generated code, so the `onChange` event handler would look like this:

```tsx
function (event) {
  this.model.count = event.element.valueAsNumber;
}
```

Remember that the component definition function is never called, so these are not real parameters, just symbols to be used when modifying the code during compilation, which allows for interesting uses. 

For example the `event` and `element` xargs can be referenced multiple times in the component, but it will point to their respective event and element in each location used. You can give them types:

```tsx
const Example = (_, { event }) => (
  <div>
    <button onClick={handleClick(event as PointerEvent)}>
      Click me
    </button>
    <input onKeyPress={handleKeyPress(event as KeyboardEvent)}/>
  </div>
);

const handleClick = (event: PointerEvent) => {};
const handleKeyPress = (event: KeyboardEvent) => {};
```

## Reactivity

Our app is reactive (the UI updates when the data is changed) because we used the `watch` directive in the root component, which causes it to get a modified `set` method that looks like this:

```tsx
function set (model, hub) {
  this.model = watch(model, () => this.update());
  this.hub = hub;
}
```

The `watch` function is a helper included in Wallace which returns a proxy of an object which calls a callback when it (or any of its nested objects) is modified:

```tsx
import { watch } from 'wallace';

const original = [{ count: 0}];
const watched = watch(original, () => console.log('modified'));

// Each of these lines triggers the callback:
watched[0].count = 1;
watched.push({ count: 2});
watched.reverse();

// And modify the original:
console.log(original)
> [{ count: 2}, { count: 1}]
```

Note however that you are dealing with proxies of the original objects, which are identical but not the same object in memory:

```tsx
// Both false
original === watched
original[0] === watched[1]

// Both true
JSON.stringify(original) === JSON.stringify(watched)
JSON.stringify(original[0]) === JSON.stringify(watched[1])
```

So in our example, `counters` points to `this.model` which is a proxy of the original array passed into `mount` :

```tsx
const CounterList = (counters) => (
  <div watch>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <button onClick={counters.push({ count: 1 })}> 
      Add Counter
    </button>
    <Counter.repeat models={counters} />
  </div>
);

mount('main', CounterList, [{ count: 1 }]);
```

The proxy's callback tells the component instance to `update` when it is modified, which happens in this line:

```tsx
<button onClick={counters.push({ count: 1 })}>
```

And in the `Counter` whose input event handler looks like this:

```tsx
function (event) {
  this.model.count = event.element.valueAsNumber;
}
```

Because `this.model` is a proxy of one of the items in the `counters` array, so modifying it triggers the callback.

By default the `watch` directive sets `() => this.update()` as the callback in `set` but you can specify an alternative, perhaps to save to local storage:

```tsx
const CounterList = (counters, { self }) => (
  <div watch={() => onDataChange(self, counters)}>
    ...
  </div>
);

const onDataChange = (component, data) => {
  localStorage.setItem("data", JSON.stringify(data));
  component.update();
}
```

So far we've been watching the full model with one callback, but you can break it up, perhaps to separate data from state, which you'd probably set up in the `render` method, after removing the `watch` directive:

```tsx
const CounterList = ({counters, state}) => (
  <div>
    <div>
      <label>Show Total</label>
      <input bind-as:checkbox={state.showTotal} />
      <div if={state.showTotal}>
        Total: {counters.reduce((a, c) => a + c.count, 0)}
      </div>
    </div>
    <button onClick={counters.push({ count: 1 })}>
      Add Counter
    </button>
    <Counter.repeat models={counters} />
  </div>
);

CounterList.methods = {
  render(model) {
    const proxy = {
      counters: watch(model.counters, () => onDataChange(this, model)),
      state: watch(model.state, () => this.update()),
    }
    this.set(proxy);
    this.udpate();
  }
};

mount("main", CounterList, {
  counters: [{ count: 0 }],
  state: {
    showTotal: true;
  }   
});
```

Again we see how Wallace offers high-level convenience (the `watch` directive) but you can progressively drop lower and take more control if you need to, which is possible as the underlying mechanism is really simple.

Because reactivity is totally decoupled from the component, you can easily follow why and when each update fires, which you will be very thankful for when things get weird (as they often do with reactive apps).

## Patterns

The approach we've seen so far doesn't scale well, so we'll explore a couple of patterns that do.

### Hubs

What if we want the `state` to be passed down to nested `Counter` components? That gets messy as we'd have to map it into the `counters`, and one solution to this is using a hub.

Any function which accepts a `model` argument (like `mount`, `render`, `set`) also accepts an optional `hub` argument right after it:

```tsx
mount(
  "main",
  CounterList,
  [{ count: 0 }],                    // model
  {showTotal: true, mode: "button"}  // hub
);
```

As we saw earlier, this gets saved on the component instance during `set` just like `model`:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

What makes `hub` different is that it is automatically forwarded to `render` for nested components which do the same and so on, meaning the whole tree from that point down shares the same hub object.

Components access the `hub` in their **xargs**, whose type you can also annotate with `Takes`:

```tsx
interface Hub {
  showTotal: boolean;
  mode: "range" | "button";
}

const Counter: Takes<CounterModel, Hub> = ({ count }, { hub }) => (
  <div>
    <div if={hub.mode === "range"} >
      <input bind-as:range={count} />{count}
    </div>
    <button if={hub.mode === "button"} onClick={count++}>
      {count}
    </button>
  </div>
);
```

The `Takes` type lets you annotate the model and hub, but there are other bits you can annotate such as methods and if doing this you need to switch to a different type called `Uses`:

```tsx
import type { Uses } from 'wallace';

interface Methods {
  btnClicked(): void;
}

const Counter: Uses<{model: CounterModel, methods: Methods}> = 
  ({ count }, { self }) => (
  <div>
    <button onClick={self.btnClicked()}>{count}</button>
  </div>
);

Counter.methods = {
  btnClicked() {
    this.model.count ++;
  }
};
```

### Classes

So far we've been using plain objects as models and hubs, but we can also use custom objects with methods, getters and setters, which is where things get really interesting.

Although it is overkill for our example, let's see what these classes might look like. We've removed the state management for clarity:

```tsx
import type { ComponentInstance } from 'wallace';

interface CounterData {
  count: number;
}

class CounterModel {
  data: CounterData;
  controller: Controller;
  constructor(data: CounterData, controller: Controller) {
    this.data = data;
    this.controller = controller;
  }
  get count() {
    return this.data.count;
  }
  set count(count) {
    this.data.count = count;
    this.controller.update();
  }
}

class Controller {
  root: ComponentInstance;
  data: CounterData[];
  counters: CounterModel[];
  constructor(data: CounterData[]) {
    this.data = data;
    this.counters = data.map(d => new CounterModel(d, this));
  }
  newCounter() {
    const data = { count: 0 };
    this.data.push(data);
    this.counters.push(new CounterModel(data, this));
    this.update();
  }
  update() {
    this.root.update();
  }
  total() {
    return this.counters.reduce((t, c) => t + c.count, 0);
  }
}
```

And here is how they are used in the component:

```tsx
import { mount } from 'wallace';
import type { Takes } from 'wallace';
import { CounterModel, Controller} from './models';

const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input bind-as:range={count} />{count}
  </div>
);

const CounterList: Takes<Controller> = ctrl => (
  <div assign:root >
    Total: {ctrl.total()}
    <button onClick={ctrl.newCounter()}>Add Counter</button>
    <Counter.repeat models={ctrl.counters} />
  </div>
);

mount("main", CounterList, new Controller([{ count: 0 }]));
```

The `assign` directive assigns the component instance to a value, usually a property on the model, in which case we can use the shorthand notation shown, which equates to this:

```tsx
<div assign={ctrl.root}>
```

It works by modifying the `set` function as follows:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
  model.root = this;
}
```

The model and the component cross-reference each other, which is perfectly safe, and very useful.

This approach also brought about a few small changes:

- We don't need `watch` as the methods and setters update the component.
- We don't need interfaces as classes are their own interface.
- The `CounterList` has become a lot simpler.

The bigger change is subtle but radical: the locus of control has shifted from the components to our classes. To understand the impact, let's follow what would happen to both as the application grows.

#### Components

The components are now essentially the dumb outer layer of the application concerned only with displaying data and capturing events. All the logic, complexity and coordination is in the models and controller classes.

The code ends up very simple, readable and unlikely to conceal errors.

#### Classes

All your logic now resides in classes whose only coupling to components is by simple references. This code has nothing to do with the framework, which is a good thing as:

1. You have the full freedom of JavaScript to organise your code and reuse through inheritance, composition, factories and more.
2. You don't need to consider the framework when debugging.

This makes your life a lot easier.

Of course your components may need to be organised to prevent duplication too, and there are two main ways to achieve this.

### Stubs

Stubs are slots for nested components that can be overridden when extending the component.

```tsx
import { extendComponent } from 'wallace';

const RangeCounter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input bind-as:range={count} />{count}
  </div>
);

const ButtonCounter: Takes<CounterModel> = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList: Takes<Controller> = ctrl => (
  <div assign:root >
    Total: {ctrl.total()}
    <button onClick={ctrl.newCounter()}>Add Counter</button>
    <stub.counter.repeat models={ctrl.counters} />
  </div>
);

const CounterListWithRange = extendComponent(CounterList);
CounterListWithRange.stub.counter = RangeCounter;

const CounterListWithButton = extendComponent(CounterList);
CounterListWithRange.stub.counter = ButtonCounter;
```

The extended components also inherit methods, but not the set method? - is this a problem?

### Factories

Use a function to return a component definition:

```tsx
export function getCounterList<CounterModel>(
  Counter: ComponentFunction<CounterModel>
) {
  const CounterList: Takes<Controller> = ctrl => (
    <div>  
      Total: {ctrl.total()}
      <button onClick={ctrl.newCounter()}>Add Counter</button>
      <Counter.repeat models={ctrl.counters} />
    </div>
  );
  return CounterList;
}

const CounterListWithRange = getCounterList(RangeCounter);
const CounterListWithButton = getCounterList(ButtonCounter);
```

This allows you to decide what component to nest at run time.

## Partials

So far we have been updating the entire tree whenever data changes, but you can also run more targeted updates of components and within components.

The `part` directive lets you delineate a part of a component which you can update independently:

```tsx
const CounterList: Takes<Controller> = ctrl => (
  <div>
    <div part:total>  
      Total: {ctrl.total()}
    </div>
    <button onClick={ctrl.newCounter()}>Add Counter</button>
    <Counter.repeat part:counters models={ctrl.counters} />
  </div>
);

CounterList.methods = {
  updateTotal() {
    this.part.total.update()
  }
  updateCounters() {
    this.part.counters.update()
  }
}
```

Bear in mind that no matter what you update, only the those properties that actually need to change will result in a DOM operation, so this is just about reducing computation.

To update individual components under a `repeat` instruction you'd save references to them, either on their model:

```tsx
const Counter: Takes<CounterModel> = ({ count }) => (
  <div assign:component>
    <input bind-as:range={count} />{count}
  </div>
);
```

Or to a register:

```tsx
const Counter: Takes<CounterModel> = ({ count, id }, { hub }) => (
  <div assign={hub.counterComponents[id]}>
    <input bind-as:range={count} />{count}
  </div>
);
```

By combining these two approaches your Wallace app can match the performance of vanilla JavaScript.

## Conclusion



- custom directives

- apply







Inheritance (components later)

For example our `Controller` encapsulates an array



which works in simple examples where the data stays its original format. But in real apps the data may be assembled from multiple sources, and may contain complex combinations of persisted data and state.

At that point you may wish to turn your models or hubs into more capable objects, typically connected by auxiliary controllers or services. 

The `assign` directive assigns the component instance to the specified property. 

Useful for deep updates, particularly in combination with parts.







```tsx
<input bind-as:range={count} />
<input type="range" bind:valueAsNumber={count} />
<input
  type="range"
  value={count}
  onChange={(count = element.valueAsNumber)}
/>
```

The idea is to use the more compact version until you need to change defaults.



As do these, which change the event from the default `change` to `input` causing the UI to update as you move the slider:

```tsx
<input bind-as:range={count} event:input />
<input type="range" bind:valueAsNumber={count} event="input" />
<input
  type="range"
  value={count}
  onInput={(count = element.valueAsNumber)}
/>
```





leaving behind only efficient generated code in the bundle, which lets us create new directives or make them more complex without bloat.



means they can increase in numbers and complexity at no cost.



Take `bind-as` which takes a qualifier

qualifiers

```tsx
<input bind-as:range={count} />
```

The `bind-as` directive:

```
<input bind-as:range={count} />
```

Is just a shorthand for setting the type and binding to the property you most likely want for that type:

```
<input type="range" bind:valueAsNumber={count} />
```

Which in turn is shorthand for this:

```
<input type="range" value={count} onChange={(count = element.valueAsNumber)} />
```

By default `bind` binds to the input’s `value` which is a string, so this would totally mess up the total:

```
<input type="range" bind={count} />
```

By default, bind responds to the `change` event, which fires once the input loses focus. If you want to update the UI in live time you could use the `input` event:

```
<input bind-as:range={count} event:input />
```

The idea is to use high-level concise syntax for default behaviour, and drop to progressively longer forms as you need to deviate from defaults.

that do something, such as `if` which conditionally attaches an element, and `bind` which creates two-way binding between an element and data, and also takes a *qualifier* to specify which event fires the change:

compilation

Directives operate during compilation, so both of these result in the exact same code:

```
<input bind-as:range={count} />

<input type="range" value={count} onChange={count = element.valueAsNumber} />
```

You can add endless custom directives without increasing bundle size:

```
<input range-input={count} />
```

Talk about directives.

Change to event, use xargs?Because Wallace JSX is also more expressive and compact, you can really get an overview of your DOM structure by glancing at the components.

#### 