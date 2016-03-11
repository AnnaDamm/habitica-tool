define([
    './module'
], function (services) {
    "use strict";
    services.factory('groups', ['$resource', 'baseUrl', function ($resource, baseUrl) {
        return $resource(baseUrl + '/groups');
    }]);
});