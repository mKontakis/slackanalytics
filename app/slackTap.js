/*
    This file presents the rest of the application with a model
    that provides all google-related data needed for a said user.

    It creates a layer of abstraction between the app and api/database.
 */
var request = require('request');

var exports = module.exports = {};

exports.getSlackChannels = function listChannels(currentUser, callback)
{
    var propertiesObject =
    {
        token: currentUser.slack.token
    };
    request(
    {
        url: 'https://slack.com/api/channels.list',
        qs: propertiesObject
    },
    function (error, response, body)
    {
        if (error)
        {
            console.log(error);
            return;
        }

        console.log(JSON.parse(body));

        callback(null, JSON.parse(body));
    });
}