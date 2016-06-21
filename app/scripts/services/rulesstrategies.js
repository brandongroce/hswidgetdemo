'use strict';

/**
 * @ngdoc service
 * @name widgetdemoApp.rulesStrategies
 * @description
 * # rulesStrategies
 * Factory in the widgetdemoApp.
 */
angular.module('widgetdemoApp')
  .factory('rulesStrategies', ['util', 'configFactory',function ($util, $config) {

    var strategies = {};

    /**
     * Set the ALL string in rules to their respective values
     * Currently only applies to bundle rules
     * @param rules
     * @param lob
     * @returns {*}
       */
    var setAll = function(rules, lob){
      if(rules.value === 'all'){
        rules.value = $config.getLobs();
        var newValues = [];
        rules.value.forEach(function(val){
          newValues.push([val]);
        });
        rules.value = newValues;
      }
      if(rules.not === 'all')rules.not = rules.where === 'states' ? $config.getStates() : $config.getIndustries();
      if(rules.equal === 'all')rules.equal = rules.where === 'states' ? $config.getStates() : $config.getIndustries();
      if( rules.value.indexOf(lob.lob) !== -1){
        rules.value.splice(rules.value.indexOf(lob.lob), 1);
      }
      return rules;
    };

    /**
     * Logic method for gating lob by industries/states
     * @param type
     * @param lob
     * @param rules
     * @param state
     * @param industry
     * @returns {*}
       */
    var applyGatingRules = function(type, lob, rules, state, industry){
      var whereNot, opValue, whereCheck;
      switch(type) {
        case "states":
          whereCheck = "industries";
          whereNot = industry;
          opValue = state;
              break;
        case "industries":
          whereCheck = "states";
          whereNot = state;
          opValue = industry;
              break;
      }
      // If where doesn't match, do not deny
      if(typeof rules.where !== "undefined" && rules.where === whereCheck){
        var whereMatch = false;
        if(typeof rules.equal !== "undefined" && rules.equal.indexOf(whereNot) !== -1){
          whereMatch = true;
        }else if(typeof rules.not !== "undefined" && rules.not.indexOf(whereNot) === -1){
          whereMatch = true;
        }
        if(!whereMatch){
          return lob;
        }
      }
      // Check main rule if no `where` or if `where` matches
      if(rules.op === '=' && rules.value.indexOf(opValue) !== -1){
        lob.enabled = false;
        lob.gateMessage = "Gated by "+type+": "+JSON.stringify(rules);
      }else if(rules.op === '!=' && rules.value.indexOf(opValue) === -1){
        lob.enabled = false;
        lob.gateMessage = "Gated by "+type+": "+JSON.stringify(rules);
      }
    };

    /**
     * Logic method for applying bundling rules
     * @param lob
     * @param rules
     * @param state
     * @param industry
       * @returns {boolean}
       */
    var applyBundlingRules = function(lob, rules, state, industry){
      rules = setAll(rules, lob);
      if(!lob.enabled){
        return false;
      }
      var checkIndex;
      switch(rules.where){
        case "states":
          checkIndex = state;
          break;
        case "industries":
          checkIndex = industry;
          break;
      }
      // Check if rules apply
      return ((typeof rules.equal !== "undefined" && rules.equal.indexOf(checkIndex) !== -1) ||
        (typeof rules.not !== "undefined" && rules.not.indexOf(checkIndex) === -1))
    };

    /**
     * Public method for gating lob by state
     * @param lob
     * @param rules
     * @param state
       * @param industry
       */
    strategies.denyStates = function(lob, rules, state, industry){
      // Set to all if string set
      if(rules.value === 'all')rules.value = $config.getStates();
      if(rules.not === 'all')rules.not = $config.getIndustries();
      if(rules.equal === 'all')rules.equal = $config.getIndustries();
      // var lob (reference) is updated if rules apply
      applyGatingRules("states", lob, rules ,state, industry);
    };

    /**
     * Public method for gating lob by industry
     * @param lob
     * @param rules
     * @param state
       * @param industry
       */
    strategies.denyIndustries = function(lob, rules, state, industry){
      if(rules.value === 'all')rules.value = $config.getIndustries();
      if(rules.not === 'all')rules.not = $config.getStates();
      if(rules.equal === 'all')rules.equal = $config.getStates();
      applyGatingRules("industries", lob, rules, state, industry);
    };

    /**
     * Public method for gating lob bundles by state/industry
     * @param lobs
     * @param lob
     * @param rules
     * @param state
       * @param industry
       */
    strategies.denyBundlingLobs = function(lobs, lob, rules, state, industry) {
      var rulesApply = applyBundlingRules(lob, rules, state, industry);
      if(rulesApply){
        lobs.gated[lob.lob] = lobs.gated[lob.lob].concat(rules.value);
      }
    };

    /**
     * Public method for requiring lob bundles by state/industry
     * @param lobs
     * @param lob
     * @param rules
     * @param state
       * @param industry
       */
    strategies.requireBundlingLobs = function(lobs, lob, rules, state, industry){
      var rulesApply = applyBundlingRules(lob, rules, state, industry);
      if(rulesApply){
        lobs.required[lob.lob] = lobs.required[lob.lob].concat(rules.value);
      }
    };


    return strategies;
  }]);
