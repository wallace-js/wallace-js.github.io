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
2. Nest components to form a tree.
3. Attach the root component to the document.

For example:

```tsx
import { mount } from "wallace";

const User = (name) => <div>User: {name}</div>;

const UserList = (users) => (
  <div>
    <h2>Showing {users.length} users:</h2>
    <User.repeat items={users} />
  </div>
);

mount("main", UserList, ["Wallace", "Gromit"]);
```

It might look very much like React, but Wallace components:

1. Work very differently.
2. Use different JSX syntax.
3. Manage DOM differently.
4. Have different capabilities.
5. Play a different role in your app.

We'll cover these roughly in that order, but first let's go over the built-in help features.

## Help

Your two best friends are tool tips and TypeScript.

### Tool tips

All imported definitions and all directives (JSX attributes with special meaning) have their own tool tip:

```tsx
<div if>...</div>
```

The only directive you need to remember is `help` whose only job is to display a tool tip with a cheat sheet:

```tsx
<div help>...</div>
```

Tool tips include code snippets that your editor hopefully lets you copy,

Unfortunately JSX tool tips don't work on directives with a qualifier:

```tsx
<div style:height>...</div>
```

To get around this, temporarily add something like `.` to break the JSX which should display the tool tip as well as squiggly red lines reminding you to remove the `.` once you're done:

```tsx
<div style.:height >...</div>
```

For more extensive documentation, hover over the `wallace` module import:

```ts
import {} from "wallace";
```

It includes everything (in condensed format) so can look something up without leaving your editor, or asking for the WiFi password.

### TypeScript

You don't have to use TypeScript, but you'll have a lot more fun if you do.

The main thing you'll be annotating are the arguments components accept, which you do with the `Accepts` type:

```tsx
import type { Accepts } from "wallace";

// CORRECT
const User: Accepts<string> = (name) => <div>User: {name}</div>;

// WRONG
const User = (name: string) => <div>User: {name}</div>;
```

The type ensures type safety when nesting or mounting the component too.

The type `Uses` lets you annotate other aspects of the component:

```tsx
import type { Uses } from 'wallace';

type UserTypes = { model: string, stubs: {...} };
const User: Uses<UserTypes> = ( name ) => <div>User: {name}</div>;
```

These are covered in more detail in [TypeScript](/docs/reference/typescript/).

For brevity we'll omit type annotations from the rest of the tour.

## Compilation

Component functions are never _executed_, they are _parsed_ and _replaced_ during compilation. The JSX is turned into an HTML string with all the dynamic bits stripped out, and reassembled into a component definition. So this:

```tsx
const User = (name) => <div>User: {name}</div>;
```

Compiles to this:

```tsx
const User = defineComponent("<div>User: <span></span></div>", ...);
```

Although you tend not to see this code, Wallace uses it like this:

```jsx
const user = new User();
user.render("Wallace");
```

The HTML string becomes the component instance's initial DOM, which is then updated according to behaviour generated from placeholders, directives and nesting/repeating syntax found in the JSX.

It's a very crude system compared to virtual DOM, but has impressive advantages. The first is that it lets us (or you) add endless directives without increasing bundle size:

```tsx
import { userDiv, active } from "../styles.module.css";

const User = (user) => (
  <div css={userDiv} toggle:active={user.active}>
    User: {user.name}
    <div if={mode === "edit"}>
      <input bind={user.name} />
      <button on:click={deleteUser(user.id)} />
    </div>
  </div>
);
```

> If you're coding along, hover your cursor over directives to see their tool tips.

The work of interpreting the directive, validating its use, and converting it to optimised DOM instructions is done during compilation, leaving only the minimum working code in your bundle.

## JSX

Although you define a component as a function that returns JSX:

```tsx
const User = (name) => <div>User: {name}</div>;
```

It gets replaced with a code generated from the JSX during compilation:

```tsx
const User = defineComponent(...);
```

The original function with JSX doesn't exists at run time, is never called, and therefore can't contain code like a normal function. It must only contain a single static JSX statement and nothing else:

