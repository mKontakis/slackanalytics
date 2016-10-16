// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        refreshToken : String,
        email        : String,
        name         : String,
        view         : {
            id       : String,
            name     : String
        }
    },
    slack            : {
        id           : String,
        token        : String,
        team         : String,
        teamId       : String,
        user         : String,
        name         : String,
        channel: {
            id       : String,
            name     : String
        }
    },
    reports: [{
        reportId     : String,
        period       : String,
        prefChannel  : String,
        when: {
            interval : String,
            time     : String
        }
    }]
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password)
{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password)
{
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports.User = mongoose.model('User', userSchema);