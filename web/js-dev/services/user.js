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
                getData:       function (reload) {
                    if (!userData || reload === true) {
                        userData = user.get().$promise;
                    }

                    return userData;
                },
                getClass:      function () {
                    var defer = $q.defer();

                    this.getData().then(function (userData) {
                        defer.resolve(userData.stats.class);
                    });

                    return defer.promise;
                },
                getAttributes: function (unBuffed) {
                    var attributesToUse = [
                            'str', 'int', 'con', 'per'
                        ],
                        defer           = $q.defer(),
                        unBuffed        = unBuffed || false;

                    $q.all([
                        contentService.getGear(),
                        this.getData()
                    ]).then(function (values) {
                        var gear       = values[0],
                            userData   = values[1],
                            attributes = {},
                            levelBonus = Math.ceil((userData.stats.lvl - 1) / 2);

                        // base stats
                        ng.forEach(attributesToUse, function (name) {
                            attributes[name] = userData.stats[name] + levelBonus;
                            if (!unBuffed && userData.stats.buffs && userData.stats.buffs[name]) {
                                attributes[name] += userData.stats.buffs[name];
                            }
                        });

                        // add gear stats
                        ng.forEach(userData.items.gear.equipped, function (itemName, slot) {
                            var itemData    = gear[itemName],
                                isClassItem = itemData.klass == userData.stats.class;
                            if (itemData) {
                                ng.forEach(attributesToUse, function (name) {
                                    attributes[name] += itemData[name] * (isClassItem ? 1.5 : 1);
                                });
                            }
                        });

                        defer.resolve(attributes);
                    });

                    return defer.promise;
                },
                getSpells:     function () {
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