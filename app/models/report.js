// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var user = require('../app/models/user');

// define the schema for our reports
var reportSchema = mongoose.Schema(
    {
        period              : String,
        when: {
            interval        : String,
            time            : String
        },
        specifications      : [{
            metrics         : {
                pageViews   : true,
                bounceRate  : true
            },
            dimensions:
            {

            }
        }
        ],
        //Reference to the user it belongs.
        user: [
            {
                type: Schema.Types.ObjectId, ref: user
            }
        ]
    }
);

// create the model for users and expose it to our app
module.exports = mongoose.model('Report', reportSchema);