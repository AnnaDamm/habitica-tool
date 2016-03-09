define([
    'angular',
    './module',
    'text!templates/gear.html'
], function (ng, module, html) {
    "use strict";
    module.controller('GearController', [
        '$scope', '$rootScope', '$q', '$anchorScroll',
        'configService', 'userService', 'contentService',
        GearController
    ]).run(function ($templateCache) {
        $templateCache.put('templates/gear.html', html);
    });

    function GearController($scope, $rootScope, $q, $anchorScroll,
                            configService, userService, contentService) {

        if (!configService.checkValid()) {
            return;
        }

        $scope.attributesToUse = userService.attributesToUse;

        $scope.gearChange = function () {
            $scope.gearBonus = userService.getGearBonuses($scope.equippedGear, $scope.userData.stats.class, $scope.gear.flat);
            $scope.attributes = userService.calculateAttributes($scope.userData, $scope.gearBonus, true);
            $scope.userData.items.gear.equipped = $scope.equippedGear;
        };

        $scope.userDataChange = function () {
            $scope.levelBonus = userService.getLevelBonus($scope.userData.stats.lvl);
        };

        var firstOpened = {};
        $scope.dropdownOpened = function (slot, isOpen) {
            if (isOpen && !firstOpened[slot]) {
                var $dropdown = $("#slot_" + slot + "_dropdown"),
                    $item     = $("#item_" + $scope.equippedGear[slot]);

                $dropdown.scrollTop($dropdown.scrollTop() + $item.position().top);
                firstOpened[slot] = true;
            }
        };

        $scope.useGear = function (slot, item) {
            $scope.equippedGear[slot] = item.key;
            $scope.gearChange();
            emitChange();
        };

        $scope.reset = function() {
            $q.all([
                userService.getData(),
                contentService.getAllGear(),
                userService.getAttributes(true)
            ]).then(function (values) {
                var userData   = ng.copy(values[0]),
                    gear       = values[1],
                    attributes = values[2];

                $scope.userData     = userData;
                $scope.equippedGear = userData.items.gear.equipped;
                $scope.gear         = gear;
                $scope.attributes   = attributes;

                console.log(values);

                ng.forEach($scope.gear.tree, function (category, slot) {
                    if (!$scope.equippedGear[slot]) {
                        $scope.equippedGear[slot] = category.base[0].key;
                    }
                });

                $scope.gearChange();
                $scope.userDataChange();

                emitChange();
            });
        };

        function emitChange() {
            $rootScope.$emit('userData.change', $scope.userData);
        }

        $scope.reset();
    }
});
