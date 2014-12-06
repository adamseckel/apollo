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