---
title: Tour
sidebar:
  order: 2
---

## Introduction

Frameworks are integral to modern front end development, but they have several downsides:

1. They seriously **bloat** your bundle.
2. They involve **learning** new APIs and paradigms.
3. They don't **perform** as well as vanilla JavaScript.
4. They **obscure** operations, which impedes debugging.
5. They force awkward **patterns**, like hooks.
6. They restrict your **freedom**.

This tour will show you how Wallace works, and how that addresses these issues.

Mention layers here?

## Code

We'll reuse the code sample from the home page, but with two tweaks that help us cover more topics:

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

It may look similar to React, but Wallace works very differently, and this affects how you use it.

You can code along:

- **Online** with StackBlitz using [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).
- **Locally** with `npx create-wallace-app`

## JSX

Rather than mangling your JSX with JavaScript and losing all sense of structure:

```tsx
// React code - won't work in Wallace!
const CounterList = (counters) => (
  <div>
    {counters.length ? (
      counters.map(c => <Counter props={c} />)
    ) : (
      <div>No counters</div>
    )}
  </div>
);
```

 Wallace uses *directives* and special syntax for nesting and repeating:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
    <div if={!counters.length}>No counters</div>
  </div>
);
```

You loose some of the flexibility of React, but:

1. Your JSX ends up more compact (around ~50% line count).
2. Your JSX is more readable, and hides fewer bugs.
3. Directives bring more power than plain JSX.
4. You actually gain more freedom, as we'll see later.

You only need to memorise one directive: `help` whose tool tip is a cheat sheet listing all the other directives:

```tsx
const Counter = () => (
  <div help ></div>
);
```

The module's tool tip covers everything else, so you can access full documentation without leaving your IDE:

```tsx
import {} from 'wallace';
```

## Components

During compilation, functions that return JSX get replaced with very different functions that are used as constructors to create objects we call components:

```tsx
const component = new CounterList();
```

You don't usually see this code. In this case it happens in the `mount` which essentially does this:

```tsx
const component = new CounterList();
const target = document.getElementById('main');
component.render([{ count: 0 }]);
target.parentNode.replaceChild(component.el, target);
```

During `render` this `component` object will:

1. Update its own DOM (the total calculation).
2. Create (or reuse) an instance of `Counter` for every item in the array passed to `render` and tell those components to `render` their item.

There is no central coordination, DOM engine or global state. Each component updates its own DOM directly and instructs its nested components to do the same, and so on.

What you end up with is a tree of component objects controlling the DOM tree:

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

It's a simple model that's easier to visualise and interact with than the functional approach of virtual DOM based frameworks.

## Rendering

The `render` method we saw above looks like this:

```tsx
function render (model, hub) {
  this.set(model, hub);
  this.update();
}
```

The `model` is the main data object passed to a component (the equivalent of React props, but it's one object) and `hub` is an optional second object which can safely ignore for now as we're not using it.

Both are saved as properties on the component during `set`:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

The `update` method coordinates the DOM updates, which we won't display here as it's more complex.

Splitting the flow into three methods lets us do useful things, such as updating a component by modifying its model in-place then calling `update`:

```tsx
const component = new Counter();
component.render({ count: 0 });

const click = () => {
  component.model.count = 1;
  component.update();
}
```

This comes in very handy for reactivity as we'll see later. It also bypasses `render` and `set` which would then only be called from the parent component, allowing us to override those methods to set things up for the "lifecycle" of the component, such as timeouts:

```tsx
CounterList.methods.render = function (model, hub) {
  setTimeout(() => {
    model.timedOut = true;
    this.update();
  }, 3000)
  this.set(model, hub);
  this.update();
}
```

Here `methods` is just a proxy for `prototype` which lets you use more compact syntax without accidentally overwritting the prototype:

```tsx
CounterList.methods = {
  render (model, hub) {},
  udpate () {},
  foo () {},
}
```

Overriding the `update` method is occasionally useful, but you shouldn't override `set` as that gets customised by directives such as `watch`.

## DOM

When you call a component constructor function:

```tsx
new Counter()
```

It creates that component instance's initial DOM and saves references to any dynamic elements so they can be accessed later without traversing the DOM, which is costly.

During `update` the component will read each value used, compare it to the previous value, and only update the element if it has changed since last update.

This is both highly efficient and robust, as you can layer in manual operations without breaking the component. To illustrate this let's use a `ref` to manually disable the input if `count` exceeds three:

```tsx
const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input ref:input bind-as:range={count} />{count}
  </div>
);

CounterList.methods = {
  update () {
    this.base.update.call();
    this.ref.input.disabled = this.model.count > 3;
  }
};
```

In the above:

- `this.base` lets you call the base methods.
-  `this.ref.input` points to the actual DOM element.

We are able to set the `disabled` property manually while letting the component control its value and event handling without any clash.

Of course you could have used an expression with the `disabled` attribute:

```tsx
<input disabled={count > 3} bind-as:range={count} />
```

The end result and underlying opertations would be the same, except the later would not update the element if it was hidden by an `if` statement or similar, as `update` takes this into account.

If you want to the best of both (change the element manually, but only if it is visible) use the `apply` directive:

```tsx
<div apply={doStuff(element)} />
```

Where possible, Wallace provides intermediate levels of control.

## Freedom

Most components don't override methods or access the DOM directly:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
    <div if={!counters.length}>No counters</div>
  </div>
);
```

