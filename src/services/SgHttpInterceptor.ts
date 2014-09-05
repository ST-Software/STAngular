/// <reference path="../../angular.d.ts" />

module STAngular {

    Module.factory("SgHttpInterceptor", ["$q", "$rootScope", ($q: ng.IQService, $rootScope: any) => {
        var status = {
            ok: 200,
            notAuthenticated: 401,
            forbidden: 403,
            badRequest: 400 //validation error
        };

        $rootScope.globalErrors = $rootScope.globalErrors || {};

        return {
            'response': response => {
                //This is a workaround. When user initiated ajax request but html was returned
                //then it means that he was already logged out and "redirect to login" was returned instead of that ajax response
                var contentType = response.headers()['content-type'];

                if (response.status == status.ok && contentType != null && contentType.indexOf('text/html') == 0 && response.config.url.indexOf('/api/') > 0) {
                    $rootScope.globalErrors.sgAjaxLastErrorMessage = null;
                    $rootScope.globalErrors.notAuthenticated = true;
                }
                return response;
            },
            'responseError': response => {
                if (response.status == status.notAuthenticated) {
                    $rootScope.globalErrors.sgAjaxLastErrorMessage = null;
                    $rootScope.globalErrors.notAuthenticated = true;
                } else if (response.status == status.badRequest) {
                    $rootScope.globalErrors.validationErrorMessage = response.data;
                } else if (response.status == status.forbidden) {
                    $rootScope.globalErrors.sgAjaxLastErrorMessage = null;
                    $rootScope.globalErrors.forbidden = true;
                } else {
                    $rootScope.globalErrors.sgAjaxLastErrorMessage = response.data;
                    $rootScope.globalErrors.notAuthenticated = false;
                }

                return $q.reject(response);
            }
        };
    }]);
}