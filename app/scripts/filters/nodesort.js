'use strict';

angular.module('fiveStarApp')
.filter('nodeSort', function () {
    return function (input) {
        angular.forEach(input, function(i) {
            i.BinItemCount = parseInt(i.BinItemCount, 10);
        });
        return input;
    };
});