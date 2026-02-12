---
title : How it works
sidebar:
  order: 2
---

## Compilation

Wallace uses a custom Babel plugin to find functions that contain JSX (which must follow certain rules) and *replace* them with a generated function plus prototype:

```tsx
var Counter = function () {/* generated code */};
Counter.prototype = {/* generated code */};
```

> The real code looks different, but is equivalent.

The function with JSX *never runs*, as it doesn't exist at run time. Its only purpose is to hold a JSX expression which gets *parsed during compilation* along with the function parameters, then replaced.

This generated function is used internally to create objects, which are the actual components, also called component objects or instances:

```js
const counter = new Counter();
```

> You don't usually create components like this yourself.

Components have their own properties like `el` which is the root element of it DOM, and methods like `render` which updates the DOM with data:

```js
const counter = new Counter();
document.body.appendChild(counter.el);
counter.render({ clicks: 0 });
```

> You should now see a click counter on the page.

As you can see: a component is just an object which creates its own DOM and updates it when you call `render`.

This is very different to frameworks like React, where "components" are functions, and this impacts several things which we'll see throughout the tour.

## Mounting

The `mount` function simply:

- Creates an instance of a component.
- Calls its `render` method.
- Attaches its `el` to the DOM by replacing the provided element.
- Returns the component.

You can supply an actual element:

```js
import { mount } from 'wallace';

mount(
 document.getElementById('main'),
 Counter,
 { clicks: 0 }
)
```

Or the id of the element:

```js
import { mount } from 'wallace';

mount('main', Counter, { clicks: 0 });
```

In either case the element with id "main" is *replaced* by the component's `el` element, so you'd loose any attributes and content:

```html
<div id="main" class="this will disappear">
  This will also disappear, as will the id.
</div>
```

If that's not what you want, then you can use `createComponent` which creates and renders the component, then attach it as you please:

```js
import { createComponent } from 'wallace';

const counter = createComponent(Counter, { clicks: 0 });
const element = document.getElementById('main');  

element.appendChild(counter.el);
```

You should always render components before attaching them to the DOM as:

1. It avoids a repaint.
2. It avoids displaying the DOM without the data, which may look off.

Another advantage of using `createComponent` instead of `new Counter()` is that it sets up the type correctly.

## Updates

The `render` method looks like this:

```tsx
function render (props) {
  this.props = props;
  this.update();
}
```

Which means we can update a component without calling `render`:

```js
counter.render({ clicks: 0 });
counter.props.clicks ++;
counter.update();
```

