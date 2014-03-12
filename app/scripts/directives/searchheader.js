'use strict';

angular.module('fivestarApp')
.directive('searchheader', function () {
    return {
        templateUrl: 'views/partials/searchheader.html',
        restrict: 'AE'
    };
});
