---
title: Directives
sidebar:
  order: 4
---

## Tool tips

A list of all directives is available on the tool tip for JSX elements:

![Tool tip on JSX element](/img/div-tooltip.jpg)

The listing shown is the same no matter which element you hover on.

Custom directives do not show up in this list.

Each directive has own tool tip with more detailed usage, however this won't display if the directive uses a qualifier:

```tsx
const Counter = ({ foo }) => (
  <div>
    {/* Tool tip */}
    <input bind={foo}>
    {/* No tool tip */}
    <input bind:keyup={foo}>
    {/* Still no tool tip */}
    <input bind  :keyup={foo}>
    {/* Temporary hack to show tool tip for bind */}
    <input bind x_:keyup={foo}>
  </div>
);
```

## Directives

### apply

Runs a callback during update, typically used to manipulate an element:

```tsx
const Counter = ({ count }, { element }) => (
  <div>
    <div apply={setStyle(count, element)}></div>
  </div>
);

const setStyle = (count, element) =>
  (element.style.color = count > 2 ? 'red' : 'black');
```

### bind

Sets up two-way binding:

  1. It uses the expression as the element's value.
  2. It assigns the value back to the expression when the element's `change` event
fires.

So this:

```jsx
const MyComponent = ({name}) => (
  <input type="text" bind={name}/>
);
```

Is the equivalent of this:

```jsx
const MyComponent = ({name}, {event}) => (
  <input type="text" onChange={name = event.target.value} value={name}/>
);
```

In the case of a checkbox it uses `checked` instead of `value`, so is the equivalent of this:

```jsx
const MyComponent = ({done}, {event}) => (
  <input type="checkbox" onChange={done = event.target.checked} checked={done}/>
);
```

By defaults it listens to the `change` event, but you can specify a different one:

```jsx
const MyComponent = ({name}) => (
  <input type="text" bind:keyup={name} />
);
```

Note that destructured props are converted to member expressions, so these examples
work even though it looks like you're setting a local variable.

### class

Without a qualifier this acts as a normal attribute setting the `class` attribute of the element:

```jsx
<div class={foo} ></div>
```

But when a qualifier is given it instead defines a group of classes which can be toggled:

```jsx
<div class:danger="danger red" toggle:danger={expr}></div>
```

