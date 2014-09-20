var assert = require('assert');

var memoize = function (func) {
  var memoized = function () {
    var key = '' + arguments[0];
    if (memoized.cache.hasOwnProperty(key)) {
      return memoized.cache[key];
    } else {
      var result = memoized.cache[key] = func.apply(this, arguments);
      return result;
    }
  };
  memoized.cache = {};
  return memoized;
};







var assertions = [
  function () {
    var counter = 0;
    var func = function (x) {
      counter++;
      return x * 2;
    };
    var memoizedFunc = memoize(func);

    // First call
    assert.equal(memoizedFunc(1), 2);
    assert.equal(counter, 1);

    // Second call
    assert.equal(memoizedFunc(1), 2);
    assert.equal(counter, 1);

    // Third call with a different argument
    assert.equal(memoizedFunc(2), 4);
    assert.equal(counter, 2);
  },
  function () {
    // It treats strings and integers as the same argument
    var counter = 0;
    var func = function (x) {
      counter++;
      return x + 1;
    };
    var memoizedFunc = memoize(func);

    // First call
    assert.equal(memoizedFunc(1), 2);

    // Second call - wrong result
    assert.equal(memoizedFunc('1'), 2);

    assert.equal(counter, 1);
  }
];

assertions.forEach(function (assertion) {
  assertion();
});
