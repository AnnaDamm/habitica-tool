define([
    'angular',
    './module',
    'text!templates/main.html'
], function (ng, module, html) {
    "use strict";
    module.controller('MainController', [
        '$scope', '$rootScope', 'configService',
        'userService', 'spellFormulaService',
        MainController
    ]).run(function ($templateCache) {
        $templateCache.put('templates/main.html', html);
    });

    function MainController($scope, $rootScope, configService,
                            userService, spellFormulaService) {

        if (!configService.checkValid()) {
            return;
        }

        $scope.round = spellFormulaService.round;

        userService.getData().then(function (userData) {
            $scope.tasks = userData.habits
                .concat(userData.dailys)
                .concat(userData.todos.filter(function (todo) {
                    return !todo.completed;
                }))
                .sort(function (a, b) {
                    return b.value - a.value;
                });

            $scope.userData = userData;
            spellFormulaService.calculateAll($scope.userData).then(function (calculated) {
                $scope.calculatedSpells = calculated;
            });
        });

        userService.getAttributes().then(function (attributes) {
            $scope.attributes = attributes;
        });

        userService.getSpells().then(function (spells) {
            $scope.spells = spells;
        });
    }
});