Which makes localising updates (only updating part of the component tree - which you'll be doing a lot) really easy. 

So far we have only been updating the root component:

```js
import { mount, watch } from 'wallace';

const counters = [{clicks: 0}, {clicks: 0}];
const root = mount(
  'main',
  CounterList,
  watch(counters, () => root.update())
);
```

That's fine for a toy app, but in the real world we'd want more localised updates. To see how we do this, this let's create an app which displays multiple `CounterList` components:

```jsx
import { mount } from 'wallace';

const CounterListApp = (props) => (
  <div>
    <CounterList.repeat items={props} />
  </div>
)

mount('main', CounterListApp, [
  [{clicks: 0}, {clicks: 0}],
  [{clicks: 0}, {clicks: 0}]
]);
```

We want each `CounterList` to update itself, not `CounterListApp`, when its array of counters is modified. The problem is that we don't have a references to them, which is the same predicament we land in when components are functions as they are in React, and we'd need to use a weird hack like hooks.





We want each `CounterList` to update itself when its props are modified, which we can do by overriding the `render` method to set its props to a reactive copy of the props passed in:

```js
import { watch } from 'wallace';

CounterList.methods = {
  render (counters) {
    this.props = watch(counters, () => this.update());
    this.update();
  }
}
```



> The `CounterLists` are now independently reactive, plus we got rid of global variables.

This works because `render` is only called once on each `CounterList` during the app lifetime, as all updates from button clicks go though `this.update()`.



TODO:

- use methods by default, then explain
- Note TypeScript support!

JavaScript "methods" are really functions on the prototype - you're confused about that, [this page](/docs/misc/prototypes) explains it at just the level of detail you need.

There are several advantages to this approach:

- Clarity
- Control



```js
import { watch } from 'wallace';

CounterList.prototype.render = function (counters) {
  this.base.render.call(
    this,
    watch(counters, () => this.update())
  );
}
```







```js
import { watch } from 'wallace';

CounterList.prototype.render = function (counters) {
  this.props = watch(counters, () => this.update());
  this.update();
}
```

> 





In React you'd need 

During the life cycle of the page:

- `App` renders and updates once.
- Each `CounterList` renders once, but updates every time its props change.
- Each `Counter` renders and updates many times.





However `render` gets called on `Counter` every time its containing `CounterList` updates. Component never calls `update` on ne component, it always calls `ren calls `up inside `render`



And that's why we were able to do this in the previous section:

```js
import { watch } from 'wallace';

const root = CounterList();
document.body.appendChild(root.el);

const counters = [{ clicks: 0 }, { clicks: 0 }];
root.render(watch(counters, () => root.update()));
```





```js
const counters = [{clicks: 0}, {clicks: 0}];
const root = mount(
  document.getElementById('main'), 
  CounterList,
  watch(counters, () => root.update())
);

```





Which means there are three ways to update a component:

```js
// 1. Using render:
counter.render({ clicks: 1 });
// 2. Assigning new props:
counter.props = {clicks: 1};
counter.update();
// 3. Modifying props in place:
counter.props.clicks ++;
counter.update();
```

And the reason this is useful is because it lets you turn any component into a 

a



We'll cover how components update the DOM later, as that's not so important for now.

What is important is understanding that 



This means we could also just modify the array then call `update` :

```tsx
counters[0].clicks = 1;
root.update();


const component = new CounterList();
document.body.appendChild(component.el);
component.render([{clicks: 0}, {clicks: 0});
```

And seeing as `root.props` and `counters` are the same object,we could do this:

```tsx
root.props[1].clicks = 1;
root.update();
```

Storing mutable state on a component might seem like a terrible idea, and is precisely what functional frameworks like React try to avoid, but:

1. You can make it safe in a couple of ways.
2. It avoids "magic code" which is a major source of mistakes.

The 







Attach el for illustration, or just explain what it is



then the other 3





We could update the DOM by calling `render` with the modified array:

```tsx
counters[0].clicks = 1;
root.render(counters);
```





d, but in a weird twist, it actually helps make your code safer.

If you only ever call `render` then components are as good as stateless and you'd never know about `props` and `update`. The only risk is if you mo



You'd only call `update` on certain high-level components. During `update` the component calls `render` on its nested components. In fact, Wallace only calls `update` from `render` as shown above. 



, which call `render` on nested components. 

And `render` sets the `props` 







The `update` method calls `render` 



This goes completely against the functional programming philosophy pushed by React, but that fails to account for the fact there are really two kinds of component:

##### Dumb components

Components like `Counter` only display data and fire events, and should be stateless. So long as you only call their `render` method (Wallace only ever calls `update` from within `render`) they are as good as stateless.

##### Controlling components

Components like `CounterList` coordinate the tree

 updates following changes to state/data, and making these stateless (as they are in React) means you need to use patterns like hooks, whose operations are unclear.

So although Wallace components do store mutable data in their state, they are for the most part as safe and predictable as stateless components, without the crippling restrictions imposed by purely functional components.



The component object is 

```js
component.el;
component.props;
component.render({ clicks: 0 });
component.update();


const component = new Counter();
document.body.appendChild(component.el);

component.render({ clicks: 0 });
```



 that's not actually a problem as can with immutable data.

## Immutability

Either you want your data to be modified by the UI (mutable) or you don't (immutable). 

For mutable data you might want to update the UI when it changes, which you can do using `watch`:

```tsx
import { watch } from 'wallace';

const reactiveCounters = watch(counters, () => root.update());
root.render(reactiveCounters);
```

For immutable data you can use `protect` which throws an error if the object is modified:

```tsx
import { protect } from 'wallace';

const readonlyCounters = protect(counters);
root.render(readonlyCounters);
```

>  Clicking the buttons now throws an error.

So you get safety where you need safety and reactivity where you need reactivity. You can also use these alongside each other:

```tsx
const props = {
  state: watch(state, root.update()),
  data: protect(data)
}
```





# EEEEEEEEEE



#### Two kinds of component



## Clarity

The problem with hooks, signals and built in reactivity is that it's not obvious how those work.













1. It isn't as unsafe as you might think, as we'll prove shortly.
2. It results in more obvious code, which is the real key to preventing mistakes.

## Reactivity

This makes it really easy to transition from one to the other, which is is quite common when requirements change, or you move from demo to real data.



You can also have both side by side:

```tsx
const props = {
  state: watch(state, root.update()),
  data: protect(data)
}
```

Or use different callbacks for different parts of the data:

```tsx
const props = {
  state: watch(state, root.update()),
  dialogState: watch(dialogState, dialog.update()),
  data: protect(data)
}
```





## Obvious code

All you need to do is update the correct components after 





1. 
2. means you don't need to use hooks or other weird patterns, which make your code easier to follow, and gives you more control over updates.









```tsx
const root = mount('main', CounterList, []);
root.props.push({ clicks: 0 });
root.update();
```

And this is really useful for coordinating updates.

```tsx
import { mount, watch } from 'wallace';

const counters = [{ clicks: 0 }, { clicks: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```







-------











## Components





, but doing it once helps you understand they are just ordinary objects with methods that updates their DOM, which you can attach to the document like any other DOM element:

```js
const counters = [{clicks: 1}, {clicks: 2}];
const component = new CounterList();
document.body.appendChild(component.el);
component.render(counters);
```

> During `render` the `CounterList` created two instances of `Counter` and attached them to its DOM.

-------







## Mounting

Components can be nested to form trees, and the root component must be attached to the page

A Wallace application is composed of one or more trees of nested DOM elements (e.g. one tree for the menu, another for the main content). 

The root element of each tree must be attached to the DOM using the `mount` function which:

1. Creates the root component instance.
2. Calls its `render` method.
3. Replaces the supplied element (you can pass an id string) with the component's DOM.
4. Returns the component instance.

You often want to keep a reference to the root component so that you can update the tree:

``` tsx
const root = mount('main', CounterList, []);
root.render([{clicks: 0}, {clicks: 0}]);
```

> `root` is an instance of `CounterList`. 







including functions which come from the prototype,



**The original `Counter` function in your source code will not exist in the bundle.**



, with bits set on its prototype.

It equates to this:



You should now see two click counters with values set:

<div style="border: 1px solid grey; padding: 10px;">
  <div>
    <span>Count: <span>1</span></span>
    <button>Click me</button>
  </div> <div>
    <span>Count: <span>2</span></span>
    <button>Click me</button>
  </div>
</div>

There's nothing magic, no virtual DOM, no hidden engine or run time complexity - just normal objects which:

- Update their own DOM.
- Coordinate nested components.

## Updates





It also tells us we could override `render` for a given component and modify its props before calling `udpate`, for example to add functions:

```tsx
const CounterList = ({ counters, incrementAll, total }) => (
  <div>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <button onClick={incrementAll()}>All +1</button>
    <div>Total: {total()}</div>
  </div>
);

CounterList.prototype.render = function (counters) {
  this.props = {
    counters: counters,
    incrementAll: () => counters.forEach(c => c.clicks++),
    total: () => counters.reduce((a, c) => a + c.clicks, 0)
  };
  this.update();
};
```

None of the buttons update the DOM yet, so let's fix that by using the `watch` helper function, which takes an object + callback, and returns a proxy (a special kind of wrapper) that calls the callback whenever it is modified:

```tsx
import { mount, watch } from 'wallace';

CounterList.prototype.render = function (counters) {
  const update = () => this.update();
  const countersProxy = watch(counters, update);
  this.props = {
    counters: countersProxy,
    incrementAll: () => countersProxy.forEach(c => c.clicks++),
    total: () => counters.reduce((a, c) => a + c.clicks, 0)
  };
  update();
};

mount('main', CounterList, [{ clicks: 0 }, { clicks: 0 }]);
```

Clicking any of the buttons now triggers the `update` callback, making our app fully reactive.

## Advantages

If you've used other frameworks you will know just how awkward their reactivity is.





Why does Wallace reactivity work this way?



## Philosophy

Wallace goes against two big trends in frameworks:

#### Functional programming

If components are functions, you don't have a reference to them, and need to use hooks - one of the ugliest patterns in web development. Less than 10% of React developers understand how they work, only how to use them.

forces you to use hooks or signals, which are horrible patterns that no one quite knows how they work.



1. Built-in reactivity.

Many frameworks have reactivity built-in, and many push functional components. 









We made a reactive app without confusing patterns like hooks or signals, just a proxy with a callback, whose operation is not linked to components.

You can see clearly when and why the DOM updates just 



But there's a subtle bug: `incrementAll` triggers `update` once for every item in `counters`. It's not noticeable with a small sample, and shows just how easy it is to make mistakes with reactive programming.

Wallace makes reactivity explicit, rather than hidden or built into the components so that these mistakes are easier to notice, debug and fix. All we need to do is work with the original `counters` instead and call `update` once we're done:

```tsx
import { watch } from 'wallace';

CounterList.prototype.render = function (counters) {
  const update = () => this.update();
  this.props = {
    counters: watch(counters, update),
    incrementAll: () => {
      counters.forEach(c => c.clicks++);
      update();
    }
  };
  update();
};
```

You can confirm this works by adding logging to `update`.

In other situations we might pass the `update` callback to nested components.



This form of repeat reuses components sequentially, which may cause issues with CSS animations and focus, in which case you should use a keyed repeater by passing `key` which can be a string or a function:

```tsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat items={tasks} key="id" />
  </div>
);

const TaskList = (tasks) => (
  <div>
    <Task.repeat items={tasks} key={(x) => x.id} />
  </div>
);
```

But you don't need to remember all this. JSX elements have a tool tip which reminds you of syntax rules and lists the available directives, which have their own tool tips detailing their usage:

Note that the function you see in your source code no longer exists at run time, so it never _runs_. It is just a placeholder for JSX, which gets _parsed_ during compilation. The function may only contain one JSX expression, and nothing else.









And mounted to the document using a helper function:

```tsx
import { mount } from 'wallace';

// Components as above...

const counters = [{clicks: 0}, {clicks: 0}];
mount('main', CounterList, counters);
```

> `mount` passes `counters` as the props to `CounterList` which then nests a `Counter` for every item in `counters`.

Your page should now display two click counters:

<div style="border: 1px solid grey; padding: 10px;">
  <div>
    <span>Count: <span>0</span></span>
    <button>Click me</button>
  </div> <div>
    <span>Count: <span>0</span></span>
    <button>Click me</button>
  </div>
</div>



Clicking on the buttons doesn't do anything yet. Before we tackle that, let's look at what Wallace did behind the scenes.
