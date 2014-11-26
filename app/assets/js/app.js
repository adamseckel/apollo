var apollo    = angular.module("apollo", ['mm.foundation', 'ngAnimate', 'mc.resizer'])
var itunes    = require('itunes-library-stream'),
    fs        = require('fs');

var gui = require('nw.gui');
var win = gui.Window.get(); 

// db.loadDatabase()



apollo.controller('menuCtrl', ['$scope', '$timeout', function ($scope, $timeout){
  $scope.menu = false;
  $scope.sideBar = false;
  $scope.settings = false;
  $scope.waiting = false;
  $scope.load = true;
  $scope.populated = false;
  var vm = $scope;
  $scope.selectedSong = ""

  $scope.maximize = function(){
    win.maximize();
  }

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

  $scope.getSong = function (song){
    // console.log("CLIECKASD");
    $scope.selectedSong = song;
    console.log(song)
    $scope.sideBar = true;
  }

  // Initialization
  $scope.populate();
}])

apollo.controller('focusCtrl', ['$scope', function($scope){

}])





