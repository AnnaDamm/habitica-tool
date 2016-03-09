define([
    'angular',
    './module'
], function (ng, module) {
    "use strict";
    module.service('configService', [
        '$state', '$timeout', 'localStorageService',
        function ($state, $timeout, localStorageService) {
            return {
                isValid:       function () {
                    return localStorageService.get('apiToken') !== null &&
                        localStorageService.get('userId') !== null
                },
                checkValid: function () {
                    if (!this.isValid()) {
                        $timeout(function () {
                            $state.go('config');
                        }, 0);
                        return false;
                    }
                    return true;
                }
            };
        }
    ]);
});