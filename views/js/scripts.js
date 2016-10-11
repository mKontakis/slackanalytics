// AngularJS Initialise

// // A module is created by using the AngularJS function angular.module
// var app = angular.module("myApp", []);
//
// // app, controllers should be in different files
// app.controller("myCtrl", function($scope)
// {
//     $scope.firstName = "John";
//     $scope.lastName = "Doe";
// });

angular.module('app', []).controller('Test', function ($scope, $http)
{
    $scope.selectedTestAccount = null;
    $scope.testAccounts = [];

    $http({
        method: 'GET',
        url: '/profile/views',
        data: { applicationId: 3 }
    }).success(function (result)
    {
        $scope.testAccounts = result;
    });
});

// var app = angular.module('app',[]);
// app.controller('Test',function($scope){
//     $scope.items = ['one','two','three','four']
// });



// Menu Hover effect
$('ul>li>a').hover(function(){
 $('ul>li>a').not(this).toggleClass('toggle');
    });


$(document).ready(function() {

    if(window.location.href.indexOf('ga_setup=true#') != -1) {
        $('#gaModal').modal('show');
    }

    if(window.location.href.indexOf('fb_setup=true#') != -1) {
        $('#faModal').modal('show');
    }

    if(window.location.href.indexOf('tw_setup=true#') != -1) {
        $('#twModal').modal('show');
    }

});