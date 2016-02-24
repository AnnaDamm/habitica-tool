define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.service('contentService', [
        '$q', 'content',
        function ($q, content) {
            var allContent,
                gear;

            return {
                getAll:       function () {
                    if (!allContent) {
                        allContent = content.get().$promise;
                    }
                    return allContent;
                },
                getGear: function () {
                    var defer = $q.defer();

                    if (!gear) {
                        this.getAll().then(function (all) {
                            gear = all.gear.flat;
                            defer.resolve(gear);
                        });
                    } else {
                        defer.resolve(gear);
                    }

                    return defer.promise;
                }
            };
        }
    ]);
});