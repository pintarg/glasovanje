// Verzija: 2016.11.22a
// ====================================================================================================
var app = angular.module('myApp', ['ngRoute', 'ngDialog']);

app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl:'pages/home.html',
    controller:'HomeController'
  })
  .when('/question', {
    templateUrl:'pages/question.html',
    controller:'QuestionController'
  })
  .when('/add-question', {
    templateUrl:'pages/add-question.html',
    controller:'Add-questionController'
  })
  .when('/answers', {
    templateUrl:'pages/answers.html',
    controller:'AnswersController'
  })
  .otherwise({redirectTo:'/'});
});

app.controller('HomeController', function($scope) {
  $scope.message = 'Home';
});
app.controller('QuestionController', function($scope, ngDialog) {
  // $scope.vprasanje = 'Klikni na gumb za prikaz vprašanja.';
  $scope.vprasanje = vprasanje,
  $scope.VprID = VprID,
  $scope.stVpr = stVpr;
  $scope.rewriteVprasanje = function() {
    return $scope.vprasanje = vprasanje,
    $scope.VprID = VprID,
    // $scope.VprID = localStorage.getItem("VprID"),
    $scope.stVpr = stVpr;
    // $scope.potrditevPrejemaOdg = potrditevPrejemaOdg2;
  };
  $scope.potrditevPrejemaOdg = function() {
    return $scope.potrditevPrejemaOdg = potrditevPrejemaOdg2;
    // return $scope.potrditevPrejemaOdg = 'Odgovor zabeležen.';
  };
});
// === DODANA KODA ZA POP-UP NA QUESTION.HTML ===
app.config(['ngDialogProvider', function (ngDialogProvider) {
    ngDialogProvider.setDefaults({
        className: 'ngdialog-theme-plain',
        plain: true,
        showClose: true,
        closeByDocument: true,
        closeByEscape: true
    });
}]);

app.directive('confirm1', ['ngDialog', function (ngDialog) {
  return {
    restrict: 'E',
    template: '<button id="btnZadnjeVpr" type="button" ng-click="confirmation()" style="display:none"></button>',
    controller: function($scope) {
      $scope.confirmation = function() {
        ngDialog.openConfirm({
          scope: $scope,
          templateUrl: "pages/pop-up/last-question.html",
        });
      };
    }
  };
}]);
// === DODANA KODA ZA POP-UP NA QUESTION.HTML ===
app.controller('Add-questionController', function($scope) {
  $scope.stVpr1 = stVpr;
  $scope.prejemStVpr = function() {
    return $scope.stVpr1 = stVpr,
    $scope.potrditevPrejemaNovegaVpr = 'Prejem novega vprašanja: "'+novoVpr+'" zabeležen.';
  };
});
app.controller('AnswersController', function($scope) {
  $scope.podatki = [{VprID:"",Odg:"",ts:"",ts2:"",SocketID:""}]; // mora biti, drugače ne izpiše tabele
  $scope.rewrite = function() {
    return $scope.podatki = rezultati;
  };
});
