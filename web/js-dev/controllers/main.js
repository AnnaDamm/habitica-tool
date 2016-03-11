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

        function load() {
            $scope.round = spellFormulaService.round;

            userService.getData().then(function (userData) {
                $scope.userData = userData;
                $scope.tasks = userData.habits
                    .concat(userData.dailys)
                    .concat(userData.todos.filter(function (todo) {
                        return !todo.completed;
                    }))
                    .sort(function (a, b) {
                        return b.value - a.value;
                    });
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

        var unbindReload = $rootScope.$on('reload', function () {
            load();
        });
        $scope.$on('$destroy', function () {
            unbindReload();
        });

        load();
    }
});
