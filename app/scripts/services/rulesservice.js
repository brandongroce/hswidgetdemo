'use strict';

/**
 * @ngdoc service
 * @name widgetdemoApp.rulesService
 * @description
 * # rulesService
 * Service in the widgetdemoApp.
 */
angular.module('widgetdemoApp')
  .service('rulesService', ['configFactory', 'rulesStrategies',function ($config, $strategies) {

    var availableLobs = [],
      availableLobBundles = {};

    /**
     * Get formatted allowed/gated/required bundle info from selected LOB
     * @param bundles
     * @param lob
     * @returns {{allowed: Array, required: Array, gated: Array, showRequired: boolean, showOptional: boolean, showBundles: boolean}}
       */
    this.getLobBundleInfo = function(bundles, lob){
      var gated = [];
      var required = [];
      var allowed = [];

      // Reformat
      bundles.required[lob].forEach(function(bundle, i){
        for(var h = 0; h < bundle.length; h++){
          if(h == 0){
            required[i] = {name:bundle[h]};
          }else{
            required[i].name += " & "+bundle[h];
          }
        }
      });
      // Reformat
      bundles.gated[lob].forEach(function(bundle, i){
        for(var h = 0; h < bundle.length; h++){
          if (h == 0) {
            gated[i] = {name: bundle[h]};
          } else {
            gated[i].name += " & " + bundle[h];
          }
        }
      });
      bundles.allowed = [];
      availableLobs.forEach(function(item){
        if(item.enabled && item.lob != lob){
          bundles.allowed.push([item.lob]);
        }
      });
      allowed = bundles.allowed;

      if( allowed.indexOf(lob) !== -1){
        allowed.splice(allowed.indexOf(lob), 1);
      }

      var removeIfLobExistsIn = function(namedArray) {
        return function(i){
          var exists = false;
          namedArray.forEach(function(item){
            if(i.indexOf(item.name) !== -1){
              exists = true;
            }
          });
          // keep if it doesn't exist
          return !exists;
        }
      };
      allowed = allowed.filter(removeIfLobExistsIn(required));
      allowed = allowed.filter(removeIfLobExistsIn(gated));

      var newAllowed = [];
      allowed.forEach(function(bundle, i){
        for(var h = 0; h < bundle.length; h++){
          if (h == 0) {
            newAllowed[i] = {name: bundle[h]};
          } else {
            newAllowed[i].name += " & " + bundle[h];
          }
        }
      });

      return {
        allowed:newAllowed,
        required:required,
        gated:gated,
        showRequired:required.length > 0,
        showOptional:allowed.length > 0,
        showBundles: (required.length > 0 || allowed.length > 0)
      };
    };

    this.makeRows = function(numInRow, lobData){
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

    this.applyEmployeeRules = function(hasEmployees, lobData){
      if(!hasEmployees){
        lobData.available.forEach(function(lob){
          if(lob.lob === 'WC')lob.enabled = false;
          lobData.enabled['WC'] = false;
        });
      }
    };

    /**
     * Run the lob rules against a state and industry
     * @param config
     * @param state
     * @param industry
     * @returns {{available: Array, bundles: *, enabled: {}, dnq: boolean}}
       */
    this.runLobRules = function(config, state, industry){
      var products = industry.products;
      industry = industry.id;
      // Cache this in real life
      availableLobs = [];
      availableLobBundles = {
        required:[],
        gated:[]
      };
      var lobCount = config.lobs.length;
      for (var i=0; i < lobCount; i++){
        var lobConfig = config.lobs[i];
        var lob = {
          lob: lobConfig.type,
          enabled:true,
          gateMessage:""
        };
        if(!lobConfig.settings.enabled || products.indexOf(lob.lob) === -1){
          lob.enabled = false;
          lob.gateMessage = "LOB is not enabled";
          availableLobs.push(lob);
          continue;
        }
        if(typeof availableLobBundles.gated[lob.lob] === 'undefined'){
          availableLobBundles.gated[lob.lob] = [];
        }
        if(typeof availableLobBundles.required[lob.lob] === 'undefined'){
          availableLobBundles.required[lob.lob] = [];
        }

        // Apply lob gating rules
        var rulesCount = lobConfig.settings.rules.length;
        var strategy;
        for(var j=0; j < rulesCount; j++){
          strategy = lobConfig.settings.rules[j].function;
          $strategies[strategy](lob, lobConfig.settings.rules[j], state, industry);
          if(!lob.enabled)break;
        }
        availableLobs.push(lob);

        // Apply lob bundling rules
        var bundleRulesCount = lobConfig.settings.bundlingRules.length;
        for(j=0; j < bundleRulesCount; j++){
          strategy = lobConfig.settings.bundlingRules[j].function;
          $strategies[strategy](availableLobBundles, lob, lobConfig.settings.bundlingRules[j], state, industry);
        }
      }

      // Create a hashmap of enabled bundles
      var lobsEnabled = {};
      for(i=0; i<availableLobs.length; i++){
        lobsEnabled[availableLobs[i].lob] = availableLobs[i].enabled;
      }

      // Check to see if any enabled LOBs require bundling with products that aren't available
      // Then check for DNQ
      var dnq = true;
      for(var key in lobsEnabled){
        if(lobsEnabled[key]){
          var ok = false;

          // Are there any bundling requirements?
          var rq = availableLobBundles.required[key];

          // If there is an enabled bundle with no requirements,
          // this option will be available, do don't DNQ
          if(rq.length === 0){
            dnq = false;
            continue;
          }

          // Check to see if lob bundle requirements
          // include at least one LOB bundle that is enabled.
          // If not, set this lob to disabled.
          for(i=0;i<rq.length;i++){
            for(j=0;j<rq[i].length; j++){
              if(lobsEnabled[rq[i][j]]){
                ok = true;
                break;
              }
            }
            if(ok)break;
          }
          if(!ok)lobsEnabled[key] = false;
        }
        if(lobsEnabled[key])dnq = false;
      }
      var lobsData = {
        available:availableLobs,
        bundles:availableLobBundles,
        enabled:lobsEnabled,
        dnq:dnq
      };
      console.log("lobsData", lobsData);
      return lobsData;
    };
  }]);
