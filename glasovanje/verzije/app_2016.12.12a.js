// Verzija: 2016.12.12a
// ====================================================================================================
var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'smart-table']);
var removeRowPodatek, removeRowVprasanje;
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
  .when('/all-questions', {
    templateUrl:'pages/all-questions.html',
    controller:'all-questionsController'
  })
  .when('/statistics', {
    templateUrl:'pages/statistics.html',
    controller:'StatisticsController'
  })
  .otherwise({redirectTo:'/'});
});

app.controller('HomeController', function($scope) {
  $scope.message = 'Home';
});
app.controller('QuestionController', function($scope) {
  $scope.vprasanje = vprasanje,
  $scope.zapStVpr = zapStVpr,
  $scope.stVpr = stVpr,
  $scope.potrZapOdg = potrZapOdg;
  $scope.rewriteVprasanje = function() {
    return $scope.vprasanje = vprasanje,
    $scope.zapStVpr = zapStVpr,
    $scope.stVpr = stVpr,
    $scope.potrZapOdg = potrZapOdg;
  };
  $scope.potrditevPrejemaOdg = function() {
    return $scope.potrZapOdg = potrZapOdg;
  };
});
// === POPUP-i ===
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
  $ctrl.ok = function() {
      $uibModalInstance.close();
  };
  $ctrl.cancel = function() {
  };
});
// === /POPUP-i ===

app.controller('Add-questionController', function($scope) {
  $scope.stVpr1 = stVpr;
  $scope.prejemStVpr = function() {
    return $scope.stVpr1 = stVpr,
    $scope.potrditevPrejemaNovegaVpr = 'Novo vprašanje: "'+novoVpr+'" dodano na seznam.';
  };
});
app.controller('AnswersController', function($scope, $filter, $route, $uibModal) {
  // $scope.podatki = [{VprID:"",Odg:"",ts:"",ts2:"",SocketID:""}]; // mora biti, drugače ne izpiše tabele
  $scope.podatki = rezultati;
  $scope.rewrite = function() {
    return $scope.podatki = rezultati,
    $route.reload(); // za osvežitev podatkov v expression-ih. Brez tega ne deluje iskanje po tabeli takoj po izpisu.
  };
  $scope.removeRow = function removeRow(podatek) { // Brisanje posamezne vrstice v izpisani tabeli
    removeRowPodatek = podatek;
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/delete-warning.html',
      controller: 'CtrlRmRow',
      controllerAs: '$ctrl',
      windowClass: 'app-modal-window' // Uporablja se v povezavi s CSS za določanje izgleda
    });
  };
  $scope.predicates = ['VprID', 'Odg', 'ts', 'ts2', 'SocketID'];
  $scope.selectedPredicate = $scope.predicates[0];
});
app.controller('CtrlRmRow', function ($uibModalInstance, $scope) { // ta kontroler se uporablja skupaj z '$scope.removeRow', za prikaz popup-a ob brisanju odgovora
  var $ctrl = this;
  $scope.podatki = rezultati;
  $ctrl.ok = function() {
    var index = $scope.podatki.indexOf(removeRowPodatek);
    if (index !== -1) {
      $scope.podatki.splice(index, 1);
    }
    socket.emit("socketBrisanjeVrsticeOdg", removeRowPodatek); // pošiljanje vsebine vrstice, ki jo želimo izbrisati
    $uibModalInstance.close();
  };
  $ctrl.cancel = function() {
    $uibModalInstance.close();
  };
});
app.controller('all-questionsController', function($scope, $filter, $route, $uibModal) {
  $scope.vprasanja = vsaVpr;
  $scope.rewriteVprasanja = function() {
    return $scope.vprasanja = vsaVpr,
    $route.reload();
  };
  $scope.removeRowVprasanja = function removeRow(vprasanje) {
    removeRowVprasanje = vprasanje;
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/delete-warning.html',
      controller: 'CtrlRmRowVprasanje',
      controllerAs: '$ctrl',
      windowClass: 'app-modal-window'
    });
  };
  $scope.predicates = ['VprID', 'vprasanje'];
  $scope.selectedPredicate = $scope.predicates[0];
});
app.controller('CtrlRmRowVprasanje', function ($uibModalInstance, $scope) {
  var $ctrl = this;
  $scope.vprasanja = vsaVpr;
  $ctrl.ok = function() {
    var index = $scope.vprasanja.indexOf(removeRowVprasanje);
    if (index !== -1) {
      $scope.vprasanja.splice(index, 1);
    }
    socket.emit("socketBeriVpr", 2);
    socket.emit("socketBrisanjeVrsticeVpr", removeRowVprasanje);
    socket.emit("socketIzpisiRezultate");
    $uibModalInstance.close();
  };
  $ctrl.cancel = function() {
    $uibModalInstance.close();
  };
});
app.controller('StatisticsController', function($scope, $filter, $route, $uibModal) {
  $scope.odgovori = statOdg;
  $scope.rewriteStatistika = function() {
    return $scope.odgovori = statOdg,
    $route.reload();
  };
  // $scope.removeRowVprasanja = function removeRow(vprasanje) {
  //   removeRowVprasanje = vprasanje;
  //   var modalInstance = $uibModal.open({
  //     templateUrl: '/pages/popup/delete-warning.html',
  //     controller: 'CtrlRmRowVprasanje',
  //     controllerAs: '$ctrl',
  //     windowClass: 'app-modal-window'
  //   });
  // };
  $scope.predicates = ['VprID', 'vprasanje'];
  $scope.selectedPredicate = $scope.predicates[0];
});
// app.controller('CtrlRmRowVprasanje', function ($uibModalInstance, $scope) {
//   var $ctrl = this;
//   $scope.vprasanja = vsaVpr;
//   $ctrl.ok = function() {
//     var index = $scope.vprasanja.indexOf(removeRowVprasanje);
//     if (index !== -1) {
//       $scope.vprasanja.splice(index, 1);
//     }
//     socket.emit("socketBrisanjeVrsticeVpr", removeRowVprasanje);
//     socket.emit("socketIzpisiRezultate");
//     $uibModalInstance.close();
//   };
//   $ctrl.cancel = function() {
//     $uibModalInstance.close();
//   };
// });
// POSAMEZNI CONTROLLER-ji
