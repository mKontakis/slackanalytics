// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema(
{

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
        name         : String
    },
    slack            : {
        id           : String,
        token        : String,
        teamId       : String,
        name         : String
    }


});

// define the schema for our user model
var dummySchema = mongoose.Schema(
    {

        facebook         : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        }

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
module.exports = mongoose.model('User', userSchema);
module.exports = mongoose.model('Dummy', dummySchema);