See also: [toggle](#toggle).

### css

Shorthand for `fixed:class`:

```jsx
<div>
  <div css={foo} ></div>
  <div fixed:class={foo} ></div>
</div>
```

See also: [fixed](#fixed).

### ctrl

Specifies an alternative `ctrl` for nested or repeated components, which would otherwise get the parent's `ctrl`:

```jsx
<div>
  <MyComponent.nest ctrl={altController} />
  <div>
    <MyComponent.repeat items={item} ctrl={altController} />
  </div>
</div>
```

### fixed

Sets the value of an attribute at point of component definition:

```jsx
<div>
  <div fixed:id={foo} ></div>
  <div fixed:class={foo} ></div>
</div>
```

As the expression is evaluated once before any component is created, it cannot access the component or props.

It is useful when setting a string would take up too much space in the JSX.

See also: [css](#css).

### hide

Set the element's `hidden` attribute of the element and doesn't update dynamic elements underneath it when true.

```jsx
<div>
  <div hide={foo}>
    This won't update if foo is true.
    <span>{bar}</span>
  </div>
  <div hidden={foo}>
    This will update regardless.
    <span>{bar}</span>
  </div>
</div>
```

See also: [show](#show).

### html

Set the element's `innnerHTML` property:

```jsx
<div>
  <div html={getDivContents()} ></div>
</div>

const getDivContents = () => '<span>hello</span>';
```

### if

Excludes this element from the DOM completely if the condition is false, and does not render dynamic elements underneath:

```jsx
<div>
  <div if={foo}>
    This will be detached from the DOM if foo is false.
    <span>{bar}</span>
  </div>
 
</div>
```

When the condition becomes true, the same DOM is reattached.

### key

Specifies a key for repeated components, creating an association between the key and the nested component. You can provide a string or a function:

```jsx
<div>
  <MyComponent.repeat items={item} key="id" />
</div>
<div>
  <MyComponent.repeat items={item} key={(x) => x.id}/>
</div>
```

The string option is a tad more efficient.

If key is not specified, the components are reused sequentially, which is performs better but may cause issues if anything else, such as animation libraries or event handlers, track the DOM elements.

### items

Specifies the items to be repeated, which must be an array of the props that component expects:

```jsx
<div>
  <MyComponent.repeat items={item} />
</div>
```

### on[Event]

Creates an event handler for the specified event, calling the expression:

```jsx
const Counter = (, { event, element}) => (
  <div>
    <button onClick={btnClicked(event, element)}>Click me</button>
  </div>
);
```

The expression is copied into a function during compilation, so it should not be a callback.

### part

Saves a reference to part of a component, allowing you to update just that part:

```jsx
const Greeting = ({ name }) => (
  <div part:title>
    {name}
  </div>
);

const component = createComponent(Greeting, {name: 'Wallace'});
component.part.title.update();
```

This will update all elements underneath, as if you had called `update` taking into account visibility toggles from `if`, `show`, `hide` etc.

### props

Sets the props for a nested component:

```jsx
<MyComponent.nest props={foo} />
```

For repeated components use items instead.

### ref

Saves a reference to an element:

```jsx
const Greeting = ({ name }) => (
  <div ref:title></div>
);

const component = createComponent(Greeting);
component.ref.title.textConten = "Hello";
```

### show

Set the element's `hidden` attribute of the element and doesn't update dynamic elements underneath it when false.

```jsx
<div>
  <div show={foo}>
    This won't update if foo is false.
    <span>{bar}</span>
  </div>
</div>
```

See also: [hide](#hide).

### style

Without a qualifier this acts as a normal attribute setting the `style` attribute of the element:

```jsx
<div style={getStyle()}></div>

const getStyle = () => 'color: red; background: white;';
```

Note that you must provide a string, not an object.

With a qualifier it targets a specific style property:

```jsx
<div style:color={getColor()}></div>

const getStyle = () => 'red';
```

### toggle

Toggles CSS classes.

If there is a set of classes named with `class:xyz` then it toggles those classes:

```jsx
<div class:danger="danger red" toggle:danger={expr}></div>
```

If there isn't, then it treats the qualifier as the class name:

```jsx
<div toggle:danger={expr}></div>
```

See also: [class](#class).

### unique

Can be set on components which are only created once to avoid the DOM being created twice:

```jsx
const Greeting = ({ name }) => (
  <div unique>
    {name}
  </div>
);
```

A component definition creates its own DOM template at point of definition, and component instances clone this to create their initial DOM. If there is only to be one instance of the component, then that creates double the DOM for no reason.

With `unique` the component uses the component definition's DOM, thereby only creating it once.

## Custom directives

You can customise the behaviour of directives or define new ones.

### Defining directives

Directives are defined as classes which inherit from the base `Directive` class. Here is a directive which sets the color property of a styles

```js
const {
  Directive,
  constants: { WATCH_CALLBACK_ARGS }
} = require("babel-plugin-wallace");

class ColorDirective extends Directive {
  static attributeName = "color";
  apply(node, value, qualifier, base) {
    node.addWatch(
      value.expression,
      `${WATCH_CALLBACK_ARGS.element}.style.color = ${WATCH_CALLBACK_ARGS.newValue}`
    );
  }
}
```

> We use [Common JS](https://nodejs.org/api/modules.html) imports as this will be imported into **babel.config.cjs** file.

Which can be used like this:

```jsx
<div color={count > 2 ? "red" : "black"}>...</div>
```

The API is not yet documented, so the easiest way to see what's available is to look at the [source code](https://github.com/wallace-js/wallace/blob/master/packages/babel-plugin-wallace/src/directives.ts) for existing directives.

### Registering directives

You register you directives in the configuration:

```js
const { ColorDirective } = require("./src/directives.js");

module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {},
        directives: [ColorDirective]
      }
    ],
    "@babel/plugin-syntax-jsx"
  ],
};
```

There is no check that `attributeName` is unique: the latest is applied, which allows you to override the behaviour of existing directives by copying their source code and modifying it.
