The html looks like this:
```
<head>
  <script>
    angular.module('app', [
      'ngRoute'
    ])
      .config(function ($routeProvider) {
        $routeProvider
          .when('/', {
            template: 'Hello'
          });
      });
  </script>
</head>
<body ng-app="app" ng-view></body>
```

* calls: `compile(element)`
  * defined: `function compile($compileNodes)`
    * calls: `var compositeLinkFn = compileNodes($compileNodes, undefined, $compileNodes)`
      * defined: `function compileNodes(nodeList, transcludeFn, $rootElement)`
        * calls: `directives = collectDirectives(nodeList[0], [], attrs)` - returns the two directives that were registered as `ngView`
        * calls: `nodeLinkFn = applyDirectivesToNode(directives, nodeList[0], attrs, undefined, $rootElement, null, [], [])`
          * defined: `function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns)`
            * param: `directives` is a two-directive array
            * param: `compileNode` is the unwrapped `body`
            * param: `templateAttrs` contains `ngApp` and `ngView` attributes.
            * param: `jqCollection` is the jqLite-wrapped body element.
            * param: `preLinkFns` and `postLinkFns` are empty arrays.
            * loops over both directives
              * i = 0
                * calls: `childTranscludeFn = compile($template, undefined, 400, null, {nonTlbTranscludeDirective: nonTlbTranscludeDirective})`
                  * defined: `function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext)`
                    * param: `$compileNodes` is the jqLite-wrapped body node (or its clone - have not figured that out).
                    * param: `maxPriority` === `400`
                    * param: `previousCompileContext` is an object with a `nonTlbTranscludeDirective` property equal to the first of the two `ngView` directive factories.
                    * calls: `var compositeLinkFn = compileNodes($compileNodes, undefined, $compileNodes, 400, null, {nonTlbTranscludeDirective: nonTlbTranscludeDirective})`
                      * defined: `function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext)`
                        * calls: `directives = collectDirectives(nodeList[0], [], attrs, 400)` - returns only one directive (the one with the negative priority) since the `maxPriority` param is passed this time.
                        * calls: `nodeLinkFn = applyDirectivesToNode(directives, nodeList[0], attrs, undefined, $rootElement, null, [], [], {nonTlbTranscludeDirective: nonTlbTranscludeDirective})`
                          * defined: `function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext)`
                            * param: `directives` now has a single, low-priority directive
                            * param: `compileNode` is the unwrapped body
                            * param: `templateAttrs` still has `ngApp` and `ngView` attributes
                            * param: `jqCollection` is the jqLite-wrapped `body`
                            * param: `previousCompileContext` is the object that contains the high-priority directive factory.
                            * calls: `addLinkFns(null, linkFn)` - adds the low-priority directive's linking function to the array.
                            * returns: `nodeLinkFn`
                        * calls: `childLinkFn = compileNodes(childNodes)` - only called here because `childNodes` contains a single empty text node.
                        * returns: `compositeLinkFn`
                    * returns: `function publicLinkFn`
                * calls: `addLinkFns(null, linkFn)`
                * calls: `nodeLinkFn.terminal = true`
              * i = 1
                * calls: `if (terminalPriority > directive.priority) break`
            * returns: `nodeLinkFn`
        * calls: `childLinkFn = null`
        * returns: `compositeLinkFn`
    * returns: `function publicLinkFn`
