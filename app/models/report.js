// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var user = require('../app/models/user');

// define the schema for our user model
var reportSchema = mongoose.Schema({
        //Reference to the user it belongs.
        user: [
            {
                type: Schema.Types.ObjectId, ref: user
            }
            ],
        botConfiguration  : {
            trigger : {
                viewsUpperLimit : Number,
                viewsLowerLimit : Number
            }
        },
        google : {
            dimensions : {
                //bla bla
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
module.exports = mongoose.model('Report', reportSchema);