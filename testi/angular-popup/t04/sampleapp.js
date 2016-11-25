//  Build our app module, with a dependency on the angular modal service.
//var app = angular.module('sampleapp', ['angularModalService', 'ngAnimate']);
var app = angular.module('sampleapp', ['angularModalService']);

app.controller('SampleController', ['$scope', 'ModalService', function($scope, ModalService) {

//  $scope.yesNoResult = null;

  $scope.showYesNo = function() {

    ModalService.showModal({
      templateUrl: "yesno/yesno.html",
      controller: "YesNoController"
    }).then(function(modal) {
      modal.element.modal();f
      modal.close.then(function(result) {
        $scope.yesNoResult = result ? "You said Yes" : "You said No";
      });
    });

  };
}]);
