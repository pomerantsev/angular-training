Let's add isolate scope and transclusion!
```
<head>
  <script>
    angular.module('app', [])
      .directive('transcludeIt', function () {
        return {
          transclude: true,
          scope: {},
          template: '<div ng-transclude></div>'
        };
      })
      .run(function ($rootScope) {
        $rootScope.message = 'Hello!';
      });
  </script>
</head>
<body ng-app="app"><transclude-it>{{message}}</transclude-it></body>
```

* calls: `compile(element)`
  * defined: `function compile(compileNodes)`
    * calls: `var compositeLinkFn = compileNodes($compileNodes, undefined, $compileNodes)`
      * defined: `function compileNodes(nodeList, transcludeFn, $rootElement)`
        * param: both `nodeList` and `$rootElement` are the jqLite-wrapped body element
        * calls: `childLinkFn = compileNodes(childNodes)`
          * defined: `function compileNodes(nodeList)`
            * param: `nodeList` is the wrapped `transclude-it` element
            * calls: `nodeLinkFn = applyDirectivesToNode(directives, nodeList[0], attrs, undefined, undefined, null, [], [])`
              * defined: `function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns)`
                * param: `directives` is an array containing the `transcludeIt` directive object.
                * calls: `$template = jqLite(jqLiteClone(compileNode)).contents()` - cloning the contents of the node that has a `transclude: true` property.
                * calls: `$compileNode.empty()` - emptying the contents of the node. This happens before the node is compiled, because on the next step we will be compiling the template on its own.
                * calls: `childTranscludeFn = compile($template)` - returns a linking function for the `'{{message}}'` text node.
                * calls: `$compileNode.html(directiveValue)` - inserting `<div ng-transclude></div>` into the `transclude-it` element.
                * calls: `nodeLinkFn.scope = false` - this property seems to be set to `true` only if scope is non-isolate.
                * calls: `nodeLinkFn.transclude = childTranscludeFn` - `transclude` is essentially the linking function of the former contents of the element.
                * returns: `nodeLinkFn`
            * calls: `childLinkFn = compileNodes(childNodes, nodeLinkFn.transclude)`
              * defined: `function compileNodes(nodeList, transcludeFn)`
                * param: `nodeList` is `<div ng-transclude></div>`
                * param: `transcludeFn` is the public linking function of `'{{message}}'`
                * calls: `nodeLinkFn = applyDirectivesToNode(directives, nodeList[0], attrs, transcludeFn, undefined, null, [], [])`
                  * defined: `function applyDirectivesToNode(...)`
                    * calls: `addLinkFns(null, linkFn)` - `linkFn` here is the linking function of `ngTransclude` directive.
                    * calls: `nodeLinkFn.transclude = childTranscludeFn` - assigning the `transclude` property of this `nodeLinkFn` the same value as one level above - the linking function of `'{{message}}'`
                    * returns: `nodeLinkFn`
                * calls: `childLink = null`, since this element doesn't have any children.
                * returns: `compositeLinkFn`
            * returns: `compositeLinkFn`
        * returns: `compositeLinkFn`
    * returns: `function publicLinkFn`
