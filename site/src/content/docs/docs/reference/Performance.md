---
title: Performance
sidebar:
  order: 32
---

Notes on optimising performance and bundle sizes.

## Bundle size

Wallace produces much smaller bundles than other frameworks in applications which are small enough that the framework makes up a significant portion of the bundle, but as applications get larger, the difference becomes less pronounced.

This makes it ideal for "micro apps" like landing pages, menus etc... 

This section therefore covers two points:

- General advice on keeping bundle sizes down.
- How to make micro app bundles even smaller.

### General

Bundles bloat because teams don't check the impact of adding a new library or restructuring their imports. So the first step in managing bundle size is to monitor it, ideally in CI.

#### Libraries

The most common cause of bloat is carelessly importing large libraries. You can check the size of various libraries on [https://bundlephobia.com/](https://bundlephobia.com/) but this assumes you are importing the entire library, rather than individual definitions, which good libraries should allow.

This applies to your own internal libraries used in multiple bundles too. You need to think about how you import/export in index.js type files, and how you group functionality into modules.

Your bundler may also have additional methods of marking modules with side effects etc.

#### Targets

The older browsers you need to support, the more polyfills for ES6 syntax will be added to your bundle. Use your analytics to determine what you need to support. If you have to support older browsers, watch what ES6 syntax you use.

#### CSS

Importing CSS into JavaScript rapidly increases bundle size. Whether this results in better or worse performance than having the CSS in CSS files is situation dependent and it's best to measure rather than make assumptions.

### Micro

Because Wallace is an ideal choice for micro apps, it offers way to make those bundles even smaller.

Wallace already does this by organising its exports in a way that helps the bundler with tree-shaking (excluding code that isn't accessed) though you need to play around and/or look at the library code to see where the big savings are.

Generally:

- Use `show` and `hide` rather than `if` as that imports code which deals with attaching/detaching.
- Use sequential rather than keyed repeaters as the repeater code is more compact.
- Avoid `watch` if you can.

Bear in mind that if you use it once, that code is imported and there's no penalty for using it again.

In addition to this, the Babel plugin uses several [flags](/docs/ref/flags) which disable features altogether and further shrink bundle size.

## Rendering

The general advice on rendering performance is to ignore it unless it becomes a problem that is definitely worth spending time on.

The first thing you should do with that time is determine whether the component really is that slow relative to what it could be, and whether there's an obvious cause for that.

Here are some culprits in order of likeliness.

#### Resource issues

- Are there any resources that should be preloaded, such as data or glyphicons?

#### Excessive updates

- Is reactivity triggering updates more frequently that it needs to?
- Are you updating too broadly, could you run a more targeted update?

#### Excessive DOM

The more DOM on the page the slower it will get, and this is typically caused by using too many wrapper elements on massively repeated components.

#### Inefficient DOM manipulation



#### Excessive computation

It is quite unlikely that your slowdown is due to non-DOM related computation, and it should be easy enough to determine if that is the case. 





 whether there's an obvious factor causing it to perform poorly.





While bundle size is something you can preemptively stay on top of, doing the same with performance is likely to waste your time, 



As with bundle size, the first step in ensuring solid performance is monitoring the impact of code changes on performance of critical paths.

The second step is understanding exactly why something isn't performing well, which isn't always easy as there are multiple factors involved.



In fact, most of the things which will slow down performance aren't down to the framework, and you can read an excellent (but old) article on the subject here: [Taming huge collections of DOM nodes](https://codeburst.io/taming-huge-collections-of-dom-nodes-bebafdba332).

In term





