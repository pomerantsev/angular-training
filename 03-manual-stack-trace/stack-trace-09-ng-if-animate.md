```html
<!doctype html>
<head>
  <style>
    .disappearing-div {
      width: 100px;
      height: 100px;
      background-color: black;
      transition: 5s linear all;
    }
    .disappearing-div.ng-leave.ng-leave-active {
      opacity: 0;
    }
  </style>
  <script src="bower_components/angular/angular.js"></script>
  <script src="bower_components/angular-animate/angular-animate.js"></script>
  <script>
    angular.module('app', [
      'ngAnimate'
    ]).run(function ($rootScope, $animate) {
      var element = angular.element(document.querySelector('.disappearing-div')),
          currentAnimation;
      $rootScope.hide = function () {
        currentAnimation = $animate.leave(element);
      };
      $rootScope.cancelAnimation = function () {
        if (currentAnimation) {
          $animate.cancel(currentAnimation);
        }
      };
    });
  </script>
</head>
<body ng-app="app">
  <div><a href ng-click="hide()">Hide</a></div>
  <div class="disappearing-div"></div>
  <div><a href ng-click="cancelAnimation()">Cancel Animation</a></div>
</body>
```

During application bootstrap:
- `$AnimateProvider` is registered in the Angular core. `this.$$selectors` is an empty object. These are the selectors by which the elements will be looked up (when?).
  - `$AnimateProvider` is a method that registers a factory with the name `'<name>-animation'`.
