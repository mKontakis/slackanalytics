// load the things we need
var mongoose = require('mongoose');

var viewsSchema = mongoose.Schema({
    _id: false,
    timestamp: { type: Date, default: Date.now },
    value: String
})

// define the schema for our user model
var activeUsersSchema = mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    views: [viewsSchema]
});

// create the model for users and expose it to our app
module.exports.ActiveUsers = mongoose.model('ActiveUsers', activeUsersSchema);
module.exports.ViewsSchema = mongoose.model('ViewsSchema', viewsSchema);