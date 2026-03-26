---
title: Tour
sidebar:
  order: 2
---

This tour:

- Assumes you are familiar with front end development.
- Covers almost everything you need to know.
- Should take 15-20 minutes.

It's not a tutorial, but you can code along:

- **Online** with StackBlitz using [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).
- **Locally** with `npx create-wallace-app`.

## Overview

Wallace mirrors React's overall structure in that you:

1. Define components as functions that return JSX.
2. Nest them to form a tree.
3. Attach the root component to the document.

For example:

```tsx
import { mount } from 'wallace';

const User = ( name ) => <div>User: {name}</div>;

const UserList = ( users ) => (
  <div>
    <h2>Showing {users.length} users:</h2>
    <User.repeat items={users} />
  </div>
);

mount('main', UserList, ['Wallace', 'Gromit']);
```

It looks like React so far, but Wallace components:

1. Use JSX differently.
2. Operate differently.
3. Manage DOM differently.
4. Have different capabilities.
5. Play a different role in your app.

We'll cover things roughly in that order, but first, some help.

## Help

If you forget how to do something, just type `help` inside a JSX tag and hover your cursor over it:

```tsx
const Example = () => (
  <div help >
    ...
  </div>
);
```

The tool tip displays a cheat sheet with code snippets which your editor hopefully lets you copy.

For more extensive documentation, hover over the `wallace` module import:

```ts
import {} from 'wallace';
```

It includes everything (in condensed format) so that's one less browser tab open, and means you can work offline too.

## TypeScript

You don't have to use TypeScript, but it makes working with Wallace a whole lot nicer.

The main thing you'll be annotating are the arguments which components accept, which you do with the `Accepts` type:

```tsx
import type { Accepts } from 'wallace';

// CORRECT
const User: Accepts<string> = ( name ) => <div>User: {name}</div>;

// WRONG
const User = ( name: string ) => <div>User: {name}</div>;
```

The correct form ensures type safety when nesting or mounting the component too.

The type `Uses` lets you annotate other aspects of the component:

```tsx
import type { Uses } from 'wallace';

type UserTypes = { props: string, stubs: {...} };
const User: Uses<UserTypes> = ( name ) => <div>User: {name}</div>;
```

These are covered in more detail in [TypeScript](/docs/reference/typescript/).

For brevity we'll omit type annotations from the rest of the tour.

## JSX

Wallace doesn't *run* the JSX, it *reads* it during compilation, and *replaces* the entire function (which must contain a single JSX expression and nothing else) with a class-like structure.

You're not allowed any code before, around or within the JSX, except in placeholders, so long as it doesn't return further JSX:

```tsx
// ALLOWED
const User = ( name ) => (
  <div>User: {name || '??'}</div>
);

// NOT ALLOWED
const User = ( name ) => (
  <div>User: {name || <span>??</span>}</div>
);
```

Wallace trades the boundless freedom of React (you can still build the same UI) for a more powerful directive-based syntax.

Directives are attributes which take effect during compilation and let you do interesting things:

```tsx
const User = ( user ) => (
  <div class:active="active" toggle:active={user.active}>    
    User: {user.name}
    <div if={mode === "edit"} >
      <input bind={user.name} />
      <button on:click={deleteUser()} />
    </div>
  </div>
);
```

As well as directives there is special syntax for nesting and repeating:

```tsx
const UserList = ( users ) => (
  <div>
    <User arg={users[0]} />
    <User.repeat args={users} />
  </div>
);
```

If you forget this, just ask for `help`.

## Components

Wallace *replaces* functions which return JSX with class-like structure during compilation. These are used to create component *instances* behind the scenes. To see this working, let's comment out the call to `mount` and do it manually:

```tsx
import { mount } from 'wallace';

const User = ( name ) => <div>User: {name}</div>;

const UserList = ( users ) => (
  <div>
    <h2>Showing {users.length} users:</h2>
    <User.repeat items={users} />
  </div>
);

// mount('main', UserList, ['Wallace', 'Gromit']);

const userList = new UserList();
document.body.appendChild(userList.el);
userList.render(['Wallace', 'Gromit']);
```

