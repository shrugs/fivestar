'use strict';

describe('Filter: aPrice', function () {

  // load the filter's module
  beforeEach(module('fivestarApp'));

  // initialize a new instance of the filter before each test
  var aPrice;
  beforeEach(inject(function ($filter) {
    aPrice = $filter('aPrice');
  }));

  it('should return the input prefixed with "aPrice filter:"', function () {
    var text = 'angularjs';
    expect(aPrice(text)).toBe('aPrice filter: ' + text);
  });

});
