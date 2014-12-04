var apollo    = angular.module("apollo", ['mm.foundation', 'ngAnimate'])
var itunes    = require('itunes-library-stream'),
    writer    = require('m3u').writer(),
    fs        = require('fs');


var gui = require('nw.gui');
var win = gui.Window.get(); 

// quick console
c = function(x){
  console.log(x)
}

// last method for arrays
if (!Array.prototype.last){
  Array.prototype.last = function(){
      return this[this.length - 1];
  };
};
// second last
if (!Array.prototype.secondLast){
  Array.prototype.secondLast = function(){
      return this[this.length - 2];
  };
};
// Clone Array
Array.prototype.clone = function() {
  return this.slice(0);
};
// Shuffle Array
function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

// Angular
apollo.controller('menuCtrl', ['$scope', '$timeout', function ($scope, $timeout){
  $scope.menu = false;
  $scope.sideBar = false;
  $scope.settings = false;
  $scope.waiting = false;
  $scope.load = true;
  $scope.populated = false;
  $scope.focus = false;
  $scope.currentSongChildren = [];
  $scope.alert = false;
  $scope.alertMessage = null;
  $scope.playlist = null;
  var solution = null;
  var playlist = null;

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
      var songChildren = children[0].children; 
      // console.log(songChildren)
      $scope.findChildren(songChildren, function(){
        
      });
    })
    $timeout(function() {
      $scope.focus = true; 
    ;}, 10);   
  }

  $scope.findChildren = function(songChildren, callback){
    var allChildren = [];
    for(var i = 0; i < songChildren.length; i++){
      db.find({_id: songChildren[i]}, function(err, docs){
        allChildren.push(docs[0]);         
      })
    }; 
    $scope.currentSongChildren = allChildren; 
    callback();   
  }

  $scope.unBlur = function (){
    $scope.focus = false;
  }

  $scope.songSelect = function(){

  }

  $scope.addLink = function(song){
    console.log(song._id)
    db.update({ _id: $scope.selectedSong._id }, { $addToSet: { "children": song._id} }, {}, function () {})    
    var addToArray=true;
    for(var i=0; i < $scope.currentSongChildren.length; i++){
      if($scope.currentSongChildren[i]._id===song._id){
        addToArray=false;
      }
    }
    if(addToArray){
      $scope.currentSongChildren.push(song)
    }
  }

  $scope.removeChild = function(child){
    var index = $scope.currentSongChildren.indexOf(child)
    $scope.currentSongChildren.splice(index, 1)
    db.update({ _id: $scope.selectedSong._id }, { $pull: { children: child._id } }, {}, function () {});
  }

  $scope.generatePlaylist = function(currentSongID){
    // Nullify old lists
    solution = null
    $scope.waiting = true;
    // Walk selected Song
    $scope.walk(currentSongID, [], function(){
      $scope.returnNames(solution)
    })
    // Wait for Fail
    $timeout(function(){
      if(!solution){
        $scope.waiting = false;
        $scope.alert = true;
        $scope.alertMessage = "THIS SONG DOES NOT HAVE ENOUGH LINKS."
        $timeout(function(){
          $scope.alert = false;
        }, 2000)
      }
    },1000);
  }

  $scope.walk = function(node, path, callback){
    var node_children = null
    db.find({_id: node}, { children: 1, _id: 0 }, function(err, children){
      node_children = children[0].children;
    });

    $timeout(function() {   
      if (node_children.length == 0) {
        return false;
      };
      // Get every possible version?
      // path = path.clone();

      if (path.indexOf(node) > -1){
        return false
      };

      path.push(node);

      if (path.length == 25){
        solution = path;
        callback();
        return true;
      }

      else {
        shuffled_children = shuffle(node_children);
        for(var i = 0; i < shuffled_children.length; i++){
          if($scope.walk(shuffled_children[i], path, callback)){
            return true;
          };
        };
        return false;
      };
    }, 50);    
  };

  $scope.returnNames = function(solution){
    var playlist = []

    solution.forEach(function(id){
      $timeout(function(){
        db.find({_id: id}, function(err, docs){
          playlist.push(docs[0].Name)
          writer.file(docs[0].Location);
          // after();
        }) 
      }, 50);
    })
    // This is awful...
    $timeout(function() {
      console.log(playlist)
      fs.writeFile("Apollo - " + playlist[0] + ".m3u", writer.toString(), function(err){
        if (err) return console.log(err)
      })
      $scope.waiting = false;
    }, 500)
  }

  // initialize
  $scope.populate();
}])

apollo.controller('focusCtrl', ['$scope', function($scope){

}])





