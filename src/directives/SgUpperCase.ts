/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive("sgUpperCase", [() => {
        
        function getCaretPosition(inputField: HTMLInputElement): number {
            // Initialize
            var position = 0;

            // IE Support
            if (document.selection) {
                inputField.focus();

                // To get cursor position, get empty selection range
                var emptySelection = document.selection.createRange();

                // Move selection start to 0 position
                emptySelection.moveStart('character', -inputField.value.length);

                // The caret position is selection length
                position = emptySelection.text.length;
            }
            else if (inputField.selectionStart || inputField.selectionStart == 0) {
                position = inputField.selectionStart;
            }

            return position;
        }

        function setCaretPosition(inputElement: HTMLInputElement, position: number) {
            if (inputElement.createTextRange) {
                var range = inputElement.createTextRange();
                range.move('character', position);
                range.select();
            }
            else {
                if (inputElement.selectionStart) {
                    inputElement.focus();
                    inputElement.setSelectionRange(position, position);
                } else {
                    inputElement.focus();
                }
            }
        }

        return {
            require: "^ngModel",
            restrict: "A",
            link: (scope:ng.IScope, elm, attrs, ctrl:ng.INgModelController) => {
                var toUpperCase = (inputValue: string): string => {
                    if (!inputValue) return inputValue;

                    var modified = inputValue.toUpperCase();
                    if (modified !== inputValue) {
                        var position = getCaretPosition(<HTMLInputElement>elm[0]);

                        ctrl.$setViewValue(modified);
                        ctrl.$render();

                        setCaretPosition(<HTMLInputElement>elm[0], position);
                    }
                    return modified;
                }

                ctrl.$parsers.push(toUpperCase);

                toUpperCase(scope[attrs.ngModel]); //Transform initial value
            }
        };
    }]);

}
