// AngularJS Initialise
//
// angular.module('plunker', ['ui.bootstrap']);
// var ModalDemoCtrl = function($scope, $modal, $timeout, $log, $http) {
//
//     $scope.open = function() {
//
//         var modalInstance = $modal.open({
//             templateUrl: 'myModalContent.html',
//             controller: ModalInstanceCtrl,
//             resolve: {
//                 mydata: function() {
//                     return "Loading...";
//                 }
//             }
//         });
//
//         modalInstance.opened.then(function() {
//             $scope.loadData(modalInstance);
//         }, function() {
//             $log.info('Modal dismissed at: ' + new Date());
//         });
//     };
//
//     $scope.loadData = function(aModalInstance)
//     {
//         $log.info("starts loading");
//
//         $http({
//             method: 'GET',
//             url: '/profile/views',
//             data: { applicationId: 3 }
//         }).success(function (result)
//         {
//             $log.info(result);
//             aModalInstance.setMyData(result);
//         });
//
//     };
// };
//
// // Please note that $modalInstance represents a modal window (instance) dependency.
// // It is not the same as the $modal service used above.
//
// var ModalInstanceCtrl = function($scope, $modalInstance, mydata) {
//     $scope.mydata = mydata;
//
//     $modalInstance.setMyData = function(theData) {
//         $scope.mydata = theData;
//     };
//
//     $scope.ok = function() {
//         $modalInstance.close('close');
//     };
//     $scope.cancel = function() {
//         $modalInstance.dismiss('cancel');
//     };
// };
//
// angular.module('app', []).controller('Test', function ($scope, $http)
// {
//     $scope.selectedTestAccount = null;
//     $scope.testAccounts = [];
//
//     $http({
//         method: 'GET',
//         url: '/profile/views',
//         data: { applicationId: 3 }
//     }).success(function (result)
//     {
//         $scope.testAccounts = result;
//     });
// });


// Nav transition effect
$('ul>li>a').hover(function(){
 $('ul>li>a').not(this).toggleClass('toggle');
    });

// On redirect from OAUTH, show modals
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