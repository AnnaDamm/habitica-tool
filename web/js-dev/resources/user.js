define([
    './module'
], function (services) {
    "use strict";
    services.factory('user', ['$resource', 'baseUrl', function ($resource, baseUrl) {
        return $resource(baseUrl + '/user');
    }]);
});