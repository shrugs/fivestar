'use strict';

describe('Filter: nodeSort', function () {

  // load the filter's module
  beforeEach(module('fivestarApp'));

  // initialize a new instance of the filter before each test
  var nodeSort;
  beforeEach(inject(function ($filter) {
    nodeSort = $filter('nodeSort');
  }));

  it('should return the input prefixed with "nodeSort filter:"', function () {
    var text = 'angularjs';
    expect(nodeSort(text)).toBe('nodeSort filter: ' + text);
  });

});