TypeScript will complain because it is unaware that `UserList` will be transformed into something else, so just ignore that as you don't normally do this.

As you can see, `userList` is an ordinary object with properties like `el` (its root HTML element) and methods like `render`, which update its DOM with the arguments:

```tsx
userList.render(['Gromit', 'Wallace']);
```

There is no global engine coordinating things: each component manages its own DOM and nested components, which manage their DOM and nested components, and so on down the tree.

## Rendering

For current purposes the `render` method looks like this:

```ts
function render ( arg ) {
  this.arg = arg;
  this.update();
}
```

Let's override it for `User` to add some logging:

```ts
User.methods = {
  render( user ) {
    this.arg = user;
    this.update();
    console.log("Rendered User");
  }
};
```

The `methods` property is just a proxy for `protoype` that extends rather than overwrites it, which reduces typing and accidents, so you're essentially doing this:

```ts
User.prototype.render = function ( user ) {
  this.arg = user;
  this.update();
  console.log("Rendered User");
};
```

The point of having `render` call `update` is so we can bypass `render` and update the component like this:

```ts
userList.arg.reverse();
userList.update();
```

If you do that, you'll see it logs `"Rendered User"` twice, because `update` calls `render` on any nested components.

This two step process comes in very handy when creating dynamic UI as we'll see in the next section. But first let's wrap up by showing how components update their DOM.

Let's use the `ref` directive to create a reference to the raw DOM element:

```tsx
const User = ( name ) => 
  <div>
    User: <span ref:name></span>
  </div>
);

User.methods = {
  render( user ) {
    if (user !== this.oldValue) {
      this.ref.name.texContent = user;
      this.oldValue = user;
    }
  }
};
```

We don't need to call `update` as we're working with the raw DOM element directly. This is essentially what the component does when we use a placeholder, with a few extra bits to account for hidden elements, nested components and repeaters.

This makes for very efficient update as it only touches elements that need to be updates, and completely ignores the rest. It is also a very simple mental model which makes it easy to follow what's going on.

Now you understand how Wallace works, lets dive into how you use it.

## Watch







Then render then update.

Decide on the point I'm trying to make, and how much I want to cover with the tour.

I need to go over:

