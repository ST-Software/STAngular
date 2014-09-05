/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive("sgFocus", [<any>"$timeout", function ($timeout: ng.ITimeoutService) {
        return {
            scope: false,
            priority: 20,
            link: (scope, el, attrs) => {
                scope.$on("focus:" + attrs.sgFocus, () => {
                    $timeout(() => el.focus(), 0, false);
                });
            }
        };
    }]);   
}