// Verzija: 2016.11.22c
// ====================================================================================================
var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap']);

app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl:'pages/home.html',
    // templateUrl:'home.html',
    controller:'HomeController'
  })
  .when('/question', {
    templateUrl:'pages/question.html',
    // templateUrl:'question.html',
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
app.controller('QuestionController', function($scope) {
  // $scope.vprasanje = 'Klikni na gumb za prikaz vprašanja.';
  $scope.vprasanje = vprasanje,
  $scope.VprID = VprID,
  $scope.stVpr = stVpr;
  // $scope.potrditevPrejemaOdg = potrditevPrejemaOdg;
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
// === POPUP, QUESTION.HTML ===
app.controller('ModalPopup', function ($uibModal) {
  var $ctrl = this;
  $ctrl.open = function () {
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/last-question.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      windowClass: 'app-modal-window' // Uporablja se v povezavi s CSS za določanje izgleda
    });
  };
});
app.controller('ModalInstanceCtrl', function ($uibModalInstance) {
  var $ctrl = this;
  $ctrl.ok = function () {
      $uibModalInstance.close();
  };
});
// === /POPUP, QUESTION.HTML ===

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
