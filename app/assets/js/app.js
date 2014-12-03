var apollo    = angular.module("apollo", ['mm.foundation', 'ngAnimate' ])
var itunes    = require('itunes-library-stream'),
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

apollo.controller('menuCtrl', ['$scope', '$timeout', function ($scope, $timeout){
  $scope.menu = false;
  $scope.sideBar = false;
  $scope.settings = false;
  $scope.waiting = false;
  $scope.load = true;
  $scope.populated = false;
  $scope.focus = false;
  $scope.currentSongChildren = []
  $scope.alert = ""
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
        $scope.focus = true;
      });
    })   
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
    db.update({ _id: $scope.selectedSong._id }, { $pull: { children: child._id } }, {}, function () {
    });
  }

  $scope.generatePlaylist = function(currentSongID){
    var output = [];
    var blacklist = {};
    output.push(currentSongID);

    var currentSongID = output.last()

    db.find({_id: currentSongID}, { children: 1, _id: 0 }, function(err, children){
      var ch = children[0].children

      if(ch.length === 0){
  
        c("Blacklisted! - No Children")
        c("This song has no links!")
        $scope.alert = "This song has no Links"
      }
      else{
        $scope.walkChildren(blacklist, output);
      }
    })    
  }

  $scope.walkChildren = function(blacklist, output, counter){
    var candidates = []
    var currentSongID = output.last()

    if(output.length > 1){var parentSong = output.secondLast()}

    db.find({_id: currentSongID}, { children: 1, _id: 0 }, function(err, children){
      var ch = children[0].children
      blacklist[parentSong] = blacklist[parentSong] || []
      // current song has no children (hit only after second )
      if(ch.length === 0){
  
        c("Blacklisted! - No Children")
        blacklist[parentSong] = blacklist[parentSong] || []
        blacklist[parentSong].push(currentSongID)
        c(output)
        output.pop()
        c(output)
        c(blacklist)
        $scope.walkChildren(blacklist, output, counter);

      }
      else{
        for(var i = 0; i < ch.length; i++){
          candidates.push(ch[i])
        }

        difference = _.difference(candidates, blacklist[parentSong])
        c("candidates: ")
        c(candidates)
        
        c("Difference")
        c(difference)
    
        c("Blackilist")
        c(blacklist[parentSong])

        var candidate = candidates[(Math.floor(Math.random() * ch.length))]
        // c(blacklist)

        // all children have no viable children
        if(difference.length === 0){    
          c("Blacklisted! All Children are Blacklisted")
          blacklist[parentSong] = blacklist[parentSong] || []
          blacklist[parentSong].push(currentSongID)
          c(output)
          output.pop()
          c(output)

          $scope.walkChildren(blacklist, output, counter);
        } 
        // duplicate
        else if(output.indexOf(candidate) > -1){
          c("Blacklisted! - Duplicate")
          blacklist[parentSong] = blacklist[parentSong] || []
          blacklist[parentSong].push(currentSongID)
          // loop
          $scope.walkChildren(blacklist, output, counter);
        }
        else if(blacklist[parentSong].indexOf(candidate) > -1){
          c("song already blacklisted")
          // output.pop();
          $scope.walkChildren(blacklist, output, counter);
        }
        // Success
        else{
          output.push((candidate));
          c("success")
          c(output)
          if(output.length == 10){
            c(output);
            // c(blacklist)
            return
          } else {
            // loop
            $scope.walkChildren(blacklist, output, counter);
          }
          
        }
      };
 

    })   

  }


  // initialize
  $scope.populate();
}])

apollo.controller('focusCtrl', ['$scope', function($scope){

}])





