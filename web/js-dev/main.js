require.config({
    paths: {
        angular:                 "../lib/angular/angular",
        "angular-resource":      "../lib/angular-resource/angular-resource",
        "angular-local-storage": "../lib/angular-local-storage/dist/angular-local-storage",
        "angular-ui-router":     "../lib/angular-ui-router/release/angular-ui-router",
        bootstrap:               "../lib/bootstrap/dist/js/bootstrap",
        jquery:                  "../lib/jquery/dist/jquery",
        text:                    "../lib/text/text"

    },
    shim:  {
        angular:                 {
            exports: 'angular',
            deps:    ['jquery']
        },
        "angular-resource":      {
            deps: ['angular']
        },
        "angular-ui-router":     {
            deps: ['angular']
        },
        "angular-local-storage": {
            deps: ['angular']
        },
        jquery:                  {
            exports: '$'
        },
        bootstrap:               {
            deps: ['jquery']
        },
    }
});

define([
    'angular',
    'app',
    'routes',
    'bootstrap',
    'text'
], function (ng) {
    "use strict";

    ng.bootstrap(document, ['app']);
});