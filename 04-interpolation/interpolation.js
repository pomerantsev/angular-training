var assert = require('assert');

function render(template){
  assert(typeof template == 'string');

  var interpolatedTokens = [],
      stringTokens = [],
      match,
      re = /{{([^}}]*)}}/g,
      lastIndex = 0;
  while (match = re.exec(template)) {
    stringTokens.push(template.slice(lastIndex, match.index));
    interpolatedTokens.push(match[1]);
    lastIndex = re.lastIndex;
  }
  stringTokens.push(template.slice(lastIndex));
  return function (context) {
    return stringTokens.reduce(function (previous, current, index) {
      return previous + current +
             (index === stringTokens.length - 1 ? '' : eval('context.' + interpolatedTokens[index]));
    }, '');
  };
}

var tpl = 'blah {{var1}} {{var2.someProp}} bbbb';

console.log(render(tpl)({var1: 'something', var2: {someProp: 'something else'}}));

module.exports = render;
