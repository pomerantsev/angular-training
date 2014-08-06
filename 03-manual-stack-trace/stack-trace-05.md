Going with the same html:
```
<head>
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

* calls: `compile(element)`
  * defined: `function compile($compileNodes)
    * param: `$compileNodes` is the `body` element
    * calls `var compositeLinkFn = compileNodes($compileNodes, undefined, $compileNodes)`
      * defined: `function compileNodes(nodeList, transcludeFn, $rootElement)`
        * calls: `nodeLinkFn = null`
        * calls: `childLinkFn = compileNodes(childNodes)`
          * defined: `function compileNodes(nodeList)`
            * param: `childNodes` is a jqLite-wrapped array with the `hello` element and a text node
            * calls: `nodeLinkFn = applyDirectivesToNode(directives, nodeList[i], attrs, undefined, undefined, null, [], [])
              * defined: `function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns)`
                * param: `directives` is an array containing the `hello` directive
                * param: `compileNode` is the unwrapped `hello` node.
                * calls: `$compileNode.html(directiveValue)` (replacing the contents of the node with the template)
                * calls: `linkFn = directive.compile($compileNode, templateAttrs)` - getting the linking function
                * calls: `addLinkFns(null, linkFn)` - pushing the linking function to the `postLinkFns` array
                * returns `nodeLinkFn`
            * calls: `childLinkFn = compileNodes(childNodes)`
              * defined: `function compileNodes(nodeList)`
                * param: `nodeList` is `'{{message}}'`
                * calls: `directives = collectDirectives(nodeList[i], [], attrs)` - this returns an interpolation directive for this node
                * calls: `nodeLinkFn = applyDirectivesToNode(directives, nodeList[i], attrs, false, undefined, null, [], [])
                  * defined: `function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns)`
                    * param: `directives` is an array containing the interpolation directive.
                    * param: `compileNode` is the `'{{message}}'` text node.
                    * calls: `linkFn = directive.compile($compileNode)`
                      * defined: `function textInterpolateCompileFn(templateNode)` - sets an `ng-binding` class to the parent of the element (namely, the `hello` element) and returns the linking function
                    * calls: `addLinkFns(null, linkFn)` - adds a single function to `postLinkFns` for this node.
                    * returns: `nodeLinkFn`
                * calls: `childLinkFn = null`
                * returns: `compositeLinkFn`
            * returns: `compositeLinkFn`
        * returns: `compositeLinkFn`
    * returns: `function publicLinkFn`
* calls: `compile(element)(scope)` - `scope` is `$rootScope` here, no additional scopes are created
  * defined: `function publicLinkFn(scope)`
    * calls: `compositeLinkFn(scope, $linkNode, $linkNode)`
      * defined: `function compositeLinkFn(scope, nodeList, $rootElement)` - this function has access to `linkFns` array that contains node link function and child link function for all elements in the `nodeList`. For each node it either calls `nodeLinkFn` if the node itself has any directives on it, or `childLinkFn` (if there are directives somewhere among the node's children)
        * params: `nodeList` and `$rootElement` both point to jqLite-wrapped `body`
        * calls: `childLinkFn(scope, node.childNodes)` (because the `body` element doesn't have any directives on itself)
          * defined: `function compositeLinkFn(scope, nodeList)`
            * param: `nodeList` is the `hello` element plus a nearly empty text element
            * calls: `nodeLinkFn(childLinkFn, childScope, node)`
              * defined: `function nodeLinkFn(childLinkFn, scope, linkNode)`
                * param: `linkNode` is the `hello` element.
                * calls: `childLinkFn(scopeToChild, linkNode.childNodes)`
                  * defined: `function compositeLinkFn(scope, nodeList)`
                    * param: `nodeList` is the `'{{message}}'` text node.
                    * calls: `nodeLinkFn(null, childScope, node)`
                      * defined: `function nodeLinkFn(childLinkFn, scope, linkNode)`
                        * calls: `linkFn(scope, $element, attrs)`
                          * defined: `function textInterpolateLinkFn(scope, node)`
                            * calls: `scope.$watch(interpolateFn, function interpolateFnWatchAction(value) {...})` - the listener function just assigns `node[0].nodeValue = value`, meaning that the whole text node, regardless of the number of interpolated values, gets its value from `interpolateFn`. Setting the `$watch` here is an intricate process involving calling `$watch`, then `$$watchDelegate`, then `$watchGroup`, then `$watch` again. Only then a single `$$watcher` is added to the scope.
                * calls: `linkFn(scope, $element, attrs)` - the `hello` linking function
    * returns: `$linkNode` (jqLite-wrapped `body`)
----Digest cycle----
* calls: [`$rootScope.$digest()`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/rootScope.js#L978)
  * defined: [`function ()`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/rootScope.js#L664)
    * calls: `value = watch.get(current)` - `function addInterceptor` defined in `parse.js` returns `'Hello!'` here.
    * calls: `watch.fn(value, ((last === initWatchVal) ? value : last), current)` - here's where `'{{message}}'` gets substituted with `'Hello'`
    * Everything's clean on the second `$digest` cycle.
