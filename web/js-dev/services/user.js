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
                        userData = user.get();
                    }

                    return userData;
                },
                getAttributes: function () {
                    var attributesToUse = [
                            'str', 'int', 'con', 'per'
                        ],
                        defer           = $q.defer();

                    $q.all([
                        contentService.getGear(),
                        this.getData()
                    ]).then(function (values) {
                        var gear     = values[0],
                            userData = values[1];

                        var attributes = {},
                            levelBonus = Math.floor((userData.stats.lvl - 1) / 2);

                        // base stats
                        ng.forEach(attributesToUse, function (name) {
                            attributes[name] = userData.stats[name] + levelBonus;
                            if (userData.stats.buffs && userData.stats.buffs[name]) {
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
                }
            };
        }
    ]);
});