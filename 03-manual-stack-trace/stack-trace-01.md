Let's assume that we have the following html:
```
<body ng-app="app">
  <hello></hello>
</body>
```
`hello` directive only defines a template (string "hello").

* [`angularInit(document, bootstrap)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/angular.suffix#L14)
  * `bootstrap` is [`function bootstrap`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1403)
* [`function angularInit(element, bootstrap)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1324)
* [`bootstrap(appElement, [module], config)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1349)
  * `appElement` is the element with `ng-app` attribute.
  * `module` is the value of `ng-app`.
  * `config` is an object that may now contain only the `strictDi` property.
* [`function bootstrap(element, modules, config)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1403)
* [`compile(element)(scope)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/Angular.js#L1427)
  * `compile` is `$compile`, one of the core services.
  * `element` is the `ng-app`'s root element (the first parameter to `bootstrap`).
  * `scope` is `$rootScope`, one of the core services.
  * This means that `compile` should return a callable.
* [`function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L854)
  * `$compileNodes` equals `element` (the root element wrapped in jqLite).
  * All other params are undefined.
  * [`var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L868)
    * `compileNodes` should return a callable.
  * [`function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L916)
    * `nodeList` and `$rootElement` both equal the wrapped root element.
    * Other params are undefined.
    * [`directives = collectDirectives(nodeList[i], [], attrs, maxPriority, ignoreDirective);`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L925)
      * `nodeList[i]` equals the unwrapped root element (`body`).
      * `attrs` is populated with {ngApp: 'app'} during the call to `collectDirectives`.
      * `directives` is assigned an empty array.
    * [`childNodes = nodeList[i].childNodes`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L938)
    * [`childLinkFn = compileNodes(childNodes, transcludeFn)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L937-944)
    * [`function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L916)
      * `nodeList` equals the wrapped `<hello>` element.
      * Other params are undefined.
      * [`directives = collectDirectives(nodeList[i], [], attrs, maxPriority, ignoreDirective)`](https://github.com/angular/angular.js/blob/7884c25643bc6c051436a25ce3680f80094b629c/src/ng/compile.js#L925)
        * `directives` array contains the single 'hello' directive (an object with `restrict`, `link`, etc. properties).
