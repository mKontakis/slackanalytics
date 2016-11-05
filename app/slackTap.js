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

//Posts stuff to slack
module.exports.postMessage = function (token, channelId, text, callback) {
    //Setting the request properties
    var propertiesObject = {
        token: token,
        channel: channelId,
        asUser : 'false',
        text: text
    };
    if (text) {
        request(
            {
                url: 'https://slack.com/api/chat.postMessage',
                qs: propertiesObject
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                    callback(null, 'Message sent');
                } else {
                    console.log(error);
                    callback(error);
                }
            });
    } else {
        callback('Post Message - Not triggered');
    }
}