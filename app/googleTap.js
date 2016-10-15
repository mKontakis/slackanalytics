/*
    This file presents the rest of the application with a model
    that provides all google-related data needed for a said user.

    It creates a layer of abstraction between the app and api/database.
 */

var google = require('googleapis');
var analytics = google.analytics('v3');
var analyticsReporting = google.analyticsreporting('v4');
var OAuth2Client = google.auth.OAuth2;
var UserModel = require('../app/models/user');

var configAuth = require('../config/authLocal');

var exports = module.exports = {};

var CLIENT_ID = configAuth.googleAuth.clientID;
var CLIENT_SECRET = configAuth.googleAuth.clientSecret;
var REDIRECT_URL = configAuth.googleAuth.callbackURL;

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

exports.getAccountSummariesList = function (CurrentUser, callback)
{
    oauth2Client.setCredentials(
    {
        access_token: CurrentUser.google.token,
        refresh_token: CurrentUser.google.refreshToken
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

exports.reportingRequest = function (user, queryBody, callback) {

    //Dummy Request body
    //Request body for the batch request
    // var req = {
    //     "viewId":"129070637",
    //     "dateRanges":[
    //         {
    //             "startDate":"2015-06-15",
    //             "endDate":"2016-10-06"
    //         }],
    //     "metrics":[
    //         {
    //             "expression":"ga:pageviews"
    //         }]
    // };

    setOauthCredentials(user.google.token, user.google.refreshToken);
    

    analyticsReporting.reports.batchGet({
        "headers": {
            "Content-Type": "application/json"
        },
        "auth": oauth2Client,
        "resource": {
            "reportRequests": queryBody
        }
    }, function (err, results) {
        if (err) {
            //TODO: Be smarter about that
            console.log(err);
            if (err.code == 401) {
                refreshTokenFunc(user);
            }

            callback(err, null);
        } else {
            //TODO: Treat the response properly.
         //   console.log(JSON.stringify(results));
         //   console.log(results.reports[0].data.totals[0]);
            callback(null, results);
            //  console.log(JSON.parse(results));
        }
    })


    //Function to refresh google access token when it expires
    function refreshTokenFunc(user) {
        oauth2Client.refreshAccessToken(function (err, tokens) {
            if (err) {
                console.log("Error refreshing tokens: " + err);
            } else {
                //Updating user's object access token
                user.google.accessToken = tokens.access_token;
                //Update the database through mongoose given using the refresh token as index.
                //Refresh tokens are unique per user and they dont expire .
                UserModel.User.update(
                    { "google.refreshToken": user.google.refreshToken },
                    {"$set": { "google.token": tokens.access_token}},
                    {multi: false},
                    function (err, raw) {
                        if (err) {
                            console.log('Error log: ' + err)
                        } else {
                            console.log("Token updated: " + raw);
                        }
                    }
                );
                console.log("New google access token: " + tokens.access_token);
            }
        })
    }
}

var setOauthCredentials = function (token, refreshToken) {
    oauth2Client.setCredentials(
        {
            access_token: token,
            refresh_token: refreshToken
        });
}

//TODO: to be implemented properly
exports.parseGoogleResponse = function (response, callback) {
    var payload = response.reports[0].data.totals[0].values;
    var output = null;
    for (var result in payload) {
        if (payload.hasOwnProperty(result)) {
            if (output == null) {
                output = payload[result] + " ";
            } else {
                output += payload[result] + " ";
            }

        }
    }

    callback(null, output);
}

