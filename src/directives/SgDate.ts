/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />
/// <reference path="../interfaces/IPickadate.d.ts" />

module STAngular {

    //You can specify min|max attributes using moment.js syntax
    //See method parseDateAttr() in file pickadateHelper.ts for details

    Module.directive("sgDate", [<any>"$window", "$parse", ($window, $parse: ng.IParseService) => {
        
        return {
            require: "^ngModel",
            priority: 0,
            restrict: "A",
            link: (scope:ng.IScope, elm, attrs, ctrl:ng.INgModelController) => {
                var moment = $window.moment;
                var dateFormat : string = attrs.sgDate;

                var modelValue = scope.$eval(attrs.ngModel);
                var utcDate = modelValue != null ? moment.utc(modelValue) : null;

				if (!attrs.withoutIcon) {
					var pickadateHelper = new PickadateHelper();
					pickadateHelper.bindPickadateForAngular(elm, utcDate, dateFormat, scope, ctrl, $parse);
				}
                var isDateValid = (value: Date) : boolean => {
                    var isValid = true;

                    var min = attrs['min'] != null ? pickadateHelper.parseDateAttr(attrs['min'], scope, $parse, true) : null,
                        max = attrs['max'] != null ? pickadateHelper.parseDateAttr(attrs['max'], scope, $parse) : null;

                    if (min != null && min > value) {
                        isValid = false;
                    }

                    if (max != null && max < value) {
                        isValid = false;
                    }

                    return isValid;
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
                    ctrl.$setValidity(attrs.name, isValid && isDateValid(utcDate));

                    return retVal;
                });

                ctrl.$parsers.unshift(viewValue => {
                    var date = moment.utc(viewValue, dateFormat);                    
                    var isEmpty = viewValue == null || viewValue.trim() === "";
                    var isRequired = attrs.required;
                    if (isEmpty && isRequired || !isEmpty && (!!date && (date.isValid() == false || date.year() < 1900))) 
                    {                        
                        ctrl.$setValidity(attrs.name, false);
                        return "";
                    } else {
                        ctrl.$setValidity(attrs.name, true && isDateValid(date));
                    }

                    return !!date ? date.format() : null;
                });
            }
        };
    }]);

}