- watch + bind > bad for (state + data (like mode for inputs vs buttons)
- controller
- hot props partials
- 

Remember this is not a "How to use Wallace".





In our example so far it makes no difference whether components are functions or objects.

This is very different from React, where a special "root" object calls component functions and patches the DOM.

Although you can add methods to component definitions like you did with React classes, you tend not to do that, and instead wrap functionality into the arguments.

#### Arguments

The render method accepts two argument which can be anything, but is usually an object.



We'll now look a how components works, which matters because it affects the various ways you can structure your app as well explore in the subsequent sections, 





The functions with JSX are never executed. They get replaced with constructor functions during compilation, which are 













- A primitive
- A plain object
- An instance of a class



You might think this happens in the `render` method, but it's actually the `update` method

```ts
User.methods = {
  render(user) {
    console.log("rendering user", user);
    this.item = user;
    this.update();
  }
}
```



```tsx
const User = ( name ) => (
  <div>
     <span>User: {name}</span>
     <span ref:age></span>
  </div>
);

User.methods = {
  render(user) {
    this.ref.name.textContent = user;
    this.update();
  }
}
```







If all you're doing is displaying data, then it feel much like React, except for the JSX syntax and faster page load. But when the UI becomes dynamic

But Wallace works very differently to React, and this only becomes apparent 

If all you're 





In React you your components do all the work





You probably noticed the JSX syntax is a bit different. What's less obvious is that components, their arguments, how the render and how you use them is also *very* different.



1. 

```
New plan:
	Show that components are objects
	more mechanical
	why its better:

	
```



### Why this is better

The point of a frameworks is to reduce your workload

because development time is not about churning out code.



Doing, Deciding, Debugging



There's a separate page explaining [why](/docs/why) Wallace exists. The TLDR is that none of the alternatives met the author's four basic criteria:

1. No **ugly** syntax or patterns.
2. No **magic** DOM updates that are hard to follow, debug or control.
3. No **bloat**, so it can be used on landing pages and apps with frequent page switches etc...
4. No **learning** beyond an initial 15-30 minutes.







which lets you create component instances:

```ts
const greeting = new Greeting();
greeting.render('Wallace');
document.body.appendChild(greeting.el);
setTimeout(() => greeting.render('Gromit'), 2000);
```

But you'd normally use `mount`:

```tsx
import { mount } from 'wallace';

const greeting = mount('main', Greeting, 'Wallace');
setTimeout(() => greeting.render('Gromit'), 2000);
```







```ts
const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);
```



 look like React but work very differently:





Wallace is a component-based framework (like React, but different) where you structure the UI as a components are defined as functions:

(show two components)

Like React you define components as functions that return JSX:

But they don't work the same way.

During compilation any function with JSX is replaced with a generated constructor function that lets you create component instances:

```
new 
```

These objects control their own DOM

```
apend and render
```

(later) There's no virtual DOM. The component stores references to dynamic elements.

You don't normally do this manually, you'd use mount:

```ts

```

So how is this different to React?



## First glance

Let's jump right in with a reactive click counter:

```tsx
import { mount, watch } from 'wallace';

const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);

const root = mount(
  'main',
  Counter,
  watch({ count: 0 }, () => root.update())
);
```

Alt



```tsx
import { mount, watch } from 'wallace';

const Counter = ({ count }) => (
  <div assign:cmp>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);

Counter.methods = {
  render(item) {
    this.item = watch(item, () => this.update());
    this.update();
  }
}

mount('main', Counter, { count: 0 });
```





We defined a component as a function with JSX, then called `mount`



mounted an instance of it to the DOM by replacing the element with id `main` with the 



## Overview

Wallace is a compiled framework which requires a tool like Webpack to transform the jsx/tsx files in which you define components:

```jsx
const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);
```

It looks like React, and due to its similarity and popularity we'll be using that as a base for comparison. Just remember Wallace works differently, and is used differently too.

It's more fun learning with an interactive UI so let's set this up first, and explain how it works later:

```tsx
import { mount, watch } from 'wallace';

const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);

const root = mount(
  'main',
  Counter,
  watch({ count: 0 }, () => root.update())
);
```

> This replaces the element with `id="main"` with an instance of `Counter`.

## Assistance



## JSX

Instead of putting JavaScript around JSX elements, you place *directives* (like `if`) inside elements:

```jsx
const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
    <button if={count > 3} onClick={(count=0)}>
      Reset
    </button>
  </div>
);
```

You loose the full flexibility of React, but:

1. You rarely need that flexibility.
2. You can still achieve the same end result.
3. Your JSX will be less cluttered (and easier to debug) and more compact (~50% fewer lines).
4. You don't create false indentation.
5. More power.

Nesting syntax is also different: you pass props in a single directive, which means you can use other directives:

```jsx
const DoubleCounter = (counters) => (
  <div>
    <Counter props={counters[0]} />
    <Counter props={counters[1]} if={counters.length > 1}/>
  </div>
);
```

To repeat a nested component you just add `.repeat` after the name:

```jsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat props={counters} />
  </div>
);
```

Both Wallace and TypeScript understands that `props` should now be an Array.

Lastly, you can't put any code before the JSX:

```jsx
const CounterList = (counters) => {
  counters.sort() // << No code allowed here!
  return <div>
    <Counter.repeat props={counters} />
  </div>
};
```

If you're use to React this might seem like madness, but once you see how Wallace does it,  then React might seem the madder of the two.

### Components

The second difference is that these functions are never *called* - they are *replaced* with a constructor function during compilation, which lets us create component objects:

```jsx
const component = new Counter();
```

However you don't usually do that yourself, instead you define a tree of nested components:

```jsx
const CounterList = (counters) => (
  <div>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <Counter.repeat props={counters} />
  </div>
);
```

And mount the root component to the DOM:

```jsx
import { mount } from 'wallace';

/*...*/

const counters = [{ count: 0 }, { count: 0 }];
const root = mount('main', CounterList, counters);
```

The root component is a component like any other, which:

1. Updates its own DOM.
2. Manages its nested components.

So your DOM is controlled by a tree of very simple objects which you can customise and interact with.

Before we look at what we can do with that, let's quickly cover the JSX rules.

#### 1. Static JSX

Wallace doesn't allow JavaScript around JSX elements, only inside `{expressions}`. You do the interesting things using directives and special syntax for nesting and repeating components:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat props={counters} />
    <div if={counters.length > 5}>Calm down</div>
  </div>
);
```

This approach means your JSX:

1. Doesn't turn into an mangled mess which:
   1. Obscures the DOM structure.
   2. Creates false indentation.
   3. Conceals bugs.
2. Is a lot more compact, often needing half as many lines as React.
3. Allows for more powerful syntax and behaviour like partial updates, two-way binding and overridable stubs.

#### 2. Real Components

Wallace components are real objects. The `mount` function creates the root component of the tree:

```jsx
import { mount } from "wallace";

