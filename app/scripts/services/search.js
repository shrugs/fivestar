'use strict';

angular.module('fiveStarApp')
.factory('Search', function ($resource) {
    return $resource('/api/search');
});