```tsx
// ALLOWED
const User = ( name ) => (
  <div>User: <span>{name || '??'}</span></div>
);

// NOT ALLOWED
const User = ( name ) => {
  const text = name || '??';
  return <div>User: {text}</div>
};

// NOT ALLOWED
const User = ( name ) => (
  name ? <div>User: {text}</div> || <div>User: ??</div>
);
```

You can put code inside the JSX `{expressions}` so long as it don't contain further JSX:

```tsx
// ALLOWED
const User = (name) => (
  <div class={getClass(name)}>User: {name ? name.toUpperCase() : "??"}</div>
);

// NOT ALLOWED
const User = (name) => <div>User: {name || <span>??</span>}</div>;
```

JSX is only allowed as a single statement returned by a function, and nowhere else:

```tsx
// NOT ALLOWED
const noName = <span>??</span>;
const User = (name) => <div>User: {name || noName}</div>;
```

The JSX isn't compiled to function calls like React. The code inside expressions get _copied_ to the generated code during compilation, which means you can place function calls in event handlers:

```tsx
const Button = () => <button on:click={doSomething()}>Click me</button>;
```

but used to build a component definition during compilation,

The key point is that the original function with JSX doesn't exist at run time.

is just a placeholder for a JSX statement with the arguments in scope.

This new `User` function

The function doesn't return virtual DOM, or anything for that matter, seeing as it doesn't exist anymore.

Wallace copies code from placeholders, and uses directives to control behaviour.

Wallace doesn't _call_ component functions like React does. It _reads_ their code during compilation, then replaces them with generated code.

The only reason you return it in a function is to create a scope

Component functions are never called. They are read during compilation, and replaced with generated code.

Wallace doesn't _call_ the functions which return JSX - it _reads_ them during compilation, and _replaces_ them with generated code. The function is just a scoped placeholder for a single _static_ JSX expression, and that's the only place where JSX is allowed.

So you lose the freedom of full JSX

Wallace trades the boundless freedom of React (you can still build the same UI) for a more powerful directive-based syntax.

Directives are attributes which take effect during compilation and let you do interesting things:

```tsx
const User = (user) => (
  <div class:active="user-active" toggle:active={user.active}>
    User: {user.name}
    <div if={mode === "edit"}>
      <input bind={user.name} />
      <button on:click={deleteUser()} />
    </div>
  </div>
);
```

As well as directives there is special syntax for nesting and repeating components:

```tsx
const UserList = (users) => (
  <div>
    <User arg={users[0]} />
    <User.repeat args={users} />
  </div>
);
```

The end result is that your JSX ends up more compact and more readable than React.

## Components

Wallace _replaces_ functions which return JSX with class-like structure during compilation. These are used to create component _instances_ behind the scenes. To see this working, let's comment out the call to `mount` and do it manually:

```tsx
import { mount } from "wallace";

const User = (name) => <div>User: {name}</div>;

const UserList = (users) => (
  <div>
    <h2>Showing {users.length} users:</h2>
    <User.repeat items={users} />
  </div>
);

// mount('main', UserList, ['Wallace', 'Gromit']);

const userList = new UserList();
document.body.appendChild(userList.el);
userList.render(["Wallace", "Gromit"]);
```

TypeScript will complain because it is unaware that `UserList` will be transformed into something else, just ignore that as you don't normally do this.

As you can see, `userList` is an ordinary object with properties like `el` (its root HTML element) and methods like `render`, which update its DOM with the arguments:

```tsx
userList.render(["Gromit", "Wallace"]);
```

There is no global engine coordinating things: each component manages its own DOM and nested components, which manage their DOM and nested components, and so on down the tree.

It's all very simple.

## Rendering

For current purposes the `render` method looks like this:

```ts
function render(arg) {
  this.arg = arg;
  this.update();
}
```

So instead of calling `render` you could modify the `arg` object, then call `update`:

```ts
userList.arg.reverse();
userList.update();
```

This comes in handy when making components reactive, which we'll see later.

