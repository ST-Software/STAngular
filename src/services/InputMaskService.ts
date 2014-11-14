/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    export interface IInputMaskService {
        //Mask is not provided => it will be read from mask attribute on input elements
        bindMask(context: JQuery, selector: string);

        //Mask is provided
        bindMask(context: JQuery, selector: string, mask: string);
    }

    Module.factory("InputMaskService", [(): STAngular.IInputMaskService => {

        function bindMask(context: JQuery, selector: string, defaultMask?: string) {
            var fields = selector != null ? context.find(selector) : context;
            if (fields.length == 0) {
                return;
            }

            //mask does not work with input type=number
            var jQ = <any>jQuery;
            if (jQ.mask != null) {
                _.each(fields, (field: Element) => {
                    var el = jQuery(field);
                    var mask = defaultMask || el.attr('mask');
                    if (mask == '' || mask == null) return;

                    (<any>el).mask(mask);
                });
            }
        }

        return {
            bindMask: bindMask
        };
    }]);

}