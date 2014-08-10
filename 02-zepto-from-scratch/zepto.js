// Should be able to select a collection
// and perform a .find() method.

var Zepto = (function () {
  var zepto = {},
      emptyArray = [],
      classCache = {},
      // Q: What do the exclamation point and the caret mean in this regexp?
      // A: The exclamation point is the literal exclamation point.
      // The caret means 'not' if it's the first symbol in [].
      fragmentRE = /^\s*<(\w+|!)[^>]*>/,
      // Used for converting self-closing tags (<div/>) into a pair of tags.
      tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
      // special attributes that should be got/set via method calls
      methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
      table = document.createElement('table'),
      tableRow = document.createElement('tr'),
      containers = {
        tr: document.createElement('tbody'),
        tbody: table,
        thead: table,
        tfoot: table,
        td: tableRow,
        th: tableRow,
        '*': document.createElement('div')
      },
      readyRE = /complete|loaded|interactive/,
      class2type = {},
      toString = class2type.toString,
      slice = emptyArray.slice,
      filter = emptyArray.filter,
      isArray = Array.isArray ||
        function (object) {
          return object instanceof Array;
        };

  'Boolean Number String Function Array Date RegExp Object Error'.split(' ').forEach(function (name) {
    class2type['[object ' + name + ']'] = name.toLowerCase();
  });

  function type (obj) {
    // Q: why are we calling class2type.toString.call(obj)
    // instead of simply obj.toString() ?
    // A: because when we call toString() on an object
    // or Object.prototype, we get a string '[object String]' (for instance),
    // and when we call it on an array or a string, the output is surely
    // different :).
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || 'object';
  }

  function isFunction (value) {
    return type(value) === 'function';
  }

  function isWindow (obj) {
    return obj != null && obj === obj.window;
  }

  function isDocument (obj) {
    // Simply checking if obj === document doesn't work
    // with iframes (we have several documents).
    return obj && obj.nodeType === obj.DOCUMENT_NODE;
  }
  function isObject (obj) {
    // Same thing here: with iframes, checking if
    // obj instanceof Object will yield false negatives.
    return type(obj) === 'object';
  }

  function isPlainObject (obj) {
    return isObject(obj) &&
      !isWindow(obj) &&
      Object.getPrototypeOf(obj) === Object.prototype;
  }

  function likeArray (obj) {
    return typeof obj.length === 'number';
  }

  function compact (array) {
    // Q: why not call array.filter(function (...) {...}) ?
    // Are we also dealing with some array-like objects here
    // that may have redefined filter() method?
    // A: yes, filter may be undefined on array-like objects.
    return [].filter.call(array, function (item) {
      return item != null;
    });
  }

  function flatten (array) {
    // Q: why can't we simply return $.fn.concat.apply([], array) ?
    // A: this function's argument is meant to be either an array
    // or an object. If it's an object, concat() would always
    // return an empty array.
    // It would probably be clearer if the argument was called 'obj',
    // and the if statement was 'if (likeArray(obj))'.
    if (array.length > 0) {
      // concat.apply is used here because this way the array in question
      // is treated as an array of arguments to the concat function,
      // this way being flattened.
      return $.fn.concat.apply([], array);
    } else {
      return array;
    }
  }

  function classRE (name) {
    // Q: could we instead use if (classCache[name])?
    // Is it faster this way or more reliable?
    // A: here, we could use these two interchangeably.
    if (name in classCache) {
      return classCache[name];
    } else {
      // We could return the new RegExp instead every time,
      // but this solution that uses cache is probably more memory-efficient.
      return classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
    }
  }

  zepto.fragment = function (html, name, properties) {
    var dom, nodes, container;

    // Expanding self-closing tags.
    html.replace(tagExpanderRE, '<$1></$2>');

    if (!(name in containers)) {
      name = '*';
    }

    // Placing the element(s) in the correct container (for example,
    // a <td> cannot have a <div> as a parent - it will be interpreted
    // as a text node instead of a <td>).
    container = containers[name];
    // Here the actual transformation from string to a DOM fragment happens.
    container.innerHTML = '' + html;
    // $.each returns the array given to it as the first parameter.
    // Removing elements from the container probably to prevent memory leaks.
    dom = $.each(slice.call(container.childNodes), function () {
      container.removeChild(this);
    });

    if (isPlainObject(properties)) {
      nodes = $(dom);
      $.each(properties, function (key, value) {
        if (methodAttributes.indexOf(key) > -1) {
          nodes[key](value);
        } else {
          nodes.attr(key, value);
        }
      });
    }

    return dom;
  };

  // This method is responsible for setting the prototype
  // for a dom fragment or an array of nodes to $.fn,
  // and for setting its 'selector' property.
  // This means that we can always chain method calls.
  zepto.Z = function (dom, selector) {
    // We should always return a zepto.Z object, so dom
    // shouldn't be null or undefined.
    dom = dom || [];
    dom.__proto__ = $.fn;
    dom.selector = selector || '';
    return dom;
  };
  // Q: let var a = [1, 2, 3]; a.__proto__ = { key: 'value' };
  // Why Array.isArray(a) === true ?

  zepto.isZ = function (object) {
    return object instanceof zepto.Z;
  };

  // This method is being called whenever $(...) is called.
  // It always returns a zepto.Z object (an array with special
  // properties and methods).
  zepto.init = function (selector, context) {
    var dom;
    // Making sure that $() is a chainable object.
    if (!selector) {
      return zepto.Z();
    } else if (typeof selector === 'string') {
      if (selector[0] === '<' && fragmentRE.test(selector)) {
        // In this case, context is treated as a parameters object:
        // set any named attributes or special attributes (like val, css...)
        // on each resultant element.
        dom = zepto.fragment(selector, RegExp.$1, context);
        selector = null;
      } else if (context !== undefined) {
        // Since context might be either a string or an object,
        // we cannot simply call zepto.qsa(context, selector) here.
        return $(context).find(selector);
      } else {
        dom = zepto.qsa(document, selector);
      }
    } else if (isFunction(selector)) {
      return $(document).ready(selector);
    // If selector is already a zepto.Z object, return it.
    } else if (zepto.isZ(selector)) {
      return selector;
    } else {
      if (isArray(selector)) {
        // Remove elements that are null or undefined,
        // and eventually make it a zepto.Z object.
        dom = compact(selector);
      } else if (isObject(selector)) {
        // If it's an object, it's perhaps an unwrapped Element.
        // Making it a single-element array.
        // Q: but why is its selector set to null?
        dom = [selector];
        selector = null;
      // Q: if selector is neither an array, nor an object, nor a string,
      // what can it be? A document fragment?
      // A: this is not clear, but probably the library tries to wrap
      // anything in a Z object if it can't deal with it otherwise.
      // Running tests in Zepto doesn't shed the light on this either.
      } else if (context !== undefined) {
        return $(context).find(selector);
      } else {
        dom = zepto.qsa(document, selector);
      }
    }
    return zepto.Z(dom, selector);
  };

  var $ = function (selector, context) {
    return zepto.init(selector, context);
  };

  $.map = function(elements, callback){
    var value,
        values = [],
        i,
        key;
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i);
        if (value != null) {
          values.push(value);
        }
      }
    } else {
      for (key in elements) {
        value = callback(elements[key], key);
        if (value != null) {
          values.push(value);
        }
      }
    }
    // Q: what's the point in flattening the array?
    // Cannot each value returned by the callback be an array?
    // A: the reason for that is probably the way find() uses map()
    // (we need the result of find() to be flattened if the
    // context array contains multiple elements).
    return flatten(values);
  }

  $.each = function (elements, callback) {
    var i, key;
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++) {
        if (callback.call(elements[i], i, elements[i]) === false) {
          return elements;
        }
      }
    } else {
      for (key in elements) {
        if (callback.call(elements[key], key, elements[key]) === false) {
          return elements;
        }
      }
    }
    return elements;
  }

  zepto.qsa = function (element, selector) {
    if (element.nodeType !== 1 && element.nodeType !== 9) {
      return [];
    } else {
      // Q: why aren't we simply returning element.querySelectorAll(selector) ?
      // Why do we need the returned value to be an instance of Array?
      // A: probably so.
      return slice.call(element.querySelectorAll(selector));
    }
  };

  $.contains = function (parent, node) {
    return parent !== node && parent.contains(node);
  };

  function funcArg (context, arg, index, payload) {
    return isFunction(arg) ? arg.call(context, index, payload) : arg;
  }

  function className(node, value) {
    if (value === undefined) {
      return node.className;
    } else {
      node.className = value;
    }
  }

  $.fn = {
    concat: emptyArray.concat,
    eq: function (idx) {
      // Always returns only one element.
      if (idx === -1) {
        return this.slice(idx);
      } else {
        return this.slice(idx, idx + 1);
      }
    },
    find: function (selector) {
      var result, $this = this;
      // Q: why are we not returning zepto.Z(), but a simple Array?
      // Shouldn't something like $('.class1').find() be chainable
      // for the sake of consistency?
      // A: ???
      if (!selector) {
        result = [];
      // If the selector is an object or an array.
      // Q: does this mean that we are expecting a single node,
      // an array of nodes, or a zepto.Z object? Can there be anything else?
      // A: probably so.
      } else if (typeof selector === 'object') {
        result = $(selector).filter(function () {
          var node = this;
          // If any of the nodes contained in the caller array
          // is a parent to the element of the $(selector) array,
          // then the filter() method returns true, and thus
          // this element is preserved in the result.
          return emptyArray.some.call($this, function (parent) {
            return $.contains(parent, node);
          });
        });
      // Now we're dealing with a String selector.
      } else {
        // Each context element is mapped to the array found on it
        // with querySelectorAll. The result is eventually flattened
        // inside map().
        result = this.map(function () {
          return zepto.qsa(this, selector);
        });
      }
      return result;
    },
    clone: function () {
      return this.map(function () {
        return this.cloneNode(true);
      });
    },
    attr: function (name, value) {
      // !(1 in arguments) means that value is not given.
      // Treating method as a getter.
      if (typeof name === 'string' && !(1 in arguments)) {
        // Trying to get attr only from the first element in the collection.
        var element = this[0];
        if (!this.length || element.nodeType !== 1) {
          return undefined;
        } else {
          var result = element.getAttribute(name);
          // If attribute with the given name is not set on the element (in html),
          // then return the object property with the same name
          // (for example, parentNode).
          if (!result && name in element) {
            return element[name];
          } else {
            return result;
          }
        }
      }
    },
    map: function (fn) {
      // Supplying the object this method was called on to
      // $.map function, and then wrapping the resultant
      // array (making it a zepto.Z instance).
      return $($.map(this, function (el, i) {
        // Calling the callback so that this === el inside of it.
        // Weird, but element and index are swapped here, like in jQuery.
        return fn.call(el, i, el);
      }));
    },
    slice: function () {
      // This version of slice returns a zepto.Z instance.
      return $(slice.apply(this, arguments));
    },
    ready: function (callback) {
      if (readyRE.test(document.readyState)) {
        callback();
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          callback();
        // In modern browsers, useCapture is false by default.
        // Parameter used here for compatibility with older browsers.
        }, false);
      }
      // Making this method chainable.
      return this;
    },
    remove: function () {
      return this.each(function () {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      });
    },
    each: function (callback) {
      // This construct means that we need to execute the callback
      // on each element of the collection, but if it returns false
      // for one of the elements, the execution stops.
      // The method always returns the same collection, unaltered.
      emptyArray.every.call(this, function (element, index) {
        return callback.call(element, index, element) !== false;
      });
      return this;
    },
    hasClass: function (name) {
      return emptyArray.some.call(this, function (el) {
        return this.test(className(el));
      // Array.prototype.some takes an optional second argument
      // which is the this object inside the callback.
      // Here it is a regexp like /(^|\s)some-class-name(\s|$)/
      }, classRE(name));
    },
    addClass: function (name) {
      return this.each(function (index) {
        classList = [];
        // Current class of the element.
        var cls = className(this),
            // If name is a function, it gets called with (index, cls) parameters.
            newName = funcArg(this, name, index, cls);
        newName.split(/\s+/g).forEach(function (klass) {
          if (!$(this).hasClass(klass)) {
            classList.push(klass);
          }
        }, this);
        // Otherwise we would add a space to the end of the class list.
        if (classList.length) {
          // Using className as a setter to set the element's class name.
          className(this, cls + (cls ? ' ' : '') + classList.join(' '));
        }
      });
    },
    removeClass: function (name) {
      return this.each(function (index) {
        // Remove all classes if there's no parameter.
        if (name === undefined) {
          className(this, '');
        } else {
          // Strange that it's not named cls, like in addClass().
          classList = className(this);
          funcArg(this, name, index, classList).split(/\s+/g).forEach(function (klass) {
            classList = classList.replace(classRE(klass), ' ');
          });
          className(this, classList.trim());
        }
      });
    },
    toggleClass: function (name, when) {
      return this.each(function (index) {
        var $this = $(this),
            names = funcArg(this, name, index, className(this));
        names.split(/\s+/g).forEach(function (klass) {
          if (when === undefined ? !$this.hasClass(klass) : when) {
            $this.addClass(klass);
          } else {
            $this.removeClass(klass);
          }
        });
      });
    }
  };

  // if zepto.Z.prototype === $.fn, then:
  // if obj.__proto__ === $.fn, then obj instanceof zepto.Z
  // (by definition of instanceof operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
  zepto.Z.prototype = $.fn;
  return $;
})();

window.Zepto = Zepto;
window.$ = Zepto;
