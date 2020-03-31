const Pipeline = require('../Pipeline');

const arr = new Array(100);

for (let i = arr.length; i >= 0; i--) {
  arr[i] = i;
}

Pipeline(arr)
  .filter((item: any) => item % 2 === 0 && item % 10 === 0)
  .map((item: any) => `Pipeline-1 ${item}`)
  .effect((value: any) => console.log(value))
  .runAsync((response: { value: any; done: boolean }) =>
    console.log('Pipeline-1 last callbackFn', response),
  );

Pipeline(arr)
  .filter((item: any) => item % 3 === 0 && item % 30 === 0)
  .map((item: any) => `Pipeline-2 ${item}`)
  .effect((value: any) => console.log(value))
  .runAsync((response: { value: any; done: boolean }) =>
    console.log('Pipeline-2 last callbackFn', response),
  );

Pipeline(arr)
  .filter((item: any) => item % 3 === 0 && item % 30 === 0)
  .map((item: any, index: number) => `Pipeline-3 ${item}. index-${index}`)
  .effect((value: any) => console.log(value))
  .runAsync((response: { value: any; done: boolean }) =>
    console.log('Pipeline-3 last callbackFn', response),
  );
