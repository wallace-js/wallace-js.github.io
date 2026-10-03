---
title: Watching
sidebar:
  order: 14
---

## Watch a component model

The `watch` directive makes a component update when its model or a nested value is changed through the watched proxy:

```tsx
const Counter = ({ count }) => (
  <div watch>
    <button onClick={count++}>{count}</button>
  </div>
);
```

The directive wraps the model when the component is set. The component's `model` is therefore a proxy, not necessarily the same object passed to `render`. Mutations made through that proxy update the underlying object and invoke the watcher. Mutating the original object directly does not trigger the callback.

By default, a change calls the component's `update` method. You can provide a callback instead:

```tsx
const Counter = ({ count }) => (
  <div watch={(target, key, value) => recordChange(key, value)}>
    {count}
  </div>
);
```

When you provide a callback, Wallace does not also automatically update the component; call `update` yourself if that is required.

`watch` may only be placed on a component's root element. It modifies the component's `set` method, so custom method overrides must preserve that behavior.

## The `watch` helper

Use the exported helper when you want to decide what to update or watch data outside the component:

```tsx
import { watch } from "wallace";

const model = watch({ count: 0 }, () => root.update());
```

The callback receives the modified target, property or array method name, and assigned value or arguments. Nested objects are watched as they are accessed. Array mutation methods such as `push`, `pop`, `splice`, `reverse`, and `sort` invoke the callback.

The helper is shallow in identity, not in effect: the proxy wraps nested objects when they are read, while the original object remains the underlying data. Changes made outside the proxy are visible through it but do not notify watchers.
