// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var user = require('./user');

// define the schema for our user model
var reportSchema = mongoose.Schema({
    reportId: String,
    specifications : [{
        metrics: [
            {
                expression: String
            }
        ],
        metricFilterClauses : [
            {
                operator: { type: String, default: 'OR'},
                filters: [
                    {
                        metricName: String,
                        operator: String,
                        comparisonValue: String,
                        not: Boolean
                    }
                ]

            }
        ],
        dimensions: {

        }
    }
    ]
    }
);

// create the model for users and expose it to our app
module.exports = mongoose.model('Reports2', reportSchema);