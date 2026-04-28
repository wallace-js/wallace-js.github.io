---
title: Flags
sidebar:
  order: 30
---

The Babel plugin accepts flags which toggle certain features. At present all features are enabled by default, and the only two reason you'd want to disable any are:

- Reducing bundle size.
- Performance optimisation.

These are covered in [performance](/docs/reference/performance).





, or get a very small performance boost by disabling features you don't use. Wallace is tiny and insanely fast as it is, and the gains are really small, so this is only something you need special cases.

If you load the plugin without options:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
};
```

All features flags are will be **enabled**, as this is what you want most of the time. But if you specify `flags` in the plugin options:

```js
module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {},
      },
    ],
    "@babel/plugin-syntax-jsx",
  ],
};
```

Then they are all **disabled** unless you add them back in:

```js
module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {
          allowHub: true,
          allowStubs: false,
        },
      },
    ],
    "@babel/plugin-syntax-jsx",
  ],
};
```

Notes:

- Disabling features doesn't affect the type system (and therefore tool tips) which will always show these features to be available.
- Where possible, you will receive a compiler error if you attempt to use a feature which you disabled.

List of feature flags:

#### allowBase

Adds the `base` property to components:

```js
Counter.prototype.render = function (model) {
  this.base.render.call(this, model);
};
```

Note that `base` is not the same as `super` which is used in classes.

#### allowHub

Enables the `hub` property in components, so that the `render` method looks like this:

```js
function render(model, hub) {
  this.model = model;
  this.hub = hub;
  this.update();
}
```

Helper functions which forward `model` to `render` (such as `mount` and `createComponent`) now forward `hub` as well:

```js
mount(element, def, model, hub);
createComponent(def, model, hub);
```

#### allowMethods

Add the `methods` property to component definitions:

```js
Counter.methods = {
  render(model) {
    this.base.render.call(this, model);
  },
  doSomething() {
    console.log("something");
  },
};
```

You can always create or override methods via the prototype:

```js
Counter.prototype.render = function (model) {
  this.base.render.call(this, model);
};
Counter.prototype.doSomething = function (model) {
  console.log("something");
};
```

#### allowParts

Allows you to declare parts in a component:

```jsx
const CounterList () => (
  <div>
    <div part:stats>Total: {total}</div>
    <div>
      <Counter.repeat models={counters} />
    </div>
  </div>
);
```

#### allowRepeaterSiblings

Allows you to place a repeater under a node with other children:

```jsx
const CounterList ({ total, counters }) => (
  <div>
    <div>Total: {total}</div>
    <Counter.repeat models={counters} />
  </div>
);
```

Otherwise you'd need to place it under another node on its own:

```jsx
const CounterList ({ total, counters }) => (
  <div>
    <div>Total: {total}</div>
    <div>
      <Counter.repeat models={counters} />
    </div>
  </div>
);
```

#### allowStubs

Enables the use of stubs:

```jsx
const CounterList () => (
  <div>
    <stub.stats />
    <stub.counters />
  </div>
);
```

### Directives

You can overwrite or add new directives in the configuration:

```js
const { MyCustomDirective } = require("./src/directives.js");

module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {},
        directives: [MyCustomDirective],
      },
    ],
    "@babel/plugin-syntax-jsx",
  ],
};
```

See [Custom Directives](/docs/reference/directives#custom-directives) for more details.
