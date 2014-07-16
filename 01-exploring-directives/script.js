// Lines in compile.js are based on commit 1f23980590263fbd513f276c208dfb053682c330

angular.module('app', [])
  .directive('customElement', function () {
    return {
      type: 'html',
      name: 'customElement',
      restrict: 'E',
      priority: 0,
      terminal: false,
      template: function template1 () {
        console.log('template1 args:', arguments);
        return '<div></div>';
      },
      transclude: true,
      scope: {},
      controller: function controller1 ($scope, $transclude) {
        console.log('controller1 args:', arguments);
        $transclude && $transclude($scope, function controller1TranscludeFn () {
          console.log('controller1 transcludeFn args:', arguments);
          // These cloneConnectFns are being called on line 881, and their return values aren't used.
        });
        // A return value here would replace the object created by the constructor,
        // since a new object is being created with $injector.instantiate, using this function as a constructor.
      },
      controllerAs: 'customElementController',
      compile: function compile1 () {
        console.log('compile1 args:', arguments);
        return {
          pre: function pre1 (scope, element, attrs, controller, transclude) {
            console.log('pre1 args:', arguments);
            transclude && transclude(scope, function pre1TranscludeFn () {
              console.log('pre1TranscludeFn args:', arguments);
            });
            // Pre and post link functions are called around line 1580 of compile.js, and their return values are not used.
          },
          post: function post1 (scope, element, attrs, controller, transclude) {
            console.log('post1 args:', arguments);
            transclude && transclude(scope, function post1TranscludeFn () {
              console.log('post1TranscludeFn args:', arguments);
            });
          }
        };
      }
    };
  })
  .directive('customElement', function () {
    return {
      type: 'html',
      name: 'customElement',
      restrict: 'E',
      priority: -200,
      terminal: true,
      transclude: false,
      // Applying two controllers
      // controller: function controller2 ($scope, $transclude) {
      //   console.log('controller2 args:', arguments);
      //   $transclude && $transclude($scope, function controller2TranscludeFn () {
      //     console.log('controller2 transcludeFn args:', arguments);
      //   });
      // },
      controllerAs: 'customElementController',
      compile: function compile2 () {
        console.log('compile2 args:', arguments);
        return {
          pre: function pre2 (scope, element, attrs, controller, transclude) {
            console.log('pre2 args:', arguments);
            transclude && transclude(scope, function pre2TranscludeFn () {
              console.log('pre2TranscludeFn args:', arguments);
            });
          },
          post: function post2 (scope, element, attrs, controller, transclude) {
            console.log('post2 args:', arguments);
            transclude && transclude(scope, function post2TranscludeFn () {
              console.log('post2TranscludeFn args:', arguments);
            });
          }
        };
      }
    };
  });
