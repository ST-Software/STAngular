/// <reference path="../../angular.d.ts" />
/// <reference path="../../../moment.d.ts" />
/// <reference path="../Sg.ts" />
module STAngular {

    declare var ExceptionUrl: string;    
    var sessionId = null;

    Module.factory("SgExceptionHandler", ["$log", ($log) => {

        var uuid = (): string => {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                var r = Math.random() * 16 | 0;
                var v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        if (!sessionId) {
            sessionId = uuid();
        }

        var log = (exception, cause) => {

            var url = (<any>window).FinaDb.apiUrlBase + 'clientlog';

            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify({
                    Message: exception.message,
                    Details: cause,
                    StackTrace: exception.stack,
                    Url: window.location.href,
                    ClientPageLoadId: sessionId
                })
            });
            $log.error.apply($log, arguments);
        };

        return log;
    }]);

}