/*
    This file presents the rest of the application with a model
    that provides all google-related data needed for a said user.

    It creates a layer of abstraction between the app and api/database.
 */

var google = require('googleapis');
var analytics = google.analytics('v3');
var analyticsReporting = google.analyticsreporting('v4');
var OAuth2Client = google.auth.OAuth2;

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

exports.reportingRequest = function (CurrentUser, callback) {

    oauth2Client.setCredentials(
        {
            access_token: CurrentUser.google.token,
            refresh_token: CurrentUser.google.refreshToken
        });

    //Dummy Request body
    //Request body for the batch request
    var req = {
        "viewId":"129070637",
        "dateRanges":[
            {
                "startDate":"2015-06-15",
                "endDate":"2016-10-06"
            }],
        "metrics":[
            {
                "expression":"ga:pageviews"
            }]
    };

    analyticsReporting.reports.batchGet({
        "headers": {
            "Content-Type": "application/json"
        },
        "auth": oauth2Client,
        "resource": {
            "reportRequests": req
        }
    }, function (err, results) {
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

