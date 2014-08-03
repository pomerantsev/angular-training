Compiling an html fragment:
```
<body ng-app="app">
  <hello></hello>
</body>
```
Where hello is a directive with a template.

* calls: [`angularInit(document, bootstrap)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/angular.suffix#L14)
  * defined: [`function angularInit(element, bootstrap)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1324)
    * param: `element` === `document`
    * param: `bootstrap` === [`function bootstrap`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1403)
    * returns: `undefined`
    * calls: [`bootstrap(appElement, [module], config)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1349)
      * defined: [`function bootstrap(element, modules, config)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1403)
        * param: `element` === `body` (the element which has the `ng-app` attribute)
        * param: `modules` === `['app']` (an array with one string element - the value of `ng-app` attribute)
        * param: `config` === `{strictDi: false}`
        * returns: `injector` (an injector that is created for the given set of modules: created by a call to [`function createInjector`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/auto/injector.js#L609)). Not used in this flow.
        * calls: [`compile(element)(scope)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1427)
          * defined: [`function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L854)
            * param: `$compileNodes` === `jqLite(body)`
            * params: rest of the params are undefined.
            * returns: [`function publicLinkFn`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L872)
            * calls: [`var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L869)
              * defined: [`function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCopileContext)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L916)
                * param: `nodeList` === `jqLite(body)`
                * param: `$rootElement` === `jqLite(body)`
                * params: rest of the params are undefined.
                * returns: a composite linking function.
                * calls: [`directives = collectDirectives(nodeList[i], [], attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L925)
                  * defined: [`function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1031)
                    * param: `node` === `body`
                    * param: `directives` === `[]`
                    * param: `attrs` === `new Attributes()`
                    * param: rest of the params are undefined.
                    * calls: [`addDirective(directives, directiveNormalize(nodeName_(node)), 'E', maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1040-1041)
                      * defined: [`function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1654)
                        * param: `tDirectives` === `[]`
                        * param: `name` === `'body'`
                        * param: `location` === `'E'`
                        * params: rest are undefined.
                        * returns: `null`
                    * calls: [`addAttrInterpolateDirective(node, directives, value, nName)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1077)
                      * defined: [`function addAttrInterpolateDirective(node, directives, value, name)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1932)
                        * param: `node` === `body`
                        * param: `directives` === `[]`
                        * param: `value` === `'app'` (the value of `ng-app` attribute)
                        * param: `name` === `'ngApp'` (the normalized name of the attribute)
                        * returns: `undefined` (since `$interpolate` doesn't return anything)
                    * calls: [`addDirective(directives, nName, 'A', maxPriority, ignoreDirective, attrStartName, attrEndName)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1078-1079)
                      * defined: [`function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName)`](https://github.com/angular/angular.js/tree/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L1654)
                        * param: `tDirectives` === `[]`
                        * param: `name` === `'ngApp'`
                        * param: `location` === `'A'`
                        * params: rest are undefined.
                        * returns: `null` (since `ng-app` is not registered as a directive).
