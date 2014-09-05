/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive("sgTime", [<any>"$window", ($window) => {

        var defaultFormat: string = 'mm:ss:ff';

        return {
            require: "^ngModel",
            restrict: "A",
            link: (scope:ng.IScope, elm, attrs, ctrl:ng.INgModelController) => {
                var timespan = $window.timespan;
                var timeFormat = defaultFormat;
                var serverFormat = "hh:mm:ss.fff";
                
                attrs.$observe("sgTime", newValue => {
                    timeFormat = newValue ? newValue.toLowerCase() : defaultFormat;
                });

                ctrl.$formatters.unshift(modelValue => {
                    if (!timeFormat || !modelValue) return "";
                    var time = timespan(modelValue, serverFormat);
                    var retVal = time.format(timeFormat);
                    ctrl.$setValidity(attrs.name, retVal);
                    return retVal || modelValue;
                });

                ctrl.$parsers.unshift(viewValue => {
                    var time = timespan(viewValue, timeFormat);
                    var isEmpty = viewValue == null || viewValue.trim() === "";
                    var isRequired = attrs.required;
                    if (isEmpty && isRequired || !time) 
                    {                        
                        ctrl.$setValidity(attrs.name, false);
                        return "";
                    } else {
                        ctrl.$setValidity(attrs.name, true);
                    }
                    return time.format(serverFormat);
                });
            }
        };
    }]);

}