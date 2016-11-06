// Import required modules
var async = require('async');

var slackOperations = require('./slackTap');
var googleOperations = require('./googleTap');
var queryGenerator = require('./queryGenerator');

var UserModel = require('./models/user');

module.exports = function (agenda) {
    agenda.define('listener', function(job, done) {
        UserModel.User.findOne({'slack.id' : job.attrs.data.userId}, function(err, user) {
            realTimeReport(user, job.attrs.data.report);
            done();
        });
    });
}

var realTimeReport = function (user, report) {
    async.waterfall([
        async.apply(googleOperations.realTimeRequest, user),
        async.apply(googleOperations.parseGoogleRTrespose, user, report),
        async.apply(slackOperations.postMessage, user.slack.token, '#general')
    ], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    })
}

// var doReport = function (user, report) {
//     async.waterfall([
//         async.apply(queryGenerator.generateQuery, user, report),
//         async.retryable({times: 3, interval: 500}, async.apply(googleOperations.reportingRequest, user)),
//         googleOperations.parseGoogleResponse,
//         //TODO: replace channel
//         async.apply(slackOperations.postMessage, user.slack.token, '#general')
//     ], function (err, results) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("Inside callback --> " + results);
//         }
//     })
// }