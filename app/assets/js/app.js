var apollo    = angular.module("apollo", ['mm.foundation', 'ngAnimate' ])
var itunes    = require('itunes-library-stream'),
    fs        = require('fs');

var gui = require('nw.gui');
var win = gui.Window.get(); 


apollo.controller('menuCtrl', ['$scope', '$timeout', function ($scope, $timeout){
  $scope.menu = false;
  $scope.sideBar = false;
  $scope.settings = false;
  $scope.waiting = false;
  $scope.load = true;
  $scope.populated = false;
  $scope.focus = false;
  $scope.currentSongChildren = []
  // $scope.filtered = {};


  var vm = $scope;
  $scope.selectedSong = ""
  // $scope.library = null
  $scope.rowCollection = [];
  

  $scope.maximize = function(){
    win.maximize();
  }

  $scope.showLibrary = function(){
    $scope.populated = true;
  }

  $scope.populate = function(){
    db.find({ $not: {library: { $exists: true }}}, function(err, docs){
      $scope.library = docs; 
      $scope.rowCollection = docs;
      $scope.displayedCollection = [].concat($scope.rowCollection);
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
    var dbiTunes = []
    var stream = fs.createReadStream(iTunesDir)
      .pipe(itunes.createTrackStream())
      .on('data', function(data) {
        iTunes.push(data)
      }).on("end", function(err, resp){
        for(var i = 0; i < iTunes.length; i++){
          iTunes[i].children = []
          dbiTunes.push(iTunes[i])
        }
        db.insert(dbiTunes, function() {
          $scope.$apply($scope.populate);
        });
      })
  }

  $scope.getSong = function (song){
    $scope.selectedSong = song;
    $scope.selectedSongChildren = [];
    db.find({_id: $scope.selectedSong._id}, { children: 1, _id: 0 }, function(err, children){
      console.log($scope.selectedSong._id)
      var songChildren = children[0].children
      for(var i = 0; i < songChildren.length; i++){
        db.find({_id: songChildren[i]}, function(err, docs){
          $scope.selectedSongChildren.push(docs[0]);
        })
      }
    })
    $scope.focus = true;    
    
  }
  $scope.unBlur = function (){
    $scope.focus = false;
  }

  $scope.songSelect = function(){

  }

  $scope.addLink = function(song){
    db.update({ _id: $scope.selectedSong._id }, { $push: { "children": song._id} }, {}, function () {})
    // $scope.currentSongChildren.push(song)
  }

  // initialize
  $scope.populate();
}])

apollo.controller('focusCtrl', ['$scope', function($scope){

}])





