define([
    './module'
], function (services) {
    "use strict";
    services.factory('members', ['$cachedResource', 'baseUrl', function ($cachedResource, baseUrl) {
        return $cachedResource('members', baseUrl + '/members/:id', {
            id: "@id"
        });
    }]);
});