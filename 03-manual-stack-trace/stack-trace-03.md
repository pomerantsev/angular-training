The HTML is the same:
```
<body ng-app="app">
  <hello></hello>
</body>
```
The `hello` directive simply contains a template (text element).

* defined: [`function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L854-855)
  * param: `$compileNodes` === `jqLite(body)`
  * Other params are undefined.
  * calls: [`var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#868-870)
    * defined: [`function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#916-917)
      * param: `nodeList` === `$rootElement` === `jqLite(body)`
      * Other params are undefined.
      * calls: [`directives = collectDirectives(nodeList[i], [], attrs, i === 0 ? maxPriority : undefined, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#925-926)
        * returns: `[]`
      * calls: [`childLinkFn = compileNodes(childNodes, transcludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#937-944)
        * defined: [`function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#916-917)
          * param: `nodeList` === `[#text, <hello></hello>, #text]` (two text nodes are spaces and line breaks)
          * Other params are undefined.
          * loop: `for (var i = 0; i < nodeList.length; i++)`
            * `i === 0` (`nodeList[i]` is a text node with a line break)
              * calls: [`directives = collectDirectives(nodeList[i], [], attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#925-926)
                * defined: [`function collectDirectives (node, directives, attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#1031)
                  * param: `node` is an unwrapped text node with a line break.
                  * Other params are undefined.
                  * calls: [`addTextInterpolateDirective(directives, node.nodeValue)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#1096) (doesn't do anything since there is nothing to interpolate)
              * calls: [`nodeLinkFn = null`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#928-931)
              * calls: [`childLinkFn = null`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#937-944)
            * `i === 1` (`nodeList[i]` is the `hello` element)
              * calls: [`directives = collectDirectives(nodeList[i], [], attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#925-926)
                * defined: [`function collectDirectives (node, directives, attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#1031)
                  * param: `node` is the unwrapped `hello` node (registered as a directive)
                  * Other params are undefined.
                  * calls: [`addDirective(directives, directiveNormalize(nodeName_(node)), 'E', maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#1040-1041)
                    * defined: [`function addDirective (tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#1654-1655)
                      * param: `tDirectives` === `[]`
                      * param: `name` === `'hello'`
                      * param: `location` === `'E'`
                      * Other params are undefined.
                      * calls: [`tDirectives.push(directive)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#1668) (`directive` is an object that has a `template === 'Hello!'` property and several others (`index`, `name`, `priority`, `require`, `restrict` - all with default values))
                  * returns: an array with a single element (the `hello` directive object).
              * calls: [`nodeLinkFn = applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#928-931)
                * defined: [`function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#1190-1192)
                  * param: `directives` is a single-element array (with the `hello` directive object)
                  * param: `compileNode` is the unwrapped `hello` node.
                  * param: `templateAttrs` is the attributes array for this element (an instance of `Attributes`), which also eventually gets an `$$element` property which is a reference to the jqLite-wrapped node.
                  * param: `preLinkFns` and `postLinkFns` are empty arrays
                  * Other params are null or undefined.
                  * calls: `$compileNode.html(directiveValue)`, where `directiveValue` is the template(`'Hello!'`).
                  * returns: `nodeLinkFn`
                    * defined: [`function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#1454)
              * calls: [`childLinkFn = compileNodes(childNodes, transcludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#937-944) (since now the `hello` element has a text child node)
                * returns: `null`
              * returns: [`compositeLinkFn`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#953)
