var UserModel = require('./models/user');
var async = require('async');

var slackOperations = require('./slackTap');
var googleOperations = require('./googleTap');
var queryGenerator = require('./queryGenerator');

module.exports = function (agenda) {
    agenda.define('dummyjob', function(job, done) {
        UserModel.User.findOne({'slack.id' : job.attrs.data.userId}, function(err, user) {
            if (err) console.log(err);
            doReport(user, job.attrs.data.report);
            done();
        })
    });
}

var doReport = function (user, report) {
    async.waterfall([
        async.apply(queryGenerator.generateQuery, user, report),
        async.retryable({times: 3, interval: 500}, async.apply(googleOperations.reportingRequest, user)),
        googleOperations.parseGoogleResponse,
        //TODO: replace channel
        async.apply(slackOperations.postMessage, user.slack.token, '#general')
    ], function (err, results) {
        if (err) console.log(err);
    })
}
