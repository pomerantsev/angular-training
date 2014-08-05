The directive declaration is slightly different today:
```
<head>
  <script src="bower_components/angular/angular.js"></script>
  <script>
    angular.module('app', [])
      .directive('hello', function () {
        return {
          template: '{{message}}',
          link: function (scope) {
            scope.message = 'Hello!';
          }
        };
      });
  </script>
</head>
<body ng-app="app"><hello></hello></body>
```

* calls: [`compile(element)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1427)
  * defined: [`function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L854-855)
    * calls: [`var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L868-870)
      * defined: [`function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L916-917)
        * params: `nodeList` === `$rootElement` === `jqLite(body)`
        * calls: `nodeLinkFn = null`
        * calls: `childLinkFn = compileNodes(childNodes, transcludeFn)`
          * defined: [`function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L916-917)
            * param: `nodeList` is a jqLite-wrapped `hello` element (plus some newline text node)
            * calls: [`directives = collectDirectives(...)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L925-926) - returns an array with a single directive: an object with a compile function that returns a link function, and with a template.
            * calls: [`nodeLinkFn = applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L928-931)
              * defined: [`function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1190-1192)
                * param: `directives` is an array with a single `hello` directive object.
                * param: `compileNode` is the unwrapped `hello` node.
                * param: `templateAttrs` is an empty Attributes object.
                * Other params are undefined.
                * calls: [`$compileNode.html(directiveValue)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1346) - the unaltered template gets inserted inside the `hello` node. Result: `<hello>{{message}}</hello>`.
                * calls: [`linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1369) - getting the link function
                * calls: [`addLinkFns(null, linkFn, attrStart, attrEnd)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1371)
                  * defined: [`function addLinkFns(pre, post, attrStart, attrEnd)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1399)
                    * param: `post` is the `hello` directive link function.
                    * Other params are null or undefined.
                    * calls: [`postLinkFns.push(post)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1416) - adding `linkFn` to the array of postlink function passed to `applyDirectivesToNode`
                * returns: `nodeLinkFn`
                  * defined: [`function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1454)
            * calls: [`childLinkFn = compileNodes(childNodes, transcludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L937-944)
              * defined: [`function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L916-917)
                * param: `childNodes` is a jqLite-wrapped text node: `'{{message}}'`
                * Other params are undefined.
                * calls: [`directives = collectDirectives(nodeList[0], [], attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L925-926)
                  * defined: [`function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1031)
                    * calls: [`addTextInterpolateDirective(directives, node.nodeValue)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1096)
                      * defined: [`function addTextInterpolateDirective(directives, text)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1876)
                        * param: `directives` === `[]`
                        * param: `text` === `'{{message}}'`
                        * calls: `var interpolateFn = $interpolate(text, true);`
                          * defined: [`function $interpolate(text, mustHaveExpression, trustedContext, allOrNothing)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/interpolate.js#L186)
                            * param: `text` === `'{{message}}'`
                            * param: `mustHaveExpression` === `true`
                            * returns: an interpolation function.
                        * calls: [`directives.push({...})`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/interpolate.js#L1879-1898) - adds a 'text interpolate' directive object (with `compile` and `priority === 0` properties) to the text node.
                * calls: [`nodeLinkFn = applyDirectivesToNode(directives, nodeList[0], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L928-931)
                  * defined: [`function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1190-1192)
                    * param: `directives` is an array with a single 'text interpolate' directive object.
                    * param: `compileNode` is a text node, still with `'{{message}}'` text.
                    * param: `templateAttrs` - an empty Attributes object.
                    * Other params are false, null or undefined.
                    * calls: [`linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1369)
                      * defined: [`function textInterpolateCompileFn(templateNode)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1881)
                        * param: `templateNode` is the same `'{{message}}'` text node.
                        * returns: [`function textInterpolateLinkFn(scope, node) {...}`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1887)
                    * calls: [`addLinkFns(null, linkFn, attrStart, attrEnd)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1371) - adds the text interpolate link function to the postLinkFns array for the current node.
                    * returns: `nodeLinkFn`
                * calls: [`childLinkFn = null`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L937-944)
                * returns: `compositeLinkFn`
            * returns: `compositeLinkFn`
        * returns: `compositeLinkFn`
    * returns: `function publicLinkFn ()`
* calls: [`compile(element)(scope)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1427)
  * defined: [`function publicLinkFn(scope, cloneConnectFn, transcludeControllers, parentBoundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L872)
    * param: `scope` === `$rootScope`
    * Other params are undefined.
    * calls: `var $linkNode = $compileNodes` (sets `$linkNode` equal to `jqLite(body)`)
    * calls: [`compositeLinkFn(scope, $linkNode, $linkNode, parentBoundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L887)
      * defined: [`function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L955) - calling `compositeLinkFn` for `body`
        * calls: [`childLinkFn(scope, node.childNodes, undefined, parentBoundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L994)
          * defined: [`function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L955) - calling `compositeLinkFn` for the children of `body` (namely, `hello` and a newline text node).
            * calls: [`nodeLinkFn(childLinkFn, childScope, node, $rootElement, childBoundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L991) - we will not call `childLinkFn` here, we're passing it as a parameter to `nodeLinkFn`
              * defined: [`nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1454)
                * param: `childLinkFn` is the linking function for the contents of `hello` (the `'{{message}}'` node)
                * param: `scope` === `$rootScope`
                * param: `linkNode` is the `hello` node.
                * Other params are undefined.
                * calls: [`childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1601) - calling this after pre-linking, but before post-linking
                  * defined: [`function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L955) - calling `compositeLinkFn` for the children of `hello` (the `'{{message}}'` text node).
                    * param: `scope` === `$rootScope`
                    * param: `nodeList` is the jqLite-wrapped `'{{message}}'` text node
                    * Other params are null or undefined.
                    * calls: [`nodeLinkFn(childLinkFn, childScope, node, $rootElement, childBoundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L991)
                      * defined: [`nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1454)
                        * param: `childLinkFn` is `null`
                        * param: `scope` === `$rootScope`
                        * param: `linkNode` is the `'{{message}}'` text node.
                        * calls: [`linkFn(scope, $element, attrs, undefined, transcludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1607-1608)
                          * defined: [`function textInterpolateLinkFn (scope, node)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1887) - sets a `$watch` on the scope.
                            * param: `scope` === `$rootScope`
                            * param: `node` is the jqLite-wrapped `'{{message}}'` text node.
                * calls: [`linkFn(scope, $element, attrs, undefined, transcludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1607-1608) - the `hello` directive link function that sets `scope.message = 'Hello!'`.
* And then the digest cycle starts. Ta-da!
