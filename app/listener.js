// Import required modules
var google = require('googleapis');
var events = require('events');
var request = require('request');

var User = require('../config/passport.js')

var analytics = google.analytics('v3');
var OAuth2Client = google.auth.OAuth2;

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '45668073716-htaah8vqs4k5tf8ei3ag9iqseamtt2gv.apps.googleusercontent.com';
var CLIENT_SECRET = 'Tddw7zdDGw5V9SnxgQw95e0X';
var REDIRECT_URL = 'http://localhost/auth/google/callback';

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


// Create an eventEmitter object
var eventEmitter = new events.EventEmitter();

// Function that triggers on emmit
//Maybe redundant
var usersTriggerHandler = function invokeSlackbot()
{
    console.log("EMMITED");
}

// Bind the connection event with the handler
eventEmitter.on('testTrigger', usersTriggerHandler);


var loop = function() {
    //Provide the tokens to the oauth object
    oauth2Client.setCredentials({
        access_token: User.UserInfo.AccessToken,
        refresh_token: User.UserInfo.RefreshToken
    });
    //Call queryData function every 5 seconds
    setInterval(queryData, 5000, analytics);
}
//Exporting loop function
exports.loop = loop;


// Query function declearation
function queryData(analytics)
{
    analytics.management.accountSummaries.list({
        auth: oauth2Client

    }, function (err, response) {
        if (err) {
            console.log(err);
            return;
        }

        console.log(response);
    })
    eventEmitter.emit('testTrigger');

}
