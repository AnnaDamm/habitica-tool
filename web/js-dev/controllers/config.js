define([
    'angular',
    './module',
    'text!templates/config.html'
], function (ng, module, html) {
    "use strict";
    module.controller('ConfigController', [
        '$scope', '$state', 'localStorageService',
        ConfigController
    ]).run(function ($templateCache) {
        $templateCache.put('templates/config.html', html);
    });

    function ConfigController($scope, $state, localStorageService) {
        $scope.apiToken  = localStorageService.get('apiToken');
        $scope.userId    = localStorageService.get('userId');
        $scope.uuidRegex = '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$';

        $scope.isValid = $scope.apiToken !== null && $scope.userId !== null;

        $scope.save = function () {
            if ($scope.configForm.$valid) {
                localStorageService.set('apiToken', $scope.apiToken);
                localStorageService.set('userId', $scope.userId);

                $state.go('main');
            }
        };
    }
});
