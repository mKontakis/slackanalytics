// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var configurationSchema = mongoose.Schema({
    userId: String,
    botConfiguration  : {
        trigger : {
            viewsUpperLimit : Number,
            viewsLowerLimit : Number
        }
    },
    google : {
        dimensions : {

        },
        metrics : {
            pageViews : Boolean,
            uniquePageViews : Boolean,
            entrances : Boolean
        }
      }
    }
);

// create the model for users and expose it to our app
module.exports = mongoose.model('Configuration', configurationSchema);