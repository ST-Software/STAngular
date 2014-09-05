/// <reference path="../../angular.d.ts" />
/// <reference path="../../../moment.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    var timespan = (<any>window).timespan;

    export function timeFilter() {
        return (time, format) => {
            if (!time) {
                return "";
            }
            format = format || "mm:ss:ff";
            var serverFormat = "hh:mm:ss.fff";
            var timeFmt = timespan(time, serverFormat);
            return timeFmt.format(format);
        };
    }

    Module.filter('sgtime', timeFilter);

}