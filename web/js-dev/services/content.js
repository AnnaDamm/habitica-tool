define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.service('contentService', [
        '$q', '$rootScope', 'content',
        function ($q, $rootScope, content) {
            var allContent,
                gear;

            $rootScope.$on('clearCache', function () {
                allContent = undefined;
            });

            return {
                getAll:       function () {
                    if (!allContent) {
                        allContent = content.get().$promise;
                    }
                    return allContent;
                },
                getAllGear: function() {
                    var defer = $q.defer();
                    if (!gear) {
                        this.getAll().then(function (all) {
                            defer.resolve(all.gear);
                        });
                    } else {
                        defer.resolve(gear);
                    }

                    return defer.promise;
                },
                getGear: function () {
                    var defer = $q.defer();
                    this.getAllGear().then(function (gear) {
                        defer.resolve(gear.flat);
                    });

                    return defer.promise;
                }
            };
        }
    ]);
});