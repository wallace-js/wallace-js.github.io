---
title: Router
sidebar:
  order: 20
---

## Overview

Wallace exports a `Router` component and a `route` helper. The router listens for page-load and `hashchange` events, matches the URL fragment against its route list, then renders the matching component. Routes use hash paths such as `#/tasks/42`.

The router requires the `allowBase` and `allowDismount` Babel plugin flags. Both are enabled by default; see [Flags](/docs/reference/flags).

## Define routes

Pass a `routes` array as the Router model. A route is created with a path and a component definition:

```tsx
import { mount, Router, route } from "wallace";

const Home = () => <h1>Home</h1>;
const Task = ({ id }) => <h1>Task {id}</h1>;

const routerModel = {
  routes: [
    route("/", Home),
    route("/tasks/{id}", Task, ({ args }) => ({ id: args.id })),
  ],
};

mount("app", Router, routerModel);
```

Route paths are split into `/`-separated chunks. A `{name}` chunk captures a string argument. Supported conversions are `{name:int}`, `{name:float}`, and `{name:date}`. A route can also have a query string; the converter receives `args`, `params` (`URLSearchParams`), and the matched `url`. It may return a model synchronously or a promise of a model.

## Errors and cleanup

An unmatched path is reported to the optional `error(error, router)` model callback. Without one, the error is thrown. A route may have a fourth `cleanup` callback, called when that route is left; it receives the route's component instance:

```tsx
route("/tasks/{id}", Task, convertTask, (component) => releaseTask(component));
```

The router reuses the component instance associated with each route. Keep per-visit state in the route model or explicitly reset it when the route renders again.
