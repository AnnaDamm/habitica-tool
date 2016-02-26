define([
    './module'
], function (services) {
    "use strict";
    services.factory('members', ['$resource', 'baseUrl', function ($resource, baseUrl) {
        return $resource(baseUrl + '/members/:id');
    }]);
});