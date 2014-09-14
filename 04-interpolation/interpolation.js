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

var tpl;

assert.equal('1', render('{{bar}}')({bar: 1}));

tpl = '{{date.getFullYear()}}-{{date.getMonth()}}-{{date.getDate()}}';
assert.equal('2000-0-1', render(tpl)({date: new Date('2000-01-01')}));

tpl = "{{foo}} | {{foo.bar}} | {{foo.baz()}}";
assert.equal("[object Object] | bat | undefined", render(tpl)({ foo: { bar: 'bat', baz: function(){ } } }));
