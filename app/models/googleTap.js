/*
    This file presents the rest of the application with a model
    that provides all google-related data needed for a said user.

    It creates a layer of abstraction between the app and api/database.
 */

var google = require('googleapis');
var analytics = google.analytics('v3');
var OAuth2Client = google.auth.OAuth2;

var configAuth = require('../../config/authLocal');

var exports = module.exports = {};

var CLIENT_ID = configAuth.googleAuth.clientID;
var CLIENT_SECRET = configAuth.googleAuth.clientSecret;
var REDIRECT_URL = configAuth.googleAuth.callbackURL;

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

exports.getAccountSummariesList = function (CurrentUser, callback)
{
    oauth2Client.setCredentials(
    {
        access_token: CurrentUser.google.token
    });

    analytics.management.accountSummaries.list(
        {
            'auth': oauth2Client

        }, function (err, response)
        {
            if (err)
            {
                console.log(err);
                return;
            }

            callback(null, response);
        });




}

