/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive("sgTime", [<any>"$window", "InputMaskService",
        ($window, InputMaskService: STAngular.IInputMaskService) => {

        var defaultFormat: string = 'mm:ss:ff';

        return {
			require: "^ngModel",
            restrict: "A",
            link: (scope:ng.IScope, elm, attrs, ctrl:ng.INgModelController) => {
                var timespan = $window.timespan;
                var timeFormat = defaultFormat;
                var serverFormat = "hh:mm:ss.fff";

                var setTimeFormat = (newValue) => {
                timeFormat = newValue ? newValue.toLowerCase() : defaultFormat;
                var mask = timeFormat.replace(/[a-zA-Z]/g, '9');
                InputMaskService.bindMask(elm, null, mask);
              };

              setTimeFormat(attrs.sgTime);

              attrs.$observe("sgTime", newValue => {
              setTimeFormat(newValue);
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