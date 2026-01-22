---
title: Claims
sidebar:
  order: 0
---

Wallace claims to load faster and render faster than almost any other framework. That naturally raises a few eyebrows as well as some questions, which we'll answer here.

These claims are based on the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) which has become the de-facto  benchmark due to its attention to accuracy and coverage. However, there are a few subtleties you need to be aware of when interpreting the results.

## The js-framework-benchmark

### Premise

The project is a repository which includes a multitude of implementations of the same app using different frameworks:

![](https://raw.githubusercontent.com/krausest/js-framework-benchmark/refs/heads/master/images/screenshot.png)

It run a suite of tests (e.g. create 1000 rows, swap rows, remove a row etc...) against the app and measures the times and other metrics. The latest results are regularly [published](https://krausest.github.io/js-framework-benchmark/current.html), showing how different frameworks stack up against each other.

### Implementations

There are implementations for:

- Every framework you've likely heard of.
- A load of frameworks you'll likely never hear of.
- Alternative implementations of frameworks (E.g. React-redux-hooks, React-zustand)
- A few vanilla (no framework) implementations which act as baselines.
- Various DOM libraries which you wouldn't realistically use as a framework (we'll ignore the fact React calls itself a library).

Once you exclude permutations of the same, you're left with just over 100 entries which are a mix of frameworks and not-quite-frameworks. The results table has a link to view the source code of each implementation, which is very handy.

### Keyed vs non-keyed

This refers to the two different approaches to repeating elements. 

In the keyed approach each item in the data array stays linked to its DOM element, so if your array renders elements A, B, C, then you re-render just A, C then the DOM element that displayed B would be removed from the DOM.

In the non-keyed approach, re-rendering [A, C] would reuse the first two DOM elements, meaning C is displayed in the DOM node that used to display B.

The keyed approach is preferable in two scenarios:

- When you use CSS or third party animations.
- When you have inputs which may retain focus.

Otherwise, the non-keyed implementation generally offers better performance (and in Wallace's case, even better performance tweaking possibilities). You can read more in Stefan's blog entry [here](https://www.stefankrause.net/wp/2017/01/js-web-frameworks-benchmark-keyed-vs-non-keyed/).

The results are separated by approach, which on one hand gives a fairer comparison within each table, but gives an unfair comparison on the other as framework X may appear slower than framework Y in the keyed table, whereas its non-keyed mode (which you would be using for places where performance really matters) is far superior. And of course, some frameworks only bother submitting one approach.

## Interpreting results

There are two parts we're interested in: loading times and render times, but these both have some nuances.

### Loading times

The metrics we have that affect loading times are:

- Uncompressed size
- Compressed size
- First paint

Each of these matters in different ways. On a first visit to a site, the client will not have any static assets cached (with the possible exception of generic third party libraries) meaning they all need to go over the network, so the compressed size matters.

However network speeds are much faster than they used to be, we have CDNs, and JavaScript bundles are often smaller than the many images being loaded on the page, so it's not as critical as it used to be. But bloated bundles will still definitely impact loading times on a poor connection.

On a second visit, the assets will often be cached, which negates the network loading time, but the bundle still needs to be decompressed, interpreted and converted to machine code - and the latter can be significant. The uncompressed bundle size is the best (though by no means linear) indicator of this.

Then there's the matter of what your bundle does before it starts updating the DOM. The "first paint" metric captures both the interpreting and activity before the bundle starts updating the DOM, and is the really useful one you should be looking at.

The spread of scores for loading times dwarfs the spread of scores for render metrics.

- First paint - fastest: 30.7 (vanillas) vs slowest: 989.5 (ember)
- Create 1000 rows - fastest: 24.0 (deleight) vs slowest 88.6 (qwik)

Bear in mind that the js-framework-benchmark app is tiny with just 3 components. So the gargantuan bundles would not grow all that much with 30 components, whereas the smaller bundles would grow almost proportionally.

### Render times

There are several subtleties to be aware of when interpreting the. The first is that 



This is the larger table with a dozen metrics, which makes people tempted to 

If you look at the row headers you'll see mentions of "5 warmup runs" 

### Geometric mean

The project goes to great lengths to ensure fairness and accuracy, however the overall score as shown in "geometric mean of all factors in the table" is rather questionable, as the relative importance of each test is subjective. 

For example the speed of "clear all rows" ranges from 9 to 44ms, and no one is going to notice that difference - yet a framework's relative score on that test matters as much as its relative score on "create 1000 rows" which is the one would become visible in certain real world scenarios.

