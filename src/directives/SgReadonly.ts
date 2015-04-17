/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {
    
    ///Finds all contained input elements and add property disabled when condition is met.
    ///Fields with attribute [sg-readonly-ignore] are not affected
    Module.directive("sgReadonly", [() => {

        function toggleDisableAttr(fields:any[], isDisabled:boolean) {
            _.each(fields, (f: any) => angular.element(f).prop('disabled', isDisabled));
        }

        return {
            restrict: "A",
            link: (scope, elm, attrs, ctrl) => {

                if (attrs.sgReadonlyCacheFields == true || attrs.sgReadonlyCacheFields == "true") {
                    //Caching fields has better performance but does not see fields added later via ng-if etc, so use it only when you are sure that no fields will be added dynamically 
                    var cachedFields = elm
                        .find('input[ng-model], select[ng-model], textarea[ng-model]')
                        .not('[ng-disabled], [ng-readonly], [disabled], [readonly], [sg-readonly-ignore]');

                    scope.$watch(attrs.sgReadonly, (value: boolean) => {
                        toggleDisableAttr(cachedFields, value);
                    });
                } else {
                    scope.$watch(attrs.sgReadonly, (value: boolean) => {
                        var fields = elm
                            .find('input[ng-model], select[ng-model], textarea[ng-model]')
                            .not('[ng-disabled], [ng-readonly], [sg-readonly-ignore]');

                        toggleDisableAttr(fields, value);
                    });    
                }
                

            }
        };
    }]);

}
