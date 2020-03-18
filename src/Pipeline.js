async function* createIterator(iterator, type, callbackFn) {
  let index = 0;
  for await (const value of iterator) {
    switch (type) {
      case 'filter':
        if (callbackFn(value, index++)) yield value;
        break;
      case 'map':
        yield callbackFn(value, index++);
        break;
      case 'pipe':
        yield callbackFn(value, index++) || value;
        break;
      case 'effect':
        callbackFn(value);
        yield value;
        break;
      default:
        index++;
        yield value;
    }
  }
}

module.exports = function PipeLine(initialIterable) {
  if (Symbol.iterator in initialIterable === false) {
    throw TypeError('PIPELINE: The argument provided is not an `iterable` object');
  }
  const pipe = {
    pipeLine: [initialIterable],
    getLastIterable() {
      const pipeLineLength = this.pipeLine.length;
      return this.pipeLine[pipeLineLength - 1];
    },
    add(iterator) {
      this.pipeLine.push(iterator);
    },
    response: new Array(initialIterable.length),
  };

  const timeOutsList = {
    list: [],
    add(timeOut) {
      this.list.push(timeOut);
    },
    reset() {
      this.list.length = 0;
    },
    cancelAll() {
      this.list.forEach(timeOut => {
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
        return done;
      } else {
        pipe.response[index] = value;
      }
      timeOutsList.add(setTimeout(run, 0, callbackFn, ++index));
    },
    runAsPromise(callbackEffect) {
      return new Promise((resolve, reject) => {
        try {
          this.runAsync(() => {
            callbackEffect && callbackEffect();
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    *runAsSaga(options) {
      const { callbackEffect, argumentsArray, reduxSagaEffects } = options || {};
      const iterable = pipe.getLastIterable();
      while (true) {
        const { done } = iterable.next();
        if (done) {
          timeOutsList.reset();
          yield callbackEffect && callbackEffect(...argumentsArray);
          break;
        }
        yield reduxSagaEffects.delay(1);
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
    asyncEffect(asyncCallbackFn) {
      const iterator = pipe.getLastIterable();
      pipe.add(createIterator(iterator, 'effect', asyncCallbackFn));
      return this;
    },
    pipe(asyncCallbackFn) {
      const iterator = pipe.getLastIterable();
      pipe.add(createIterator(iterator, 'pipe', asyncCallbackFn));
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
