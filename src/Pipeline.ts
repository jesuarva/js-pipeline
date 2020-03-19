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

async function* createIterator<T>(
  iterable: iter & Iterable<T>,
  type: string,
  callbackFn: (value: any, index: number) => any,
): ReturnType<any> {
  let index = -1;
  for await (const value of iterable) {
    switch (type) {
      case 'filter':
        if (callbackFn(value, ++index)) yield value;
        break;
      case 'map':
        yield callbackFn(value, ++index);
        break;
      case 'effect':
        callbackFn(value, ++index);
        yield value;
        break;
      default:
        index++;
        yield value;
    }
  }
}

export = function PipeLine<T>(initialIterable: iter & Iterable<T>): pipelineAPI {
  if (Symbol.iterator in initialIterable === false) {
    throw TypeError('PIPELINE: The argument provided is not an `iterable` object');
  }
  const pipe = {
    pipeLine: [initialIterable],
    getLastIterable() {
      const pipeLineLength = this.pipeLine.length;
      return this.pipeLine[pipeLineLength - 1];
    },
    add(iterable: iter & Iterable<T>) {
      this.pipeLine.push(iterable);
    },
    response: new Array(initialIterable.length) as pipeLineResponse[],
  };

  const timeOutsList = {
    list: [] as number[],
    add(timeOut: ReturnType<typeof setTimeout>) {
      this.list.push(timeOut);
    },
    reset() {
      this.list.length = 0;
    },
    cancelAll() {
      this.list.forEach((timeOut: number) => {
        window.clearTimeout(timeOut);
      });
    },
  };

  return {
    runAsync: async function run(callbackFn, index = 0) {
      const iterable = pipe.getLastIterable();
      const { done, value } = await iterable.next();
      if (done) {
        timeOutsList.reset();
        pipe.response.length = index;
        callbackFn && callbackFn({ done, value: pipe.response });
        return;
      } else {
        pipe.response[index] = value;
      }
      timeOutsList.add(setTimeout(run, 0, callbackFn, ++index));
    },
    async *runAsSaga({ callbackEffect, callbackArguments = [] }) {
      const iterable = pipe.getLastIterable();
      while (true) {
        const { done } = iterable.next();
        if (done) {
          timeOutsList.reset();
          yield callbackEffect && callbackEffect(pipe.response, ...callbackArguments);
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    },
    filter(callbackFn) {
      const iterator = pipe.getLastIterable();
      pipe.add(createIterator(iterator, 'filter', callbackFn));
      return this;
    },
    map(callbackFn) {
      const iterator = pipe.getLastIterable();
      pipe.add(createIterator(iterator, 'map', callbackFn));
      return this;
    },
    effect(callbackFn) {
      const iterator = pipe.getLastIterable();
      pipe.add(createIterator(iterator, 'effect', callbackFn));
      return this;
    },
    getPipeLine() {
      // If looking to run the generators-pipeline manually
      return pipe.getLastIterable();
    },
    stopPipeLine() {
      timeOutsList.cancelAll();
    },
  };
};
