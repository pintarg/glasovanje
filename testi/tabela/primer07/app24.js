// MODULE
var angularApp = angular.module('angularApp', ['ngRoute']);

angularApp.config(function($routeProvider){
    
   $routeProvider
   
   .when('/', {
       
       templateUrl: 'pages/domaca24.html',
       controller: 'mainController'
       
   })
   
   .when('/druga/', {
       
       templateUrl: 'pages/druga24.html',
       controller: 'secondController'
       
   })
   
   .when('/druga/:num', {
       
       templateUrl: 'pages/druga24.html',
       controller: 'secondController'
       
   })
    
});



// CONTROLLERS
angularApp.controller('mainController', ['$scope', '$log', 
function($scope, $log) {
    

    
}]);

angularApp.controller('secondController', ['$scope', '$log', '$routeParams', 
function($scope, $log, $routeParams) {
    
   
    
}]);

angularApp.directive("rezultatIskanja", function(){
    return {
        restrict: 'AECM',
        templateUrl: 'directives/rezultatiskanja.html',
        replace: true
    }
});