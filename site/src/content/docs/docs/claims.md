---
title: Claims
sidebar:
  order: 0
---

Wallace claims to load faster and render faster than "almost any other framework" - which raises a few eyebrows as well as some questions.

## TLDR

The [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) runs performance tests on implementations of the same app in different frameworks. It distinguishes between keyed and non-keyed strategies, with the latter being faster but unsuitable for certain situations. Most frameworks allow both strategies.

* Non-keyed results:
  * Wallace comes first in the **create 1000 rows** test (probably most indicative of render time) and does rather well on other tests.
  * Wallace comes joint first in **first paint** test (an accurate measure of impact on page loading time).
* Keyed results:
  * PR open, awaiting merge.

There's no way to pick an "overall" winner as the relative importance of tests, and whether you can compare keyed vs non-keyed, is subjective. Having said that, if you're looking for a combination of fastest loading and fastest rendering, it's hard not to pick Wallace.

You can see the official results [here](https://krausest.github.io/js-framework-benchmark/current.html).

## Details

The [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) has become the most popular benchmark for JavaScript frameworks due to the enormous work and attention to accuracy by the maintainer (Stefan Krause) as well as its unofficial role as a live register of active frameworks.

However, there are a few subtleties you need to be aware of when interpreting the results.

### Premise

The project is a repository which includes a multitude of implementations of the same app using different frameworks:

![](https://raw.githubusercontent.com/krausest/js-framework-benchmark/refs/heads/master/images/screenshot.png)

It run a suite of tests (e.g. create 1000 rows, swap rows, remove a row etc...) against each implementation and records times and other metrics. The latest results are regularly [published](https://krausest.github.io/js-framework-benchmark/current.html), showing how different frameworks stack up against each other.

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

There are two parts we're interested in: loading times and render times.

### Loading times

Three tests are included for loading times:

- Uncompressed size
- Compressed size
- First paint

Each of these matters in different ways.

On a first visit to a site, the uncompressed size matters as the bundle needs to be fetched over the network. With modern network speeds and the prevalence of CDNs this doesn't matter as much as it used to.

On a second visit, the assets will often be cached but the bundle still needs to be decompressed, parsed and converted to machine code before it even runs - which is not insignificant. Then there's the matter of what your bundle does before it starts updating the DOM. The "first paint" metric captures both the interpreting and activity before the bundle starts updating the DOM, and is the really useful one you should be looking at.

The spread of scores for loading times dwarfs the spread of scores for render metrics, for example the non-keyed results show:

- **First paint** 
  - Fastest: 30.7ms (Wallace & skruv-liten)
  - Slowest: 2,454.3 ms(reflex-dom)
- **Create 1000 rows**
  - Fastest: 21.8ms (Wallace) 
  - Slowest 141.0ms (incr_dom)

Bear in mind that the js-framework-benchmark app is tiny with just 3 components. So the gargantuan bundles would not grow all that much with 30 components, whereas the smaller bundles would grow almost proportionally.

### Render times

There are 9 tests relating to render times, plus a geometric mean calculation, which confuses a lot of people.

#### Tests and the geometric mean

The test scores are in milliseconds, but the geometric mean is a relative score calculating the difference between frameworks across selected tests. As such, it changes as you include or exclude tests or frameworks.

What is potentially misleading is that it is a mean of tests that don't all matter to the same extent. No user is going to notice "remove row" taking 10 vs 30 ms.

#### Warm up runs

If you look at the row headers you'll see mentions of "5 warmup runs" which helps give a fair comparison on maximum performance after engine optimisation, as it needs to identify hot code. However, your first render of data the page might benefit from that, so that's something to consider, and something that's not captured in the benchmark.

#### Keyed vs non-keyed

As mentioned before, the test results are split by keyed vs non-keyed, but this generally ends up with people picking a table (usually keyed as it has more frameworks) and ignoring the fact that you may use non-keyed in certain situations (if the framework allows that).

#### Incompleteness

The most important thing to bear in mind is that the target app is by necessity rather simple and not representative of the real world:

- It is tabular, with one level of nesting. Things change drastically when you include multiple levels of nested repeats, and even more if there are irregular numbers of sub-nested items.
- There is minimal CSS and no animations.
- There are almost no gotchas.

Interestingly there is one gotcha: if an implementation fails to preload the `glyphicon` it will be orders of magnitude slower than it should be. This just goes to show that you can't just pick out a fast framework and expect a fast application

Lastly, these implementations don't use the framework's full features, which can sometimes impact performance (sometimes drastically by [deoptimisation](https://www.thenodebook.com/node-arch/v8-engine-intro#common-deoptimization-triggers)).

In other words, solid performance in benchmarks are no guarantee of solid performance in all real life situations, although frameworks which perform poorly on benchmarks are unlikely to fare better in real life.

If you're interested in further exploring performance issues, we recommend these articles:

- https://codeburst.io/taming-huge-collections-of-dom-nodes-bebafdba332
- https://www.thenodebook.com/node-arch/v8-engine-intro#common-deoptimization-triggers

