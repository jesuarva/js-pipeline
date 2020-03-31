# A [Pipeline](<https://en.wikipedia.org/wiki/Pipeline_(computing)>) implementation in JavaScript

It is an approach to solve performance issues processing big blocks of data in a non-blocking way.
The `Pipeline` is implemented with JS generators

There are currently two proposals to introduce a new `pipeline operator` in JavaScript: [tc39/proposal-pipeline-operator](https://github.com/tc39/proposal-pipeline-operator/wiki)

# Install

> npm install @jesuarva/js-pipeline

# How to initialize a Pipeline

```JavaScript
const Pipeline = require('path/to/Pipeline');

const iterable = new Array(10000); // Any `iterable`  object

for (let i = iterable.length - 1; i >= 0; i--) {
  iterable[i] = i;
}

const pipeline = Pipeline(iterable);
```

# Usage example

After running `example1.js`:

> node src/examples/example1.js

```javascript
// src/examples/example1.js
const Pipeline = require('../Pipeline');

const arr = new Array(100);

for (let i = arr.length; i >= 0; i--) {
  arr[i] = i;
}

Pipeline(arr)
  .filter(item => item % 2 === 0 && item % 10 === 0)
  .map(item => `Pipeline-1 ${item}`)
  .effect(value => console.log(value))
  .runAsync(response => console.log('Pipeline-1 last callbackFn', response));

Pipeline(arr)
  .filter(item => item % 3 === 0 && item % 30 === 0)
  .map(item => `Pipeline-2 ${item}`)
  .effect(value => console.log(value))
  .runAsync(response => console.log('Pipeline-2 last callbackFn', response));

Pipeline(arr)
  .filter(item => item % 3 === 0 && item % 30 === 0)
  .map((item, index) => `Pipeline-3 ${item}. index-${index}`)
  .effect(value => console.log(value))
  .runAsync(response => console.log('Pipeline-3 last callbackFn', response));
```

the output in the console looks like:

```bash
✘-127 ~/Sites/js-pipeline [master ↑·1|✚ 3…2]
13:43 $ node src/examples/example1.js ;2A
Pipeline-1 0
Pipeline-2 0
Pipeline-3 0. index-0
Pipeline-1 10
Pipeline-2 30
Pipeline-1 20
Pipeline-3 30. index-1
Pipeline-2 60
Pipeline-1 30
Pipeline-3 60. index-2
Pipeline-2 90
Pipeline-1 40
Pipeline-2 last callbackFn { done: true,
  value:
   [ 'Pipeline-2 0',
     'Pipeline-2 30',
     'Pipeline-2 60',
     'Pipeline-2 90' ] }
Pipeline-3 90. index-3
Pipeline-1 50
Pipeline-1 60
Pipeline-3 last callbackFn { done: true,
  value:
   [ 'Pipeline-3 0. index-0',
     'Pipeline-3 30. index-1',
     'Pipeline-3 60. index-2',
     'Pipeline-3 90. index-3' ] }
Pipeline-1 70
Pipeline-1 80
Pipeline-1 90
Pipeline-1 100
Pipeline-1 last callbackFn { done: true,
  value:
   [ 'Pipeline-1 0',
     'Pipeline-1 10',
     'Pipeline-1 20',
     'Pipeline-1 30',
     'Pipeline-1 40',
     'Pipeline-1 50',
     'Pipeline-1 60',
     'Pipeline-1 70',
     'Pipeline-1 80',
     'Pipeline-1 90',
     'Pipeline-1 100' ] }
```

The output shows how the `pipeline` runs asynchronously, processing a unit of data one by one, one after the other, no blocking the main thread.

# API Reference

The public API emulates the _Array's_ iteration methods (map, filter).

### pipeline.map(mapFn)

Emulates `Array.map`.
`mapFn`: Function that is invoke with each element of the iterable. Each time callback executes, the returned value is passed thought the `pipeline`.

```typescript
interface pipelineAPI {
  map(mapFn: <T, S>(currentData: T, index: number) => S | T, index: number): void;
}
```

### pipeline.filter(filterFn)

Emulates `Array.filter`.
`filterFn` is a predicate, to test each element of the iterable. Return true to keep the element, false otherwise.

```typescript
interface pipelineAPI {
  filter(filterFn: <T>(currentData: T, index: number) => boolean): void;
}
```

### pipeline.effect(effectFn)

Meant to perform a side effect with the current chunk of data outside the pipeline data-flow.

```typescript
interface pipelineAPI {
  effect(effectFn: <T>(currentValue: T, index: number) => any): void;
}
```

### pipeline.getPipeLine()

Returns underlying generator instance.

Could be useful if looking to run the generators-pipeline manually.

```typescript
interface iteratorResult {
  value: any;
  done: boolean;
}

interface generatorObject {
  next(value?: any): iteratorResult;
  throw(value?: any): iteratorResult;
  return(value?: any): iteratorResult;
}

interface pipelineAPI {
  getIterator(): generatorObject;
}
```

### pipeline.stopPipeLine()

Stops the `pipeline`.

```typescript
interface pipelineAPI {
  stopPipeLine(): void;
}
```

### pipeline.runAsync(callback)

Run asynchronously the `pipeline`.
`callback` is called when the `pipeline` has finished processing all data chunks. Returns an Array of data processed.

```typescript
type pipeLineResponse = {
  done: true;
  value: any[]; // Array of processed data.
};
interface pipelineAPI {
  runAsync(callback: (response: pipeLineResponse) => any): void;
}
```

### pipeline.runAsSaga(options)

A version of `runAsync` adapted to run within a `redux-saga` task.

```typescript
interface sagaFnOptions {
  callbackEffect: <T>(response: pipeLineResponse, ...others: T[] | []) => any;
  callbackArguments: any[];
}
interface pipelineAPI {
  runAsSaga(options: sagaFnOptions): void;
}
```

## Types & Interfaces

```typescript
interface iter {
  length: number;
}

interface generatorObject {
  next(value?: any): iteratorResult;
  throw(value?: any): iteratorResult;
  return(value?: any): iteratorResult;
}

interface iteratorResult {
  value: any;
  done: boolean;
}

type pipeLineResponse = {
  done: true;
  value: any[];
};

interface sagaFnOptions {
  callbackEffect: <T>(response: pipeLineResponse[], ...others: T[] | []) => any;
  callbackArguments: any[];
}

interface pipelineAPI {
  runAsync(callback: (response: pipeLineResponse) => any): void;
  runAsSaga(options: sagaFnOptions): void;
  map(mapFunction: <T, S>(currentValue: T, index: number) => S | T, index: number): void;
  filter(filterFunction: <T>(currentValue: T, index: number) => boolean): void;
  effect(effectFn: <T>(currentValue: T, index: number) => any): void;
  getPipeLine(): generatorObject;
  stopPipeLine(): void;
}
```
