'use strict';

describe('Service: rulesService', function () {

  // load the service's module
  beforeEach(module('widgetdemoApp'));

  // instantiate service
  var rulesService;
  beforeEach(inject(function (_rulesService_) {
    rulesService = _rulesService_;
  }));

  it('should do something', function () {
    expect(!!rulesService).toBe(true);
  });

});
