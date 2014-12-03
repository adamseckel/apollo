Array.prototype.clone = function() {
  return this.slice(0);
};

var solution = null

walk = function(node, path){

  var node_children = null
  db.find({_id: currentSongID}, { children: 1, _id: 0 }, function(err, children){
    node_children = children[0].children
  })
  if (node_children.length === 0) {
    return false;
  }

  path = path.clone()

  if (path.indexOf(node) > -1){
    return false
  }
}