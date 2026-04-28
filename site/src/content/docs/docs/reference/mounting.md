---
title: Mounting
sidebar:
  order: 8
---

You mount the root component of your tree using `mount`:

```tsx
const root = mount("root", MyComponent, model, hub);
```

The arguments are:

1. Element or id string.
2. Component definition.
3. model for the element (optional)
4. hub (optional)

`mount` returns the component instance, allowing you to call its methods:

```tsx
root.update();
```

Every tree is separate
