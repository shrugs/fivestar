'use strict';

describe('Filter: prettyDeptName', function () {

  // load the filter's module
  beforeEach(module('fiveStarApp'));

  // initialize a new instance of the filter before each test
  var prettyDeptName;
  beforeEach(inject(function ($filter) {
    prettyDeptName = $filter('prettyDeptName');
  }));

  it('should return the input prefixed with "prettyDeptName filter:"', function () {
    var text = 'angularjs';
    expect(prettyDeptName(text)).toBe('prettyDeptName filter: ' + text);
  });

});
