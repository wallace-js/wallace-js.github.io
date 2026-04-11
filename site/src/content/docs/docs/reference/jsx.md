---
title: JSX
sidebar:
  order: 7
---

Instead of placing logic _around_ elements, you control structure from _within_ elements using directives (attributes with special behaviour) like `if`:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button if={count > 2} onClick={(count = 0)}>
      reset
    </button>
  </div>
);
```

And special syntax for nesting and repeating:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter model={counters[0]} />
    <div>
      <Counter.repeat models={counters} />
    </div>
  </div>
);
```

But you don't need to remember all this. JSX elements have a tool tip which reminds you of syntax rules and lists the available directives, which have their own tool tips detailing their usage.
