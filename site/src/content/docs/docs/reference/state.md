---
title: State
sidebar:
  order: 15
---

## Keep the DOM derived from data

Wallace updates the DOM from the expressions in a component definition. Prefer expressing a changing attribute or property in JSX rather than changing it imperatively:

```tsx
const Counter = ({ count }) => (
  <button disabled={count > 2} onClick={count++}>
    {count}
  </button>
);
```

If you use a ref or `apply` to modify DOM directly, make sure the property is set correctly on every relevant update. A component instance or its DOM may be reused, so a value left behind by an earlier model can otherwise leak into its next use.

## Where to keep state

Wallace does not require a particular state container. Choose based on the lifetime and ownership of the value:

- Put domain data in the model that describes it.
- Put shared or temporary interface state in an application object or optional hub when that is a useful fit.
- Store values on a component instance only when they are derived again or reset whenever the instance renders with a new model.

Repeated components can be reused for different models. Do not keep per-model state on an instance unless it is reset as part of the component lifecycle. See [Repeating components](/docs/reference/repeaters) and [Pooling](/docs/reference/pooling).

## Inputs

Use `bind` when the DOM input and data should stay in sync. This avoids leaving stale input text or checked state behind when a component is reused. Binding updates the model expression when the configured event fires; it does not by itself make every other model change reactive. See [Binding](/docs/reference/binding) and [Watching](/docs/reference/watching).

## Imperative DOM work

Use an ordinary dynamic attribute for a single property. Use `apply` when several DOM properties need coordinated updates, or override `update` only when the behavior is too complex to express in JSX. When overriding a method, preserve the base behavior where needed by calling `this.base.update.call(this)`.

1. DOM state such as whether a checkbox is checked.
2. State stored in a component such as the result of a calculation.
3. Temporary application data (typically relating to the UI) such as display filters.

Some amount of state is needed for applications to work, other kinds easily lead to errors.

## DOM

A declarative framework's main job is to keep the DOM in sync with the data, but it can't do that if you tamper with the DOM in ways it is not aware of.

Consider the following example:

```tsx
const Counter = ({ count }, { self }) => (
  <div watch>
    <button ref:btn onClick={self.handleClick()}>
      {count}
    </button>
  </div>
);

Counter.methods = {
  handleClick() {
    this.model.count ++;
    this.ref.btn.disabled = this.model.count > 2;
  }
};
```

Once the button is clicked 3 times, it gets disabled. But this is done manually using a `ref`  so if this component gets reused, its button will still be disabled as there is nothing to reset its `disabled` property.

This is why you should avoid direct DOM manipulation unless absolutely necessary, and ensure it is always reset during `update`. 

Here are alternative approaches.

#### Attribute expression

This should be your default option:


```tsx
const Counter = ({ count }) => (
  <div watch>
    <button disabled={count > 2} onClick={count++}>
      {count}
    </button>
  </div>
);
```

It evaluates on every `update` so it is reliable.

#### Apply

You can also use the `apply` directive:


```tsx
const Counter = ({ count }, { element }) => (
  <div watch>
    <button 
      apply={setButton(count, element)}
      onClick={count++}>
      {count}
    </button>
  </div>
);

const setButton = (count, button) => (
  button.disabled = count > 2;
);
```

This fires also on every `update`. Use this if you needs to manipulate multiple properties, or need to reuse that function in different places.

#### Update

Lastly you can override `update` and do what you need in there:

```tsx
const Counter = ({ count }) => (
  <div watch>
    <button ref:btn onClick={count++}>
      {count}
    </button>
  </div>
);

Counter.methods = {
  update() {
    this.ref.btn.disabled = this.model.count > 2;
    this.base.update.call(this);
  }
};
```

Use this when there are more complex operations involving multiple elements. Just bear in mind it is easy to make mistakes, especially with conditional logic:


```tsx
Counter.methods = {
  update() {
    // will not reset disabled property when count <= 2.
    if (this.model.count > 2) {
      this.ref.btn.disabled = true;
    }
    this.base.update.call(this);
  }
};
```

### Binding

The main place where you risk leaving state in DOM is around inputs or relying on events to clear data.

Consider this form:

```tsx
const Form = (_, { hub, event, element }) => (
  <form>
    Enter your name (min 2 characters):
    <input onKeyPress={handleKeyPress(hub, event, element)} />
  </form>
);

const handleKeyPress = (hub, event, element) => {
  if (event.code === 13) {
    if (element.value.length >= 2) {
      const name = element.value;
      element.value = '';
      hub.submitForm(name);
    } else {
      alert('Name must be at least 2 characters.')
    }
  }
};
```

Closing the form any way other than hitting enter will not clear the input, so it displays what you last typed if you relaunch the form.

Sometimes this is the behaviour you want, but in that case you should make it explicit. Either way, always use a bound input:

