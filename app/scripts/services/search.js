'use strict';

angular.module('fivestarApp')
.factory('Search', function ($resource) {

    return $resource('/api/search');

});