- The `config` block of `'ngAnimate'` module runs.
  - `var rootAnimateState = {running: true};` - this probably ensures that no animations will run until every template has been loaded and the page is fully ready. Then, in the end of `$$postDigestQueue`, [`rootAnimateState.running` will be set to `false`](http://github.com/angular/angular.js/blob/7cb01a80beec669d8f6aae1dc211d2f0b7d4eac4/src/ngAnimate/animate.js#L418-437).
  - `$provide.decorator('$animate', ...);` - registering the decorator.
  - `$AnimateProvider.register('', ...);` - registering the default animation factory.
- The app's `run` block requires `$animate`, so the original factory and the decorator are invoked:
  - Original factory (`$AnimateProvider.$get`) - returns an object with `enter`, `leave`, etc.
  - Decorator:
    - `var globalAnimationCounter = 0;`
    - Some function declarations (will be used later on).
    - Also returns an object with `enter`, `leave`, etc.
- The `run` block runs and sets necessary properties on the scope (!!! - it runs before the application bootstrap).

When the `Hide` link is pressed:
- `$animate.leave(element)` is called by the scope method.
  - `this.enabled(false, element)` - it calls `element.data(NG_ANIMATE_STATE, data);` where data has a `disabled === true` attribute (what for?).
  - calls `runAnimationPostDigest(function (done) { ... })` - where inside the callback it calls `performAnimation`. `runAnimationPostDigest` is declared in the decorator.
    * `fn` === `function (done) { ... }`
    - pushes a function into the `$$postDigestQueue`: `cancelFn = fn(function () { defer.resolve; });` - which means that during `$$postDigest` the `fn` function will be invoked and as the `done` callback it will resolve the promise.
    - returns a promise (the `$$q` one that doesn't trigger `$rootScope.$digest()`) which also has a non-standard `$$cancelFn` attribute (that is a function which calls the cancelFn that gets a value during `$$postDigest`).
  - returns the same promise (the value that we got from the previous function call).
- assigns the returned promise to `currentAnimation`.

During `$$postDigest`:
- `cancelFn = fn(function () { ... });`
  - calls `performAnimation(...)` - a function registered in the decorator.
    * `animationEvent` === `'leave'`
    * `className` === `'ng-leave'`
    * `element` is the disappearing div.
    * `parentElement` and `afterElement` are `null` (we don't need them for the `leave` animation).
    * `domOperation` is a function which calls `$delegate.leave(element)` (which removes the element from the DOM).
    * `doneCallback` is a function which calls `defer.resolve()`, resolving the promise that was defined in `runAnimationPostDigest`.
    - calls `var runner = animationRunner(element, animationEvent, className);` - `animationRunner` is defined in the decorator. `animationEvent` is `'leave'`, `className` is `'ng-leave'`.
      - `var beforeComplete = noop` - this value is going to be used in animation cancellation.
      - calls `lookup(animationLookup)` - `lookup` is defined in the decorator.
        * `name` === `'.disappearing-div.ng-leave'`
        - calls `$injector.get('-animation');`
          - ... (eventually calls the `'-animation'` factory):
            - returns an object with `enter`, `leave`, etc. methods.
        - pushes the returned value into the `matches` array which was previously empty.
        - returns the `matches` array.
      - calls `var created = registerAnimation(animationFactory, animationEvent);`, where `animationFactory` is the object returned by `'-animate'` factory, and `animationEvent === 'leave'`. `registerAnimation` is a function defined inside `animationRunner()`.
        - `var afterFn = animationFactory['leave'];`
        - `var beforeFn = undefined;`
        - `if (event == 'leave') { beforeFn = afterFn; afterFn = null; }`
        - `before.push({event: 'leave', fn: animationFactory['leave']});` - the `before` array was previously empty.
        - returns `true`.
      - returns an object with info about the animation: `node`, `event`, `className`, `isClassBased`, `before`, `cancel`.
    - `var totalActiveAnimations = 0;`
    - sets a handler for the `$destroy` event (only for the `leave` animation).
    - `element.addClass('ng-animate');`
    - `var localAnimationCount = 0; globalAnimationCounter = 1; totalActiveAnimations = 1;`
    - `runningAnimations['ng-leave'] = runner;` - the object that was returned from `animationRunner()`.
    - `element.data('$$ngAnimateState', {last: runner, active: runningAnimations, index: localAnimationCount, totalActive: totalActiveAnimations});` - where `runningAnimations` is an empty array.
    - calls `fireBeforeCallbackAsync();` - the function is defined in `performAnimation()`
      - calls `fireDOMCallback('before');` - the function is defined in `performAnimation()`
        - since `elementEvents['$animate:before']` is `undefined`, the function does nothing.
    - calls `runner.before(function (cancelled) { ... });` - one of the methods of the object returned by `animationRunner()`.
      * `allCompleteFn` is a function declared inline.
      - `beforeComplete = allCompleteFn`
      - `run(before, [], function () { beforeComplete = noop; allCompleteFn(); });` - `run()` is declared inside `animationRunner()`, and `before` is an array previously populated in `registerAnimation()` with a single object.
        * `fn` === `before`
        * `cancellations` === `[]`
        * `allCompleteFn` === `function () { beforeComplete = noop; allCompleteFn(); }`
        - `var animations` is set equal to `before`
        - `var progress = function () { afterAnimationComplete(index); };`
        - calls `animation.fn(element, progress);`
          - calls `animate('leave', element, 'ng-leave', animationCompleted);` - `animate()` is defined inside the animation factory.
            * `animationEvent` === `'leave'`
            * `className` === `'ng-leave'`
            * `animationComplete` is `function () { afterAnimationComplete(index); };`, where `afterAnimationComplete` is defined inside `run()`, and `index` is `0`.
            - `var preReflowCancellation = animateBefore(animationEvent, element, className);`, where `animateBefore` is defined in the animation factory.
              - calls `animateSetup(animationEvent, ...);` - defined in the animation factory.
                - `element.addClass('ng-leave');`
                - `var timings = {transitionDuration: 5, ...}` - various info about the CSS transition that's going to happen.
                - calls `blockTransitions(node, true);` - sets element's `transitionProperty` property to `none` - what for?
                - returns `true`.
              - returns `function (cancelled) { cancelled && animateClose(element, className); }`
            - `var cancel = preReflowCancellation`
            - calls `afterReflow(element, function () { cancel = animateAfter(animationEvent, element, className, animationComplete); });` - `afterReflow()` is defined inside the animation factory.
              - `animationReflowQueue.push(callback);` - `callback` is the function passed to `afterReflow()`
              - `cancelAnimationReflow = `$$animateReflow(function () { ... });` - passing a callback that calls all the functions in the `animationReflowQueue`. `$$animateReflow` calls `requestAnimationFrame` with the passed callback and returns a cancellation.
            - returns `function (cancelled) { (cancel || noop)(cancelled); }`, where `cancel` is `preReflowCancellation`.
          - returns the result of `animate()` (the function that we got on the previous step).
        - pushes the result from the previous step to the `cancellations` array.
    - returns `runner.cancel`
  - returns the value returned by `performAnimation()` (`runner.cancel`).

In the requestAnimationFrame callback:
- the callback that was passed to `$$animateReflow` is called.
  - calls `fn()`, where `fn` is the function that was passed to `afterReflow()` that's defined inside the animation factory.
    - calls `cancel = animateAfter(animationEvent, element, className, animationComplete);` where `animateAfter` is a function defined in the animation factory, and `animationComplete` is the callback passed to `animation.fn` as `progress` (`function () { afterAnimationComplete(index); }`)
      - calls `animateRun(animationEvent, element, className, afterAnimationComplete)` - where `animateRun` is also defined in the animation factory.
        - sets the element's `transitionProperty` to an empty string (it was previously `'none'`, I don't know why).
        - calls `element.addClass('ng-leave-active');`
        - calls `element.on('webkitAnimationEnd animationend transitionend', onAnimationProgress);` - where onAnimationProgress is a function defined inside `animateRun()`
        - `elementData.closeAnimationFns.push(function () { onEnd(); activeAnimationComplete(); });` - where `elementData` is `element.data['$$ngAnimateCSS3Data']` (an object that has an empty `closeAnimationFns` array), `onEnd` is a function defined in `animateRun()`, and `activeAnimationComplete` is passed to it as a parameter (as `afterAnimationComplete`, previously `progress`).
        - calls `animationCloseHandler(element, totalTime);` - where `animationCloseHandler` is defined in the animation factory, and `totalTime` === 7500 (for some reason, it's 1.5 * `transitionDuration`).
          - sets a timeout to close all animations
        - returns `onEnd`, a function defined inside `animateRun`.
      - returns the result of `animateRun` (`onEnd`).
  - `animationReflowQueue = [];`

When the `transitionend` event is fired:
- `onAnimationProgress` is called (a function defined in `animateRun`).
  - calls `activeAnimationComplete()` (the function previously defined as `progress`).
    - calls `afterAnimationComplete(0);` - a function defined inside `run()`
      - calls the only item in the the `cancellations` array (the one that was pushed there during `run()`)
        - calls `(cancel || noop)(cancelled)`, where `cancel` is the `onEnd` function (defined in `animateRun()`), and `cancelled` is `undefined`.
          - removes classes and event handlers.
          - calls `animateClose()`, defined in the animation factory.
            - removes `data.running` and the whole `'$$ngAnimateCSS3Data'` property from element's `data` since it's no longer required.
      - calls `allCompleteFn();` - a function passed as an inline argument to `run()`.
        - calls `allCompleteFn();` - the only parameter to `runner.before()`
          - calls `fireDOMOperation()` - a function declared in `performAnimation()`
            - calls `domOperation()` - a parameter to `performAnimation()`
              - calls `$delegate.leave(element)` which removes the element from the DOM.
                ***
                The `$destroy` event handler is called:
                - calls `activeLeaveAnimation.cancel()`, where `activeLeaveAnimation` is the `runner` object.
                  - calls `(cancelFn || noop)(true)`, where `cancelFn` is the only item in the `cancellations` array.
                    - it calls `(cancel || noop)(cancelled)` once again, but this time `cancelled` === `true` (but the `onEnd` callback doesn't use its argument anyway).
                      - the method does the same things as previously (performing them on a detached element).
                - calls `cleanup(element, 'ng-leave')` - a function defined inside the decorator.
                  - removes some classes and data from the already detached element.
                ***
          - calls `fireAfterCallbackAsync()` (which is defined in `performAnimation()`).
            - calls `fireDOMCallback('after')` (which does nothing)
          - calls `runner.after(closeAnimation)` (where `closeAnimation` is a function defined in `performAnimation`).
            - calls `run(after, [], function () { afterComplete = noop; allCompleteFn(); });` - where `allCompleteFn is `closeAnimation`
              - calls `allCompleteFn()`
                - calls `allCompleteFn()` (which means `closeAnimation()`).
                  - calls `fireDoneCallbackAsync()` (defined in `performAnimation()`).
                    - calls `fireDOMCallback('close')` (which does nothing).
                    - calls `doneCallback()` (finally!!!) which was passed as a parameter to `performAnimation()`
                      - the function resolves the animation promise that is returned by `$animate.leave()`.

When the timeout callback is called:
- `closeAllAnimations(animationElementQueue);` - a function defined inside the animation factory. `animationElementQueue` contains the animated element.
  - the function does nothing since `element.data.closeAnimationFns` is empty.

If the animation is cancelled:
- `$animate.cancel(currentAnimation);` - `currentAnimation` is the object returned by `$animate.leave(element)`
  - calls `promise.$$cancelFn()` - was set inside `runAnimationPostDigest()`.
    - calls `cancelFn()`, which was previously defined as `progress` - see line 148.
    ...
