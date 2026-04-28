import { mount } from "wallace";

const Counter = ({ count }) => <button onClick={count++}>{count}</button>;

const CounterList = (counters) => (
  <div watch>
    Total: {counters.reduce((a, c) => a + c.count, 0)}
    <button onClick={counters.push({ count: 1 })}>Add Counter</button>
    <Counter.repeat models={counters} />
  </div>
);

mount("counters", CounterList, []);
