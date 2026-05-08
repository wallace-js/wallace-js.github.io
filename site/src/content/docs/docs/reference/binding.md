---
title: Binding*
sidebar:
  order: 15
---

The `bind` directive binds an element's value to data:

```jsx
<input type="text" bind={foo} />
```

It is the equivalent of this:

```jsx
<input type="text" value={foo} onChange={(foo = event.target.value)} />
```

It works on any element that has a `value` field, such as `input` and `select`:

```jsx
<select bind={foo}>
  <option value="">Select option</option>
  <option value="blue">Blue</option>
  <option value="white">White</option>
</select>
```

### Property

By default `bind` binds to the `value` property of the element, which always returns a string regardless of the input "type". You can bind to a different property using a qualifier.

##### Checkbox

You typically want the `checked` property, which is a boolean:

```jsx
<input type="checkbox" bind:checked={foo} />
```

##### Numbers and dates

There are two alternative values for numbers and dates:

```jsx
<input type="number" bind:valueAsNumber={foo} />
<input type="date" bind:valueAsDate={foo} />
```

> Note that these properties may not be implemented on all browsers.

Wallace does an under the hood hack make `valueAsDate` work with [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects returned by watch.



##### Date

For date inputs you can use `valueAsDate`:

```jsx
<input type="date" bind:valueAsDate={foo} />
```




HOWEVER this will fail if when using reactive data:

```jsx
const DateInput = ({ date }) => (
  <input type="date" bind:valueAsDate={date} />
);

const root = mount(
  "main",
  DateInput,
  watch({ date: new Date() }, () => root.update())
);
```

Resulting in this error:

```
Uncaught TypeError: Failed to set the 'valueAsDate' property on 'HTMLInputElement': The provided value is not a Date.
```

This is because `watch` returns a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which the HTMLInputElement won't accept as a `Date` object. In fact the Proxy also breaks if you set the value:

```jsx
<input type="date" bind={date} />
```

Resulting in this error:

```
Uncaught TypeError: Method Date.prototype.toString called on incompatible receiver [object Date]
```

There isn't much Wallace can do about this, it's part of the HTML and JavaScript specifications.

### Event

To change which event fires the action:

```jsx
<input type="text" bind={foo} event:keyup />
```

### Other

If you need more control, then you drop bind:

```jsx
<input type="text" value={foo} onkeyUp={} />
```



