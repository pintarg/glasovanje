var app = angular.module('plunker', ['ngDialog']);

app.controller('MainCtrl', function($scope) {

});

app.config(['ngDialogProvider', function (ngDialogProvider) {
    ngDialogProvider.setDefaults({
        className: 'ngdialog-theme-plain',
        plain: true,
//        showClose: true,
//        closeByDocument: true,
//        closeByEscape: true
    });
}]);

app.directive('confirm', ['ngDialog', function (ngDialog) {
  return {
//    restrict: 'E',
//    template: '<button type="button" ng-click="confirmation()">Confirm</button>',
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
        })
      }
    }
  }
}])
