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

exports.getAccountSummariesList = function (user, callback)
{

    setOauthCredentials(user, user.google.refreshToken, function (err, msg)
    {
        if (err)
        {
            console.log(err);
        }

        analytics.management.accountSummaries.list(
            {
                'auth': oauth2Client

            }, function (err, response)
            {
                if (err)
                {
                    if (err.code == 401)
                    {
                        refreshTokenFunc(user);
                    }
                    console.log(err);
                    return;
                }

                callback(null, response);
            });
    });
}

exports.reportingRequest = function (CurrentUser, callback)
{

    oauth2Client.setCredentials(
    {
        access_token: CurrentUser.google.token,
        refresh_token: CurrentUser.google.refreshToken
    });

    //Dummy Request body
    //Request body for the batch request
    var req =
    {
        "viewId"        :"129070637",
        "dateRanges"    :[{
            "startDate" :"2015-06-15",
            "endDate"   :"2016-10-06"
        }],
        "metrics"       :[{
            "expression":"ga:pageviews"
        }]
    };

    analyticsReporting.reports.batchGet({
        "headers"           : {
            "Content-Type"  : "application/json"
        },
        "auth"              : oauth2Client,
        "resource"          : {
            "reportRequests": req
        }
    }, function (err, results)
    {
        if (err) {
            //TODO: Be smarter about that
            console.log(err.code);
        } else {
            //Treat the response properly.
            console.log(results.reports[0].data.totals[0].values[0]);
            callback(null, results);
            //  console.log(JSON.parse(results));
        }
    })
}

//Function to refresh google access token when it expires
function refreshTokenFunc(user)
{
    oauth2Client.refreshAccessToken(function (err, tokens)
    {
        if (err) {
            console.log("Error refreshing tokens: " + err);
        } else {
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

var setOauthCredentials = function (user, refreshToken, callback)
{
    UserModel.User.findOne(
        {"slack.id": user.slack.id},
        function (err, user)
        {
            if ((err)) {
                console.log(err);
                callback(err, null);
            }
            oauth2Client.setCredentials(
                {
                    access_token: user.google.token,
                    refresh_token: refreshToken
                });

            callback(null, 'Tokens set');
        })
}
