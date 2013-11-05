(function () {
"use strict";

angular.module('pushRVA', ['ngRoute']).
  config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {
        controller: 'HomeCtrl',
        templateUrl: 'views/home.tpl.html'
      }).
      when('/chat', {
        controller: 'ChatCtrl',
        templateUrl: 'views/chat.tpl.html'
      }).
      otherwise({ redirectTo: '/' });
  }]);


angular.module('pushRVA').
  controller('HomeCtrl', ['$scope', '$rootScope', '$http', '$location',
                         function ($scope, $rootScope, $http, $location) {
    $scope.joinChat = function () {
      $http.post('/register', {
        username: $scope.username
      }).success(function () {
        $rootScope.username = $scope.username;
        $location.path('/chat');
      });
    };
  }]);

angular.module('pushRVA').
  controller('ChatCtrl', ['$scope', '$rootScope', '$location',
                         function ($scope, $rootScope, $location) {

    if (!$rootScope.username) {
      $location.path('/');
      return;
    }
    Pusher.log = console.log.bind(console);

    var pusher = new Pusher('c58c0593d14c10c68435');
    var channel = pusher.subscribe('private-rvajs-chat');

    $scope.messages = [];

    $scope.currentMessage = {
      username: $rootScope.username,
      body: ''
    };

    channel.bind('client-message', function (msg) {
      $scope.$apply(function () {
        $scope.messages.push(msg);
      });
    });

    $scope.sendMessage = function () {
      if (!$scope.currentMessage.body.trim()) {
        return;
      }

      var success = channel.trigger('client-message', $scope.currentMessage);
      if (success) {
        $scope.messages.push(angular.copy($scope.currentMessage));
        $scope.currentMessage.body = '';
      }
    };
  }]);
  
})();
