---
title: Extending
sidebar:
  order: 18
---

## Overview

This page covers patterns for extending and reusing component definitions, which is useful for creating base components with common functionality, such as forms and dialog boxes.

## Extending

You can extend a component definition using `extendComponent` function:

```tsx
import { extendComponent } from 'wallace';

const BaseCounterList = (counters, { self }) => (
  <div>
    <div>{self.stats()}</div>
    <Counter.repeat models={ctrl.counters} />
  </div>
);

BaseCounterList.methods = {
  total () {
    return this.model.reduce((a, c) => a + c.count, 0));
  }
}

CounterListWithTotal = extendComponent(BaseCounterList);
CounterListWithTotal.methods = {
  stats () {
    return `Total: ${this.total()}`;
  }
}

CounterListWithAverage = extendComponent(BaseCounterList);
CounterListWithAverage.methods = {
  stats () {
    return `Average: ${this.total() / this.model.length}`;
  }
}
```

As you can see, the methods are inherited by the derived classes, as the `methods` helper extends rather than overrides the prototype.

The derived component definition has the same DOM structure, unless you pass a new one as the second argument to `extendComponent`:

```tsx
CounterListWithBoth = extendComponent(
  BaseCounterList,
  (counters, { self }) => (
    <div>
      <div>Total {self.total()}</div>
      <div>Average {self.average()}</div>
      <Counter.repeat models={ctrl.counters} />
    </div>
  )
);

CounterListWithBoth.methods = {
  average () {
    return this.total() / this.model.length;
  }
}
```

In this case, the only result is that `CounterListWithBoth`  inherits the `total` method from `BaseCounterList` which isn't particularly useful, and could equally be achieved like this:

```tsx
CounterListWithBoth = (counters, { self }) => (
  <div>
    <div>Total {self.total()}</div>
    <div>Average {self.average()}</div>
    <Counter.repeat models={ctrl.counters} />
  </div>
);

CounterListWithBoth.methods = {
  total: BaseCounterList.methods.total,
  average () {
    return this.total() / this.model.length;
  }
}
```

So it may seem pointless, except that `extendComponents` doesn't just just inherit methods, it also inherits **stubs**.

**WARNING**: you must pass a raw JSX function to the second argument. You cannot pass a variable:

```tsx
const newDef = (counters, { self }) => (
  <div>
    <div>Total {self.total()}</div>
    <div>Average {self.average()}</div>
    <Counter.repeat models={ctrl.counters} />
  </div>
);

// This will break.
CounterListWithBoth = extendComponent(BaseCounterList, newDef);
```

## Stubs

Stubs are named slots for nested components to be implemented by derived components:

```tsx
import { extendComponent } from 'wallace';

const BaseCounterList = (counters, { stub }) => (
  <div>
    <stub.stats model={counters} />
    <Counter.repeat models={ctrl.counters} />
  </div>
);

CounterListWithTotal = extendComponent(BaseCounterList);
CounterListWithTotal.stub.stats = (counters) => (
  <div>
    Total: {counters.reduce((a, c) => a + c.count, 0))}
  </div>
);

CounterListWithAverage = extendComponent(BaseCounterList);
CounterListWithAverage.stub.stats = (counters) => (
  <div>
    Average: {
      counters.reduce((a, c) => a + c.count, 0)) /
      counters.length
    }
  </div>
);
```

In this case the derived component implements the stubs, but you can also define the stubs on the base and use them in the derived component:

```tsx 
import { extendComponent } from 'wallace';

const BaseCounterList = (counters) => <div></div>;
BaseCounterList.stubs = {
  counter: Counter,
  total: (counters) => (
    <div>
      Total: {counters.reduce((a, c) => a + c.count, 0))}
    </div>
  ),
  average: (counters) => (
    <div>
      Average: {
        counters.reduce((a, c) => a + c.count, 0)) /
        counters.length
      }
    </div>
  )
};

CounterListWithAverage = extendComponent(
  BaseCounterList,
  (counters, { stub }) => (
    <div>
      <stub.average model={counters} />
      <stub.counter.repeat models={counters} />
    </div>
  )
);
```

