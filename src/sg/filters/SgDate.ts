/// <reference path="../../angular.d.ts" />
/// <reference path="../../../moment.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    export function dateFilter() {
        return (date, format) => {
            if (!date) {
                return "";
            }
            return moment(date).format(format);
        };
    }

    Module.filter('sgdate', dateFilter);

    Module.filter('nl2br', function () {
        return function (text: string) {
            return text.replace(/\r\n|\n|\r/gi, '<br/>');
        };
    });

}