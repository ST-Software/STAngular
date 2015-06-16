/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    // this original code comes from: http://jsfiddle.net/tadchristiansen/gt92r/

    Module.factory("PopupService", [<any>"$http", "$compile", function ($http: ng.IHttpService, $compile: ng.ICompileService) {
        return new PopupService($compile, $http);
    }]);
    
    Module.directive("sgPopup", ["PopupService", function (popupService: PopupService) {
        return {
            restrict: "A",
            link: function postLink(scope, element, attrs) {
                var ngPopupUrl = attrs["sgPopup"];
                // Could have custom or boostrap modal options here
                var popupOptions = {};
                element.bind("click", function () {
                    popupService.load(ngPopupUrl, scope, popupOptions);
                });
            }
        };
    }]);

    Module.directive("sgConfirm", [<any>"PopupService", function (popupService: PopupService) {
        return {
            restrict: "AE",
            link: function postLink(scope, element, attrs) {
                // Could have custom or boostrap modal options here
                var popupOptions = {};
                element.bind("click", (event: Event) => {
                    popupService.confirm(attrs["title"], attrs["actionText"],
                        attrs["actionButtonText"], attrs["actionFunction"],
                        attrs["cancelButtonText"], attrs["cancelFunction"],
                        scope, popupOptions);
                });
            }
        };
    }]);


    Module.directive("sgPrompt", [<any>"PopupService", function (popupService: PopupService) {
        return {
            restrict: "AE",
            link: function postLink(scope, element, attrs) {
                // Could have custom or boostrap modal options here
                var placeholder = attrs["sgPromptPlaceholder"];
                var popupOptions = {placeholder : placeholder};
                element.bind("click", function () {
                    popupService.prompt(attrs["title"], attrs["actionText"],
                        attrs["actionButtonText"], attrs["actionFunction"],
                        attrs["cancelButtonText"], attrs["cancelFunction"],
                        scope, popupOptions);
                });
            }
        };
    }]);

    Module.directive("sgAlert", [<any>"PopupService", function (popupService: PopupService) {
        return {
            restrict: "AE",
            link: function postLink(scope, element, attrs) {
                // Could have custom or boostrap modal options here
                var popupOptions = { };
                element.bind("click", function () {
                    popupService.alert(attrs["title"], attrs["text"],
                            attrs["buttonText"], attrs["alertFunction"],
                            scope, popupOptions);
                });
            }
        };
    }]);

    export class PopupService {

        popupElement: any;
        popupContent: any;
        $compile: ng.ICompileService;
        $http: ng.IHttpService;

        constructor($compile: ng.ICompileService, $http: ng.IHttpService) {
            this.$compile = $compile;
            this.$http = $http;
        }

        // Get the popup
        getPopup(create?: boolean) {
            if (!this.popupElement && create) {
                var dialog = $('<div class="modal-dialog"></div>');
                this.popupContent = $('<div class="modal-content"></div>');
                this.popupContent.appendTo(dialog);

                this.popupElement = $('<div class="modal fade" tabindex="-1"></div>');
                dialog.appendTo(this.popupElement);

                this.popupElement.appendTo('body');
            }
            return this.popupElement;
        }

        getPopupContent(popup: any) {
            return popup.find('.modal-content');
        }

        compileAndRunPopup(popup, scope, options) {
            this.$compile(popup)(scope);
            popup.modal(options);
        }

        // Is it ok to have the html here? should all this go in the directives? Is there another way
        // get the html out of here?
        alert (title, text, buttonText, alertFunction, scope, options) {
            text = (text) ? text : "Alert";
            buttonText = (buttonText) ? buttonText : "Ok";
            var alertHtml : string = "";
            if (title) {
                alertHtml += "<div class=\"modal-header\"><h1>" + title + "</h1></div>";
            }
            alertHtml += "<div class=\"modal-body\">" + text + "</div>"
                        + "<div class=\"modal-footer\">";
            if (alertFunction) {
                alertHtml += "<button class=\"btn\" ng-click=\"" + alertFunction + "\">" + buttonText + "</button>";
            }
            else {
                alertHtml += "<button class=\"btn\">" + buttonText + "</button>";
            }
            alertHtml += "</div>";

            var popup = this.getPopup(true);
            var popupContent = this.getPopupContent(popup);

            //popup.html(alertHtml);
            popupContent.html(alertHtml);

            if (!alertFunction) {
                popup.find(".btn").click(function () {
                    this.close();
                });
            }

            this.compileAndRunPopup(popup, scope, options);
        }

        // Is it ok to have the html here? should all this go in the directives? Is there another way
        // get the html out of here?
        confirm (title: string, actionText: string, actionButtonText: string, actionFunction: string, cancelButtonText: string, cancelFunction: string, scope, options) {
            actionText = (actionText) ? actionText : "Are you sure?";
            actionButtonText = (actionButtonText) ? actionButtonText : "Ok";
            cancelButtonText = (cancelButtonText) ? cancelButtonText : "Cancel";

            var popup = this.getPopup(true);
            var popupContent = this.getPopupContent(popup);

            var confirmHtml: string = "";

            if (title) {
                confirmHtml += "<div class=\"modal-header\"><h1>" + title + "</h1></div>";
            }
            confirmHtml += "<div class=\"modal-body\">" + actionText + "</div>"
                        + "<div class=\"modal-footer\">";
            if (actionFunction) {
                confirmHtml += "<button class=\"btn btn-primary\" ng-click=\"" + actionFunction + "\">" + actionButtonText + "</button>";
            }
            else {
                confirmHtml += "<button class=\"btn btn-primary\">" + actionButtonText + "</button>";
            }
            if (cancelFunction) {
                confirmHtml += "<button class=\"btn btn-cancel\" ng-click=\"" + cancelFunction + "\">" + cancelButtonText + "</button>";
            }
            else {
                confirmHtml += "<button class=\"btn btn-cancel\">" + cancelButtonText + "</button>";
            }
            confirmHtml += "</div>";

            //popup.html(confirmHtml);
            popupContent.html(confirmHtml);

            //if (!actionFunction) {
                popup.find(".btn-primary").click(() => {
                    this.close();
                });
            //}
            //if (!cancelFunction) {
                popup.find(".btn-cancel").click(() => {
                    this.close();
                });
            //}
                this.compileAndRunPopup(popup, scope, options);

                popup.on('keydown',(event: KeyboardEvent) => {
                    //TODO: Extract keyCodes to angular service (constant) and upload on Github
                    //they are already used in SgLookups
                    if (event.keyCode == 13) {
                        popup.find(".btn-primary").trigger('click');
                    }
            });

        }


        // Is it ok to have the html here? should all this go in the directives? Is there another way
        // get the html out of here?
        prompt(title: string, actionText: string, actionButtonText: string, actionFunction: string, cancelButtonText: string, cancelFunction: string, scope, options) {
            actionText = (actionText) ? actionText : "Are you sure?";
            actionButtonText = (actionButtonText) ? actionButtonText : "Ok";
            cancelButtonText = (cancelButtonText) ? cancelButtonText : "Cancel";

            var popup = this.getPopup(true);
            var popupContent = this.getPopupContent(popup);

            var confirmHtml: string = "";

            var placeholder = options.placeholder;

            if (title) {
                confirmHtml += "<div class=\"modal-header\"><h1>" + title + "</h1></div>";
            }

            confirmHtml += "<div class=\"modal-body\">" + actionText + "</div>"
            + "<textarea placeholder=\"" + placeholder + "\" ng-model=\"message\"></textarea>"
            + "<strong ng-bind=\"message\"></strong>" //test
            + "<div class=\"modal-footer\">";

            if (actionFunction) {
                confirmHtml += "<button class=\"btn btn-primary\" ng-click=\"" + actionFunction + "\">" + actionButtonText + "</button>";
            }
            else {
                confirmHtml += "<button class=\"btn btn-primary\">" + actionButtonText + "</button>";
            }

            if (cancelFunction) {
                confirmHtml += "<button class=\"btn btn-cancel\" ng-click=\"" + cancelFunction + "\">" + cancelButtonText + "</button>";
            }
            else {
                confirmHtml += "<button class=\"btn btn-cancel\">" + cancelButtonText + "</button>";
            }
            confirmHtml += "</div>";

            //popup.html(confirmHtml);
            popupContent.html(confirmHtml);

            //if (!actionFunction) {
            popup.find(".btn-primary").click(() => {
                this.close();
            });
            //}
            //if (!cancelFunction) {
            popup.find(".btn-cancel").click(() => {
                this.close();
            });
            //}
            this.compileAndRunPopup(popup, scope, options);
        }

        // Loads the popup
        load(url, scope, options) {
            var htmlPage = '<div class="modal-header"><h1>Header</h1></div><div class="modal-body">Body</div><div class="modal-footer"><button class="btn btn-primary" ng-click="doIt()">Do it</button><button class="btn btn-cancel" ng-click="cancel()">Cancel</button></div>';

            this.$http.get(url).success(function (data) {
                var popup = this.getPopup(true);
                var popupContent = this.getPopupContent(popup);
                // Tried getting this to work with the echo and a post, with no luck, but this gives you the idea
                // popup.html(data);
                popupContent.html(htmlPage);
                this.compileAndRunPopup(popup, scope, options);
            });
        }

        close() {
            var popup = this.getPopup();

            if (popup) {
                popup.modal('hide');
            }
        }
    }

}
