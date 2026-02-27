---
title: Claims
sidebar:
  order: 1
---

Wallace claims to:

- Load faster than almost any other framework.
- Render faster than most other frameworks.

These claims are based on the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) which is widely regarded as the official benchmark for JavaScript frameworks and DOM libraries, and ranks Wallace as:

- Joint **1st** in the **create (1000) rows** metric - which a pretty good proxy for real-world render speed.
- Joint **2nd** place in the **first paint** and **uncompressed size** metrics - which are accurate indicators of real-world loading speed.

However, the [results](https://krausest.github.io/js-framework-benchmark/current.html) are laid out in a rather confusing manner, and if you just glance at them without understanding how they are sorted, you see a very different picture. This discrepancy is down to the project's decision to:

1. Separate results for keyed and non-keyed implementations.
2. Sort by geometric mean of all metrics on the table.

While these decisions do make sense, they can also be misleading.

## Keyed vs non-keyed

The project maintains separate results tables for **keyed** and **non-keyed** implementations, which refers to how we treat arrays of same-type elements, like rows in a table.

#### The difference

In the keyed approach each items in the data array stays linked to its DOM element by using a key such as "id". So if you render [A, B, C] then render [A, C] the DOM element for B gets removed.

The non-keyed approach reuses DOM elements sequentially, so the element for C gets removed and the element for B is made to render C.

The non-keyed approach often performs better, but causes problems in certain scenarios, such as:

- When you use animation on the repeated elements (e.g. fade when removed).
- When you have inputs which may retain focus (really only an issue for active text input, as things like checkboxes should be data-bound).

You can read more on this in Stefan's blog [here](https://www.stefankrause.net/wp/2017/01/js-web-frameworks-benchmark-keyed-vs-non-keyed/).

#### Implementations

Some frameworks (e.g React) only operates in keyed mode, however it can be made to operate in a non-keyed manner simply by using the index as key when iterating over items.

These frameworks tend not to bother submitting a non-keyed implementation to the benchmark, as its scores would be identical to its keyed implementation.

Other frameworks such as Wallace operate in either mode, depending on how you set up the repeat instruction:

```jsx
<Row.repeat props={items} />           // non-keyed
<Row.repeat props={items} key="id" />  // keyed
```

These may use different algorithms, resulting in a performance difference, and so tend to submit both keyed and non-keyed implementations to the benchmarks.

Some frameworks only operate in non-keyed mode, which is not suitable for all projects.

#### The problem

Because many popular frameworks only appear in the keyed table, people tend to focus on that and ignore the non-keyed results.

That's fine if you're comparing two frameworks which only operate in keyed mode (e.g. Solid vs React). But if you're comparing against a framework which operates in both modes (e.g React vs Wallace) then the comparison is only valid if you need to use keyed mode for the reasons mentioned above.

In cases where performance matters (large grids, infinite scroll etc..) you are more likely to be using non-keyed mode, in which case the valid comparison would be React keyed vs Wallace non-keyed, which gives us a different difference:

| create rows | React  | Wallace | Diff    |
| ----------- | ------ | ------- | ------- |
| Keyed       | 26.6   | 25.6    | -3.76%  |
| Non-keyed   | (26.6) | 22.2    | -16.54% |

But it's rather difficult making this comparison as you have to of scrolling between the two tables.

## Geometric mean

The geometric mean is an attempt to rank frameworks taking into account the different range and distribution of scores for various metrics by assigning a weight based around the 90% percentile. There is a [wiki page](https://github.com/krausest/js-framework-benchmark/wiki/Computation-of-the-weighted-geometric-mean) explaining this in more detail.

While the geometric mean is useful when focusing a single metric (you can filter) it loses any meaning when used across multiple metrics as there is no objective way to rate their relative importance:

- How important is **create (1000) rows** compared to **remove row**?
- How importance is the difference compared to other frameworks?
- How likely are you to create 10,000 rows?

Unfortunately the results are sorted by geometric mean of all factors by default, which penalises frameworks that score badly on less relevant metrics.

## Conclusion

Ultimately, benchmarks are best-attempts at producing useful statistics, but as with all statistics, we need to be careful with how we use them.

The overall story these benchmarks tell us is that:

1. Many of the big popular frameworks (Angula, Blazor, Alpine, Ember etc) are comparatively slow.
2. There's very little difference between the fastest rendering frameworks.
3. There is _significant_ difference in bundle sizes and loading times.

Bear in mind that render metrics are calculated after the bundle is loaded, and after a number of warm up runs. So if what you're most concerned about is the initial render of a large page then you should be looking at the combined impact of loading and rendering.

There isn't a metric for that yet, but you can get a fair idea of where Wallace would land on that from this screenshot:

![](/img/bundle-sizes.png)
