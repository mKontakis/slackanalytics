var request = require('request');

//Posts stuff to slack
module.exports.postMessage = function (token, channelId, text, callback) {
    //Setting the request properties
    var propertiesObject = {
        token: token,
        channel: channelId,
        asUser : 'false',
        text: text
    };
    request(
        {
            url: 'https://slack.com/api/chat.postMessage',
            qs: propertiesObject
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                //  callback(null, 'Message sent');
                // console.log(body);
                callback(null, 'Message sent');
            } else {
                console.log(error);
                callback(error);
            }
        });
}