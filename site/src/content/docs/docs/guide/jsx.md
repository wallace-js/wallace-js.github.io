---
title : JSX
sidebar:
  order: 4
---

Instead of placing logic _around_ elements, you control structure from _within_ elements using directives (attributes with special behaviour) like `if`:

```tsx
const Counter = ({ clicks }) => (
  <div>
    <div>Count: {clicks}</div>
    <button onClick={clicks++}>Click me</button>
    <button onClick={(clicks = 0)} if={count > 2} >
      Reset
    </button>
  </div>
);
```

And special syntax for nesting:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.nest props={counters[0]} />
    <Counter.nest props={counters[1]} />
  </div>
);
```


 And repeating:

```tsx
const CounterList = (counters) => (
  <div>
    <Counter.repeat items={counters} />
  </div>
);
```

This form of repeat reuses components sequentially, which may cause issues with CSS animations and focus, in which case you should use a keyed repeater by passing `key` which can be a string or a function:

```tsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat items={tasks} key="id" />
  </div>
);

const TaskList = (tasks) => (
  <div>
    <Task.repeat items={tasks} key={(x) => x.id} />
  </div>
);
```

But you don't need to remember all this. JSX elements have a tool tip which reminds you of syntax rules and lists the available directives, which have their own tool tips detailing their usage:

Note that the function you see in your source code no longer exists at run time, so it never _runs_. It is just a placeholder for JSX, which gets _parsed_ during compilation. The function may only contain one JSX expression, and nothing else.

