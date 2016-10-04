// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var configurationSchema = mongoose.Schema({
        configuration  : {
            viewsUpperLimit : String,
            viewsLowerLimit : String
        },
        metrics : {
            pageViews : String,
            uniquePageViews : String,
            entrances : String
        }
    }
);

// create the model for users and expose it to our app
module.exports = mongoose.model('Configuration', configurationSchema);