'use strict';

describe('Service: postalService', function () {

  // load the service's module
  beforeEach(module('widgetdemoApp'));

  // instantiate service
  var postalService;
  beforeEach(inject(function (_postalService_) {
    postalService = _postalService_;
  }));

  it('should do something', function () {
    expect(!!postalService).toBe(true);
  });

});
