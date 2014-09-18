/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive('sgFocusIf', () => {
        return {
            restrict: 'A',
            link: (scope, element, attrs) => {
                scope.$watch(attrs.sgFocusIf, () => {
                    if (attrs.sgFocusIf) {
                        window.setTimeout(() => {
                            element.focus();
                        }, 5);
                    }
                }, true);
            }
        };
    }); 
}