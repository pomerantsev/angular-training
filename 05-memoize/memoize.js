var assert = require('assert');

var memoizeCache = {};

var memoize = function (func) {
  var key = func.toString();
  memoizeCache[key] = memoizeCache[key] || {};

  return function () {
    if (memoizeCache[key].hasOwnProperty(arguments[0])) {
      return memoizeCache[key][arguments[0]];
    } else {
      var result = memoizeCache[key][arguments[0]] = func.apply(null, arguments);
      return result;
    }
  };
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
