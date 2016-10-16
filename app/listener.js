// Import required modules
var events = require('events');
var request = require('request');
var async = require('async');

var google = require('googleapis');
var analytics = google.analytics('v3');
var analyticsReporting = google.analyticsreporting('v4');
var OAuth2Client = google.auth.OAuth2;

<<<<<<< HEAD
=======

>>>>>>> master
var UserModel = require('../app/models/user');

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '45668073716-htaah8vqs4k5tf8ei3ag9iqseamtt2gv.apps.googleusercontent.com';
var CLIENT_SECRET = 'Tddw7zdDGw5V9SnxgQw95e0X';
var REDIRECT_URL = 'http://localhost/auth/google/callback';


var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

/*
TODO List:
 - FIX the call of this file
 - FIX the error handling
 - Restart loop on db insertion or update
 */


// Create an eventEmitter object
var eventEmitter = new events.EventEmitter();


// Function that triggers on emmit
//Maybe redundant
var usersTriggerHandler = function invokeSlackbot(response)
{
   // console.log(response);
  //  postMessage();
   // getUsers();

}

function getUsers() {
    UserModel.User.find({}, function (err, users) {
        var userMap = users;
        //For each user in the database do:
        //User is passed automatically to postMessage from the iteration.
        async.eachOf(userMap, function (value, key, callback) {
            //Returned data from the functions are passed to the next in the hierarchy
            async.waterfall(
                [
                    //Apply creates a continuation function with some arguments already applied.
                    async.apply(listChannels, userMap[key].slack.token),
                    async.apply(queryData, userMap[key].google.token, userMap[key].google.refreshToken),
                    postMessage
                ], function (err, results) {
                   // console.log(results);
                }
            )

        },
            function (err) {
            if( err ) {
                // One of the iterations produced an error.
            } else {
             //   console.log('All iterations complete successfully.');
            }
        })
    })
}

function listChannels(slackToken, callback) {
    var propertiesObject = {
        token: slackToken
    };
    request(
        {
            url: 'https://slack.com/api/im.list',
            qs: propertiesObject
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //  console.log(body); // Show the response's body
                var jsonObject = JSON.parse(body);
                for(i = 0; i < jsonObject.ims.length; i++) {
                    var tempObj = jsonObject.ims[i];
                    //Finding the channel that is dedicated to the direct communication with the bot
                    //THe ad hock string is the user code for the bot assigned by slack.
                    if (tempObj.user == 'U2JD9TBCM') {
                        callback(null, tempObj.id, slackToken);
                    }
                }
            } else {
              //  console.log(error);
                callback(error);
            }
        });
}

// Query function declearation
function queryData(googleToken, refreshToken, slackToken, channelId, callback) {
   // console.log("Google Refresh Token: " + refreshToken);
    //Provide the tokens to the oauth object
    oauth2Client.setCredentials({
        access_token: googleToken,
        refresh_token: refreshToken
    });
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


    analytics.management.accountSummaries.list({
        auth: oauth2Client

    }, function (err, response) {
        if (err) {
           // console.log(err);
            //When access token expires manually refresh it
            refreshTokenFunc(refreshToken);
            return;
        }

        analyticsReporting.reports.batchGet( {
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
               // console.log(err.code);
            } else {
                //Treat the response properly.
              //  console.log(results.reports[0].data.totals[0].values[0]);

              //  console.log(JSON.parse(results));
            }
        })

        //Returning data to the waterfall to be passed deeper in the call hierarchy
        callback(null, response, slackToken, channelId);
    })
}

//Posts stuff to slack
function postMessage(response, channelId, token, callback) {
        //Debug
        // console.log('Slack TOken: ' + token);
        // console.log('Channel ID: ' + channelId);
        // console.log(response);
         //Setting the request properties
        var propertiesObject = {
            token: token,
            channel: channelId,
            asUser : 'false',
            text: 'pipes ' + response.username
        };
        request(
            {
                url: 'https://slack.com/api/chat.postMessage',
                qs: propertiesObject
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //console.log(body);
                  //  callback(null, 'Message sent');
                    // console.log(body);
                    callback(null, 'Message sent');
                } else {
                   // console.log(error);
                    callback(error);
                }
            });
}

function handleReportingResults(results) {
    if (!results.code) {
       // console.log(results);
    }
}

// function executeFunctions() {
//     async.waterfall(
//         [
//             queryData,
//             postMessage
//
//
//         ], function (err, results) {
//             console.log(results);
//         }
//     )
// }
//Dummy Comment

// Bind the connection event with the handler
eventEmitter.on('testTrigger', usersTriggerHandler);


var loop = function() {

    var i = new Interval(getUsers, 8000);
    //console.log(i.isRunning());
    if (i.isRunning()) {
       // console.log("IS RUNNING");
    } else {
       // console.log("START");

        i.start();
        //console.log(i.isRunning());
    }

}

function Interval(fn, time) {
    var timer = false;
    this.start = function () {
        if (!this.isRunning())
            timer = setInterval(fn, time);
    };
    this.stop = function () {
        clearInterval(timer);
        timer = false;
    };
    this.isRunning = function () {
        return timer !== false;
    };
}


//Exporting loop function
exports.loop = loop;



//Function to refresh google access token when it expires
function refreshTokenFunc(refreshToken) {
    oauth2Client.refreshAccessToken(function (err, tokens) {
        if (err) {
           // console.log("Error refreshing tokens: " + err);
        } else {
            //Update the database through mongoose given using the refresh token as index.
            //Refresh tokens are unique per user and they dont expire .
            UserModel.User.update(
                    { "google.refreshToken": refreshToken },
                    {"$set": { "google.token": tokens.access_token}},
                    {multi: false},
                    function (err, raw) {
                        if (err) {
                           // console.log('Error log: ' + err)
                        } else {
                           // console.log("Token updated: " + raw);
                        }
                    }
            );
            //console.log("New google access token: " + tokens.access_token);
        }
    })
}


