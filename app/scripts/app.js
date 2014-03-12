'use strict';

angular.module('fiveStarApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'rt.debounce'
]).config(function ($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl',
        reloadOnSearch: false
    })
    .otherwise({
        redirectTo: '/'
    });

    $locationProvider.html5Mode(true);
});