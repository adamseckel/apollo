var apollo    = angular.module("apollo", ['mm.foundation', 'ngAnimate', 'mc.resizer'])
var itunes    = require('itunes-library-stream'),
    fs        = require('fs');
    // path      = require('path'),
    // Datastore = require('nedb');
// var collection = db.collection("library");
// db.loadDatabase();    

apollo.controller('menuCtrl', ['$scope', function ($scope){
  $scope.menu = true;
  $scope.sideBar = false;
  $scope.settings = false;
  $scope.progress = false;
  var vm = $scope;

  $scope.progressBarOn = function(){
    vm.progress = true
  }
  $scope.progressBarOff = function(){
    vm.progress = false
  }



  $scope.importItunes = function(element){
    // $scope.progressBarOn();
    $scope.fileNameChanged(element);
    // $scope.progressBarOff();

  }

  $scope.fileNameChanged = function(element) { 
    vm.progressBarOn();
    var iTunesDir = (element.files[0].path); 
    collection.insert({library: iTunesDir}, function (err, file) {
      // console.log(file)
    });

    var stream = fs.createReadStream(iTunesDir)
    .pipe(itunes.createTrackStream())
    .on('data', function(data) {
      collection.insert([data], function (err, file) {
        // console.log(file)
      });
    })
    stream.on("end", function(err, resp){
      alert("Done!")
    })
    // vm.progressBarOff();
  }

}])

// var library = collection.find()


