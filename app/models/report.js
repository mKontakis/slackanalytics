// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var user = require('./user');

// define the schema for our user model
var reportSchema = mongoose.Schema({
    reportId: String,
    specifications : [{
        metrics: {
            'ga:pageviews': Boolean,
            bounceRate: Boolean
        },
        dimensions: {

        }
    }
    ]
    //Reference to the user it belongs.
    // user: [
    //     {
    //         type: Schema.Types.ObjectId, ref: user
    //     }
    // ]
    }
);

// create the model for users and expose it to our app
module.exports = mongoose.model('Report', reportSchema);