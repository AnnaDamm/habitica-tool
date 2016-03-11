define([
    'angular',
    'text!package.json',
    'angular-resource'
], function (ng, pkg) {
    "use strict";
    return ng.module('app.config', [])
        .constant('baseUrl', 'https://habitica.com/api/v2')
        .constant('classChangeCosts', {gems: 3})
        .constant('gemCosts', {gold: 20})
        .constant('pkg', JSON.parse(pkg));
});