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
        templateUrl: 'views/chat.tpl.html',
        resolve: {
          username: ['$rootScope', '$q', function ($rootScope, $q) {
            if (!$rootScope.username) {
              return $q.reject('No username');
            }
            return $q.when($rootScope.username);
          }]
        }
      }).
      otherwise({ redirectTo: '/' });
  }]).
  run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function () {
      $location.path('/');
    });
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

    privateChannel.bind('client-chat-message', function (msg) {
      $scope.$apply(function () {
        $scope.messages.push(msg);
        $rootScope.$emit('new_message', msg);
      });
    });

    $scope.sendMessage = function () {
      if (!$scope.currentMessage.body.trim()) {
        return;
      }
      var success = privateChannel.trigger('client-chat-message', $scope.currentMessage);
      if (success) {
        var msg = angular.copy($scope.currentMessage);
        $scope.messages.push(msg);
        $rootScope.$emit('new_message', msg);
        $scope.currentMessage.body = '';
      }
    };

    // Code for displaying the list of users in the channel using a presence
    // channel.

    var presenceChannel = pusher.subscribe('presence-rvajs-chat');

    $scope.users = [];

    presenceChannel.bind('pusher:subscription_succeeded', function (members) {
      $scope.$apply(function () {
        $scope.users.splice(0, $scope.users.length);
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


  angular.module('pushRVA').
    directive('rvaScrollDown', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
      return function (scope, elem, attr) {
        $rootScope.$on('new_message', function () {
          $timeout(function () {
            elem[0].scrollTop = elem[0].scrollHeight + 10;
          });
        });
      };
    }]);
  
})();
