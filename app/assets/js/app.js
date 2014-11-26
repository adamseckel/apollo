var apollo    = angular.module("apollo", ['mm.foundation', 'ngAnimate', 'mc.resizer'])
var itunes    = require('itunes-library-stream'),
    fs        = require('fs');

// db.loadDatabase()



apollo.controller('menuCtrl', ['$scope', '$timeout', function ($scope, $timeout){
  $scope.menu = true;
  $scope.sideBar = false;
  $scope.settings = false;
  $scope.waiting = false;
  $scope.load = true;
  $scope.populated = false;
  var vm = $scope;

  $scope.showLibrary = function(){
    $scope.populated = true;
  }

  $scope.populate = function(){
    db.find({}, function (err, docs) {
      vm.library = docs; 
      if($scope.load == true){
        $timeout(function() { $scope.load = false }, 1200);  
      }
      $scope.waitingOff();
      $scope.showLibrary();
    });
  }

  // $scope.findLibrary = function(){
  //   db.find({}, function (err, docs) {
  //     vm.library = docs
  //     debugger;
  //   })
    
  // }

  $scope.waitingOff= function() {
    $timeout(function() {$scope.waiting = false}, 1200);
  }


  $scope.importItunes = function(element) {
    var iTunesDir = (element.files[0].path); 
    $scope.$apply(function() {
      $scope.fileNameChanged(iTunesDir);
    })
  }

  $scope.fileNameChanged = function(iTunesDir) { 
    $scope.populated = false;
    $scope.waiting = true;
    db.insert({library: iTunesDir}, function (err, file) {});
    
    var iTunes = []
    var stream = fs.createReadStream(iTunesDir)
      .pipe(itunes.createTrackStream())
      .on('data', function(data) {
        iTunes.push(data)
      }).on("end", function(err, resp){
        // console.log('stream.end')
        db.insert(iTunes, function() {
          $scope.$apply($scope.populate);
        });
      })
  }

  // Initialization
  $scope.populate();
}])





