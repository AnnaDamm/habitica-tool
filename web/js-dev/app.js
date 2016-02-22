/*global language, direction */
define([
    'angular',
    'angular-ui-router',
    'angular-local-storage',
    'controllers/index',
    'resources/index'
], function (ng) {
    "use strict";
    return ng.module('app', [
        'ui.router',
        'LocalStorageModule',
        'app.controllers',
        'app.resources'
    ]).config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('habitica-tool');
    });
});