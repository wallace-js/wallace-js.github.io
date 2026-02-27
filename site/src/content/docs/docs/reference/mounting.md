---
title: Mounting
sidebar:
  order: 5
---

You mount the root component of your tree using `mount`:

```tsx
const root = mount("root", MyComponent, props, ctrl);
```

The arguments are:

1. Element or id string.
2. Component definition.
3. props for the element (optional)
4. controller (optional)

`mount` returns the component instance, allowing you to call its methods:

```tsx
root.update();
```

Every tree is separate
