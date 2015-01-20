/// <reference path="../_references.ts" />
module IdlDb {

    GlobalModule.directive('sgDateTimeMask', [() => {

        return {
            require: "^ngModel",
            restrict: "A",
            scope: {
                model: "=ngModel"
            },
            link: (scope, element, attrs, ctrl) => {

                var mask: string = null;

                var dateFormat: string = attrs.sgDateTimeMask;

                var useMask: boolean = true;

                if (attrs.hasOwnProperty('readonly') || attrs.hasOwnProperty('disabled')) {
                    useMask = false;
                }

                if ((<any>jQuery).mask && useMask) {
                    mask = dateFormat.replace('DD', '99').replace('MM', '99').replace('YYYY', '9999').replace('HH', '99').replace('mm', '99');
                    element.mask(mask);
                }

                scope.$watch("model", (newVal) => {
                    if (!newVal && !element.prop('required')) {
                        ctrl.$setValidity('date', true);
                    }
                });
            },
        };
    }
    ]);
}