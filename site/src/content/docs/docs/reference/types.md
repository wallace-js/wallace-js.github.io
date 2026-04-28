---
title: Types
sidebar:
  order: 9
---

## Components

Wallace exports two types for annotating components: `Takes` and `Uses` which let you annotate various aspects. 

### Takes

This type lets you annotate the model and hub (both optional) which a component takes:

```tsx
import type { Takes } from 'wallace';

interface TaskModel {
  text: string
}

const Task: Takes<TaskModel, Hub> = ({text}) => <div>{text}</div>;
```

It must be placed right after the component name as shown above. This ensures you pass correct model and/or hub during mounting, nesting and repeating:

```tsx
const TaskList: Takes<TaskModel[]> = (tasks) => (
  <div>
    First task:
    <Task model={tasks[0]} />
    <Task.repeat models={tasks.slice(1)} />
  </div>
);

mount("main", TaskList, [{test: 'foo'}]);
```

Do not annotate types like this, as that only works inside the function:

```tsx
// Incorrect
const Task = ({ text }: TaskModel) => <div>{text}</div>;
```

If you require no model, pass `null`:

```tsx
const Task: Takes<null> = () => <div>Hello</div>;
```

### Uses

Lets you annotate model, hub and other things the component uses. It is used the same way as `Takes` except you pass a composite type as an object:

```tsx
import type { Uses } from 'wallace';

interface TaskTypes {
  model: Model,
  hub: Hub,
  methods: Methods,
  stub: Stub
}
const Task: Uses<TaskTypes> = () => <div></div>;
```

All fields are optional, so you can omit model etc, which you can't do with `Takes`:

```tsx
const Task: Uses<{methods: Method}> = () => <div></div>;
```

#### Methods

Annotates the properties (usually methods) defined on the component are available on the instance, which is accessed as `self` in the JSX:

```tsx
import type { Uses } from 'wallace';

interface TaskMethods () {
  getName(): string;
}

const Task: Uses<{methods: TaskMethods}> = (_, { self }) => (
  <div>{self.getName()}</div>
));

Task.methods = {
  getName() { return 'wallace' },
  render(model, hub) {  // types are already known
    this.model = { ...model, notallowed: 1 };  // type error
  }
};
```

The type will pass into the object passed into `methods` so it recognises custom methods
in addition to standard methods like `render`, which are already typed for you.

#### Stubs

You can specify the model and hub of each stub:

```tsx
import type { Takes, Uses } from 'wallace';

interface ParentTypes {
  hub: Hub;
  stub: {
    foo: Takes<iDay>;
    bar: Takes<iDay, Hub}>;
  };
}

const Parent: Uses<ParentTypes> = (_, { stub }) => (
  <div>
    <stub.foo model={data[0]} /> 
    <stub.foo.repeat models={data} /> 
  </div>
);
```

## Inheritance

The `extendComponent` function transfers the types specified on the base:

```tsx
const Child = extendComponent(Parent);
```

You may specify different types:

```tsx
const Child = extendComponent<newModel, Hub, Methods>(Parent);
```

However:

1. You must specify all those that are specified on base - as omitted types default
   to `any`.
2. Each type must extend its corresponding type on base.

## Helpers

The helper functions like `mount` `watch` and `extendComponent`, `createComponent` are all type-aware.

## Other types:

Wallace defines a couple more types you may use:

 - `Component<Model, Hub, Methods>` - the base component class (it is a 
   constructor, not a class)
 - `ComponentInstance<Model, Hub, Methods>` - a component instance.