During `update` a component will call `render` on any nested components, passing in their `arg`. To demonstrate, let's override the `User.render` method to add some logging:

```ts
User.methods = {
  render(user) {
    this.arg = user;
    this.update();
    console.log("Rendered User");
  },
};
```

The `methods` property is just a quicker and safer way of doing this:

```ts
User.prototype.render = function (user) {
  this.arg = user;
  this.update();
  console.log("Rendered User", user);
};
```

Now every time you call `userList.update()` you will see `"Rendered User"` logged twice.

```
> userList.update();
Rendered User Wallace
Rendered User Gromit
```

However, the DOM will only be updated if the data to be displayed has changed.

## DOM

To see how components update their DOM, let's use the `ref` directive to create a reference to the raw DOM element:

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

This behaves the same as it did before: the element is updated if the value differs from last update. More to the point, it works the same way - as this is exactly how components update their DOM.

You can manually control one attribute while letting Wallace control another:

```tsx
<span style:color={name.startsWith("W") ? "green" : "red"} ref:name></span>
```

Just remember to add `this.update()` back in.

There are three advantages to this approach over virtual DOM:

##### Performance

A React component must walk its full virtual DOM to detect changes. A Wallace component keeps references to the elements it cares about, and updates them if the corresponding data has changed. It's lightning fast.

##### Simplicity

Understanding exactly how components work saves time.

##### Control

You can do whatever you like with the DOM, which lets you handle awkward things like chart.js, reparenting or other things that are a nightmare with virtual DOM.

This is a key Wallace philosophy: you get compact syntax for basic cases, but you can always swap that for more control.

## Philosophy

At this point it helps to understand why Wallace is designed way it is.

Frameworks create convenience through automation, which saves time, but also:

1. Adds new complexity - which makes debugging more time-consuming.
2. Restricts your freedom - which forces you to choose between automation or freedom, if you even get that choice.

