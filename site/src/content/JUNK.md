# JUNK



Wallace offers:

1. Faster loading.
2. Faster rendering.
3. Faster development.

Than any other front-end framework. However, its still very fresh, so use with caution.

### Faster loading

Here are the bundle sizes of various...

### Faster rendering



### Faster development

Wallace cuts development time as both:

- The application code you write
- Wallace's own operations 

Are easier to follow and control than in other frameworks.

That reduces the time spent confused, evaluating, wondering or deciding, which takes up the greater part of coding time. There's no metric to uphold this claim, but once you read the guide it should make sense.

You might not want to use it for production just yet, but it's a great tool for building personal apps, which you can do for free at nohost.dev.















It's not magic, just clear and obvious, which means less time spent in confusion or indecision. this adds up over the weeks.

You don't need to "master" Wallace to reach this point. Just





Development time is 10% typing code 90% thinking about what to type. You oscillate between these modes both at a macro level and micro level, but either way, the ratio stays heavily skewed.

how quickly you can type out new functions, and more about how much time you waste in a state of confusion or indecision.

- 10% I know what to do, I just need to type it out.
- 90% Not sure what to type.





- Fixing mistakes.
- Tidying up.
- 

We spend far more time staring at code than writing code (a ratio of 1:10 is not uncommon). Staring involves wondering, evaluating, deciding in branches and even circles when things get bad.

Wallace code is more compact in some places, more explicit in others, and ultimately clearer to follow and see what your options are.



 than we do writing final code. That's the bottleneck.

Wallace code is easier to follow, refactor and control than other frameworks.



If you've ever lost unsaved work.





- how to make something work
- why it doesn't work
- whether it should work this way
- whether it should be written differently

Than we do actually writing code. The wondering and decision making is where the bottleneck is.





### Sane reactivity

Wallace gets its reactivity through a helper function called `watch` which returns a proxy of an object (which can be an array) that calls a callback whenever it is modified:

```tsx
import { watch } from 'wallace';

CounterList.prototype.render = function ( counters ) {
  this.props = watch(counters, () => this.update());
  this.update();
}
```

> The CounterList component now updates when the buttons are clicked.

Many frameworks hide their reactivity, or couple it with UI controlling objects, making it very easy to make mistakes. Wallace's approach is:

- Crystal clear: you can tell exactly why and when things update.
- Easy to debug: just add console log in the callback (which takes arguments).
- Powerful:
  - Watch different objects within the props with different callbacks.
  - Do different things depending on what was changed (you can even update parts of a component).

Despite not being as "automatic" as some frameworks, this approach actually saves time in the long run, and helps produce better performing apps.









That may be a clunky example, but this design helps us in several ways:

### Simpler code

To update a component from a nested component in a functional framework like React you need to use awful patterns like hooks or signals etc.

With Wallace you can simply pass a reference to that component in the props:



Nested components can call `root.update()` or you could pass a callback, but 	





 So when the `Counter` increments its 



 without using awkward patterns like hooks.



at means we can update components 

Let's overwrite the `render` method on `CounterList` to modify the props before `update` to add a reference to itself into each item:

```tsx
CounterList.prototype.render = function (props) {
  this.props = props.map(p => ({ ...p, root: this}));
  this.update();
};
```

We can now use that reference to update the `CounterList` from the `Counter` components when their button is clicked:

```tsx
const Counter = ({ clicks, root }) => (
  <div>
    <span>Count: {clicks}</span>
    <button onClick={(clicks++, root.update())}>Click me</button>
  </div>
);
```

Why it works:

1. The destructured props are put back together during compilation, so `clicks++` becomes `this.props.clicks ++`
2. `this.props` in the `Counter` is the same object as in the `counters` array.
3. When we call `update` on the `CounterList` it updates its own DOM (updating the total) then calls `render` on its nested `Counter` instances (passing the same counter object in as first time)
4. The `Counter` calls its own `update` during `render` which update its `<span>` with the click count.



