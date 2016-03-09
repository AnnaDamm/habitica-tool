define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.service('userService', [
        '$q', 'user', 'contentService',
        function ($q, user, contentService) {
            var userData;

            return {
                attributesToUse: [
                    'str', 'int', 'con', 'per'
                ],
                getData: function (reload) {
                    if (!userData || reload === true) {
                        userData = user.get().$promise;
                    }

                    return userData;
                },
                getClass: function () {
                    var defer = $q.defer();

                    this.getData().then(function (userData) {
                        defer.resolve(userData.stats.class);
                    });

                    return defer.promise;
                },
                getLevelBonus: function (level) {
                    return Math.ceil((level - 1) / 2);
                },
                getGearBonuses: function (equippedGear, userClass, gearData) {
                    var self       = this,
                        attributes = {};

                    ng.forEach(equippedGear, function (itemName, slot) {
                        var itemData = gearData[itemName];
                        if (itemData) {
                            var isClassItem = itemData.klass == userClass;
                            ng.forEach(self.attributesToUse, function (name) {
                                attributes[name] = (attributes[name] ? attributes[name] : 0) + itemData[name] * (isClassItem ? 1.5 : 1);
                            });
                        }
                    });

                    return attributes;
                },
                calculateAttributes: function (userData, gearBonuses, unBuffed) {
                    var levelBonus = this.getLevelBonus(userData.stats.lvl),
                        attributes = {};

                    unBuffed = unBuffed || false;

                    // base stats
                    ng.forEach(this.attributesToUse, function (name) {
                        attributes[name] = userData.stats[name] + levelBonus;
                        if (!unBuffed && userData.stats.buffs && userData.stats.buffs[name]) {
                            attributes[name] += userData.stats.buffs[name];
                        }
                        if (gearBonuses[name]) {
                            attributes[name] += gearBonuses[name];
                        }
                    });

                    return attributes;
                },
                getAttributes: function (unBuffed, userData) {
                    var defer    = $q.defer(),
                        self     = this;

                    $q.all([
                        contentService.getGear(),
                        (function () {
                            if (userData) {
                                var defer = $q.defer();
                                defer.resolve(userData);
                                return defer.promise;
                            } else {
                                return self.getData();
                            }
                        }())
                    ]).then(function (values) {
                        var gear      = values[0],
                            userData  = values[1],
                            gearBonuses = self.getGearBonuses(userData.items.gear.equipped, userData.stats.class, gear),
                            attributes = self.calculateAttributes(userData, gearBonuses, unBuffed);

                        defer.resolve(attributes);
                    });

                    return defer.promise;
                },
                getSpells: function () {
                    var defer = $q.defer();

                    $q.all([
                        contentService.getAll(),
                        this.getData()
                    ]).then(function (values) {
                        var content  = values[0],
                            userData = values[1];

                        defer.resolve(content.spells[userData.stats.class]);
                    });

                    return defer.promise;
                }
            };
        }
    ]);
});