Wallace avoids these problems by sticking to very simple operations (whether that's DOM or reactivity) and giving you progressively more access to them.

For example, you could start with directives:

```tsx
<span style:color={name.startsWith("W") ? "green" : "red"}>{name}</span>
```

Then hook into the render cycle:

```tsx
const applySpan = (el, name) => {
  el.style.color = name.startsWith("W") ? "green" : "red";
  el.textContent = name;
};

<span apply={applySpan(element, name)}></span>;
```

the 1st problem by sticking to very simple operations, whether that's the DOM or reactivity. It avoids the 2nd problem by giving you access to that if you need it.

both these problems by refusing to do anything clever, other than hide how dumb it is.

being very smart at concealing how dumb it is.

Which can leave you having to decide between automation or freedom.

And in certain situations this steals more time than it saves!

Wallace solves this problem by using compilation to hide rather dumb operations behind layers of convenience, and letting you progressively peel back those layers to get closer to the dumb operations.

##### High convenience, low freedom

Start with normal placeholders and directives, like React.

##### Medium convenience, medium freedom

If you hit a gnarly situation which simple directives don't handle, you have a few intermediate options:

The `html` directive sets the `innerHTML`:

```tsx
<div html={getChartHTML(data)} >
  <!-- really complicated chart -->
</div>
```

Or `apply` whose callback is expected to manipulate the element:

```tsx
<div apply={buildChartDOM(element, data)} >
  <!-- really complicated chart -->
</div>
```

##### Low convenience, total freedom

If neither of the above cut it (perhaps you need to coordinate multiple elements) you can use references and work with them in `render` or `update`.

The beauty of Wallace is that you'd don't have to choose one or the other, you can seamlessly blend directives and manual DOM operations.

But then you find you need to use the chart dimensions in the headers, which you can't do with the current setup. You need to you peel away another convenience layer and override `render`:

1. Minimising how much complexity it adds.
2.

These trade-offs occasionally backfire so badly that the framework wastes more time than it saves! Wallace solves this problem

is specifically designed to avoid this problem by letting you gradually moving from convenience to freedom.

through _layered convenience over crude operations_.

To explain this concept, let's say you need to build a `ReallyComplicatedCChart`:

```tsx
const ReallyComplicatedCChart = ( data ) =>
  <div>
    <div>
       <!-- easy header stuff -->
    </div>
    <div>
       <!-- complicated chart stuff -->
    </div>
  </div>
);
```

You start building the easy header stuff using directives and nested components, without really caring how those bits work behind the scenes.

But then you hit the complicated chart, which doesn't play ball with directives. You need to peel away a convenience layer and go deeper.

The two quick options are `html` which uses a callback that returns raw HTML that will be inserted:

```tsx
<div html={getChartHTML(data)} >
  <!-- really complicated stuff -->
</div>
```

Or `apply` whose callback is expected to manipulate the DOM element:

```tsx
<div apply={buildChartDOM(element, data)} >
  <!-- really complicated stuff -->
</div>
```

But then you find you need to use the chart dimensions in the headers, which you can't do with the current setup. You need to you peel away another convenience layer and override `render`:

```tsx
ReallyComplicatedChart.methods = {
  render(data) {
    const { header, chart } = this.ref;
    this.arg = data;
    this.update();
    buildChartDOM(chart, data);
    const dimensions = readDimensions(chart);
    applyDimensions(header, dimensions);
  },
};
```

There's essentially a spectrum with convenience at one end and freedom at the other, but you don't have to sit at one spot, you can blend convenience (directives) and freedom (manual DOM operation) in whatever arrangement makes most sense.

This is all possible because the component's underlying DOM operations are very crude and simple.

1. Only using crude and simple operations.
2. Adding layers of convenience.

A framework is like a microwave with 23 buttons: there's a lot of options that help you do common tasks, but not everything.

by wrapping very crude operations behind layers of convenience.

interfaces on top of very crude wiring. A good analogy is a microwave oven.

1. Add very little complexity (to the point of being crude)
2.

(in the early days of Angular we joked that every project eventually hit the point at which it's clear it would have been quicker using jQuery).

\ But they can easily steal that time back (and more) by:

1. Getting in your way.
2. Adding their own complexity.

Wallace lets you develop faster by doing a lot less of those two things than other frameworks. It does this by providing a thin layer of juicy syntax.

Frameworks exchange convenience for freedom, which is fine most of the time as you don't need the freedom. But every so often you do, and that's when you find out how much freedom you traded for the convenience.

React gives you

speeds up 95% of tasks, but that pesky 5% becomes more difficult.

Frameworks automate things for you, which saves time -

There is no clever virtual DOM diff-patch engine, just crude direct DOM element updates.

speed up your work by automating things. This involves hidden complexity, and

, which entails sticking to a structure

by providing structure and automation, but add their own complexity, way of doing things, and restrictions.

Wallace

1. Being really crude.
2.

Where possible, Wallace gives you a low effort way to do something.

## Reactivity

Let's switch to an app that lets you count sheep, deer and other animals with zero-plural names:

```tsx
import { mount } from "wallace";

const Counter = ({ count, name }) => (
  <div>
    <div>
      {count} {name}
    </div>
    <button onClick={count++}>++</button>
  </div>
);

const CounterList = (animals) => (
  <div>
    <div>Total: {getTotal()}</div>
    <Counter.repeat args={animals} />
  </div>
);

const getTotal = () => animals.reduce((a, c) => a + c.count, 0);

const animals = [
  { name: "sheep", count: 0 },
  { name: "deer", count: 0 },
];

mount("main", CounterList, animals);
```

Clicking the buttons modifies the `animals` array, but doesn't update the components yet, and it's important that you understand why.

#### References

It modifies `animals` is because the destructured arguments `{ count, name }` are put back together during compilation, so `count++` becomes `this.arg.count++` and `this.arg` is a reference to (i.e. the same object) as `{ name: "sheep", count: 0 }` in the `animals` array.

If you're unclear about that, try this:

```ts
const animals = [
  { name: "sheep", count: 0 },
  { name: "sheep", count: 0 },
];

Counter.methods = {
  render(animal) {
    this.arg = animal;
    this.update();
    // Only true for the first Counter as it is the same
    // object, not just identical.
    console.log(this.arg === animals[0]);
  },
};
```

#### Reactivity

The reason this doesn't automatically update the component is because Wallace, like React, is deliberately not reactive. And that's because reactive behaviour (in any framework) creates a minefield of bugs, glitches and frustration that will slow down you down, as well as your app.

Wallace approaches reactivity in the same way as DOM operations: you can take full control, or use simple

Of course you can make a component reactive by adding the `watch` directive:

```tsx
const CounterList = (animals) => (
  <div watch>
    <div>Total: {getTotal()}</div>
    <Counter.repeat args={animals} />
  </div>
);
```

But

### Watch

The simplest way is to watch the data and update the root component whenever it changes:

```tsx
import { mount, watch } from "wallace";

const root = mount(
  "main",
  CounterList,
  watch(animals, true, () => root.update())
);
```

The `watch` function returns a proxy of the object which triggers the callback when the object is modified.

The second argument (which we set to `true`) extends that to all nested objects. So when we modify `count` by clicking a button it updates the original `animals` object and calls the callback, which is why `getTotal` still works.

The callback can do whatever you like, like saving data to localStorage:

```tsx
const root = mount(
  "main",
  CounterList,
  watch(animals, true, () => {
    localStorage.setItem("animalCount", JSON.stringify(animals));
    root.update();
  })
);
```

Can I do this:

```tsx
const Counter = ({ count, name, showInput }) => <div watch={callback}></div>;
```

No, because it could clash with what's done in render?

But could `assign` be renamed to `extra` and do all sorts of things?

Maybe it will be understood that component level directives need to consider render.

```jsx
<div watch > watches model and calls update
<div watch={callback}> watches model and callback
<div watch:shallow > shallow watch
```

### Data vs State

To show she downside of a catch-all `watch` let's add a toggle to display a number input as well as a button:

```tsx
const Counter = ({ count, name, showInput }) => (
  <div>
    <div>
      {count} {name}
    </div>
    <button onClick={count++}>++</button>
    <div>
      <input name="mode" bindChecked={showInput} />
      <label for="mode">Show input</label>
      <input if={showInput} bindAsNumber={count} />
    </div>
  </div>
);

const animals = [
  { name: "sheep", count: 0, showInput: true },
  { name: "deer", count: 0, showInput: false },
];
```

Checking the checkbox updates the UI to display the input, but also saves the data to local Storage, which we didn't want, because that's state.

###

Maybe show use of `aux` with state first, then introduce the idea of passing objects to either.

You can run validation, add logging, send data to an API etc...

If you want to avoid a global variable you can set this up in the `render` method:

```tsx
CounterList.methods = {
  render(animals) {
    const update = () => this.update();
    this.arg = watch(animals, true, update);
    update();
  },
};

mount("main", CounterList, animals);
```

This works because `CounterList.render` is only called once in this case, and illustrates how `render` can be used as a "set up" function.

While you could the callback

### Hot

The advantage of `watch` is that doesn't know anything about components.

How do components react to data changes? They don't.

Decide on the point I'm trying to make, and how much I want to cover with the tour.

I need to go over:

- watch + bind > bad for (state + data (like mode for inputs vs buttons)
- hub
- hot model partials
-

Remember this is not a "How to use Wallace".

The point of this two-step process is that it lets us bypass `render` and update the component like this:

```ts
userList.arg.reverse();
userList.update();
```

If you do that, you'll see it logs `"Rendered User"` twice, because `userList.update()` calls `render` on the two nested `User` components. We'll look at why this matters in the next section.

Let's wrap up by showing how components update their DOM.

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
  },
};
```

```tsx
const User = (name) => (
  <div>
    <span>User: {name}</span>
    <span ref:age></span>
  </div>
);

User.methods = {
  render(user) {
    this.ref.name.textContent = user;
    this.update();
  },
};
```

If all you're doing is displaying data, then it feel much like React, except for the JSX syntax and faster page load. But when the UI becomes dynamic

But Wallace works very differently to React, and this only becomes apparent

If all you're

In React you your components do all the work

You probably noticed the JSX syntax is a bit different. What's less obvious is that components, their arguments, how the render and how you use them is also _very_ different.

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
greeting.render("Wallace");
document.body.appendChild(greeting.el);
setTimeout(() => greeting.render("Gromit"), 2000);
```

But you'd normally use `mount`:

```tsx
import { mount } from "wallace";

const greeting = mount("main", Greeting, "Wallace");
setTimeout(() => greeting.render("Gromit"), 2000);
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
import { mount, watch } from "wallace";

const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);

const root = mount(
  "main",
  Counter,
  watch({ count: 0 }, () => root.update())
);
```

Alt

```tsx
import { mount, watch } from "wallace";

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
  },
};

mount("main", Counter, { count: 0 });
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
import { mount, watch } from "wallace";

const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
  </div>
);

const root = mount(
  "main",
  Counter,
  watch({ count: 0 }, () => root.update())
);
```

> This replaces the element with `id="main"` with an instance of `Counter`.

## Assistance

## JSX

Instead of putting JavaScript around JSX elements, you place _directives_ (like `if`) inside elements:

```jsx
const Counter = ({ count }) => (
  <div>
    <span>Count: {count}</span>
    <button onClick={count++}>Click me</button>
    <button if={count > 3} onClick={(count = 0)}>
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

Nesting syntax is also different: you pass model in a single directive, which means you can use other directives:

```jsx
const DoubleCounter = (counters) => (
  <div>
    <Counter model={counters[0]} />
    <Counter model={counters[1]} if={counters.length > 1} />
  </div>
);
```

To repeat a nested component you just add `.repeat` after the name:

```jsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat models={counters} />
  </div>
);
```

Both Wallace and TypeScript understands that `model` should now be an Array.

Lastly, you can't put any code before the JSX:

```jsx
const CounterList = (counters) => {
  counters.sort(); // << No code allowed here!
  return (
    <div>
      <Counter.repeat models={counters} />
    </div>
  );
};
```

If you're use to React this might seem like madness, but once you see how Wallace does it, then React might seem the madder of the two.

### Components

The second difference is that these functions are never _called_ - they are _replaced_ with a constructor function during compilation, which lets us create component objects:

```jsx
const component = new Counter();
```

However you don't usually do that yourself, instead you define a tree of nested components:

```jsx
const CounterList = (counters) => (
  <div>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <Counter.repeat models={counters} />
  </div>
);
```

And mount the root component to the DOM:

```jsx
import { mount } from "wallace";

