```html
<head>
  <style>
    .disappearing-div {
      transition: 1s linear all;
    }
    .disappearing-div.ng-enter {
      opacity: 0;
    }
    .disappearing-div.ng-enter.ng-enter-active {
      opacity: 1;
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
    ]);
  </script>
</head>
<body ng-app="app">
  <div>
    <a href ng-click="displayElement = !displayElement">Show / hide</a>
  </div>
  <div class="disappearing-div"
       style="width: 100px; height: 100px; background-color: black;"
       ng-if="displayElement">
  </div>
</body>
```
During module loading:
- `$AnimateProvider` is instantiated (`ng/animate.js`).
- It is instantiated with a `$$selectors` object, which is later populated with selectors by which animatable elements should be found. There's also a `register` method which adds items to the `$$selectors` object (the `register` method is what actually gets called when we call `angular.module('...').animation(name, factory)`.
- `ngAnimate`'s config module is run, where a `rootAnimateState` object with a single property `running: true` is created.
- In the same `config` module, `$AnimateProvider.register()` is called, which registers an animation with an empty name (`$$selectors['-animation']`). This in turn registers a factory with $provider which is called `'-animate'`.

During bootstrap:
- `$animate` decorator is called when `$animate` is required (probably by the `ng-if` directive). Inside the decorator:
  - a $watch for `$templateRequest.totalPendingRequests` is set on the $rootScope; when it's 0, it calls `$rootScope.$$postDigest()` twice to eventually set `rootAnimateState.running` to false.
  - `globalAnimationCounter` (the decorator's local variable) is set to 0.
  - the `$animate` decorator returns an object which contains methods `enter`, `leave`, etc.

During the first `$digest` loop:
- since `$templateRequest.totalPendingRequests` is 0, the listener function of the $watch in the decorator is invoked, and the $$postDigests are set up to set `rootAnimateState.running` to false.

When element with `ng-if` should appear (when the corresponding scope value changes):
- `ngIf` directive factory calls `$animate.enter` with params:
  * `element` === the cloned node with `ng-if`
  * `parentElement` === `jqLite(body)`
  * `afterElement` === comment which stands in place of the element while it's absent
  - the original `$animate`'s `enter` method is called.
    - it inserts the element in the necessary place.
    - it returns a promise which will resolve like this (simplified): `requestAnimationFrame(function () { resolve(); });` (the returned value is not used anyway).
  - `runAnimationPostDigest is called with a single parameter:
    * function (done)
    - it adds the parameter function to `$$postDigest`
    - it returns a promise that is going to be resolved when the parameter function calls `done()`.

After the $digest cycle runs (probably initiated by `ng-click`), the $$postDigest queue runs:
- `performAnimation` function from the decorator is called
  * `animationEvent` === `'enter'`
  * `className` === `'ng-enter'`
  * `element` is the cloned disappearing and reappearing element
  * `parentElement` is body.
  * `afterElement` is a comment.
  * `domOperation` is noop.
  * `doneCallback` is a function that resolves the promise that's returned by the decorator's `enter` method.
  - calls `var runner = animationRunner(element, animationEvent, className);`
    * `element` is the cloned disappearing and reappearing element
    * `animationEvent` === `'enter'`
    * `className` === `'ng-enter'`
    - `var before = [], after = [];`
    - `var animationLookup = '.disappearing-div.ng-scope.ng-enter'` - takes all the classes that are currently on the element and adds `ng-enter`.
    - calls `lookup(animationLookup)`
      - calls `var matches = []`
      - calls `matches.push($injector.get(selectors['']))` (now we're invoking the previously registered factory with the name `'-animation'`).
        - it sets up some variables and defines functions, and it returns an object with properties `enter`, `leave`, etc.
      - returns `matches` which is an array with a single element (the one returned by the `'-animation'` factory). Since we haven't registered any more animations with the provider, there's only this default one.
    - calls `var created = registerAnimation(animationFactory, animationEvent);` (`registerAnimation` is a function defined inside `animationRunner`).
      * `animationFactory` is the object returned by the `'-animation'` factory.
      * `event` === `'enter'`
      - `var afterFn = animationFactory[event];` - `afterFn` is now `animationFactory.enter`.
      - `var beforeFn = animationFactory.beforeEnter`, which is `undefined`
      - `after.push({event: event, fn: afterFn});` (`after` and `before` were defined earlier in `animationRunner`).
      - `before.push({event: event, fn: beforeFn});`
      - returns `true`.
    - returns an object that presumably has all the info about the given animation on a given element.
  - `var ngAnimateState = {running: true, structural: true};`
  - `var totalActiveAnimations = 0;`
  - `var localAnimationCount = globalAnimationCounter++;` - sets `localAnimationCount` (local to `performAnimation`) to 0, and `globalAnimationCounter` (defined in the decorator) to 1.
  - `runningAnimations['ng-enter'] = runner;` - `runningAnimations` is defined in `performAnimation()`, and `runner` is the object returned by `animationRunner()`.
  - `element.data('$$ngAnimateState', {last: runner, active: runningAnimations, index: localAnimationCount, totalActive: totalActiveAnimations});`
  - calls `runner.before(function (...) { ... })`
    * `allCompleteFn` - passed from `performAnimation()`
    - calls `run(before, beforeCancel, function () { beforeComplete = noop; allCompleteFn(); });` (local to `animationRunner`)
      * `fns` === `[{event: 'enter', fn: undefined}]`
      * `cancellations` === `[]`
      * `allCompleteFn` === `function () { beforeComplete = noop; allCompleteFn(); }`
      - calls `allCompleteFn()`
        - calls `allCompleteFn()`
          - calls `runner.after(closeAnimation)` - `closeAnimation` is defined in `performAnimation`
            - calls `run(after, afterCancel, function () { afterComplete = noop; allCompleteFn(); });` (`run` is defined in `animationRunner`).
              - `var animations = [];`
              - `animations.push(fns[0])` - pushing the single object that's in the `after` array into `animations`
              - calls `var progress = function () { afterAnimationComplete(0); }` - `afterAnimationComplete` is defined in `run`
              - calls `cancellations.push(animation.fn(element, progress))` - cancellations was an empty array when we entered `run()` - entering `animation.fn()` (this is the `enter` method of the object returned by the `'-animate'` animation):
                * `element` is the disappearing (reappearing) element.
                * `animationCompleted` is the `progress` function: `function () { afterAnimationComplete(0); }`
                - calls `animate('enter', element, 'ng-enter', animationCompleted)` - `animate` is defined in the `'-animate'`'s factory function.
                  * `animationEvent` === 'enter';
                  * `element` is the disappearing div;
                  * `className` === `'ng-enter'`
                  * `animationComplete` is the `progress` function mentioned above.
                  - calls `var preReflowCancellation = animateBefore(animationEvent, element, className);` - where `animateBefore` is defined in the `'-animate'` factory function. Params are similar to the previous call.
                    - calls `animateSetup(animationEvent, element, className)` - defined in the `'-animate'` factory function.
                      - `var cacheKey = '1-disappearing-div ng-scope ng-animate';
                      - `var itemIndex = 0`
                      - `element.addClass('ng-enter')` - this is where the first class finally gets added.
                      - `var timings = getElementAnimationDetails(element, eventCacheKey);` - defined in the `'-animate'` factory function.
                        * `element` is the disappearing div.
                        * `cacheKey` === '1-disappearing-div ng-scope ng-animate ng-enter'
                        - `transitionDuration` and `transitionDelay` get calculated here.
                        - returns an object with `transitionDuration` and `transitionDelay` properties.
                      - `var blockTransition = true;`
                      - `element.data('$$ngAnimateCSS3Data', {...})` - setting some data about the animation on the element.
                      - calls `blockTransitions(node, true);` - defined in the `'-animate'` factory function.
                        - sets node's `transitionProperty` to `'none'`.
                      - returns `true`.
                    - returns `function (cancelled) { cancelled && animateClose(element, className); }` - where `animateClose` is defined in the `'-animate'` factory function, `element` is the disappearing div, and `className` === `'ng-enter'`.
                  - `var cancel = preReflowCancellation`
                  - calls `afterReflow(element, function () { ... })` - where `afterReflow` is defined in the `'-animate'` factory function.
                    * `element` is the disappearing div
                    * `callback` is a function where `animateAfter` is called.
                    - `animationReflowQueue.push(callback);`
                    - `cancelAnimationReflow = $$animateReflow(function () { forEach(animationReflowQueue, ...); ... })` - where `$$animateReflow` is a factory defined in `ngAnimate`.
                      - it basically returns `requestAnimationFrame(function () { forEach(animationReflowQueue, ...); ... })`
                  - returns `function (cancelled) { cancel(cancelled); }` - where `cancel` === `preReflowCancellation`.
  - returns `runner.cancel`

After the first animation frame:
- the `$$animateReflow` callback is called:
  - the only callback in `animationReflowQueue` is called.
    - `cancel = animateAfter(animationEvent, element, className, animationComplete)` - where `animateAfter` is defined in the `'-animate'` factory function.
      - calls `animateRun(animationEvent, element, className, afterAnimationComplete);` - where `animateRun` is defined in the `'-animate'` factory function.
        - calls `blockTransitions(node, false);`
          - sets `node`'s `transitionProperty` to an empty string.
        - `var activeClassName = 'ng-enter-active';`
        - `element.addClass(activeClassName);` - this is it!
