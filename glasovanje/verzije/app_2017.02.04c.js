// Verzija: 2017.02.04c
// ====================================================================================================
var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'smart-table']);
var removeRowPodatek, removeRowVprasanje;
app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl:'pages/home.html',
    controller:'HomeController'
  })
  .when('/show-question', {
    templateUrl:'pages/show-question.html',
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
  .when('/submit-vote', {
    templateUrl:'pages/submit-vote.html',
    controller:'WebGEController'
  })
  .when('/login', {
    templateUrl:'pages/login.html',
    controller:'LoginController'
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
  $scope.potrZapOdg = potrZapOdg,
  $scope.ge00odg = ge00odg,
  $scope.ge01odg = ge01odg,
  $scope.ge02odg = ge02odg,
  $scope.ge03odg = ge03odg,
  $scope.WebGETabela = WebGETabela;
  $scope.rewriteVprasanje = function() {
    return $scope.vprasanje = vprasanje,
    $scope.zapStVpr = zapStVpr,
    $scope.stVpr = stVpr,
    $scope.potrZapOdg = potrZapOdg,
    $scope.ge00odg = ge00odg,
    $scope.ge01odg = ge01odg,
    $scope.ge02odg = ge02odg,
    $scope.ge03odg = ge03odg;
  };
  $scope.potrditevPrejemaOdg = function() {
    return $scope.potrZapOdg = potrZapOdg;
  };
  $scope.rewriteGE00odg = function() {
    return $scope.ge00odg = ge00odg;
  };
  $scope.rewriteGE01odg = function() {
    return $scope.ge01odg = ge01odg;
  };
  $scope.rewriteGE02odg = function() {
    return $scope.ge02odg = ge02odg;
  };
  $scope.rewriteGE03odg = function() {
    return $scope.ge03odg = ge03odg;
  };
  $scope.rewriteWebGETabela = function() {
    return $scope.WebGETabela = WebGETabela;
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
  $ctrl.PraznoVpr = function () { // Popup za opozorili pri dodajanju novega prašanja, ko je vnosno polje prazno. Uporaba v add-question.html
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/empty-question.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      windowClass: 'app-modal-window' // Uporablja se v povezavi s CSS za določanje izgleda
    });
  };
  $ctrl.PodvojenSocketID = function () { // Popup za opozorilo pri podvojenem dostopu do webpage-a z istega IP. Uporaba na vseh straneh.
    var modalInstance = $uibModal.open({
      templateUrl: '/pages/popup/duplicated-socketid.html',
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
  $scope.predicates = ['ID vprašanja', 'Odgovor', 'Čas oddaje odgovora', 'Časovni žig', 'ID Socket povezave'];
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
  $scope.predicates = ['ID vprašanja', 'Vprašanje'];
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
  $scope.predicates = ['ID vprašanja', 'Vprašanje'];
  $scope.selectedPredicate = $scope.predicates[0];
});
app.controller('WebGEController', function($scope) {
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
app.controller('LoginController', function($scope, $http, $location) { // controller za Login stran. Skrbi za pošiljanje POST zahtevkov, da se lahko izvede prijavo in zapiše podatke seje
  $scope.sub = function() {
    $http.post('/login', $scope.formData)
    .success(function(data) {
      // console.log("posted successfully:");
      $location.url('/');
    })
    .error(function(data) {
      console.error("error in posting:");
    });
  };
});
app.controller('LogoutController', function($scope, $http, $location) {
  $scope.logout = function() {
    $http.get('/logout')
    .success(function(data) {
      // console.log("logout successfull");
      $location.url('/');
    })
    .error(function(data) {
      console.log("logout error"+data);
    });
  };
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
