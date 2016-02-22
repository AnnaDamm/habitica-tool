define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.controller('MainController', [
        '$scope', '$state', '$timeout', 'localStorageService',
        MainController
    ]);

    function MainController($scope, $state, $timeout, localStorageService) {
        $scope.apiToken = localStorageService.get('apiToken');
        $scope.userId   = localStorageService.get('userId');

        if ($scope.apiToken === null || $scope.userId === null) {
            $timeout(function() {
                $state.go('config');
            }, 0);
            return;
        }
    }
});
