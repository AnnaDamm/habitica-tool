define([
    './module'
], function (services) {
    "use strict";
    services.factory('user', ['$cachedResource', 'baseUrl', function ($cachedResource, baseUrl) {
        return $cachedResource('user', baseUrl + '/user');
    }]);
});