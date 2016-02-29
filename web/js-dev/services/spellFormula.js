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

    function getLowestValueTaskInArray(array) {
        return array.reduce(function (previous, current) {
            return !previous || previous.value > current.value ? current : previous;
        });
    }

    function getLowestValueTask(userData) {
        return getLowestValueTaskInArray([
            getLowestValueTaskInArray(userData.habits),
            getLowestValueTaskInArray(userData.dailys),
            getLowestValueTaskInArray(userData.todos)
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

    function getDiminishingReturns(bonus, max, halfway) {
        return max * (bonus / (bonus + halfway));
    }


    function getRogueSpells(userData, attributes, unBuffedAttributes) {
        var bestTask = getHighestValueTask(userData);
        return {
            pickPocket: (function () {
                var bonus = Math.max(0, bestTask.value) + 1 + attributes.per * 0.5;
                return {
                    bonuses: {
                        gold: getDiminishingReturns(bonus, 25, 75)
                    },
                    task: bestTask
                }
            }()),
            backStab: (function () {
                var bonus          = Math.max(0, bestTask.value) + 1 + attributes.str * 0.5,
                    critMultiplier = getCritMultiplier(attributes.str);

                return {
                    bonuses: {
                        xp: getDiminishingReturns(bonus, 75, 50),
                        gold: getDiminishingReturns(bonus, 18, 75)
                    },
                    crit: {
                        chance: 0.3,
                        multiplier: critMultiplier,
                        bonuses: {
                            xp: getDiminishingReturns(critMultiplier * bonus, 75, 50),
                            gold: getDiminishingReturns(critMultiplier * bonus, 18, 75)
                        }
                    },
                    task: bestTask
                };
            }()),
            toolsOfTrade: {
                bonuses: {
                    per: Math.ceil(getDiminishingReturns(unBuffedAttributes.per, 100, 50))
                },
                group: true
            },
            stealth: {
                bonuses: {
                    amount: getDiminishingReturns(attributes.per, 0.64 * getDueDailies(userData).length, 55)
                }
            }
        };
    }

    function getWizardSpells(userData, attributes, unBuffedAttributes) {
        var bestTask = getHighestValueTask(userData);
        return {
            fireball: (function () {
                var bonus          = Math.max(0, bestTask.value) + 1 + attributes.int * 0.075,
                    critMultiplier = getCritMultiplier(attributes.per);

                return {
                    bonuses: {
                        xp: getDiminishingReturns(bonus, 75, 37.5)
                    },
                    crit: {
                        chance: getCritChance(attributes.per),
                        multiplier: critMultiplier,
                        bonuses: {
                            xp: getDiminishingReturns(critMultiplier * bonus, 75, 37.5)
                        }
                    },
                    task: bestTask
                }
            }()),
            mpheal: {
                bonuses: {
                    mp: getDiminishingReturns(attributes.int, 25, 125)
                },
                group: true
            },
            earth: {
                bonuses: {
                    int: Math.ceil(getDiminishingReturns(unBuffedAttributes.int, 30, 200))
                },
                group: true
            },
            frost: {
                custom: [{
                    name: "unfinished tasks",
                    items: getDueDailies(userData).filter(function (daily) {
                        return !daily.completed;
                    })
                }]
            }
        };
    }

    function getWarriorSpells(userData, attributes, unBuffedAttributes) {
        return {
            smash: (function () {
                var critMultiplier = getCritMultiplier(attributes.con);
                return {
                    bonuses: {
                        dmg: getDiminishingReturns(attributes.str, 55, 70)
                    },
                    crit: {
                        chance: getCritChance(attributes.con),
                        multiplier: critMultiplier,
                        bonuses: {
                            dmg: getDiminishingReturns(critMultiplier * attributes.str, 55, 70)
                        }
                    }
                }
            }()),
            defensiveStance: {
                bonuses: {
                    con: Math.ceil(getDiminishingReturns(unBuffedAttributes.con, 40, 200))
                }
            },
            valorousPresence: {
                bonuses: {
                    str: Math.ceil(getDiminishingReturns(unBuffedAttributes.str, 20, 200))
                },
                group: true
            },
            intimidate: {
                bonuses: {
                    con: Math.ceil(getDiminishingReturns(unBuffedAttributes.con, 24, 200))
                },
                group: true
            }
        }
    }

    function getHealerSpells(userData, attributes, unBuffedAttributes) {
        return {
            heal: {
                bonuses: {
                    hp: Math.min((attributes.con + attributes.int + 5) * 0.075, 50 - userData.stats.hp)
                }
            },
            brightness: {
                bonuses: {
                    redness: getDiminishingReturns(attributes.int, 4, 40)
                },
                task: getLowestValueTask(userData)
            },
            protectAura: {
                bonuses: {
                    con: Math.ceil(getDiminishingReturns(unBuffedAttributes.con, 200, 200))
                },
                group: true
            },
            heallAll: {
                bonuses: {
                    hp: (attributes.con + attributes.int + 5) * 0.04
                },
                group: true
            }
        };
    }

    function calculateGroupBuffs(spells, partyMembers) {
        if (!partyMembers) {
            return spells;
        }
        ng.forEach(spells, function (info, name) {
            if (!info.group) {
                return;
            }
            var groupBonuses = {};
            ng.forEach(info.bonuses, function (amount, name) {
                var amount = round(amount, 2);
                if (name === "hp") {
                    groupBonuses[name] = 0;
                    ng.forEach(partyMembers, function (member) {
                        groupBonuses[name] += Math.min(amount, round(50 - member.stats.hp, 2));
                    });
                } else {
                    groupBonuses[name] = amount * partyMembers.length;
                }
            });

            info.groupBonuses = groupBonuses;
        });

        return spells;
    }

    function getByClass(userData, attributes, unBuffedAttributes, partyMembers) {
        var spells = {
                rogue: getRogueSpells,
                wizard: getWizardSpells,
                warrior: getWarriorSpells,
                healer: getHealerSpells
            },
            classSpells;

        if (spells[userData.stats.class]) {
            classSpells = spells[userData.stats.class](userData, attributes, unBuffedAttributes);
            return calculateGroupBuffs(classSpells, partyMembers);
        }

        return null;
    }

    function round(number, decimals) {
        return new Intl.NumberFormat('en-US', {maximumFractionDigits: decimals}).format(number);
    }


    module.service('spellFormulaService', [
        '$q', 'userService', 'groupService', 'members',
        function ($q, userService, groupService, members) {
            return {
                calculateAll: function () {
                    var defer = $q.defer();

                    $q.all([
                        groupService.getPartyMembers(),
                        userService.getData(),
                        userService.getAttributes(),
                        userService.getAttributes(true)
                    ]).then(function (values) {
                        var partyMembers       = values[0],
                            userData           = values[1],
                            attributes         = values[2],
                            unBuffedAttributes = values[3],
                            spells             = getByClass(userData, attributes, unBuffedAttributes, partyMembers);

                        if (spells === null) {
                            defer.reject();
                        } else {
                            defer.resolve(spells);
                        }
                    });

                    return defer.promise;
                },
                round: round
            };
        }
    ]);
});