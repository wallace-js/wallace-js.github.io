---
title: Repeating components
sidebar:
  order: 18
---

## Basic repetition

Use `.repeat` on a component definition to render one nested component for each item in an array. Each item becomes that component's model:

```tsx
const Task = ({ title }) => <li>{title}</li>;

const TaskList = (tasks) => (
  <ul>
    <Task.repeat models={tasks} />
  </ul>
);
```

The repeat element must be nested inside a regular element; it cannot be the root JSX element. A nested component or repeater cannot have ordinary HTML attributes or child nodes. Directives supported on nested components are documented in [JSX](/docs/reference/jsx).

## Sequential reuse

Without a `key`, Wallace reuses component instances by their position in the array. This is efficient and works well when a component's state is reset whenever it is rendered with a new model. It can be unsuitable when DOM identity matters, such as when another library tracks individual elements.

## Keyed reuse

Add `key` when an item should keep its component instance as the array is reordered or edited. The key can be the name of a model property or a function that returns a key:

```tsx
<Task.repeat models={tasks} key="id" />
<Task.repeat models={tasks} key={(task) => task.id} />
```

Keys should be stable and unique within the repeated list. Keyed repetition preserves the component associated with a key when items move; it does not make model changes reactive by itself.

## Siblings and flags

Depending on the `allowRepeaterSiblings` Babel plugin flag, a repeater may be placed alongside other children of its parent. When that flag is disabled, give the repeater its own wrapper element. See [Flags](/docs/reference/flags) for configuring compiler features.

Component instances removed from a repeater may be dismounted and pooled when the relevant flags are enabled. See [Pooling](/docs/reference/pooling).