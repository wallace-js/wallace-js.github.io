---
title: Components*
sidebar:
  order: 6
---

## Overview

The term component is often used interchangeably to refer to component *definitions* and component *instances*.

You define a component as a function which returns JSX, usually assigned to a variable:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);
```

The entire function (including its parameters) is replaced with a call to `defineComponent` which is imported from the wallace library:

```tsx
import { defineComponent } from 'wallace';

const Counter = defineComponent(
 /* Arguments generated from the JSX */
);
```

`defineComponent` returns a new function based on the instructions passed in its arguments, which are built from directives found in the JSX. This new function is used to create objects:

```tsx
const component = new Counter();
```

These objects are the component instances, or objects, and have various properties and "methods" like `render`:

```tsx
component.render({ count: 99 });
```

Component instances manage their own section of the DOM, and coordinate nested components.

## Component definitions

Component functions must follow a specific format. Bear in mind that these functions are completely replaced during compilation, so they aren't real, and neither are their parameters.

### Parameters

The function may specify 2 parameters, both of which are optional:

- `model` - the data object passed into the component. This may be destructured.
- `xargs` - various extras you might find useful. This _must_ be destructured. See the [xargs](/docs/reference/xargs) page for specifics.

Only one level of destructuring is supported, and you may not rename parameters. All of the following are valid:

```tsx
// No args
const Counter = () => <div>...</div>;

// Model only
const Counter = ( model ) => <div>...</div>;

// Model with different name
const Counter = ( user ) => <div>...</div>;

// Model destructured
const Counter = ({ name, age }) => <div>...</div>;

// Model and xargs
const Counter = (model, { self, hub }) => <div>...</div>;

// Xargs but no model
const Counter = (_, { self, hub }) => <div>...</div>;
```

But the following are not:

```tsx
// Xargs is not destructured
const Counter = (model, xargs) => <div>...</div>;

// More than 2 args
const Counter = (model, { self, hub }, whatever) => <div>...</div>;

// Destructured to more than one level
const Counter = ({ user: {name, age} }) => <div>...</div>;

// Parameter renamed
const Counter = ({userName: name, age}) => <div>...</div>;
```

### Body

The body of the function must be a single JSX expression, returned, and nothing else. All of the following are valid:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const Counter = ({ count }) => {
  return <div>
    <button onClick={count++}>{count}</button>
  </div>
};

const Counter = function ({ count }) {
  return <div>
    <button onClick={count++}>{count}</button>
  </div>
};
```

But the following are not:

```tsx
const Counter = ({ count }) => {
  const text = `Clicked ${count} times`
  return <div>
    <button onClick={count++}>{text}</button>
  </div>
};

const Counter = ({ count } => (
  count > 5 ? <div>Reach max count</div> :
  <div>
    <button onClick={count++}>{text}</button>
  </div>
);
```

Remember these are not real functions, and returning the JSX is just to help TypeScript.

### Methods

The function returned by define component will be used as a constructor, which means we can add things to it prototype, like additional methods:

```tsx
Counter.prototype.handleClick = function () {
  this.model.count ++;
}
```

Or override existing methods:

```tsx
Counter.prototype.render = function () {
  // Overrride with custom behaviour
}
```

If you're unclear about this, our [prototypes](/docs/misc/prototypes) page explains it at just the detail you need.

To make this a bit nicer, Wallace provides a special property called `methods` which is just a proxy for `prototype` so you could do this:

```tsx
Counter.methods.handleClick = function () {
  this.model.count ++;
}
```

What makes `methods` special is that it extends `prototype` rather than overwrites it on assignment, so you can use more compact object syntax when defining multiple methods:

```tsx
Counter.methods = {
  handleClick () {
    this.model.count ++;
  },
  render () {
    // Overrride with custom behaviour
  },
}
```

Doing this on the  `prototype` field directly would replace the prototype with the new object and you'd loose the other properties needed to work.

Note that adding custom methods to components is something you *can* do, but isn't where you usually add logic. Logic is typically implemented on [models](/docs/reference/models) or [hubs](/docs/reference/hubs).

### Annotation

You can annotate the model, methods and other aspects of components:

```tsx
import type { Takes, Uses } from 'wallace';

interface CounterModel {
  count: number;
}

interface CounterListMethods {
  handleClick() => void;
}

const Counter: Takes<CounterModel> = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList: Uses<{model: CounterModel[], methods:handleClick}> = (counters) => (
  <div>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <Counter.repeat models={counters} />
  </div>
);
```

See the [types](/docs/reference/types) page for full details.

## Component instances

The generated function will be used to create objects with `new`:

```tsx
const component = new Counter();
```

This is generally hidden from view, but it is important you realise this is what happens as you will be interacting with components and their properties, and also need to be mindful of how they are recycled.

Component instances have several of their own properties and "inherit" several more from their prototype, which are predominantly functions which you can treat as methods. See the [prototypes](/docs/misc/prototypes) page if you're unclear about this.

### Own

This section lists the component instance's own properties you may interact with. There are other hidden properties you should not interact with.

#### el

The root element of its DOM. Mostly used internally but you can access it if you want to move components around.

#### model

The main object passed into a component.

#### hub

An optional second object which can be passed to component, which is propagated to all nested components.

#### part

An object containing named parts within the component, which can be updated independently. Only present if the `part` directive is used:

