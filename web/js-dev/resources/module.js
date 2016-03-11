define([
    'angular',
    'angular-resource',
    'angular-cached-resource'
], function (ng) {
    "use strict";
    return ng.module('app.resources', [
        'ngResource',
        'ngCachedResource'
    ]).config(function ($httpProvider) {
        $httpProvider.interceptors.push(function (baseUrl, localStorageService) {

            var restRegex = new RegExp("^" + baseUrl);

            return {
                request: function (request) {
                    if (restRegex.test(request.url)) {
                        request.headers['x-api-key']  = localStorageService.get('apiToken');
                        request.headers['x-api-user'] = localStorageService.get('userId');
                    }

                    return request;
                }
            };
        });

    }).run(function ($rootScope, $cachedResource) {
        $rootScope.$on('clearCache', function () {
            $cachedResource.clearCache();
        });
    });
});