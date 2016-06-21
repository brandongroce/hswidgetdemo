'use strict';

/**
 * @ngdoc overview
 * @name widgetdemoApp
 * @description
 * # widgetdemoApp
 *
 * Main module of the application.
 */
angular
  .module('widgetdemoApp', [
    'ngAnimate',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'ngMessages',
    'ngMdIcons',
    'angular.filter'
  ])
  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default').dark();
    $mdThemingProvider.theme('default').backgroundPalette('grey').dark();
    $mdThemingProvider.theme('default').primaryPalette('light-green').dark();
    $mdThemingProvider.theme('default').accentPalette('light-blue').dark();
    $mdThemingProvider.theme('default').foregroundPalette['3'] = 'rgba(192,192,192,.7)';
  });
