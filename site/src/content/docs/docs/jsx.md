---
title: JSX
sidebar:
  order: 4
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
    <Counter.nest props={counters[0]} />
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);
```

But you don't need to remember all this. JSX elements have a tool tip which reminds you of syntax rules and lists the available directives, which have their own tool tips detailing their usage:

![Tool tip on JSX element](/img/div-tooltip.jpg)
