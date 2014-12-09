// setup DB
var Datastore = require('nedb'), 
    db = new Datastore({ filename: './db/library.db', autoload: true });

db.ensureIndex({ fieldName: 'Track ID', unique: true, sparse: true }, function (err) {});

