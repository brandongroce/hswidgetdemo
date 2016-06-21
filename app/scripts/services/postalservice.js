'use strict';

/**
 * @ngdoc service
 * @name widgetdemoApp.postalService
 * @description
 * # postalService
 * Factory in the widgetdemoApp.
 */
angular.module('widgetdemoApp')
  .factory('postalService', ['$http', function ($http) {
    var postalService = {};

    //Get location info from zipcode
    postalService.lookupZipCode = function (zipcode) {
      return $http.get('http://api.zippopotam.us/us/' + zipcode);
    };

    return postalService;
  }]);
