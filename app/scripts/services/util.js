'use strict';

/**
 * @ngdoc service
 * @name widgetdemoApp.util
 * @description
 * # util
 * Factory in the widgetdemoApp.
 */
angular.module('widgetdemoApp')
  .factory('util', function () {

      var arr_diff = function (a1, a2) {

        var a = [], diff = [];

        for (var i = 0; i < a1.length; i++) {
          a[a1[i]] = true;
        }

        for (var i = 0; i < a2.length; i++) {
          if (a[a2[i]]) {
            delete a[a2[i]];
          } else {
            a[a2[i]] = true;
          }
        }

        for (var k in a) {
          diff.push(k);
        }

        return diff;
      };

    var makeRows = function(numInRow, lobData){
      lobData.lobLoop = [];
      var count = 1;
      var holderObject = {};
      for(var key in lobData.enabled){
        holderObject[key] = lobData.enabled[key];
        if(count % numInRow == 0){
          lobData.lobLoop.push(angular.copy(holderObject));
          holderObject = {};
        }
        count++;
      }
      if(count % numInRow != 1){
        lobData.lobLoop.push(holderObject);
      }
    };


      var k_combinations = function(set, k) {
        var i, j, combs, head, tailcombs;

        // There is no way to take e.g. sets of 5 elements from
        // a set of 4.
        if (k > set.length || k <= 0) {
          return [];
        }

        // K-sized set has only one K-sized subset.
        if (k == set.length) {
          return [set];
        }

        // There is N 1-sized subsets in a N-sized set.
        if (k == 1) {
          combs = [];
          for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
          }
          return combs;
        }

        combs = [];
        for (i = 0; i < set.length - k + 1; i++) {
          // head is a list that includes only our current element.
          head = set.slice(i, i + 1);
          // We take smaller combinations from the subsequent elements
          tailcombs = k_combinations(set.slice(i + 1), k - 1);
          // For each (k-1)-combination we join it with the current
          // and store it to the set of k-combinations.
          for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
          }
        }
        return combs;
      };

      var combinations = function(set) {
        var k, i, combs, k_combs;
        combs = [];

        // Calculate all non-empty k-combinations
        for (k = 1; k <= set.length; k++) {
          k_combs = k_combinations(set, k);
          for (i = 0; i < k_combs.length; i++) {
            combs.push(k_combs[i]);
          }
        }
        return combs;
      };

    // Public API here
    return {
      arrayDiff:arr_diff,
      combinations:combinations,
      k_combinations:k_combinations,
      makeRows:makeRows
    };
  });
