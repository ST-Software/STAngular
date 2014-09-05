/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />
/// <reference path="../interfaces/IPickadate.d.ts" />

module STAngular {

    //You can specify min|max attributes using moment.js syntax
    //See method parseDateAttr() in file pickadateHelper.ts for details

    Module.directive("sgDate", [<any>"$window", "$timeout", ($window, $timeout: ng.ITimeoutService) => {
        
        return {
            require: "^ngModel",
            restrict: "A",
            link: (scope:ng.IScope, elm, attrs, ctrl:ng.INgModelController) => {
                var moment = $window.moment;
                var dateFormat : string = attrs.sgDate;

                var modelValue = scope.$eval(attrs.ngModel);
                var utcDate = modelValue != null ? moment.utc(modelValue) : null;

                if (attrs.withoutIcon == undefined) {
                    var pickadateHelper = new STUtils.PickadateHelper();
                    var datepicker: Pickadate.IPickadate = pickadateHelper.bindPickadateForAngular(elm, utcDate, dateFormat, scope, ctrl);
                }
                
                attrs.$observe("sgDate", newValue => {
                    if (dateFormat == newValue || !ctrl.$modelValue) return;
                    dateFormat = newValue;
                    ctrl.$modelValue = new Date(<any>ctrl.$setViewValue);
                });

                ctrl.$formatters.unshift(modelValue => {
                    if (!dateFormat || !modelValue) return "";
                    var utcDate = moment.utc(modelValue);
                    var retVal = utcDate.format(dateFormat);
                    var isValid: boolean = utcDate.isValid();
                    ctrl.$setValidity(attrs.name, isValid);
                    return retVal;
                });

                ctrl.$parsers.unshift(viewValue => {
                    var date = moment.utc(viewValue, dateFormat);                    
                    var isEmpty = viewValue == null || viewValue.trim() === "";
                    var isRequired = attrs.required;
                    if (isEmpty && isRequired || (!!date && (date.isValid() == false || date.year() < 1900))) 
                    {                        
                        ctrl.$setValidity(attrs.name, false);
                        return "";
                    } else {
                        ctrl.$setValidity(attrs.name, true);
                    }
                    return !!date ? date.format() : null;
                });
            }
        };
    }]);

}