define([
    'angular',
    'angular-resource'
], function (ng) {
    "use strict";
    return ng.module('app.config', [])
        .constant('baseUrl', 'https://habitica.com/api/v2')
        .constant('classChangeCosts', {gems: 3})
        .constant('gemCosts', {gold: 20});
});