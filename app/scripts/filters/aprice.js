'use strict';

angular.module('fivestarApp')
.filter('aPrice', function () {
    return function (input) {
        // if (input.maxPrice === 'max') {
        //     return '$' + (window.parseFloat(input.minPrice/100)).toFixed(2) + '+';
        // }
        return '<span class="bracket-min-price">$<span class="bracket-min-price-num">' + (window.parseFloat(input.minPrice/100)).toFixed(2) + '+</span></span>';
    };
});
