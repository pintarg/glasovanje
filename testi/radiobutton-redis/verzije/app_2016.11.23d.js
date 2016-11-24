// Verzija: 2016.11.23d
// ====================================================================================================
var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'smart-table']);

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
app.controller('QuestionController', function($scope) {
  $scope.vprasanje = vprasanje,
  $scope.VprID = VprID,
  $scope.stVpr = stVpr,
  $scope.potrZapOdg = potrZapOdg;
  $scope.rewriteVprasanje = function() {
    return $scope.vprasanje = vprasanje,
    $scope.VprID = VprID,
    $scope.stVpr = stVpr,
    $scope.potrZapOdg = potrZapOdg;
  };
  $scope.potrditevPrejemaOdg = function() {
    return $scope.potrZapOdg = potrZapOdg;
  };
});
// === POPUP, QUESTION.HTML ===
app.controller('ModalPopup', function ($uibModal) {
  var $ctrl = this;
  $ctrl.ZadnjeVpr = function () { // Popup za zadnje vprašanje. Uporaba v question.html
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/last-question.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      windowClass: 'app-modal-window' // Uporablja se v povezavi s CSS za določanje izgleda
    });
  };
  $ctrl.PodvojenOdg = function () { // Popup za podvojen odgovor. Uporaba v question.html
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/duplicated-answer.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      windowClass: 'app-modal-window' // Uporablja se v povezavi s CSS za določanje izgleda
    });
  };
  $ctrl.PrazenOdg = function () { // Popup za prazen odgovor. Uporaba v question.html
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/empty-answer.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      windowClass: 'app-modal-window' // Uporablja se v povezavi s CSS za določanje izgleda
    });
  };
  $ctrl.NiVpr = function () { // Popup za odgovor na 0. vprašanje/ni vprašanja. Uporaba v question.html
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/no-question.html',
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
app.controller('AnswersController', function($scope, $filter, $route) {
  // $scope.podatki = [{VprID:"",Odg:"",ts:"",ts2:"",SocketID:""}]; // mora biti, drugače ne izpiše tabele
  $scope.podatki = rezultati;
  $scope.rewrite = function() {
    return $scope.podatki = rezultati,
    $route.reload(); // za osvežitev podatkov v expression-ih. Brez tega ne deluje iskanje po tabeli takoj po izpisu.
  };
  $scope.removeRow = function removeRow(podatek) { // Brisanje posamezne vrstice v izpisani tabeli
    var index = $scope.podatki.indexOf(podatek);
    if (index !== -1) {
      $scope.podatki.splice(index, 1);
    }
  };
  $scope.predicates = ['VprID', 'Odg', 'ts', 'ts2', 'SocketID'];
  $scope.selectedPredicate = $scope.predicates[0];
});