To see why this is so useful, we're going to look at two ways to update the DOM when the buttons are clicked.

To see the effect more clearly, let's also display the total number of clicks across all counters:

```tsx
const total = counters => (
  counters.reduce((a, c) => a + c.clicks, 0);
);

const CounterList = counters => (
  <div>
    <div>Total: {total(counters)}</div>
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);
```



#### Direct update

Let's overwrite the `render` method on `CounterList` to modify the props before `update` to add a reference to itself into each item:

```tsx
CounterList.prototype.render = function (props) {
  this.props = props.map(p => ({ ...p, root: this}));
  this.update();
};
```

We can now use that reference to update the `CounterList` from the `Counter` components when their button is clicked:

```tsx
const Counter = ({ clicks, root }) => (
  <div>
    <span>Count: {clicks}</span>
    <button onClick={(clicks++, root.update())}>Click me</button>
  </div>
);
```

Why it works:

1. The destructured props are put back together during compilation, so `clicks++` becomes `this.props.clicks ++`
2. `this.props` in the `Counter` is the same object as in the `counters` array.
3. When we call `update` on the `CounterList` it updates its own DOM (updating the total) then calls `render` on its nested `Counter` instances (passing the same counter object in as first time)
4. The `Counter` calls its own `update` during `render` which update its `<span>` with the click count.

#### Reactive update



```tsx
import { watch } from "wallace";

CounterList.prototype.render = function (props) {
  this.props = watch(props, () => this.update());
  this.update();
};
```









```tsx
const counters = [{ clicks: 0 }, { clicks: 0 }];
const root = mount(
  "main",
  CounterList,
  watch(counters, () => root.update())
);
```









 makes it really easy to update a component from anywhere we like, and avoids awkward patterns like hooks or signals which are needed in other frameworks.



 separation of the two methods allows us to control updates cleanly



is the key to keeping your code clean.









there's an even neater way using controllers. and reactivity.



```
const CounterList = (props) => (
  <div>
    <Counter.repeat items={props} />
  </div>
);
```









To illustrate this lets add two features to our `CounterList`:

1. Display the total across all counters.
2. Button to increment all counters.

Here is the new component definition, the `Counter` stays the same:

```tsx
const CounterList = ({ counters, incrementAll }) => (
  <div>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <button onClick={incrementAll()}>All +1</button>
  </div>
);
```

Next we're going to overwrite the `render` method on `CounterList` to modify its props:

```tsx
import { mount, watch } from 'wallace';

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

mount('main', CounterList, [{clicks: 0}, {clicks: 0}]);
```

The `watch` function simply returns a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) of the supplied object which calls the supplied callback whenever the object (including nested objects) is modified, which will happen when we click the buttons.

The `incrementAll` function applies its changes to the original `counters` and therefore doesn't trigger the callback. 







 has two useful implications:

1. Components can read or modify their props before `update`.
2. Components can be updated from anywhere that has a reference to it.

Let's see both of these in action, first by 



And this makes coordinating updates easy as you can just to pass references, no need for awkward patterns like hooks or signals.









incrementAll

, because Wallace is not reactive by default, and we're about to see why.

To make 



make a component reactive:

```tsx
import { watch } from "wallace";

CounterList.prototype.render = function (counters) {
  this.props = watch(counters, () => this.update());
  this.update();
};
```

> The `watch` function simply returns a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) of the object which calls the callback whenever the proxy is modified.

When we click the buttons in `Counter` the callback fires, calling `update` on the `CounterList`, which then calls `render` on the `Counter` components.



they 



To understand why Wallace allows this, let's make our app reactive by overriding the `render` function and replacing the props with a reactive proxy before 



This two step is useful for two reasons:

1. Components can modify their props during `render`.
2. Components can be updated from anywhere that has a reference to it.

Let's see both of these in action, first by 



