var assert = require('assert');

var memoize = function (func) {
  var memoized = function () {
    if (memoized.cache.hasOwnProperty(arguments[0])) {
      return memoized.cache[arguments[0]];
    } else {
      var result = memoized.cache[arguments[0]] = func.apply(null, arguments);
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
  }
];

assertions.forEach(function (assertion) {
  assertion();
});
