define([
    './module'
], function (services) {
    "use strict";
    services.factory('content', ['$resource', 'baseUrl', function ($resource, baseUrl) {
        return $resource(baseUrl + '/content');
    }]);
});