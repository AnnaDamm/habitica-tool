/*global language, direction */
define([
    'angular',
    'text!templates/partials/navbar.html',
    'angular-ui-router',
    'angular-ui-bootstrap',
    'angular-local-storage',
    'controllers/index',
    'resources/index',
    'services/index',
    'config'
], function (ng, html) {
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
    }).run(function ($templateCache) {
        $templateCache.put('templates/partials/navbar.html', html);
    });
});