define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.controller('MainController', [
        '$scope', '$state', '$timeout', 'localStorageService',
        'userService', 'contentService',
        MainController
    ]);

    function MainController($scope, $state, $timeout, localStorageService,
                            userService, contentService) {
        $scope.apiToken = localStorageService.get('apiToken');
        $scope.userId   = localStorageService.get('userId');

        if ($scope.apiToken === null || $scope.userId === null) {
            return $timeout(function() {
                $state.go('config');
            }, 0);
        }

        $scope.userData = userService.getData();

        userService.getAttributes().then(function (attributes) {
            $scope.attributes = attributes;
        });
    }
});