```tsx
const Form = (_, { hub, event, element }) => (
  <form>
    Enter your name (min 2 characters):
    <input 
      bind={hub.formData.name} 
      onKeyPress={handleKeyPress(hub, event, element)} />
  </form>
);

const handleKeyPress = (hub, event, element) => {
  if (event.code === 13) {
    if (element.value.length >= 2) {
      hub.submitForm();
    } else {
      alert('Name must be at least 2 characters.')
    }
  }
};
```

The same considerations apply when manipulating DOM from outside of components. It's not so much that you shouldn't do this, but rather that you need to understand what you are doing, and exert caution.

## Components

Storing state on components can be dangerous as they get reused. You might think it wise for a framework to force components to be stateless, however:

1. If state is entirely rebuilt during `update` then it is *transient* state.
2. Stateless components force complicated patterns.

These are separate issues, so lets go over them in order.

### Transient state

Let's save a total and average calculations on the component instance:

```tsx
const CounterList = (counters, { self }) => (
  <div>
    <div>Total: {self.total}</div>
    <div>Average: {self.average}</div>
    <Counter.repeat models={counters} />
  </div>
);

CounterList.methods = {
  update () {
    const counters = this.model;
    this.total = this.model.reduce((a, c) => a + c.count, 0);
    this.average = this.total / counters.length;
    this.base.update.call(this);
  }
};
```

It may appear like state, but because it is rebuilt at each `update` the state is transient and therefore this approach is perfectly safe.

It is much the same as setting properties on the model during `update`:

```tsx
const CounterList = ({counters, total, average}) => (
  <div>
    <div>Total: {total}</div>
    <div>Average: {average}</div>
    <Counter.repeat models={counters} />
  </div>
);

CounterList.methods = {
  update () {
    const counters = this.model.counters;
    this.model.total = counters.reduce((a, c) => a + c.count, 0);
    this.model.average = this.model.total / counters.length;
    this.base.update.call(this);
  }
};
```

You could also use `apply` on the root element to achieve the same effect without overriding `update`:

```tsx
const CounterList = ({counters, total, average}, { model }) => (
  <div apply={reset(model)}>
    <div>Total: {total}</div>
    <div>Average: {average}</div>
    <Counter.repeat models={counters} />
  </div>
);

const reset = (model) => {
  model.total = model.counters.reduce((a, c) => a + c.count, 0);
  model.average = model.total / model.counters.length;
}
```

### Patterns



Using stateless functional components make sense, but makes for an awkward development experience when your app eventually needs state. React normalised this awkwardness, but that doesn't make it any less awkward.

Wallace components are not stateless, as the `model` and `hub` fields are saved on the instance. These properties are reset during `render` (but not during `udpate`) which means that the majority of components behave as if they were stateless, as they never call `update` without `render`.

But certain component



means that components which never call `update` without `render` (the majority of components) are effectively stateless.









which you typically manage in a high-level component.

Higher level components have a longer life cycle than others.



If you've used React hooks you'll know what a pain 



React uses stateless components, and advocates using hooks to manage state, which is a really awkward pattern to work with for several reasons.

The fact is that state 



1. 
2. Your application needs state, and forcing all components to be stateless forces us to use awkward patterns like hooks.



## Other

Although you might find it cleaner having these fields on the model:

```tsx
const CounterList = ({counters, total, average}) => (
  <div>
    <div>Total: {total}</div>
    <div>Average: {average}</div>
    <Counter.repeat models={counters} />
  </div>
);

CounterList.methods = {
  update () {
    this.model.reset();
    this.base.update.call(this);
  }
};
```

You could even use `apply`:

```tsx
const CounterList = ({counters, total, average}, { model }) => (
  <div apply={model.reset()}>
    <div>Total: {self.total}</div>
    <div>Average: {self.average}</div>
    <Counter.repeat models={counters} />
  </div>
);
```

This is 





---

v

. The first is any data or state that is left behind on a component instance or its DOM, which you generally want to avoid.

The second is application data that is not persisted, which may include:

- UI state like filters and display toggles.
- Action history, undo/redo etc...
- Working data like calculation results or cached data shapes.

Wallace doesn't have a specific construct for handling state - instead you handle that in your models and controllers.



- DOM state
- model and hub

## 



## Instance

So this is fine, because `render` will be called on every recycled instance, so `total` is always calculated:

```tsx
Counter.methods = {
  render (counters, hub) {
    this.total = counters.reduce((a, c) => a + c.count, 0);
    this.set(counters, hub);
    this.update();
  }
}
```

However this is not:

```tsx
Counter.methods = {
  render (counters, hub) {
    this.total = counters.reduce((a, c) => a + c.count, 0);
    if (total > 10) {
      this.truncate = true;
    }
    this.set(counters, hub);
    this.update();
  }
}
```



## DOM state
