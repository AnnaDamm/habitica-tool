define([
    './module'
], function (services) {
    "use strict";
    services.factory('content', ['$cachedResource', 'baseUrl', function ($cachedResource, baseUrl) {
        return $cachedResource('content', baseUrl + '/content');
    }]);
});