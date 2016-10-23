// moj modul

// api.openweathermap.org/data/2.5/forecast?q={New York},{NY}
// http://api.openweathermap.org/data/2.5/forecast/daily/?q={New York},{NY}
// api.openweathermap.org/data/2.5/weather?q=London
// api.openweathermap.org/data/2.5/weather?q=London 
//http://api.openweathermap.org/data/2.5/weather?q=kathmandu&appid=532d313d6a9ec4ea93eb89696983e369
// http://api.openweathermap.org/data/2.5/weather?q=kathmandu&appid=5f49429f916881845b2b7d326c259a3c
// http://api.openweathermap.org/data/2.5/forecast/daily?q=London&appid=5f49429f916881845b2b7d326c259a3c
// dvodnevna napoved:
// http://api.openweathermap.org/data/2.5/forecast?q=London&cnt=2&appid=5f49429f916881845b2b7d326c259a3c



var weatherApp = angular.module('weatherApp', ['ngRoute', 'ngResource']);
// [] - predstavlja specifikacijo "dependencies"; uporabimo Route in Resource ng

// routes
weatherApp.config(function($routeProvider){
   $routeProvider
   
   .when('/', {
       templateUrl: 'pages/home.htm',
       controller: 'homeController'
   })
   
   .when('/forecast', {
       templateUrl: 'pages/forecast.htm',
       controller: 'forecastController'
   })
   
});

// uporabniški servisi ("Services")
weatherApp.service('cityService', function() {
    
    this.city = "New York, NY";
    
});


// kontrolerji

weatherApp.controller('homeController', ['$scope', 'cityService', function ($scope, cityService) {
    $scope.city = cityService.city;
    
    $scope.$watch('city', function(){
       cityService.city = $scope.city; 
    });
    
}]);

weatherApp.controller('forecastController', ['$scope', '$resource', 'cityService', function ($scope, $resource, cityService) {
    $scope.city = cityService.city;
    $scope.weatherAPI = $resource("http://api.openweathermap.org/data/2.5/forecast?q=London&cnt=2&appid=5f49429f916881845b2b7d326c259a3c", {callback: "JSON_CALLBACK"}, {get: { method: "JSONP"}});
    
    $scope.weatherResult = $scope.weatherAPI.get({ q: $scope.city, cnt: 2});
    
    console.log($scope.weatherResult);
}]);