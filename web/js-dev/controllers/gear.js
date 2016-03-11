define([
    'angular',
    './module',
    'text!templates/gear.html'
], function (ng, module, html) {
    "use strict";
    module.controller('GearController', [
        '$scope', '$rootScope', '$q',
        'configService', 'userService', 'contentService',
        'classChangeCosts', 'gemCosts',
        GearController
    ]).run(function ($templateCache) {
        $templateCache.put('templates/gear.html', html);
    });

    var initialized = false;

    function GearController($scope, $rootScope, $q,
                            configService, userService, contentService,
                            classChangeCosts, gemCosts) {

        if (!configService.checkValid()) {
            return;
        }

        $scope.attributesToUse = userService.attributesToUse;

        $scope.gearChange = function () {
            $scope.gearBonus                    = userService.getGearBonuses($scope.equippedGear, $scope.userData.stats.class, $scope.gear.flat);
            $scope.attributes                   = userService.calculateAttributes($scope.userData, $scope.gearBonus, true);
            $scope.userData.items.gear.equipped = $scope.equippedGear;
            $scope.costs                        = getCosts();
        };

        $scope.userDataChange = function () {
            $scope.levelBonus = userService.getLevelBonus($scope.userData.stats.lvl);
        };

        var firstOpened       = {};
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

        function getCosts() {
            var costs        = {
                    gold: 0,
                    gems: 0
                },
                classChanges = {};

            function addClassChangeCosts() {
                ng.forEach(classChangeCosts, function (amount, type) {
                    costs[type] += amount;
                });
            }

            ng.forEach($scope.equippedGear, function (itemName, slot) {
                if ($scope.ownedGear[itemName]) {
                    return;
                }

                var item = $scope.gear.flat[itemName];

                if (item.klass && item.klass !== 'base') {
                    if (item.klass !== $scope.userData.stats.class && !classChanges[item.klass]) {
                        addClassChangeCosts();
                        classChanges[item.klass] = true;
                    }

                    // class items have to be purchased one by one
                    var classItems = $scope.gear.tree[slot][item.klass];
                    for (var number in classItems) {
                        if (!classItems.hasOwnProperty(number)) {
                            continue;
                        }
                        var currentItem = classItems[number];
                        if ($scope.ownedGear[currentItem.key]) {
                            continue;
                        }

                        costs.gold += currentItem.value;

                        if (currentItem.key == itemName) {
                            break;
                        }
                    }
                }
            });

            // add costs to change back to original class
            if (Object.keys(classChanges).length) {
                addClassChangeCosts();
            }

            if (costs.gold || costs.gems) {
                return costs;
            }
            return null;
        }

        $scope.getGemCosts = function (gems) {
            return gems * gemCosts.gold;
        };

        $scope.changeLevel = function (attribute, addition) {
            $scope.userData.stats[attribute] += addition;
            $scope.userData.stats.lvl += addition;

            userService.getAttributes(true, $scope.userData).then(function (attributes) {
                $scope.attributes = attributes;
            });

            $scope.userDataChange();
            emitChange();
        };

        $scope.reset = function (reload) {
            if (reload === undefined) {
                reload = true;
            }

            $q.all([
                userService.getData(reload),
                contentService.getAllGear(),
                userService.getAttributes(true)
            ]).then(function (values) {
                var userData   = ng.copy(values[0]),
                    gear       = values[1],
                    attributes = values[2];

                $scope.userData     = userData;
                $scope.equippedGear = userData.items.gear.equipped;
                $scope.ownedGear    = userData.items.gear.owned;
                $scope.gear         = gear;
                $scope.attributes   = attributes;
                $scope.costs        = getCosts();
                $scope.actualLevel  = userService.getOriginalData().stats.lvl;

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

        $scope.reset(!initialized);
        var unbindReload = $rootScope.$on('reload', function () {
            $scope.reset(true);
        });
        $scope.$on('$destroy', function () {
            unbindReload();
        });

        initialized = true;
    }
});