* calls: `compile(element)(scope)`
  * defined: `function publicLinkFn(scope)`
    * param: `scope` === `$rootScope`
    * calls: `compositeLinkFn(scope, $linkNode, $linkNode)`
      * defined: `function compositeLinkFn(scope, nodeList, $rootElement)`
        * param: `scope` === `$rootScope`
        * param: `nodeList` and `$rootElement` is a comment (!!!): `'<!-- ngView: -->'` - it was replaced inside [`applyDirectivesToNode`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1276-1280)
        * calls: `childBoundTranscludeFn = createBoundTranscludeFn(scope, nodeLinkFn.transclude)`
          * defined: `function createBoundTranscludeFn(scope, transcludeFn)`
            * param: `scope` === `$rootScope`
            * param: `transcludeFn` is the transclude linking function returned by the `compile` function with `maxPriority === 400` (that compiled only low-priority `ng-view` directive)
            * returns: `boundTranscludeFn`
        * calls: `nodeLinkFn(null, childScope, node, $rootElement, childBoundTranscludeFn)`
          * defined: `function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn)`
            * param: `scope` === `$rootScope`
            * param: `linkNode` and `$rootElement` are both the `ng-view` comment
            * param: `boundTranscludeFn` is the transclude linking function
            * calls: `linkFn(scope, $element, attrs, undefined, transcludeFn)`
              * defined: [`function (scope, $element, attr, ctrl, $transclude)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ngRoute/directive/ngView.js#L189)
                * param: `scope` === `$rootScope`
                * param: `$element` is the `ng-view` comment
                * param: `attr` is the attributes from the `body` element
                * param: `$transclude` is a function that executes the transclude linking function of the high-priority directive
                * `template` is undefined at the moment (because `ngRoute` loads the template during the first $digest), so this time the link function does nothing
* Fires the `$digest` cycle. From inside the `$digest` cycle (when looping through `asyncQueue`), `$routeChangeSuccess` event is broadcasted, and then the `update` function from the first directive's link function is called.
  * defined: [`function update()`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ngRoute/directive/ngView.js#L217)
    * calls: `var newScope = scope.$new()` - creates a child scope of `$rootScope`
    * calls: `var clone = $transclude(newScope, function (clone) { ... })`
      * defined: `function controllersBoundTransclude(scope, cloneAttachFn)`
        * param: `scope` is a child of `$rootScope`
        * calls: `boundTranscludeFn(scope, cloneAttachFn, {})`
          * defined: `function(transcludedScope, cloneFn, controllers)`
            * calls: `var clone = transcludeFn(transcludedScope, cloneFn, controllers)`
              * defined: `function publicLinkFn(scope, cloneConnectFn, transcludeControllers)`
                * param: `scope` is the same child of `$rootScope`
                * param: `cloneConnectFn` is the function passed into `$transclude` in the `ngView` link function
                * param: `transcludeControllers` is an empty object.
                * calls: `var $linkNode = JQLitePrototype.clone.call($compileNodes)` - here `$compileNodes` is the jqLite-wrapped `body`
                * calls: `cloneConnectFn($linkNode, scope)`
                  * defined: [`function (clone)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ngRoute/directive/ngView.js#L231)
                    * param: `clone` is the jqLite-wrapped cloned `body` tag.
                    * Inside this function the `ngView` comment gets replaced with the cloned `body` tag (possibly an animation starts).
                * calls: `compositeLinkFn(scope, $linkNode, $linkNode)`
                  * defined: `function compositeLinkFn(scope, nodeList, $rootElement)`
                    * param: `scope` is the child of `$rootScope`
                    * param: `nodeList` and `$rootElement` are both the cloned `body` element
                    * calls: `nodeLinkFn(null, childScope, node, $rootElement)`
                      * defined: `nodeLinkFn(childLinkFn, scope, linkNode, $rootElement)`
                        * param: `linkNode` is the unwrapped `body`
                        * param: `$rootElement` is the wrapped `body`
                        * calls: `linkFn(scope, $element, attrs)`
                          * defined: [`function (scope, $element)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ngRoute/directive/ngView.js#L263)
                            * param: `scope` is the child of `$rootScope`
                            * param: `$element` is the wrapped `body`
                            * calls: `$element.html(locals.$template)` - replacing the contents of the cloned `body` with `'Hello!'` (or is it not the cloned `body`? - Q)
                            * Then the contents of `ngView` are being compiled and linked inside this function.
                * returns: `$linkNode` (`body` with the compiled and linked contents)
        * returns: `clone` (the same `body` node)
    * Then the `$digest` cycle continues.
