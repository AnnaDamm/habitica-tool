define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";

    function getHighestValueTaskInArray(array) {
        return array.reduce(function (previous, current) {
            return !previous || previous.value < current.value ? current : previous;
        });
    }

    function getHighestValueTask(userData) {
        return getHighestValueTaskInArray([
            getHighestValueTaskInArray(userData.habits),
            getHighestValueTaskInArray(userData.dailys),
            getHighestValueTaskInArray(userData.todos)
        ]);
    }

    function getNumberOfDueDailies(userData) {
        var date         = new Date(),
            dayOfTheWeek = date.getDay(),
            dayNames     = {
                "0": "su",
                "1": "m",
                "2": "t",
                "3": "w",
                "4": "th",
                "5": "f",
                "6": "s"
            },
            dayToCheck   = dayNames[dayOfTheWeek];

        return userData.dailys.filter(function (daily) {
            return daily.repeat[dayToCheck] === true;
        }).length;
    }

    function getCritMultiplier(attributes) {
        return 1.5 + ((4 * attributes.str) / (attributes.str + 200));
    }


    function getRogueSpells(userData, attributes, unBuffedAttributes) {
        var bestTask = getHighestValueTask(userData);
        return {
            pickPocket:   (function () {
                var bonus = bestTask.value + 1 + attributes.per * 0.5;
                return {
                    bonuses: {
                        gold: 25 * bonus / (bonus + 75),
                    },
                    task:    bestTask
                }
            }()),
            backStab:     (function () {
                var bonus          = bestTask.value + 1 + attributes.str * 0.5,
                    xp             = 75 * bonus / (bonus + 50),
                    gold           = 18 * bonus / (bonus + 75),
                    critMultiplier = getCritMultiplier(attributes);

                return {
                    bonuses: {
                        xp:   xp,
                        gold: gold
                    },
                    crit:    {
                        chance:     0.3,
                        multiplier: critMultiplier,
                        bonuses:    {
                            xp:   xp * critMultiplier,
                            gold: gold * critMultiplier
                        }
                    },
                    task:    bestTask
                };
            }()),
            toolsOfTrade: {
                bonuses: {
                    amount: 0.64 * getNumberOfDueDailies(userData) * attributes.per / (attributes.per + 55)
                }
            },
            stealth:      {
                bonuses: {
                    per: unBuffedAttributes.per * 100 / (unBuffedAttributes.per + 50),
                },
                group:   true
            }
        };
    }

    function getByClass(userData, attributes, unBuffedAttributes) {
        var spells = {
            rogue: getRogueSpells
        };

        if (spells[userData.stats.class]) {
            return spells[userData.stats.class](userData, attributes, unBuffedAttributes);
        }

        return null;
    }


    module.service('spellFormulaService', [
        '$q', 'userService',
        function ($q, userService) {
            return {
                calculateAll: function () {
                    var defer = $q.defer();

                    $q.all([
                        userService.getData(),
                        userService.getAttributes(),
                        userService.getAttributes(true)
                    ]).then(function (values) {
                        var userData           = values[0],
                            attributes         = values[1],
                            unBuffedAttributes = values[2],
                            spells             = getByClass(userData, attributes, unBuffedAttributes);

                        if (spells === null) {
                            defer.reject();
                        } else {
                            defer.resolve(spells);
                        }
                    });

                    return defer.promise;
                }
            };
        }
    ]);
});