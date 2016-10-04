// Import required modules
var google = require('googleapis');
var events = require('events');
var request = require('request');
var async = require('async');
var UserModel = require('../app/models/user');

var analytics = google.analytics('v3');
var OAuth2Client = google.auth.OAuth2;

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '45668073716-htaah8vqs4k5tf8ei3ag9iqseamtt2gv.apps.googleusercontent.com';
var CLIENT_SECRET = 'Tddw7zdDGw5V9SnxgQw95e0X';
var REDIRECT_URL = 'http://localhost/auth/google/callback';

var User = require('../config/passport');

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


// Create an eventEmitter object
var eventEmitter = new events.EventEmitter();

// Function that triggers on emmit
//Maybe redundant
var usersTriggerHandler = function invokeSlackbot(response)
{
    console.log(response);
  //  postMessage();
    getUsers();

}

function getUsers() {
    UserModel.find({}, function (err, users) {
        var userMap = users;
        async.each(userMap, postMessage, function (err) {
            if( err ) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A file failed to process');
            } else {
                console.log('All files have been processed successfully');
            }
        })
    })
}

function listChannels(token, callback) {
    var propertiesObject = {
        token: token,
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
                    if (tempObj.user == 'U2JD9TBCM') {
                        callback(tempObj.id);
                    }
                }
            } else {
                return body.
                callback(error);
            }
        });
}



function postMessage(user, callback) {
        console.log(user.slack.token);
        listChannels(user.slack.token, function (channelId) {
            console.log(channelId);
            //Setting the request properties
            var propertiesObject = {
                token: user.slack.token,
                channel: channelId,
                asUser : 'false',
                text: 'pipes ' + user.slack.token
            };
            //Lets try to make a HTTP GET request to modulus.io's website.
            request(
                {
                    url: 'https://slack.com/api/chat.postMessage',
                    qs: propertiesObject
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        //  console.log(body); // Show the HTML for the Modulus homepage.
                        callback();
                    } else {
                        callback(error);
                    }
                });
        });

}

function executeFunctions() {
    async.series(
        [
            getUsers,
            
        ]
    )
}

// Bind the connection event with the handler
eventEmitter.on('testTrigger', usersTriggerHandler);


var loop = function(res) {
    //Provide the tokens to the oauth object
    oauth2Client.setCredentials({
        access_token: User.UserInfo.AccessToken,
        refresh_token: User.UserInfo.RefreshToken
    });
    //Call queryData function every 5 seconds
    setInterval(queryData, 8000, analytics);
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
            //When access token expires manually refresh it
            refreshToken();
            return;
        }

       // console.log(response);
        //module.exports.queryResponse = response;
        // module.exports.qRes = function (req, res) {
        //     res.render('profile', {response: response} );
        // }
        eventEmitter.emit('testTrigger', response);
    })

}

//Function to refresh the access token
function refreshToken() {
    oauth2Client.refreshAccessToken(function (err, tokens) {
        
    })
}

// app.get('/profile', function (req, res) {
//     res.render('../views/profile.ejs');
// })