/*...*/

const counters = [{ count: 0 }, { count: 0 }];
const root = mount("main", CounterList, counters);
```

> Passing `'main'` equates to passing `document.getElementById('main')`.

Each component manages its own DOM and nested components. So `root` (which is an instance of `CounterList`) creates one instances of `Counter` for each item in `counters`.

The DOM is controlled entirely by components, there's no virtual DOM, global state or hidden engine, just a tree of component objects.

Why this matters will become evident later.

#### 3. Sane Reactivity

Wallace is not reactive like Angular or Svelte, nor is it unreactive like React. Instead you use `watch` which returns a proxy of an object that fires a callback when it is modified, from which you can update a component:

```js
import { mount, watch } from "wallace";

/*...*/

const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

It feels rather manual, but this has several advantages:

1. You can clearly see why and when something updates, which saves tons of time given how easily reactivity goes wrong.
2. It is totally separate from the component, which helps with testing/debugging/not breaking when things change.
3. You can easily change what data you watch, or what the callback does, such as:
   1. Update different components.
   2. Update parts of components.
   3. Persisting data.
   4. Debouncing.
   5. Undo/redo state (example [here](https://github.com/wallace-js/wallace/tree/master/examples/undo)).
4. Works well with 2-way data binding.

Here is the full listing with a few bits added to show it working:

```jsx
import { mount, watch } from "wallace";

const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
    <input type="number" bind={count} />
  </div>
);

const CounterList = (counters) => (
  <div>
    <div>Total: {total()}</div>
    <Counter.repeat props={counters} />
    <button onClick={counters.push({ count: 1 })}>Add counter</button>
  </div>
);

const total = () => counters.reduce((a, c) => a + c.count, 0);
const counters = [{ count: 0 }, { count: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

Wallace was designed to produce code that's easy to follow and easy to change, the insane performance came later.

## Support

### Directives

Directives are special attributes that do something, such as `if` which conditionally attaches an element, and `bind` which creates two-way binding between an element and data, and also takes a _qualifier_ to specify which event fires the change:

```jsx
const Counter = ({ count }) => (
  <div>
    <button if={count > 3} onClick={(count = 0)}>
      Reset
    </button>
    <div>Count: {count}</div>
    <input type="number" bind:keyup={count} />
  </div>
);
```

You don't need to remember all the directives, as they are listed in the tool tip for JSX elements which also includes a reminder of JSX syntax rules:

![](/img/div-tooltip.jpg)

Hovering over the directive itself gives you more detailed documentation. Wallace has tool tips for everything, and even a full cheat sheet on the module:

![](/img/cheat-sheet.jpg)

So you can code away in remote locations without Internet - great for a rainy day in the Highlands!

You can also define as many custom directives as you like, which won't impact bundle size as they operate during compilation.

### TypeScript

Wallace provides its own type to annotate components, which lets you specify the props and a couple of other bits that we'll cover later. Functions like `mount` and `watch` are all type-aware too:

```tsx
import { mount, watch, Uses } from "wallace";

interface iCounter {
  count: number;
}

const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <div>Count: {count}</div>
    <button onClick={count++}>Click me</button>
  </div>
);

const CounterList: Uses<iCounter[]> = (counters) => (
  <div>
    <Counter.repeat props={counters} />
  </div>
);

const counters = [{ count: 0 }, { count: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

> Try passing invalid props...

### Components

During compilation a special Babel plugin replaces component functions with generated functions:

```js
var CounterList = function () {
  // Generated code...
};
```

Wallace uses these functions as constructors to create objects, which are the actual components:

```js
const component = new CounterList();
```

> You don't usually create components this way yourself.

A component creates its own DOM (whose root element is stored as `el`) and provides a method to update it:

```js
document.body.appendChild(component.el);
component.render([{ count: 0 }, { count: 0 }]);
```

> You should now see two click counters on the page.

The `mount` function does exactly what we've just seen, except it replaces the specified element, then returns the component.

Note that all the nested `Counter` components are created by `CounterList`. Components control their own DOM and nested components - there is no special root object, no central engine, or anything else - just a tree of components.

### Updates

The `render` function simply does this:

```tsx
function render(props) {
  this.props = props;
  this.update();
}
```

So you can also update a component by setting/modifying its `props` then calling `update`:

```js
component.props[0].count++;
component.update();
```

Which is how we've been handling reactivity:

```js
const counters = [{ count: 0 }, { count: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

You can override these methods as they live on the prototype:

```js
Counter.prototype.render = function (props) {
  this.props = props;
  this.update();
  console.log("Rendered Counter with", props);
};
```

> The type of `props` carries through from `Use<iCounter>`.

But working with the prototype directly has some quirks, so Wallace provides a neater way:

```js
Counter.methods = {
  render(props) {
    this.props = props;
    this.update();
    this.base.render.call(this, props);
    console.log("Rendered Counter with", props);
  },
};
```

You can also shorten the above to this:

```js
Counter.methods = {
  render(props) {
    this.base.render.call(this, props);
    console.log("Rendered Counter with", props);
  },
};
```

### Reactivity

Reactivity is a major source or bugs, glitches and performance issues on the front-end, because it is:

1. Easy to trigger more updates than intended.
2. Hard to notice this happening (especially on a typical developer's high spec device).
3. Hard to guard against with tests.

And depending on how the framework implements reactivity, it can also be hard to prevent this from happening.

To illustrate this let's add a total, and a button that increments each counter:

```jsx
const total = (counters) => counters.reduce((a, c) => a + c.count, 0);

const incrementAll = (counters) => counters.forEach((c) => c.count++);

const CounterList = (counters) => (
  <div>
    <div>Total: {total(counters)}</div>
    <button onClick={incrementAll(counters)}>++</button>
    <div>
      <Counter.repeat props={counters} />
    </div>
  </div>
);
```

> The total should update as you click on counter buttons or **++**.

It works great, but if you add 1000 counters:

```js
for (let i = 0; i < 1000; i++) {
  counters.push({ count: 0 });
}
```

You'll notice a delay when clicking the **++** button. If you add some logging, which is easy to do as you control the callback:

```js
const root = mount(
  "main",
  CounterList,
  watch(counters, (target, key, value) => {
    console.log("updated", target, key, value);
    root.update();
  })
);
```

You'll see that `incrementAll` triggers the callback once for every item in counters. Despite only causing in two DOM elements to update each time (the `Total` and one `Count`) doing it 1000 time is slow because:

- There is work involved in determining which DOM elements should change, both within the component, and calculations like `total()`.
- It causes the page to repaint multiple time in quick succession (aka DOM thrashing) which is a sure way to drain battery and kill performance.

Way can easily fix this by working on the original array rather than the proxy returned by `watch` so it doesn't trigger the update, and then `calling update` once we're done:

```js
const incrementAll = () => {
  counters.forEach((c) => c.count++);
  root.update();
};
```

> The total (and the 1000 `Counter` components) now update instantaneously, even if you keep clicking in rapid succession.

Although reactivity by explicit callback feels a bit verbose, it saves time in the long run by making it easy to diagnose and fix issues.

You can also use the callback to do other things such as:

- Updating only certain components.
- Updating parts within components.
- Setting up undo/redo state.
- Rejecting the change (and rolling back).
- Persisting data changes.

However, if you're persisting data you probably don't want your UI to be reactive, but to follow an **action>save>update** flow instead. And you'd want your data to be immutable.

### Immutability

Let's create a store (nothing to do with Wallace) with counters:

```ts
interface iCounter {
  id: number;
  count: number;
}

class Store {
  counters: iCounter[];
  constructor() {
    this.counters = [
      { id: 1, count: 0 },
      { id: 2, count: 0 },
    ];
  }
  setCount(id: number, count: number) {
    // First save to local storage or server etc...
    this.counters.find((c) => c.id === id).count = count;
  }
}

const store = new Store();
```

You don't want the UI to modify `counter` or a copy of `counters` without going via `setCount`. We can do this:

```js
import { mount, protect } from "wallace";

mount("main", CounterList, protect(store.counters));
```

> Clicking on any of the buttons now throws an error.

We need to change the buttons to use `setCount` then update the `root` which could get messy, and this is where controllers come in.

### Controllers

When enabled, the `render` function changes to this:

```tsx
function render(props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
}
```

And functions which forward `props` to `render` (such as `mount`) now forward a `ctrl` as well, so let's create a `Controller` and pass it to `mount` :

```ts
class Controller {
  setCount(id: number, count: number, update = true) {
    store.setCount(id, count);
    if (update) root.update();
  }
}

const root = mount(
  "main",
  CounterList,
  protect(store.counters),
  new Controller()
);
```

> Don't worry, we'll get rid of the global variables later.

The controller gets passed to `CounterList.render` which stores it as `this.ctrl` - and (here's the neat part) also passes it to `render` for each of its nested components, which do the same, and so on all the way down the tree.

We access `ctrl` in the JSX function via a second argument called **xargs** which has several useful things in it. Remember this function is replaced during compilation so these aren't real arguments, but `Uses` lets us set their types:

```tsx
const Counter: Uses<iCounter, Controller> = ({ id, count }, { ctrl }) => (
  <div>
    <div>Count: {count}</div>
    <button onClick={ctrl.setCount(id, count + 1)}>Click me</button>
  </div>
);
```

Here the controller acts as a small "hub" with functions which all components in the tree have access to, but there's a reason they're called controllers rather than hubs.

As your app grows, you'll need different controllers for different parts of the tree. Dialog boxes, menus, tables and forms all get their own controller, and typically maintain a link back to their parent controller:

```js
SettingsDialog.methods = {
  render(props, appController) {
    this.ctrl = new SettingsDialogController(this, appController);
    this.props = props;
    this.update();
  },
};
```

So the tree of DOM elements is managed by a tree of components which is managed by a tree of controllers. This tree of controllers coordinates updates between components and services like stores, so it becomes the locus of control, with components being pushed to the outer layer.

Controllers help you in several ways:

##### Keeping props clean

Having controllers means that props mostly contain unmodified data, as you don't need to add things into them at every step like you do in React, and this reduces:

1. How much code you need to write.
2. How much computation happens at each render.
3. How many extra types you need to create.

##### Keeping components clean

Moving logic out of components into controllers leaves you with very simple components, which are less likely to hide bugs.

##### Keeping logic clean

Controllers are just ordinary classes, which aside from calling `update`, have nothing to do with Wallace. You have the full power and freedom of OOP at your disposal to deal with state, logging, caching, side effects etc...

In React you do all this inside component functions before returning JSX, which has several limitations.

##### Faster debugging

Another subtle benefit of your logic living in ordinary classes that aren't under framework "jurisdiction" is that when things break, you don't waste time suspecting the framework.

Our brain knows that frameworks do a bit of "magic" - so when things break, we often suspect it relates to that. But

n't affected by the framework, they're just ordinary classes, and you locate the source of error much quicker when you know there's no "magic" involved.

And because they are ordinary classes, not framework artefacts, you can do whatever you like.

we know that's not the case and find the issue quicker.

When your logic lives in normal code which the framework doesn't touch, there's one less thing to suspect when things break.

There are three advantage of doing this:

1. The components become so simple they're unlikely to malfunction or hide bugs.
2. It's easier to control or add logic, like caching, logging etc...
3. The logic

segway into updates

### Updates

So far we've only been updating the root component, which is easy as `mount` returns a reference to it. Let's see how we get a reference to a nested component. First let's give the controller a register of `Counter` components:

```tsx
import { Component } from "wallace";

class Controller {
  counterComponents: { [key: number]: Component<iCounter> };
  constructor() {
    this.counterComponents = {};
  }
  /*...*/
}
```

Then override the `Counter.render` method to assign itself:

```tsx
Counter.methods = {
  render(props, ctrl) {
    ctrl.counterComponents[props.id] = this;
    this.base.render.call(this, props, ctrl);
  },
};
```

The controller can now update any `Counter` in isolation, which isn't very useful as that doesn't update the total. However Wallace lets you update part of a component:

```tsx
const CounterList = ({ counters, total }) => (
  <div>
    <div part:total>Total: {tota}</div>
    ...
  </div>
);

class Controller {
  counterComponents: { [key: number]: Component<iCounter> };
  constructor() {
    this.counterComponents = {};
  }
  setCount(id: number, count: number, update = true) {
    store.setCount(id, count);
    if (update) {
      this.counterComponents[id].update();
      root.props.total = total(store.counters);
      root.part.total.update();
    }
  }
}
```

This lets you run very narrow updates anywhere in the tree, which is the key to high performance. Of course this a bit less safe, but not as unsafe as direct DOM manipulation (which is often the only way to make a framework fast) for two reasons:

1. You're not passing data, just calling `update()`
2. Updating a part updates everything in it.

```jsx
<div part:total class={total > 5 ? "red" : "black"}>
  Total: {total(counters)} (from {counters.lenght} counters).
</div>
```

- You can do DOM updates (show in overriden update) but best use apply(link)
- Another thing you can do in render on high-level is create the controller and/or props - because update...

```jsx
CounterList.methods = {
  render() {
    this.ctrl = new Controller(this);
    this.props = {
      total: 0, // TODO remove
      counters: protect(store.counters),
    };
    this.update();
  },
};

mount("main", CounterList);
```

### Binding

You might think you're far away from needing to worry about performance, but there's one case where it hits sooner, typing, because you type a lot quicker than you push buttons.

```jsx
const CounterList = ({ counters, total, things }) => (
  <div>
    <div part:total>
      Total {things.value}: {total}
    </div>
    <div>
      <Counter.repeat props={counters} />
    </div>
    <input type="text" bind:keyup={things.value} />
  </div>
);
```

At this point it's easier managing the props on the controller:

```ts
CounterList.methods = {
  render () {
    this.ctrl = new Controller(this);
    this.update();
  }
}

class Controller {
  counterComponents: {[key: number]: Component<iCounter>};
  root:  Component<iCounterList>;
  constructor(root:  Component<iCounterList>) {
    this.counterComponents = {};
    this.root: root;
    root.props = {
      counters: protect(store.counters),
      total: 0,
      things: watch({value: 'sheep'}, () => this.updateTotal()),
    };
    this.updateTotal(false);
  }
  setCount(id: number, count: number, update = true) {
    store.setCount(id, count);
    if (update) {
      this.counterComponents[id].update();
      this.updateTotal();
    }
  }
  updateTotal(update = true) {
    this.root.props.total = total(store.counters);
    if (update) this.root.part.total.update();
  }
}
```

- parts
- controllers setting props
- methods

- events
- stubs



And for stubs, which are placeholders for nested components which derived components can override:

```tsx
const AbstractUserList = ( users ) => (
  <div>
    <stub.user arg={users[0]} />
    <stub.user.repeat args={users} />
  </div>
);

AbstractUserList.stub.user = GuestUser;
```

More compact
