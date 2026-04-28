---
title: Prototypes
sidebar:
  order: 1
---

Prototypes are one of the neatest ideas in JavaScript, but certain aspects are confusing.

## What is a prototype?

In JavaScript an object is just a set of properties:

```js
a = { x: 1, y: 2 };
```

But every object also has a secret property called `__proto__` which points to another object:

```js
typeof a.__proto__; // 'object'
```

The point of that second object is to act as a fallback when you try to read a field which doesn't exist on the first object:

```js
a.z; // undefined
```

JavaScript first looks for `z` on `a` and if it doesn't find it, it checks the object which `a.__proto__` points to. We can prove this by creating the property on that object:

```js
a.__proto__.z = 3;
a.z; // 3
```

Note that this doesn't modify `a` which is still the same:

```js
a.hasOwnProperty("z"); // false
a.valueOf(); // {x: 1, y: 2}
```

So far, prototypes are really simple!

## Constructors

JavaScript has several ways to create objects, one of which is using the `new` keyword in front of a function call:

```js
function Shape(x, y) {
  this.x = x;
  this.y = y;
}
shape = new Shape(3, 5);
```

Here JavaScript creates an empty object `{}` then calls the function, binding that object as `this` before returning that object, which typically has properties set by the function:

```js
shape.x; // 3
```

But it also point the object's `__proto__` field to the function's `prototype` field, which is a rather empty object:

```js
shape.__proto__ === Shape.prototype; // true
```

And that means anything you add to `Shape.prototype` becomes available on every object created through it with `new`:

```js
Shape.prototype.area = function () {
  return this.x * this.y;
};
shape.area(); // 15
```

It even works after the object was created, but that's messes with engine optimisation, and should therefore be avoided.

## Inheritance

Say we wanted to create a special type of shape and inherit functions but also add new ones:

```js
function Square(x) {
  this.x = x;
}
```

There are various ways to do this, which have trade-offs and are beyond the scope of this article.

If you need to do this with controllers or other business logic, we recommend you use class syntax instead.

However, this is taken care of when using `extendComponent`:

```jsx
import { extendComponent } from "wallace";

const Shape = () => <div></div>;

Shape.prototype.area = function () {
  return this.model.x * this.model.y;
};

const Square = extendComponent(Shape);

const square = new Square();
typeof square.area; // function
```

But you need to be careful not to _overwrite_ the prototype with a new object:

```js
// THIS WILL BREAK
Square.prototype = {
  area: function () {
    return this.model.x * this.model.x;
  },
};
```

As the prototype will no longer have the functions it relies on such as `update` and `render` as well as a few hidden ones.

Instead you should _assign_ properties:

```js
Square.prototype.area = function () {
  return this.model.x * this.model.x;
};
```

Or better, use `methods` which safely assigns to prototype, and lets you use more compact syntax:

```js
Square.methods = {
  area() {
    return this.model.x * this.model.x;
  },
  render() {
    //
  },
};
```

Note that using `methods` requires setting the `useMethods` flag in [configuration](/docs/reference/configuration).