```tsx
const CounterList = (counters) => (
  <div>
    <div part:total>  
      Total: {counters.reduce((a, c) => a + c.count, 0)}
    </div>
    <Counter.repeat part:counters models={counters} />
  </div>
);
 
CounterList.methods = {
  updateTotal() {
    this.part.total.update();
  } 
};
```

#### ref

An object containing named references to DOM elements. Only present if the `ref` directive is used:

```tsx
const CounterList = (counters) => (
  <div>
    <div>  
        Total: <span ref:total></span>
    </div>
    <Counter.repeat part:counters models={counters} />
  </div>
);
 
CounterList.methods = {
  updateTotal() {
    const span = this.ref.total;
    const counters = this.model;
    span.textContent = counters.reduce((a, c) => a + c.count, 0);
  } 
};
```

### Prototype

This section lists the properties available from the prototype which you may interact with. There are other hidden properties you should not interact with.

#### render

This method accepts a `model` and `hub` argument (both optional) and updates the component:

```tsx
function render (model, hub) {
  this.set(model, hub);
  this.update();
}
```

It gets called during `mount` and `createComponent` as it should be called before first attaching the component to the DOM to prevent rendering DOM without data, which would look off.

During `update` a component calls `render` on all its nested components.

#### set

This method may be modified by directives. In its base state it simply saves the model and hub on the component instance:

```tsx
function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

The `watch` directive modifies what gets saved, typically the model as follows:

```tsx
this.model = watch(model, () => this.update());
```

The `assign` directive adds a line assigning the component instance to a property, typically on the model or the hub:

```tsx
hub.root = this;
```

Because it may be modified, you are advised not to override it or skip it without good reason. For example if you decide to inline it into `render` then those two directives would not work for that component as `set` never gets called:

```tsx
// Breaks `watch` and `assign` directives:
Counter.methods = {
  render (model, hub) {
    this.model = model;
    this.hub = hub;
    this.update();
  }
}
```

#### update

This method updates the component's DOM by iterating over all the dynamic fields in the order they appear, skipping any that fall under an `if` or `show` that evaluates false, or a `hide` that evaluates to true.

The component instance keeps track of the values it last used in the DOM, and only applies the DOM operation if that value changed, which minimises repaints.

Nested and repeated are instructed to `render` (unless they are skipped) but there is no data check beforehand.

#### base

This property gives you access to the base component's methods, which is useful when overriding:

```tsx
Counter.methods = {
  render (model, hub) {
    // do your thing here
    this.base.render.call(model, hub);
  }
}
```

Note that this doesn't behave the way `super` does inside classes, which accesses the first method it finds when crawling up the inheritance tree.

#### dismount

This method is called whenever a nested component is detached from the DOM, either because it is no longer needed in a repeat function, or an `if` directive evaluates false.

It is not automatically called in any other situation.

### Internal

Component have several properties which consist of an underscore and single letter (`_o`, `_w`, `_q` etc...) which are used internally. You are strongly advised not to access these, and not to add any properties to components using that format.

### Custom

You are allowed to add properties to a component instance:

```tsx
component.total = calculateTotal();
```

But that is generally not recommended as components are recycled (see [recycling](#recycling) below) so you're best using the model for that kind of thing.

If you must save properties on the component instance you should ensure they are reset during `render`, `set` or `update` to avoid issues with components being recycled:

```tsx
Counter.methods = {
  update function () {
    this.total = calculateTotal();
    this.base.update.call();
  }
}
```

## Operation

It is important to understand how the methods and properties interact.

### Flow

Consider the following code snippet:

```tsx
import { mount } from 'wallace';

const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList = (counters) => (
  <div>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <Counter.repeat models={counters} />
  </div>
);

const data = [{ count: 0 }, { count: 0 }];
const root = mount('main', CounterList, data);
```

Here the call to `mount` creates an instance of `CounterList`, calls its `render` method (passing `data` as its model) and attaches its DOM (the `el` property) to the DOM. We then save that instance as `root` as we'll be using it again.

The call to `render` received the array we called `data` as its `model` arguments, then called `set` which saved that array as `this.model`, and finally called `update` - here are these two methods again:

```tsx
function render (model, hub) {
  this.set(model, hub);
  this.update();
}

function set (model, hub) {
  this.model = model;
  this.hub = hub;
}
```

During `update` the component iterates through its dynamic elements:

- The total calculation.
- The repeated `Counter` declaration.

Repeated components are handled using an internal "repeater" object which creates component instances, renders them and attaches their DOM to the correct location, in this case creating two instances of `Counter`, and passing `{count: 0}` to each.

Now let's insert new counter at the start of the array:

```tsx
data.unshift({count: 1});
root.update();
```

This on its own won't update the UI as we haven't set up any 



This updates the UI to display three counters, but it's important to understand what happened.

Firstly `data` and `root.model` point to the same object in memory, which is the array that now has three elements.

We then called `root.update` which will update the total, and then instruct the repeater to run its patch operation, which in this case recycles component instances sequentially. 

```tsx
{count: 1} // recycle component 0
{count: 0} // recycle component 1
{count: 0} // create new component
```

Component 0 previously displayed count 0 and will now be updated to display count of 1.

Note that we updated `root` without calling `render` - just `root.update` - in fact `root.render` only gets called once in its lifetime. However, calling `root.update` results in calls to `render` on all the nested `Counter` components.

Of course we could have called `render` passing the same object back in:

```
data.push({count: 1});
root.render(data);
```

But the point is that we can avoid doing this, which means the `render` method of higher level components only gets called at predictable points, and this lets us use it to set things up for the current life span.



Mention dismount.
