/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />
/// <reference path="../interfaces/IPickadate.d.ts" />

module STAngular {

    //You can specify min|max attributes using moment.js syntax
    //See method parseDateAttr() in file pickadateHelper.ts for details

    Module.directive("sgDate", [<any>"$window", "$parse", "InputMaskService",
        ($window, $parse: ng.IParseService, InputMaskService: STAngular.IInputMaskService) => {

            return {
                require: "^ngModel",
                priority: 100,
                restrict: "A",
                link: (scope: ng.IScope, elm: JQuery, attrs, ctrl: ng.INgModelController) => {
                    var moment = $window.moment;
                    var dateFormat: string = attrs.sgDate;
                    var dateFormatRegex: RegExp = createRegexp(dateFormat);

                    var modelValue = scope.$eval(attrs.ngModel);
                    var utcDate = modelValue != null ? moment.utc(modelValue) : null;

                    var useMask: boolean = true;
                    if (attrs.hasOwnProperty('readonly') || attrs.hasOwnProperty('disabled')) {
                        useMask = false;
                    }

                    if ((<any>jQuery).mask && useMask) {
                        var mask: string = dateFormat.toUpperCase().replace('DD', '99').replace('MM', '99').replace('YYYY', '9999');
                        InputMaskService.bindMask(elm, null, mask);
                    }

                    var pickadateHelper = new PickadateHelper();
                    if (!attrs.withoutIcon) {
                    	pickadateHelper.bindPickadateForAngular(elm, utcDate, dateFormat, scope, ctrl, $parse);
                    }
                    var isDateValid = (value: Date): boolean => {
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

                function createRegexp(dateFormat: string): RegExp {
                        var supportedSeparators: Array<string> = ["/", "\\.", "-"]; //dot . must be escaped because it has special meaning in RegExp

                        //Take the first separator which is 2 times in the format
                        var separator: string = _.find(supportedSeparators, (sep: string) => {
                            var matches: Array<string> = dateFormat.match(new RegExp(sep, 'g'));
                            var count = matches != null ? matches.length : 0;
                            return count == 2;
                        });

                        var regExp: RegExp = new RegExp("[0-9][0-9]" + separator + "[0-9][0-9]" + separator + "[0-9][0-9][0-9][0-9]");
                        return regExp;
                    }

                    var hasDateValidFormat = (value: string) => {
                        return dateFormatRegex.test(value);
                    }

                attrs.$observe("sgDate", newValue => {
                        if (dateFormat == newValue || !ctrl.$modelValue) return;
                        dateFormat = newValue;
                        ctrl.$modelValue = new Date(<any>ctrl.$setViewValue);
                    });

                    //ctrl.$formatters.unshift(modelValue => {
                    ctrl.$formatters.push(modelValue => {
                        if (!dateFormat || !modelValue) return "";

                        var utcDate = moment.utc(modelValue);
                        var retVal = utcDate.format(dateFormat);
                        var isValid: boolean = utcDate.isValid();
                        ctrl.$setValidity(attrs.name, isValid && isDateValid(utcDate));

                        return retVal;
                    });

                    //TODO: @Pavel: Why was there unshift?
                    //ctrl.$parsers.unshift(viewValue => {
                    ctrl.$parsers.push(viewValue => {
                        if (!hasDateValidFormat(viewValue)) {
                            ctrl.$setValidity(attrs.name, false);
                            return null;
                        }

                        var date = moment.utc(viewValue, dateFormat);
                        var isEmpty = viewValue == null || viewValue.trim() === "";
                        var isRequired = attrs.required;
                        if (isEmpty && isRequired || !isEmpty && (!!date && (date.isValid() == false || date.year() < 1900))) {
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