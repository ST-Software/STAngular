/// <reference path="../angular.d.ts" />

module STAngular {

    export declare var ExceptionUrl: string;

    export var Module = angular.module('STAngular', []).config([<any>"$compileProvider", ($compileProvider: any) => {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
    }]);
    
}