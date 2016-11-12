// Verzija: 2016.11.12b
var app = angular.module('myApp', ['ngRoute']);

// app.controller('HomeController', function($scope) {
//   $scope.message = 'Hello.';
// });

app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl:'pages/home.html',
    controller:'HomeController'
  })
  .when('/blog', {
    templateUrl:'pages/blog.html',
    controller:'BlogController'
  })
  .when('/about', {
    templateUrl:'pages/about.html',
    controller:'AboutController'
  })
  .otherwise({redirectTo: '/'});
});

app.controller('HomeController', function($scope) {
  $scope.message = 'Hello HomeController';
});
app.controller('BlogController', function($scope) {
  $scope.message = 'Hello BlogController';
});
app.controller('AboutController', function($scope) {
  $scope.message = 'Hello AboutController';
});
