'use strict';

describe('Filter: prettyNodeName', function () {

  // load the filter's module
  beforeEach(module('fivestarApp'));

  // initialize a new instance of the filter before each test
  var prettyNodeName;
  beforeEach(inject(function ($filter) {
    prettyNodeName = $filter('prettyNodeName');
  }));

  it('should return the input prefixed with "prettyNodeName filter:"', function () {
    var text = 'angularjs';
    expect(prettyNodeName(text)).toBe('prettyNodeName filter: ' + text);
  });

});
