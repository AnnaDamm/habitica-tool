define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.controller('MainController', [
        '$scope', 'ConfigController',
        ConfigController
    ]);

    function ConfigController($scope, localStorageService) {
        localStorageService.bind($scope, 'apiToken');
        localStorageService.bind($scope, 'userId');

        $scope.uuidRegex = '';
    }
});
