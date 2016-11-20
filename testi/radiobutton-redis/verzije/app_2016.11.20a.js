// Verzija: 2016.11.20a
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
// === DODANA KODA ===
app.controller('ConfirmCtrl', function($scope, ngDialog) {

});
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
          template:
          '<div class="ngdialog-message">' +
          '  <h2 class="confirmation-title"><i class="fa fa-exclamation-triangle orange"></i> Opozorilo!</h2>' +
          '  <span>Dosegel si zadnje vprašanje.<br> Za nadaljevanje dodaj novo vprašanje.<br><br></span>' +
          '    <div class="ngdialog-buttons">' +
          '      <button type="button" class="ngdialog-button" ng-click="closeThisDialog()">Zapri obvestilo</button>' +
          '    </div>' +
          '</div>',
        });
      };
    }
  };
}]);
// === DODANA KODA ===
app.controller('HomeController', function($scope) {
  $scope.message = 'Home';
});
app.controller('QuestionController', function($scope) {
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
    $scope.potrditevPrejemaOdg = potrditevPrejemaOdg;
  };
});
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
