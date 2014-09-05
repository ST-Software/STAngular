/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {
    Module.directive("sgFocusSelect", [<any>"$timeout", function ($timeout: ng.ITimeoutService) {
        return {
            scope: false,
            link: function (scope, el, attrs) {
                scope.$on("focusSelect:" + attrs.sgFocusSelect, function () {
                    el.focus();
                });

                el.focus(function () {
                    $timeout(() => el.select(), 100);
                });
            }
        };
    }]);
}