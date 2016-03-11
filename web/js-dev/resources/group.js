define([
    './module'
], function (services) {
    "use strict";
    services.factory('group', ['$cachedResource', 'baseUrl', function ($cachedResource, baseUrl) {
        return $cachedResource('group', baseUrl + '/groups/:id', {
            id: "@id"
        });
    }]);
});