'use strict';

/**
 * @ngdoc function
 * @name widgetdemoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the widgetdemoApp
 */
angular
  .module('widgetdemoApp')
  .controller('MainCtrl', function ($scope, $mdToast, $location, postalService, configFactory, rulesService, $timeout, $q) {


  configFactory.getPartnerConfig('geico')
    .then(function (response) {
      $scope.config = response.data;
    }, function (error) {
      console.log('Unable to load config data: ' + error.message);
    });
  configFactory.getIndustries()
    .then(function (response) {
      $scope.industries = response.data;
      $scope.autocompleteArray = configFactory.getAutocompleteArray($scope.industries);
    }, function (error) {
      console.log('Unable to load industry data: ' + error.message);
    });


  $scope.maxIndex = 2;
  $scope.selectedIndex = 0;
  $scope.showBundles = false;
  $scope.dnq = false;
  $scope.searchText = null;
  $scope.selectedIndustry = null;
  $scope.showControls = true;
  $scope.lobDetails = configFactory.getLobDetails();


  /**
   * Used for Material Autocomplete of Industries
   * @param query
   * @returns {Promise}
   */
  $scope.querySearch = function (query) {
    var results = query ? $scope.autocompleteArray.filter(createFilterFor(query)) : $scope.autocompleteArray;
    var deferred = $q.defer();
    $timeout(function () {
      deferred.resolve(results);
    });
    return deferred.promise;

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(industry) {
        var exists = false;
        industry.aliases.forEach(function (alias) {
          var lowercaseindustry = angular.lowercase(alias);
          if (lowercaseindustry.indexOf(lowercaseQuery) !== -1) {
            exists = true;
          }
        });
        return exists;
      };
    }
  };

  $scope.$watch("selectedIndustry", function() {
    if($scope.selectedIndustry === null)return;
    console.log("checking requirements ", $scope.selectedIndustry);
    if($scope.selectedIndustry.hasOwnProperty("products")){
      var products = $scope.selectedIndustry.products;
      if(products.indexOf("BOP") !== -1){
        $scope.showLocation = true;
      }
      if(products.indexOf("WC") !== -1){

        $scope.showEmployees = true;
      }
      $scope.showSecondRow = $scope.showEmployees || $scope.showLocation;
    }
  });
  /**
   * First step, look up zipcode and fetch related lob data, processing rules.
   * This checks rules against industries as well, more like a form submit
   * @param zipcode
     */
  $scope.lookupZip = function (zipcode) {
    if(/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipcode)) {
      postalService.lookupZipCode(zipcode)
        .then(function (response) {
          var address = response.data;
          address.state = address.places[0]["state abbreviation"];
          address.city = address.places[0]['place name'];
          address.zip = address['post code'];
          $scope.address = address;
        });
    }
  };
  /**
   * Sets the form for # of employees if checked and after $touched with value
   */
  $scope.setEmployees = function () {
    if (!$scope.employees || $scope.employees <= 0) {
      $scope.hasEmployees = false;
    }
  };

  $scope.$watch("hasEmployees", function(newval){
    console.log("has employees changed", newval);
  });

  $scope.$watch("showSecondRow", function(newval){
    if(newval){
      if(angular.element(".tab1row2").css('display') == 'none'){
        angular.element(".tab1row2").slideDown();
      }
    }else{
      angular.element(".tab1row2").slideUp();
    }
  });

  /**
   * Tab Navigation
     */
  $scope.nextTab = function () {
    if(!$scope.widgetForm.$valid){
      console.log($scope.widgetForm);
      // $scope.widgetForm.$setSubmitted();
      $scope.widgetForm.autocompleteField.$setTouched();
      $scope.widgetForm.zipcode.$setTouched();
      return;
    }
    $scope.loading = true;
    $timeout(function(){
      $scope.lobData = rulesService.runLobRules($scope.config, $scope.address.state, $scope.selectedIndustry);
      rulesService.applyEmployeeRules($scope.hasEmployees, $scope.lobData);
      rulesService.makeRows(3, $scope.lobData);
    }, 1000).then(function(){
      if ($scope.lobData.dnq) {
        $scope.dnq = true;
        $scope.showControls = false;
        $scope.selectedIndex = 1;
        $scope.maxIndex = 1;
        $scope.productMessage = "Sorry, we're unable to provide you with a quote at this time";
        return false;
      } else {
        $scope.productMessage = "We offer the following products:";
      }
      if ($scope.selectedIndex >= $scope.maxIndex) {
        $location.path('/bbi');
      } else {
        $timeout(function () {
          $scope.loading = false;
          $scope.selectedIndex++;
        });
      }
    });
  };

  /**
   * Tab Navigation
   */
  $scope.prevTab = function () {
    if ($scope.selectedIndex > 0)
      $scope.selectedIndex--;
  };

  /**
   * Runs after clicking a LOB on the products tab.
   * Decide whether required/allowed lob bundling needs to be displayed next
   * or move to the BBI if none are available
   *
   * @param lob
     */
  $scope.selectedLobs = {};
  $scope.lobSelectOrder = [];
  $scope.lastSelected = null;
  $scope.selectLob = function (lob) {
    var search;
    var selected = false;
    var $el = angular.element("."+lob);

    // Deselect
    if($el.hasClass("highlight")){
      $el.removeClass("highlight");
      delete $scope.selectedLobs[lob];
      $scope.lobSelectOrder.splice($scope.lobSelectOrder.indexOf(lob), 1);
      $scope.lastSelected = $scope.lobSelectOrder[$scope.lobSelectOrder.length - 1];
      search = $scope.lastSelected;
    // Select
    }else{
      $el.addClass("highlight");
      search = lob;
      $scope.selectedLobs[lob] = true;
      $scope.lobSelectOrder.push(lob);
      selected = true;
    }
    // $mdToast.hide();
    $scope.additionalMessage = false;
    var keys = Object.keys($scope.selectedLobs);
    var currentTotal = keys.length;
    $scope.bundleNotMet = false;
    // This only implements rules in a way that enforces required bundling at least one of
    // another product with one having a requirement of bundling.  It does not look at the
    // specific lobs allowed.  Disallowed bundles and hiding required bundles not configured
    // has not been implemented.
    $scope.productMessage = "We offer the following products:";
    if(currentTotal === 0) {
      return;
      // If only one in the current array, check if that item has required bundles
    } else if (currentTotal === 1 && $scope.lobData.bundles.required[keys[0]].length > 0) {
      $scope.bundleNotMet = true;
      $scope.additionalMessage = $scope.lobDetails[search].name;
    }
    if(selected) {
      $scope.lastSelected = lob;
    }
  };
})
  .directive('lobWidget', function(){
    return {
      restrict: 'E',
      templateUrl: 'views/main.html',
      controller:'MainCtrl'
    }
  });
