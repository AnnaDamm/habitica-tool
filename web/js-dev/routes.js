define([
    'app'
], function (app) {
    "use strict";

    app.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('main', {
                url:         '/',
                templateUrl: '/templates/main.html',
                controller: 'MainController'
            })
            .state('config', {
                url:         '/config',
                templateUrl: '/templates/config.html',
                controller: 'ConfigController'
            });
    });
});
