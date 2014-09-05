/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive("sgUpperCase", [() => {
        
        return {
            require: "^ngModel",
            restrict: "A",
            link: (scope:ng.IScope, elm, attrs, ctrl:ng.INgModelController) => {
                var toUpperCase = (inputValue: string): string => {
                    if (!inputValue) return inputValue;

                    var modified = inputValue.toUpperCase();
                    if (modified !== inputValue) {
                        ctrl.$setViewValue(modified);
                        ctrl.$render();
                    }
                    return modified;
                }

                ctrl.$parsers.push(toUpperCase);

                toUpperCase(scope[attrs.ngModel]); //Transform initial value
            }
        };
    }]);

}