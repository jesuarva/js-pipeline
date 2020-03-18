const pipeline = require('./Pipeline');

const arr = new Array(10000);

for (let i = arr.length; i >= 0; i--) {
  arr[i] = i;
}

pipeline(arr)
  .filter(item => item % 2 === 0 && item % 4 === 0)
  .map(item => `item ${item}`)
  .effect(console.log)
  .runAsync(response => console.log(response.value.length));
