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

    // Code for sending/receiving chat messages using client events and a
    // private pusher channel.

    var privateChannel = pusher.subscribe('private-rvajs-chat');

    $scope.messages = [];

    $scope.currentMessage = {
      username: $rootScope.username,
      body: ''
    };

    privateChannel.bind('client-message', function (msg) {
      $scope.$apply(function () {
        $scope.messages.push(msg);
      });
    });

    $scope.sendMessage = function () {
      if (!$scope.currentMessage.body.trim()) {
        return;
      }
      var success = privateChannel.trigger('client-message', $scope.currentMessage);
      if (success) {
        $scope.messages.push(angular.copy($scope.currentMessage));
        $scope.currentMessage.body = '';
      }
    };

    // Code for displaying the list of users in the channel using a presence
    // channel.

    var presenceChannel = pusher.subscribe('presence-rvajs-chat');

    $scope.users = [];

    presenceChannel.bind('pusher:subscription_succeeded', function (members) {
      $scope.$apply(function () {
        members.each(function (member) {
          $scope.users.push(member);
        });
      });
    });
    presenceChannel.bind('pusher:member_added', function (member) {
      $scope.$apply(function () {
        $scope.users.push(member);
      });
    });
    presenceChannel.bind('pusher:member_removed', function (member) {
      $scope.$apply(function () {
        var index = _.findIndex($scope.users, function (user) {
          return parseInt(user.id, 10) === parseInt(member.id, 10);
        });
        $scope.users.splice(index, 1);
      });
    });
  }]);
  
})();
