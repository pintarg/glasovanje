var app = angular.module('plunker', ['ngDialog']);

app.controller('MainCtrl', function($scope) {

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

app.directive('confirm', ['ngDialog', function (ngDialog) {
  return {
    restrict: 'E',
    template: '<a href="#" ng-click="confirmation()">Confirm</a>',
    scope: {
      type: '=?',
    },
    controller: function($scope) {
      $scope.confirmation = function() {
        ngDialog.openConfirm({
            scope: $scope,
            template:
              '<div class="ngdialog-message">' +
              '  <h2 class="confirmation-title"><i class="fa fa-exclamation-triangle orange"></i> Are you sure?</h2>' +
              '  <span>{{text}}</span>' +
              '    <div class="ngdialog-buttons">' +
              '      <button type="button" class="ngdialog-button" ng-click="confirm(confirmValue)">{{label}}</button>' +
              '      <button type="button" class="ngdialog-button" ng-click="closeThisDialog()">Cancel</button>' +
              '    </div>' +
              '</div>',
        }).then(function (confirm) {
          alert('Confirmed')
        }, function(reject) {
          alert('Rejected')
        });
      }
    },
    link: function(scope, element, attrs) {
    	var content = {
    		text: {
    			confirm: "Confirm action text",
    			remove: "Remove action text",
    		}
    	}

    	var button = {
    	  label: {
    	    confirm: "Confirm",
    	    remove: "Remove"
    	  }
    	}
    	scope.text = content.text[attrs.type];
    	scope.label = button.label[attrs.type];
    },

  }
}])