In fact you can combine both approaches:

```tsx
const RangeCounter = ({ count }) => (
  <div>
    <input bind-as:range={count} />{count}
  </div>
);

CounterListWithAverage.stub.counter = RangeCounter;
```

So long as the final component definition covers all stubs it references (either with its own implementations or inherited ones) it will work.

Note that stubs function just like nested components. You can repeat them, specify an alternate hub, keys and so on:

```tsx
const BaseCounterList = (counters, { self }) => (
  <div>
    <stub.stats hub={altHub}>
    <stub.counter.repeat models={ctrl.counters} key:id />
  </div>
);
```

### Gotcha

One common mistake is forgetting that a stub is a nested component, and therefore cannot access methods from its parent component:

```tsx
import { extendComponent } from 'wallace';

const BaseCounterList = (counters, { self }) => (
  <div>
    <stub.stats>
    <Counter.repeat models={ctrl.counters} />
  </div>
);

BaseCounterList.methods = {
  total () {
    return this.model.reduce((a, c) => a + c.count, 0));
  }
}

CounterListWithAverage = extendComponent(BaseCounterList);
CounterListWithAverage.stub.stats = (counters, { self }) => (
  <div>
    {/*  This will fail as `self.total` is undefined. */}
    Average: {self.total() / counters.length}
  </div>
);
```

The `total` method is available on instances of `BaseCounterList` and `CounterListWithAverage` because it inherits that, but `CounterListWithAverage.stub.stats` doesn't as it is a separate component.

The solution to this is to put those methods on the model or the hub. 

# Factories

An other approach to extending and reusing component definitions is with a factory function which returns a component definition:

```tsx
interface CounterModel {
  count: number;
}

const RangeCounter: Takes<CounterModel> = ({ count }) => (
  <div>
    <input bind-as:range={count} />{count}
  </div>
);

const ButtonCounter: Takes<CounterModel> = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

export function getCounterList<CounterModel>(
  Counter: ComponentFunction<CounterModel>
) {
  const CounterList = (counters) => (
    <div>
      <div>
        Total: {counters.reduce((a, c) => a + c.count, 0))}
      </div>
      <Counter.repeat models={counters} />
    </div>
  );
  return CounterList;
}

const CounterListWithRange = getCounterList(RangeCounter);
const CounterListWithButton = getCounterList(ButtonCounter);
```

This allows you to decide what component to nest at run time.

The returned definition can also make use of stubs, so you can combine both patterns:

```tsx
export function getCounterList<CounterModel>(
  Counter: ComponentFunction<CounterModel>
) {
  const CounterList = (counters, { stub }) => (
    <div>
      <stub.stats model={counters} />
      <Counter.repeat models={counters} />
    </div>
  );
  return CounterList;
}

const CounterListWithRange = getCounterList(RangeCounter);
CounterListWithRange.stub.stats = (counters) => (
  <div>
    Average: {
      counters.reduce((a, c) => a + c.count, 0)) /
      counters.length
    }
  </div>
```

As with all things, it's not because you can that you should. The point of these patterns is to *prevent* errors by reducing duplication. If you end up with something that causes more errors through confusion, you need a rethink.

Consider low-tech strategies to organise your components, like aliasing to localised names, or grouping them into objects:

```tsx 
interface DialogComponents {
  base: ComponentDefinition;
  form: ComponentDefinition;
  buttons: ComponentDefinition[];
}

const PreferencesDialogComponents: DialogComponents = {
  base: CustomButtonsDialog,
  form: PreferencesDialogForm,
  buttons: [
    OKButton,
    CancelButton,
    ExportButton
  ]
};

const PreferencesDialog = buildDialog(PreferencesDialogComponents);
```

