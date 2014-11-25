var Engine = require('tingodb')(),
    assert = require('assert');

var db = new Engine.Db('./db', {});
var collection = db.collection("library");





// var itunes    = require('itunes-library-stream'),
//     fs        = require('fs'),
//     path      = require('path'),
//     Datastore = require('nedb');

// // setup DB
// var db = new Datastore('./library.db');

// db.loadDatabase();

// db.find({song:{name: "Crusaders"}}, function (err, docs) {
//   console.log(docs)
// });

// db.count({}, function (err, count) {
//   console.log(count)
// });