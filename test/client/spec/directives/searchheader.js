'use strict';

describe('Directive: searchheader', function () {

  // load the directive's module
  beforeEach(module('fivestarApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<searchheader></searchheader>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the searchheader directive');
  }));
});
