/*global language, direction */
define([
    'angular',
    'text!templates/partials/footer.html',
    'angular-ui-router',
    'angular-ui-bootstrap',
    'angular-local-storage',
    'controllers/index',
    'resources/index',
    'services/index',
    'config'
], function (ng, footer) {
    "use strict";
    return ng.module('app', [
        'ui.router',
        'LocalStorageModule',
        'app.controllers',
        'app.resources',
        'app.services',
        'app.config',
        'ui.bootstrap'
    ]).config(function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('habitica-tool');
    }).run(function ($templateCache, $rootScope, $cachedResource, pkg) {
        $templateCache.put('templates/partials/footer.html', footer);

        $rootScope.package = pkg;
    });
});