* calls: `compile(element)(scope)`
  * defined: `function publicLinkFn(scope)`
    * calls: `compositeLinkFn(scope, $linkNode, $linkNode)`
      * defined: `function compositeLinkFn(scope, nodeList, $rootElement)`
        * param: `nodeList` and `$rootElement` equal the jqLite-wrapped `body` element.
        * calls: `childLinkFn(scope, node.childNodes)`
          * defined: `function compositeLinkFn(scope, $linkNode)`
            * param: `scope` is `$rootScope`
            * param: `$linkNode` is a `nodeList` containing the `transclude-it` element.
            * calls: [`childBoundTranscludeFn = createBoundTranscludeFn(scope, nodeLinkFn.transclude)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L979)
              * defined: [`function createBoundTranscludeFn(scope, transcludeFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1000)
                * returns: `boundTranscludeFn`
            * calls: `nodeLinkFn(childLinkFn, childScope, node, undefined, childBoundTranscludeFn)`
              * defined: `function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn)`
                * param: `childLinkFn` is the composite linking function of the children of `transclude-it` (currently `<div ng-transclude></div>`).
                * param: `scope` === `$rootScope`
                * param: `linkNode` is the unwrapped `transclude-it`
                * param: `boundTranscludeFn` is the function returned by `createBoundTranscludeFn`
                * calls: `isolateScope = scope.$new(true)` - creating an isolate scope
                * calls: `transcludeFn = boundTranscludeFn && controllersBoundTransclude` - assigning `controllersBoundTransclude` to `transcludeFn`. `controllersBoundTransclude` is yet another function that eventually calls `boundTranscludeFn`.
                * calls: `childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn)`
                  * defined: `function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn)`
                    * param: `scope` is the isolate scope of `transclude-it`
                    * param: `nodeList` is `<div ng-transclude></div>`
                    * param: `$rootElement` is undefined
                    * param: `parentBoundTranscludeFn` is the function returned by `createBoundTranscludeFn`
                    * calls: `childBoundTranscludeFn = parentBoundTranscludeFn` - the bound transclude function gets passed from parent to child until some element does something with it.
                    * calls: `nodeLinkFn(undefined, childScope, node, undefined, childBoundTranscludeFn)`
                      * defined: `function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn)`
                        * param: `childLinkFn` === `undefined`
                        * param: `scope` is the isolate scope
                        * param: `linkNode` is `<div ng-transclude></div>`
                        * param: `boundTranscludeFn` is the same transclude function as on the previous step.
                        * calls: `transcludeFn = boundTranscludeFn && controllersBoundTransclude` - same as on previous step.
                        * Q: why does the `postLinkFns` array have three elements?
                        * calls: `linkFn(scope, $element, attrs, undefined, transcludeFn)`
                          * defined: [`function($scope, $element, $attrs, controller, $transclude)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/directive/ngTransclude.js#L59)
                            * calls: `$transclude(function (clone) {...})`
                              * defined: [`function controllersBoundTransclude(scope, cloneAttachFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1615)
                                * param: the first parameter is treated as `cloneAttachFn` if there's only one parameter. It is the function passed to `$transclude`.
                                * calls: `boundTranscludeFn(undefined, cloneAttachFn)`
                                  * defined: [`function(transcludedScope, cloneFn)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1002)
                                    * param: `cloneFn` is the function passed to `$transclude`
                                    * calls: `transcludedScope = scope.$new()` - creating a child of `$rootScope`
                                    * calls: `var clone = transcludeFn(transcludedScope, cloneFn)`, where transcludeFn is the public linking function of the `'{{message}}'` node, and `cloneFn` is the function passed here from `ng-transclude`'s linking function
                                      * defined: `function publicLinkFn(scope, cloneConnectFn)`
                                        * param: `scope` is the transcluded scope (child of `$rootScope`)
                                        * calls: `var $linkNode = JQLitePrototype.clone.call($compileNodes)` - cloning the `'{{message}}'` span (it became a `span` when `compile()` was called on this node). Now `$linkNode` is not equal to `$compileNodes`.
                                        * calls: `cloneConnectFn($linkNode, scope)`
                                          * defined: [`function (clone)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/directive/ngTransclude.js#L68). It empties the element and attaches the cloned node instead.
                                        * calls: `compositeLinkFn(scope, $linkNode, $linkNode)` - the interpolate linking function sets a `$watch` during this call, as usual
                                        * returns: `$linkNode` - the newly created clone.
                                    * returns: `clone` - the newly created clone.
                                * returns: the same clone. The returned value doesn't seem to be used here.
                        * !!! Same thing is repeated twice more (there seem to be two copies of the same linking function)
* Compile and link phases are completed.
