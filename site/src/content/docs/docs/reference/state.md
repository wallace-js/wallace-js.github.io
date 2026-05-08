---
title: State*
sidebar:
  order: 16

---

This is no diff

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

