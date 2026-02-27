---
title: TypeScript
sidebar:
  order: 3
---

# Uses

TypeScript support comes from a special type called `Uses` which lets you annotate component props, controller and methods.

### Props

Don't annotate props like this:

```tsx
interface iCounter {
  count: number;
}

// BAD
const Counter = ({ count }: iCounter) => (
  <button onClick={count++}>{count}</button>
);
```

That only works within that function, but not elsewhere. Instead import the `Uses` type:

```tsx
import { Uses } from "wallace";

interface iCounter {
  count: number;
}

const Counter: Uses<iCounter> = ({ count }) => (
  <button onClick={count++}>{count}</button>
);
```

This annotates the component's props inside the definition, and ensures correct props are passed when nesting, repeating and mounting:

```tsx
const CounterList: Uses<iCounter[]> = (counters) => (
  <div>
    <Counter props={counters[0]} />
    <Counter.repeat props={counters} />
  </div>
);

mount("main", CounterList, [{ count: 0 }]);
```

The type also carries through to the object and its `render` method. Here both the `props` parameter and `this.props` types are known:

```jsx
Counter.methods.render = function (props) {
  this.props = props;
  this.update();
};
```

### Controller

The second slot in `Uses` lets you specify the controller, which is accessible as `ctrl` in the [xargs](/docs/reference/xargs):

```tsx
import { mount, Uses } from "wallace";

interface Controller {
  shout(txt: string): () => void;
}

const Greeting: Uses<string, Controller> = (txt, { ctrl }) => (
  <button onClick={ctrl.shout(txt)}>GO</button>
);

const controller = {
  shout: (txt) => alert(txt),
};

mount("main", Greeting, "Hello", controller);
```

If you declare a class for your controller there is no need to create a separate interface:

```tsx
import { mount, Uses } from "wallace";

class Controller {
  shout(txt: string) {
    alert(txt);
  }
}

const Greeting: Uses<string, Controller> = (txt, { ctrl }) => (
  <button onClick={ctrl.shout(txt)}>GO</button>
);

const controller = new Controller();
mount("main", Greeting, "Hello", controller);
```

The type also carries through to the object and its `render` method, where here both the `ctrl` parameter and property's types are known:

```jsx
Counter.methods.render = function (props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
};
```

### Methods

Lastly the `Uses` type lets make any additional methods you defined visible. Here `shout` is recognised on `self` inside the component definition, and on `this` in the methods:

```tsx
import { mount, Uses } from "wallace";

interface Methods {
  shout(): () => void;
}

const Greeting: Uses<string, null, Methods> = (txt, { self }) => (
  <button onClick={self.shout()}>GO</button>
);

Greeting.methods = {
  render(props, ctrl) {
    this.props = props;
    this.ctrl = ctrl;
    this.update();
    this.shout();
  },
  shout() {
    alert(this.props);
  },
};

mount("main", Greeting, "Hello");
```

### Omitting types

Use `null` rather than `any` when omitting an argument, as this will warn you if you try to pass props when none are allowed:

```tsx
const Greeting: Uses<string, null, Methods> = (_, { self }) => (
  <button onClick={self.shout()}>GO</button>
);
```

# Helpers

The helper functions like `mount` `watch` and `extendComponent` are all type-aware.

There is a lot of magic involved in making TypeScript work on code that is compiled to something quite different, which makes legitimate code like this break TypeScript:

```tsx
const Greeting = (txt) => <div>{txt}</div>;

const component = new Greeting();
```

You can get around this case by using `createComponent` which also calls `render` as you shouldn't be using un-rendered components:

```tsx
import { createComponent } from "wallace";

const Greeting = (txt) => <div>{txt}</div>;

const component = createComponent(Greeting, "Hello");
```
