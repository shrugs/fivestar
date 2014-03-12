'use strict';

angular.module('fivestarApp')
.filter('prettyNodeName', function () {
    return function (input) {
        return input === 'BrandName' ? 'Brand' : input;
    };
});
