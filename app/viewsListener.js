// Import required modules
var events = require('events');
var request = require('request');
var async = require('async');

var slackOperations = require('./slackTap');
var googleOperations = require('./googleTap');
var queryGenerator = require('./queryGenerator');

var UserModel = require('./models/user');
var Scheduler = require('./scheduler');

module.exports = function (agenda) {
    agenda.define('listener', function(job, done) {
        UserModel.User.findOne({'slack.id' : job.attrs.data.userId}, function(err, user) {

            realTimeReport(user, job.attrs.data.report);
        //    doReport(user, job.attrs.data.report);
            // queryGenerator.generateQuery(user, function (err, result) {
            //     console.log(JSON.stringify(result, null, 4));
            //
            // });
            done();
        });
    });
}

var realTimeReport = function (user, report) {
    async.waterfall([
        async.apply(googleOperations.realTimeRequest, user),
        async.apply(googleOperations.parseGoogleRTrespose, report),
        async.apply(slackOperations.postMessage, user.slack.token, '#general')
    ], function (err, result) {

    })
}

var doReport = function (user, report) {
    async.waterfall([
        async.apply(queryGenerator.generateQuery, user, report),
        async.retryable({times: 3, interval: 500}, async.apply(googleOperations.reportingRequest, user)),
        googleOperations.parseGoogleResponse,
        //TODO: replace channel
        async.apply(slackOperations.postMessage, user.slack.token, '#general')
    ], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log("Inside callback --> " + results);
        }
    })
}

// module.exports = function (agenda) {
//     agenda.define('listener', function(job, done) {
//         UserModel.User.findOne({'slack.id' : job.attrs.data.userId}, function(err, user) {
//
//             var report2job = createJob(user);
//             //Request body for the batch request
//             var queryBody = {
//                 "viewId": user.google.view.id,
//                 "metrics":[
//                     {
//                         "expression":"ga:pageviews"
//                     }]
//             };
//             googleOperations.reportingRequest(user, queryBody, function (err, response) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         var payload = response.reports[0].data.totals[0].values;
//                         var output = null;
//                         var max = 20;
//                         var min = 10;
//                         for (var result in payload) {
//                             if (payload.hasOwnProperty(result)) {
//                                 if (output == null) {
//                                     if (payload[result] > max || payload[result] < min) {
//                                         console.log(payload[result]);
//                                         require('./reportTwo')(Scheduler.agenda);
//                                         report2job.enable();
//                                       //  agenda.now('report2', {userId: user.slack.id});
//                                     } else {
//                                         report2job.disable();
//                                     }
//                                     output = "Total page views: " + payload[result] + " - ";
//                                 } else {
//                                     output += "Unique page views: " + payload[result] + " ";
//                                 }
//
//                             }
//                         }
//                     }
//             });
//             // async.retry({times: 3, interval: 500},
//             //                  async.apply(googleOperations.reportingRequest, user, queryBody)
//             // );
//
//             // async.waterfall([
//             //     async.apply(queryGenerator.generateQuery, user),
//             //
//             // ], function (err, results) {
//             //     if (err) {
//             //         console.log(err);
//             //     } else {
//             //         console.log(results);
//             //     }
//             // })
//             done();
//         });
//     });
// }

var isJobCreated = false;
//var report2job;
var createJob = function (user) {
    Scheduler.agenda.jobs({name: "2"}, function (err, job) {
        if (err) {
            console.log('creating job');
            var report2job = Scheduler.agenda.create('report2', {userId: user.slack.id}).repeatEvery('1 minute').save();
            return report2job;
        } else {
            if (job === undefined) {
                console.log('job exists. Return job');
                console.log(job[0]);
                return job[0];
            } else {

                var report2job = Scheduler.agenda.create('2', {userId: user.slack.id}).repeatEvery('1 minute').save();
                console.log('job null');
                return report2job;

            }

        }
    });
}
