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

    function getDueDailies(userData) {
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
        })
    }

    function getCritMultiplier(attribute) {
        return 1.5 + ((4 * attribute) / (attribute + 200));
    }

    function getCritChance(attribute) {
        return 3 * (1 + attribute / 100) / 100;
    }


    function getRogueSpells(userData, attributes, unBuffedAttributes) {
        var bestTask = getHighestValueTask(userData);
        return {
            pickPocket:   (function () {
                var bonus = Math.max(0, bestTask.value) + 1 + attributes.per * 0.5;
                return {
                    bonuses: {
                        gold: 25 * bonus / (bonus + 75)
                    },
                    task:    bestTask
                }
            }()),
            backStab:     (function () {
                var bonus          = Math.max(0, bestTask.value) + 1 + attributes.str * 0.5,
                    xp             = 75 * bonus / (bonus + 50),
                    gold           = 18 * bonus / (bonus + 75),
                    critMultiplier = getCritMultiplier(attributes.str);

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
                    per: unBuffedAttributes.per * 100 / (unBuffedAttributes.per + 50)
                },
                group:   true
            },
            stealth:      {
                bonuses: {
                    amount: 0.64 * getDueDailies(userData).length * attributes.per / (attributes.per + 55)
                }
            }
        };
    }

    function getWizardSpells(userData, attributes, unBuffedAttributes) {
        var bestTask = getHighestValueTask(userData);
        return {
            fireball: (function () {
                var bonus          = Math.max(0, bestTask.value) + 1 + attributes.int * 0.075,
                    critMultiplier = getCritMultiplier(attributes.per),
                    xp             = 75 * bonus / (bonus + 37.5);

                return {
                    bonuses: {
                        xp: xp
                    },
                    crit:    {
                        chance:     getCritChance(attributes.per),
                        multiplier: critMultiplier,
                        bonuses:    {
                            xp: xp * critMultiplier
                        }
                    },
                    task:    bestTask
                }
            }()),
            mpheal:   {
                bonuses: {
                    mp: attributes.int * 25 / (attributes.int + 125)
                },
                group:   true
            },
            earth:    {
                bonuses: {
                    int: unBuffedAttributes.int * 30 / (unBuffedAttributes.int + 200)
                },
                group:   true
            },
            frost:    {
                custom: [{
                    name:  "unfinished tasks",
                    items: getDueDailies(userData).filter(function (daily) {
                        return !daily.completed;
                    })
                }]
            }
        };
    }

    function getByClass(userData, attributes, unBuffedAttributes) {
        var spells = {
            rogue:  getRogueSpells,
            wizard: getWizardSpells
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