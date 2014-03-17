'use strict';

angular.module('fiveStarApp')
.filter('prettyNodeName', function () {
    var names = {
        BrandName: 'Brand',
        Categories: 'Department'
    };

    return function (input) {
        return names[input] || input;
    };
});