// setup DB
var Datastore = require('nedb'), 
    db = new Datastore({ filename: './db/library.db', autoload: true });

