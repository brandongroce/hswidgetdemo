'use strict';

/**
 * @ngdoc service
 * @name widgetdemoApp.configFactory
 * @description
 * # configFactory
 * Factory in the widgetdemoApp.
 */
angular.module('widgetdemoApp')
  .factory('configFactory', ['$http', function ($http) {
    var configFactory = {},
      industries = {},
      config = {},
      lobs = ["BOP", "GL", "WC", "CA"],
      states = {
      AL: "Alabama",
      AK: "Alaska",
      AS: "American Samoa",
      AZ: "Arizona",
      AR: "Arkansas",
      CA: "California",
      CO: "Colorado",
      CT: "Connecticut",
      DE: "Delaware",
      DC: "District Of Columbia",
      FM: "Federated States Of Micronesia",
      FL: "Florida",
      GA: "Georgia",
      GU: "Guam",
      HI: "Hawaii",
      ID: "Idaho",
      IL: "Illinois",
      IN: "Indiana",
      IA: "Iowa",
      KS: "Kansas",
      KY: "Kentucky",
      LA: "Louisiana",
      ME: "Maine",
      MH: "Marshall Islands",
      MD: "Maryland",
      MA: "Massachusetts",
      MI: "Michigan",
      MN: "Minnesota",
      MS: "Mississippi",
      MO: "Missouri",
      MT: "Montana",
      NE: "Nebraska",
      NV: "Nevada",
      NH: "New Hampshire",
      NJ: "New Jersey",
      NM: "New Mexico",
      NY: "New York",
      NC: "North Carolina",
      ND: "North Dakota",
      MP: "Northern Mariana Islands",
      OH: "Ohio",
      OK: "Oklahoma",
      OR: "Oregon",
      PW: "Palau",
      PA: "Pennsylvania",
      PR: "Puerto Rico",
      RI: "Rhode Island",
      SC: "South Carolina",
      SD: "South Dakota",
      TN: "Tennessee",
      TX: "Texas",
      UT: "Utah",
      VT: "Vermont",
      VI: "Virgin Islands",
      VA: "Virginia",
      WA: "Washington",
      WV: "West Virginia",
      WI: "Wisconsin",
      WY: "Wyoming"
    };

    configFactory.getPartnerConfig = function (partner) {
      if(angular.element.isEmptyObject(config)){
        config = $http.get(partner+".json");
      }
      return config;
    };

    configFactory.getIndustries = function () {
      if(angular.element.isEmptyObject(industries)){
        industries = $http.get("industries.json");
      }
      return industries;
    };

    configFactory.getAutocompleteArray = function(industryArray){
      var autocompleteArray = [];
      for(var key in industryArray){
        var obj = {
          id: key,
          aliases: industryArray[key].aliases,
          mtid:industryArray[key].mtid,
          products:industryArray[key].hasOwnProperty("products") ? industryArray[key].products : ["BOP", "GL", "WC"]
        };

        autocompleteArray.push(obj);
      }
      return autocompleteArray;
    };

    configFactory.getLobs = function(){
      return angular.copy(lobs);
    };

    configFactory.getStates = function(){
      return angular.copy(states);
    };

    configFactory.getLobDetails = function(){
       return {
        BOP: {
          name: "Business Owner Policy",
          color: "rgba(232,135,12,0.8)",
          desc: "Combined protection from all major property and liability risks in one package.",
          image:"bop"
        },
        GL: {
          name: "General Liability",
          color: "rgba(0,178,89,0.8)",
          desc: "Protects your commercial business from 3rd party claims of injury or property damage.",
          image:"gl"
        },
        WC: {
          name: "Worker's Compensation",
          color: "rgba(20,133,204,0.8)",
          desc: "Provides wage replacement and medical benefits to employees injured in the course of employment.",
          image:"wc"
        },
        CA: {
          name: "Commercial Auto",
          color: "rgba(178,39,10,0.8)",
          desc:"Commercial auto policy",
          image:"directions_bus"
        },
         "BOP & GL": {
           name:"BOP with GL",
           color:"rgba(178,39,10,0.8)",
           desc:"Business owner policy with general liability"
         }
      };
    };

    return configFactory;
  }]);
