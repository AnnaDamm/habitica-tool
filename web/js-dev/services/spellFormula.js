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

    function getWarriorSpells(userData, attributes, unBuffedAttributes) {
        return {
            smash:            (function () {
                var critMultiplier = getCritMultiplier(attributes.con),
                    dmg            = 55 * attributes.str / (attributes.str + 70);
                return {
                    bonuses: {
                        dmg: dmg
                    },
                    crit:    {
                        chance:     getCritChance(attributes.con),
                        multiplier: critMultiplier,
                        bonuses:    {
                            dmg: dmg * critMultiplier
                        }
                    }
                }
            }()),
            defensiveStance:  {
                bonuses: {
                    con: unBuffedAttributes.con * 40 / (unBuffedAttributes.con + 200)
                }
            },
            valorousPresence: {
                bonuses: {
                    str: unBuffedAttributes.str / (unBuffedAttributes.str + 200)
                },
                group:   true
            },
            intimidate:       {
                bonuses: {
                    con: unBuffedAttributes.con * 24 / (unBuffedAttributes.con + 200)
                },
                group:   true
            }
        }
    }

    function getHealerSpells(userData, attributes, unBuffedAttributes) {
        return {
            heal:        {
                bonuses: {
                    hp: Math.min((attributes.con + attributes.int + 5) * 0.075, 50 - userData.stats.hp)
                }
            },
            brightness:  {
                bonuses: {
                    redness: 4 * (attributes.int / (attributes.int + 40))
                },
                task:    getLowestValueTask(userData)
            },
            protectAura: {
                bonuses: {
                    con: 200 * unBuffedAttributes.con / (unBuffedAttributes.con + 200)
                },
                group:   true
            },
            heallAll:    {
                bonuses: {
                    hp: (attributes.con + attributes.int + 5) * 0.04
                },
                group:   true
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
                rogue:   getRogueSpells,
                wizard:  getWizardSpells,
                warrior: getWarriorSpells,
                healer:  getHealerSpells
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