/*...*/

const counters = [{ count: 0 }, { count: 0 }];
const root = mount("main", CounterList, counters);
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
    <Counter.repeat models={counters} />
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
    <Counter.repeat models={counters} />
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

Wallace provides its own type to annotate components, which lets you specify the model and a couple of other bits that we'll cover later. Functions like `mount` and `watch` are all type-aware too:

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
    <Counter.repeat models={counters} />
  </div>
);

const counters = [{ count: 0 }, { count: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```

> Try passing invalid model...

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
function render(model) {
  this.model = model;
  this.update();
}
```

So you can also update a component by setting/modifying its `model` then calling `update`:

```js
component.model[0].count++;
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
Counter.prototype.render = function (model) {
  this.model = model;
  this.update();
  console.log("Rendered Counter with", model);
};
```

> The type of `model` carries through from `Use<iCounter>`.

But working with the prototype directly has some quirks, so Wallace provides a neater way:

```js
Counter.methods = {
  render(model) {
    this.model = model;
    this.update();
    this.base.render.call(this, model);
    console.log("Rendered Counter with", model);
  },
};
```

You can also shorten the above to this:

```js
Counter.methods = {
  render(model) {
    this.base.render.call(this, model);
    console.log("Rendered Counter with", model);
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
      <Counter.repeat models={counters} />
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
function render(model, hub) {
  this.model = model;
  this.hub = hub;
  this.update();
}
```

And functions which forward `model` to `render` (such as `mount`) now forward a `hub` as well, so let's create a `Hub` and pass it to `mount` :

```ts
class Hub {
  setCount(id: number, count: number, update = true) {
    store.setCount(id, count);
    if (update) root.update();
  }
}

const root = mount("main", CounterList, protect(store.counters), new Hub());
```

> Don't worry, we'll get rid of the global variables later.

The hub gets passed to `CounterList.render` which stores it as `this.hub` - and (here's the neat part) also passes it to `render` for each of its nested components, which do the same, and so on all the way down the tree.

We access `hub` in the JSX function via a second argument called **xargs** which has several useful things in it. Remember this function is replaced during compilation so these aren't real arguments, but `Uses` lets us set their types:

```tsx
const Counter: Uses<iCounter, Hub> = ({ id, count }, { hub }) => (
  <div>
    <div>Count: {count}</div>
    <button onClick={hub.setCount(id, count + 1)}>Click me</button>
  </div>
);
```

Here the hub acts as a small "hub" with functions which all components in the tree have access to, but there's a reason they're called controllers rather than hubs.

As your app grows, you'll need different controllers for different parts of the tree. Dialog boxes, menus, tables and forms all get their own hub, and typically maintain a link back to their parent hub:

```js
SettingsDialog.methods = {
  render(model, appController) {
    this.hub = new SettingsDialogController(this, appController);
    this.model = model;
    this.update();
  },
};
```

So the tree of DOM elements is managed by a tree of components which is managed by a tree of controllers. This tree of controllers coordinates updates between components and services like stores, so it becomes the locus of control, with components being pushed to the outer layer.

Controllers help you in several ways:

##### Keeping model clean

Having controllers means that model mostly contain unmodified data, as you don't need to add things into them at every step like you do in React, and this reduces:

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

So far we've only been updating the root component, which is easy as `mount` returns a reference to it. Let's see how we get a reference to a nested component. First let's give the hub a register of `Counter` components:

```tsx
import { Component } from "wallace";

class Hub {
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
  render(model, hub) {
    hub.counterComponents[model.id] = this;
    this.base.render.call(this, model, hub);
  },
};
```

The hub can now update any `Counter` in isolation, which isn't very useful as that doesn't update the total. However Wallace lets you update part of a component:

```tsx
const CounterList = ({ counters, total }) => (
  <div>
    <div part:total>Total: {tota}</div>
    ...
  </div>
);

class Hub {
  counterComponents: { [key: number]: Component<iCounter> };
  constructor() {
    this.counterComponents = {};
  }
  setCount(id: number, count: number, update = true) {
    store.setCount(id, count);
    if (update) {
      this.counterComponents[id].update();
      root.model.total = total(store.counters);
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
- Another thing you can do in render on high-level is create the hub and/or model - because update...

```jsx
CounterList.methods = {
  render() {
    this.hub = new Hub(this);
    this.model = {
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
      <Counter.repeat models={counters} />
    </div>
    <input type="text" bind:keyup={things.value} />
  </div>
);
```

At this point it's easier managing the model on the hub:

```ts
CounterList.methods = {
  render () {
    this.hub = new Hub(this);
    this.update();
  }
}

class Hub {
  counterComponents: {[key: number]: Component<iCounter>};
  root:  Component<iCounterList>;
  constructor(root:  Component<iCounterList>) {
    this.counterComponents = {};
    this.root: root;
    root.model = {
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
    this.root.model.total = total(store.counters);
    if (update) this.root.part.total.update();
  }
}
```

- parts
- controllers setting model
- methods

- events
- stubs

And for stubs, which are placeholders for nested components which derived components can override:

```tsx
const AbstractUserList = (users) => (
  <div>
    <stub.user arg={users[0]} />
    <stub.user.repeat args={users} />
  </div>
);

AbstractUserList.stub.user = GuestUser;
```

More compact
