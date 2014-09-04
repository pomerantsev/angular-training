var assert = require('assert');

function render(template, context){
  assert(typeof template == 'string');

  return template.replace(/{{(\S+)}}/g, function (match, prop) {
    return eval('context.' + prop);
  });
}

var tpl = '{{var1}} {{var2.someProp}}';

console.log(render(tpl, {var1: 'something', var2: {someProp: 'something else'}}));

module.exports = render;
