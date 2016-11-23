app = angular.module('ui.bootstrap.demo', ['ui.bootstrap']);
app.controller('ModalDemoCtrl', function ($uibModal) {
  var $ctrl = this;

  $ctrl.open = function () {
    var modalInstance = $uibModal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
    });
  };
});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

app.controller('ModalInstanceCtrl', function ($uibModalInstance) {
  var $ctrl = this;
  $ctrl.ok = function () {
      $uibModalInstance.close();
  };
});