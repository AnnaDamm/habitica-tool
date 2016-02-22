define([
    'angular',
    'angular-resource'
], function (ng) {
    "use strict";
    return ng.module('app.config', [])
        .constant('baseUrl', 'https://habitica.com/api/v2');
});