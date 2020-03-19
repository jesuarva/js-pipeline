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
