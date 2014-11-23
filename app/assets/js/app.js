var apollo = angular.module("apollo", ['mm.foundation', 'ngAnimate'])

apollo.controller('menuCtrl', function ($scope){
  $scope.menu = false;
  $scope.sideBar = false;
  var iTunesDir = ""

  var chooseFile = function (name) {
    var chooser = document.querySelector(name);
    chooser.addEventListener("change", function(evt) {
      var iTunesDir = this.value;
      console.log(iTunesDir)
    }, false); 
  }
  chooseFile('#fileDialog');
  
})





