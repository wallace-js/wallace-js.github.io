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

This tour shows you how Wallace works, and how that solves these issues. 

Assuming you've use frameworks before, it should also be enough for you to start using it in place of any other framework, as it is pretty simple and has built-in documentation.

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

It's a simple model that's easier to visualise and interact with than the functional components typical of virtual DOM based frameworks, which often require awkward patterns like hooks.

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

This is an example of **progressive control**, which is a concept you'll be seeing throughout Wallace. The idea being that you:

1. Start by using the compact syntax convenience mode, in this case attributes and basic directives.
2. If you need more control, switch to a more powerful directive, like `apply`.
3. If you need even more control, use `ref` and override `update`.

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

These can wreak havoc on frameworks, which are forced to come up with elaborate features (like React's portals) or use plugins which further bloat your bundle. Sometimes there is no neat solution, meaning you are effectively trapped by the framework.

Wallace avoids these problem as it has a fully open architecture: all that exists at run time is a tree of components whose behaviour you can fully override, and whose internal operations are simple enough to interact with.

You will never be trapped by Wallace, or reliant on fixes or plugins to deal with gnarly situations. Wallace essentially comes with an eject button, except that **progressive control** means you rarely have to push the button all the way.

This will make more sense with the coming sections.

## Directives

Directives are JSX attributes which do something special.

They take effect during transpilation, so all the heavy lifting involved in interpreting, validating and combining your instructions happens then, rather than at run time. Similarly, all the code involved in doing this work stays out of your bundle, leaving behind only compact instructions.

This means we can add endless directives, permutations and combinations at no extra cost, which helps us offer progressive control.

The ` bind-as:range` directive is a perfect example:


```tsx
<input bind-as:range={count} />
```

That is just a more compact way of setting the input type and binding to the property you're most likely interested in:

```tsx
<input type="range" bind:valueAsNumber={count} />
```


And binding is just a more compact way of creating a two-way update manually:

```tsx
<input
  type="range"
  value={count}
  onChange={(count = element.valueAsNumber)}
/>
```

We'll explain where that `element` comes from and why changing `count` updates our component in the next couple of sections. The point here is that all three permutations compile to the *exact* same code.

Again the idea is to start at the highest level of abstraction with the most compact syntax, and progressively drop to lower levels with lengthier syntax as you need to deviate from default behaviour.

You might want to parse or format a value, or change the event which triggers the change, - although you can do that with `event` which is an example of combining directives:

```tsx
<input bind-as:range={count} event:input />
```

>  The total now updates as you move the slider, rather than when you let go.

The part after `:` is called the qualifier, and acts as an extra variable, or for directives which simply require a text value it is interpreted as the value, so `event:input` equates to `event="input"`. 

You can also define your own directives or override stock directives if you don't like the defaults:

```tsx
// Just an example - won't work unless you implement it.
<input bind-range:count />
```

## Xargs

Component functions may specify a second parameter called **xargs** which contains various helpful extras, like `element`:

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
- `model` - alias for `this.model` which is useful when the main `model` parameter is destructured (i.e. `{count}` instead of `model`)
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

The `watch` directive causes the component to update whenver its model is modified by that component or any nested components, thereby making our app reactive:

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
```

It does this by modifying the `set` method to look like this:

```tsx
import { watch } from 'wallace';

function set (model, hub) {
  this.model = watch(model, () => this.update());
  this.hub = hub;
}
```

The `watch` function (not to be confused with the `watch` directive) returns a proxy of an object which fires a callback when it (or any of its nested objects) is modified:

```tsx
import { watch } from 'wallace';

const original = [{ count: 0}];
const callback = () => console.log('modified');
const watched = watch(original, callback);

// Each of these lines fires the callback:
watched[0].count = 1;
watched.push({ count: 2});
watched.reverse();

// And also modifies the original:
console.log(original)
> [{ count: 2}, { count: 1}]
```

The proxy returns a new proxy for nested elements, which also fire the callback. So `watched[0]` is a proxy of the object at `original[0]` which is why changing the `count` property via the input in `Counter` also makes the `CounterList` update.

The important part of this is that watching of data is totally decoupled from the updating of components, which makes it easy to:

1. Follow exactly how, why and when updates are triggered.
2. Control what gets watched and what happens when parts change.

Reactivity is very prone to confusing, hard to diagnose bugs, so having full visibility and control really helps.

Again the idea is to start out with the basic format, then drop down to lower level when you need different behaviour or (even temporary) visibility, which you can do by passing a callback to the `watch` directive:

```tsx
const CounterList = (counters, { self }) => (
  <div watch={() => countersChanged(self, counters)}>
    ...
  </div>
);

const countersChanged = (component, counters) => {
  localStorage.setItem("data", JSON.stringify(data));
  component.update();
}
```

If you need even more control you're best removing the `watch` directive and setting it up yourself in `render`. Say you have some UI state in the model which should update the UI but shouldn't trigger a data save:

```tsx
import { mount, watch } from 'wallace';
import type { Takes } from 'wallace';

interface CounterModel {
  count: number;
}

interface CounterListModel {
  counters: CounterModel[];
  state: {
    showTotal: boolean
  }
}

const CounterList: Takes<CounterListModel> = ({counters, state}) => (
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
  render({counters, state}) {
    const model = {
      counters: watch(counters, () => countersChanged(this, counters)),
      state: watch(state, () => this.update()),
    }
    this.set(model);
    this.udpate();
  }
};

mount("main", CounterList, {
  counters: [{ count: 0 }],
  state: {showTotal: true}
});
```

We'll look at more fine grained updates in a bit, but first lets look at a nicer way to handle state.

## Hubs

Say we want to access the `state` from the `Counter` components. This gets messy when we only have a single input into a component (the model) and that's where hubs come in.

Any function which accepts a `model` argument (such as `mount`, `render`, `set`) also accepts an optional `hub` argument right after it. Lets move the state to that slot, and add a "mode" which the `Counter` will access.

```tsx
mount(
  'main',
  CounterList,
  [{ count: 0 }],                    // model
  {showTotal: true, mode: 'button'}  // hub
);
```

As we saw earlier, this gets saved on the component instance during `set` just like `model`:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

What makes `hub` special is that it is automatically propagated to nested components, meaning the whole tree from that point down shares the same `hub` object.

Components access their `hub` in their **xargs**, whose type you can also annotate with `Takes`:

```tsx
interface Hub {
  showTotal: boolean;
  mode: 'range' | 'button';
}

const Counter: Takes<CounterModel, Hub> = ({ count }, { hub }) => (
  <div>
    <div if={hub.mode === 'range'} >
      <input bind-as:range={count} />{count}
    </div>
    <button if={hub.mode === 'button'} onClick={count++}>
      {count}
    </button>
  </div>
);
```

Here we used the hub to share a plain object with state, which we can watch it just like we watch the model.

We can also use the hub to share custom objects with methods, getters and setters, which we can think of as controllers. These often have a reference to a component so they can trigger updates:

```tsx
class Controller {
  constructor(root) {
    this.root = root;
    this._showTotal = true;
  }
  get showTotal () {
    return this._showTotal;
  }
  set showTotal (value) {
    this._showTotal = value;
    this.root.update();
  }
}

CounterList.methods = {
  render(counters) {
    this.set(model, new Controller(this));
    this.udpate();
  }
};

mount('main', CounterList, [{count: 1}]);
```

Notice how we:

1. Instantiated the controller in `render` rather than passing it in.
2. Used setters to produce reactive behaviour instead of `watch`.

Both of these alternatives are perfectly valid. Use whatever feels best according to your needs.

## Models

Of course we can also use custom objects as models, which is a very powerful pattern. Although it is overkill for our example, let's see what these classes might look like:

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

Although we end up writing more code, that extra code is free code (nothing to do with the framework) and we actually end with *less* framework code. Free code is quicker to work with on two counts:

1. It is easier to assess whether it is correct just by looking at it, as we understand it fully and there's no framework operation to take into account.
2. You have the full range of constructs available in that language to organise your code with, whereas framework code may impose some restrictions.





There are two major benefits to this, which relate to the fact different kinds of code have different qualities.

Time to certainty is how long you need to stare at a piece of code to be certain it has no errors. Organisation potential is how much power you have organise your code clearly and without duplication etc.

|           | Time to Certainty | Organisation Potential |
| --------- | ----------------- | ---------------------- |
| Regex     | Terrible          | Terrible               |
| Framework | Average           | Average                |
| Free      | Best              | Best                   |

You will be more efficient working with a codebase 



#### Certainty

Different kinds of code



Firstly we tend to suspect framework



This approach has a couple of small benefits:

- We don't need the hub to share the `Controller` as the `CounterModel` has a reference to it.
- We don't need interfaces, as classes are their own interface.
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

