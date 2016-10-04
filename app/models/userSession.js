var mongoose = require('mongoose');

var userSession = mongoose.Schema(
    {
        session : {
            name            : String,
            slack_id        : String,
            logged_in_at    : String
        }
    }
);

module.exports = mongoose.model('UserSession', userSession);