In which case it doesn't really matter how the framework implements things under the hood, and you can essentially ignore the last three sections.

Where it does matter is in those pesky little edge cases which consume a disproportionate amount of dev time such as:

- Reparenting components.
- Altering a top level component without updating its nested components.
- Libraries like [chart.js](https://www.chartjs.org/) requires elements be attached to the DOM before it can do anything to them.

These can wreak havoc on frameworks, which are forced to come up with elaborate features (like React portals)  to handle them or use plugins which further bloat your bundle. 

In some cases there is no neat solution at all, and you are effectively left trapped by your framework.

Wallace doesn't have this problem. All that exists at run time is a tree of components whose methods you can override, and whose DOM operations you can fully interact with.



making Wallace the only fully open framework where you are totally free.



avoids this dilema by being a fully open framework, seemingly the only one out there.



## Directives

Directives are JSX attributes which do something special.

They take effect during transpilation, so all the heavy lifting involved in interpreting, validating and combining your instructions happens then and not at run time. Similarly the code involved in all that stays out of your bundle, leaving only instructions in very  compact form.

This means we can add endless directives, permutations and combinations at no extra cost, which lets us create multiple layers of abstraction. 

The ` bind-as:range` directive is a perfect example:


```tsx
<input bind-as:range={count} />
```

It is just a more compact way of doing this:

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

We'll explain where that `element` comes from and why changing `count` updates our component in the next couple of sections. The point here is that all three permutations compile to the *exact* same code.

The idea (which is repeated throughout Wallace) is to work at the highest level of abstraction with the most compact syntax, and progressively drop to lower levels with lengthier syntax as you need to deviate from default behaviour.

In this case you may want to parse or format a value, or change the event which triggers the change, although you can do that with `event` which is an example of combining directives:

```tsx
<input bind-as:range={count} event:input />
```

The part after `:` is called the qualifier, and acts as an extra variable, or for directives which simply require a text value it is interpreted as the value, so `event:input` equates to `event="input"`. 

You can also define your own directives or override stock directives if you don't like the defaults:

```tsx
// Doesn't work as it is just an example.
<input bind-range:count />
```

## Xargs

Component functions may specify a second parameter known as xargs because it contains various helpful extras:

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

Remember this is not a real function, and these parameters do NOT equate to the arguments passed into `render`:

```tsx
// hub does not become xargs
component.render(model, hub);
```

However, `hub` (which we'll cover soon) is one of the arguments available in xargs, along with:

- `self` - alias for `this` as `this` is not allowed in arrow functions.
- `model` - alias for `this.model`  which is useful when the main `model` parameter is destructured (i.e. `{count}` instead of `model`)
- `event` - the event, where applicable.
- `element` - the DOM element, where applicable.

The `model` parameter *may* be destructured to exactly one level, but the `xargs` parameter *must* be destructured to exactly one level. Renaming is not supported. If destructured, the model is reassembled in the generated code, so the `onChange` event handler would look like this:

```tsx
function (event) {
  this.model.count = event.element.valueAsNumber;
}
```

This matters for reactivity which we'll look at next.

The `event` and `element` xargs can be referenced multiple times in the component, but it will point to their respective event and element in each location used. You can even give them different types:

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

// And also modify the original:
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

The extended components also inherit methods.

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

## Updates

So far we have been telling the root component to `udpate` whenever data changes, which is generally fine as it only touches those parts of the DOM that actually need to changed. But in larger apps where performance matters we can streamline this further by combining two approaches.

The `part` directive lets you delineate parts within a component (including repeated components) which you can update independently:

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
    this.part.total.update();
  },
  updateCounters() {
    this.part.counters.update();
  }
}
```

We could also update specific `Counter` components by assigning them to a model:

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

Which lets you target components deeply nested in the tree.

You can combine these two approaches:

```tsx
CounterList.methods = {
  updateCounter(id) {
    this.models.find(counter => counter.id === id).component.update();
    this.part.total.update();
  }
}
```

These capabilities lets you match the performance of any vanilla app, while keeping your code clean, safe and sane.

## Conclusion

Wallace was designed to provide the benefits of a framework:

- Structure and organisation
- Declarative syntax
- Reactivity

Without the disadvantages:

- Bloated bundles
- Learning curve
- Restricted freedom

That last point is often overlooked. We can't anticipate what the web will throw at us, and handing over control of the DOM to a framework whose operations cannot be modified (as is the case in virtually all frameworks) is a very risk move.

Wallace's basic architecture was designed to let you override *everything*, and though you may not need that freedom day-to-day, knowing you have it is a welcome safety net.

As it turns out, that initial architectural decision led to Wallace becoming a very versatile tool which lends itself to a range of situations:

- Tiny size > good for landing pages.
- Concise syntax and easy reactivity > good for simple apps and prototypes.
- Closeness to the DOM > good for performance-critical pages.
- Built-in documentation > good for those who don't use it every day.
- OOP patterns > good for managing large complex apps.

This emphasis on freedom also explains how Wallace got its name, which makes a lot more sense if you've seen [Braveheart](https://www.imdb.com/title/tt0112573/) (or for a more modern adaptation: this [sketch](https://www.youtube.com/watch?v=HbDnxzrbxn4)).

![](/public/img/braveheart-1.jpg)

