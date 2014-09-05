/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive('sgCkEditor', [<any>'$window', function ($window) {
        return {
            require: '?ngModel',
            scope: {
                width: '@',
                height: '@'
            },
            link: function (scope, el, attr, ngModel) {

                var ck = $window.CKEDITOR.replace(el[0], { width: scope.width, height: scope.height });

                ck.on('pasteState', function () {
                    scope.$apply(function () {
                        ngModel.$setViewValue(ck.getData());
                    });
                });

                ck.on('instanceReady', function () {
                    ck.setData(ngModel.$viewValue);
                });
                
                ngModel.$render = function (value) {
                    ck.setData(ngModel.$modelValue);
                };
            }
        };
    }]);

} 