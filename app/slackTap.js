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

/**
 * Posts a message to slack
 * @param {String} token: The token to authorize the call
 * @param channelId: Name or ID of slack channel to post the message
 * @param attachments: Contains attachments objects
 * @param callback
 */
module.exports.postMessage = function (token, channelId, attachments, callback) {
    //Setting the request properties
    var propertiesObject = {
        token: token,
        channel: channelId,
        asUser : 'false'
    };

    var attachmentsObject = [];
    var myObj = {};
    myObj.attachments = attachments;
    attachmentsObject.push(attachments);

    propertiesObject.attachments = JSON.stringify(attachmentsObject);
    request(
        {
            url: 'https://slack.com/api/chat.postMessage',
            qs: propertiesObject
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(null, 'Message sent');
            } else {
                callback(error);
            }
        });
}