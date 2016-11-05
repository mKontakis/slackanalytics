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

//Generalized
exports.reportingRequest = function (user, queryBody, callback) {
    setOauthCredentials(user, user.google.refreshToken, function (err, msg) {
        if (err) {
            console.log(err);
        }

        var params = {
            "headers": {
                "Content-Type": "application/json"
            },
            "auth": oauth2Client,
            "resource": {
                "reportRequests": queryBody
            }
        };

        analyticsReporting.reports.batchGet(params, function (err, results) {
            if (err) {
                //TODO: Be smarter about that
                console.log(err);
                if (err.code == 401 || err.code == 403) {
                    refreshTokenFunc(user);
                }
                callback(err, null);
            } else {
                //TODO: Treat the response properly.
                callback(null, results);
            }
        });
    })
}

exports.realTimeRequest = function (user, callback) {
    setOauthCredentials(user, user.google.refreshToken, function (err, msg) {
        if (err) {
            console.log(err);
        }

        var dummyQueryBody = {
            "ids": "ga:129070637",
            "metrics": "rt:activeUsers"
        }

        var params = {
            "headers": {
                "Content-Type": "application/json"
            },
            "auth": oauth2Client,
            "ids": "ga:" + user.google.view.id,
            "metrics": "rt:activeUsers"
        };


        //Merging objects
    //    var params2 = Object.assign(params, queryBody);

        // console.log(params2);

        analytics.data.realtime.get(params, function (err, response) {
            if (err) {
                //TODO: Be smarter about that
                console.log(err);
                if (err.code == 401 || err.code == 403) {
                    refreshTokenFunc(user);
                }
                callback(err, null);
            } else {
                //TODO: Treat the response properly.
                var responseString = JSON.stringify(response.totalsForAllResults, null, 4);
                var activeUsers = responseString.toString().split(":")[2].split('"')[1];
                callback(null, activeUsers);
            }
            }
        );
})
}



//Function to refresh google access token when it expires
function refreshTokenFunc(user) {
    oauth2Client.refreshAccessToken(function (err, tokens) {
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

var setOauthCredentials = function (user, refreshToken, callback) {
    UserModel.User.findOne(
        {"slack.id": user.slack.id},
        function (err, user) {
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


exports.parseGoogleRTrespose = function (report, activeUsers, callback) {
    //var activeUsers = responseString.toString().split(":")[2].split('"')[1];
    console.log(activeUsers + ", " + report.threshold.max + ", " + report.threshold.min);
    if (activeUsers > report.threshold.max || activeUsers < report.threshold.min) {
        console.log("Real Time --> Triggered");
        var msg = "Your active users are: " + activeUsers;
        callback(null, msg);
    } else {
        console.log("Real Time --> NOT Triggered");
        callback("Not triggered");
    }
}

//TODO: to be implemented properly
exports.parseGoogleResponse = function (response, callback) {
   // console.log(JSON.stringify(response, null, 4));
    var payload = response.reports[0].data.totals[0].values;
    var output = null;
    for (var result in payload) {
        if (payload.hasOwnProperty(result)) {
            if (payload[result] > 0) {
                console.log("Parse response - Trigerred");
                if (output == null) {
                    output = "Total page views: " + payload[result] + " - ";
                } else {
                    output += "Unique page views: " + payload[result] + " ";
                }
            }
        }
    }
    //Checking the response if contains data
    if (output) {
        callback(null, output);
    } else {
        console.log("Parse response - NOT Trigerred");
        callback("Not triggered");
    }
}

