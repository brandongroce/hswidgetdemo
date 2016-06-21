'use strict';

describe('Service: configFactory', function () {

  // load the service's module
  beforeEach(module('widgetdemoApp'));

  // instantiate service
  var configFactory;
  beforeEach(inject(function (_configFactory_) {
    configFactory = _configFactory_;
  }));

  it('should do something', function () {
    expect(!!configFactory).toBe(true);
  });

});
