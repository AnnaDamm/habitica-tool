define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.service('groupService', [
        '$q', 'groups', 'members',
        function ($q, groups, members) {
            var party, partyData, memberData;

            return {
                getParty:        function () {
                    var defer = $q.defer();

                    if (!party) {
                        party = groups.query({type: 'party'});
                    }

                    party.$promise.then(function (party) {
                        if (!party.length) {
                            return defer.resolve(null);
                        }
                        defer.resolve(party[0]);
                    });

                    return defer.promise;
                },
                getPartyData:    function () {
                    if (!partyData) {
                        partyData = $q.defer();

                        this.getParty().then(function (party) {
                            if (!party) {
                                partyData.resolve(null);
                            }
                            groups.get({id: party._id}).$promise.then(function (data) {
                                partyData.resolve(data);
                            })
                        });
                    }

                    return partyData.promise;
                },
                getPartyMembers: function () {
                    if (!memberData) {
                        memberData = $q.defer();

                        this.getPartyData().then(function (data) {
                            var partyMembers = [];

                            ng.forEach(data.members, function (member) {
                                partyMembers.push(members.get({id: member._id}).$promise);
                            });

                            $q.all(partyMembers).then(function (members) {
                                memberData.resolve(members);
                            });
                        })
                    }

                    return memberData.promise;
                }
            };
        }
    ]);
});