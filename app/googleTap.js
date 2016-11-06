/*
    This file presents the rest of the application with a model
    that provides all google-related data needed for a said user.

    It creates a layer of abstraction between the app and api/database.
 */

var moment = require('moment');
var google = require('googleapis');
var analytics = google.analytics('v3');
var analyticsReporting = google.analyticsreporting('v4');
var OAuth2Client = google.auth.OAuth2;
var UserModel = require('../app/models/user');
var ActiveUsers = require('../app/models/activeUsers');

var configAuth = require('../config/authLocal');

var exports = module.exports = {};

var CLIENT_ID = configAuth.googleAuth.clientID;
var CLIENT_SECRET = configAuth.googleAuth.clientSecret;
var REDIRECT_URL = configAuth.googleAuth.callbackURL;

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

var chartGenerator = require('./chartGenerator');


/**
 * Returns all the views of the user
 * @param user
 * @param callback
 */
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

        var params = {
            "headers": {
                "Content-Type": "application/json"
            },
            "auth": oauth2Client,
            "ids": "ga:" + user.google.view.id,
            "metrics": "rt:activeUsers"
        };

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


exports.parseGoogleRTrespose = function (user, report, activeUsers, callback) {
    var newEntry = {
        value: activeUsers
    }

    //Adding active users data to the database.
     ActiveUsers.ActiveUsers.findOne({userId: user._id}, function (err, activeUserDocument) {
         //If users already has a dedicated document for his active users, push new data to it
         //else create new document
         if (activeUserDocument) {
             activeUserDocument.views.push(newEntry);
             activeUserDocument.save();
         } else {
             var newActiveUsersEntry = new ActiveUsers.ActiveUsers();
             newActiveUsersEntry.userId = user._id;
             newActiveUsersEntry.views.push(newEntry);
             newActiveUsersEntry.save();
         }
     });


    if (activeUsers > report.threshold.max || activeUsers < report.threshold.min) {
        var today = moment().startOf('day')
        var tomorrow = moment(today).add(1, 'days')
        //TODO: does not return last 24 hours of active users.
        ActiveUsers.ActiveUsers.findOne({userId: user._id, "views.timestamp": { $gt: today.toDate(), $lt: tomorrow.toDate() } }, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                var samples = results.views;

                chartGenerator.generateChart(samples, function (err, result) {
                    if (err) console.log(err);

                    var attachments = {
                        text: "Your active users are: " + activeUsers,
                        image_url: result
                    }

                    callback(null, attachments);
                });
            }
        })

    } else {
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
                if (output == null) {
                    output = "Total page views: " + payload[result] + " - ";
                } else {
                    output += "Unique page views: " + payload[result] + " ";
                }
            }
        }
    }

    var attachments = {
        text: output
    }

    //Checking the response if contains data
    if (output) {
        callback(null, attachments);
    } else {
        callback("Not triggered");
    }
}

