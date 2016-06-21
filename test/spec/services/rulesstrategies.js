'use strict';

describe('Service: rulesStrategies', function () {

  // load the service's module
  beforeEach(module('widgetdemoApp'));

  // instantiate service
  var rulesStrategies;
  beforeEach(inject(function (_rulesStrategies_) {
    rulesStrategies = _rulesStrategies_;
  }));

  it('should do something', function () {
    expect(!!rulesStrategies).toBe(true);
  });

});
