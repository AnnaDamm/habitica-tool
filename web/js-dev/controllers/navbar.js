define([
    'angular',
    './module',
    'text!templates/partials/navbar.html'
], function (ng, module, html) {
    "use strict";
    module.controller('NavbarController', [
        '$scope', '$rootScope',
        NavbarController
    ]).run(function ($templateCache) {
        $templateCache.put('templates/partials/navbar.html', html);
    });

    function NavbarController($scope, $rootScope) {

        $scope.reload = function() {
            $rootScope.$emit('clearCache');
            $rootScope.$emit('reload');
        };
    }
});
