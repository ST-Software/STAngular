/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {
    
    Module.directive("sgReadonly", [() => {

        function toggleDisableAttr(fields:any[], isDisabled:boolean) {
            _.each(fields, (f: any) => angular.element(f).prop('disabled', isDisabled));
        }

        return {
            restrict: "A",
            link: (scope, elm, attrs, ctrl) => {

                scope.$watch(attrs.sgReadonly, (value: boolean) => {
                    var fields = elm.find('input[ng-model], select[ng-model], textarea[ng-model]').not('[ng-disabled, ng-readonly, disabled, readonly]');
                    toggleDisableAttr(fields, value);
                });

            }
        };
    }]);

}
