define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.controller('MainController', [
        '$scope', '$state', '$timeout', '$window',
        'localStorageService',
        'userService', 'spellFormulaService',
        MainController
    ]);

    function MainController($scope, $state, $timeout, $window,
                            localStorageService,
                            userService, spellFormulaService) {

        $scope.apiToken = localStorageService.get('apiToken');
        $scope.userId   = localStorageService.get('userId');

        $scope.round = function (number, decimals) {
            return new Intl.NumberFormat('en-US', {maximumFractionDigits: decimals}).format(number);
        };

        if ($scope.apiToken === null || $scope.userId === null) {
            return $timeout(function () {
                $state.go('config');
            }, 0);
        }

        userService.getData().then(function (userData) {
            $scope.userData = userData;
        });

        userService.getAttributes().then(function (attributes) {
            $scope.attributes = attributes;
        });

        userService.getSpells().then(function (spells) {
            $scope.spells = spells;
        });

        spellFormulaService.calculateAll().then(function (calculated) {
            $scope.calculatedSpells = calculated;
        });
    }
});
