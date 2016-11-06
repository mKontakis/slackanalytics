var CronJob = require('cron').CronJob;
var Agenda = require('agenda');
//var Report = require('./models/report');
var fs = require('fs');
var async = require('async');

var slackOperations = require('./slackTap');
var googleOperations = require('./googleTap');
var user = require('./models/user');
var queryGenerator = require('./queryGenerator');

var agenda;

var index = 0;
var createJob = function (report, user) {
    index++;
    console.log(report);


    agenda.define('Test ' + index, function(job, done) {
        doReport(user);
        done();
    });

    parseWhen(report.when, function (err, data) {
            var cronPattern = data.minute + ' '
                + data.hour + ' '
                + data.day_month + ' '
                + data.month + ' '
                + data.day_week + ' ';

            agenda.every(cronPattern, 'Test ' + index);
            agenda.start();
            console.log("Agenda initted");
    })
}
    // parseWhen(report[1].when, function (err, data) {
    //     try {
    //         var cronPattern = data.minute + ' '
    //             + data.hour + ' '
    //             + data.day_month + ' '
    //             + data.month + ' '
    //             + data.day_week + ' ';
    //         console.log(cronPattern);
    //         //Creating the cron job.
    //         new CronJob(cronPattern,function () {
    //             doReport(user);
    //         }, null, true, null, null); //True start the cron job.
    //     } catch (ex) {
    //         console.log("cron pattern not valid");
    //     }
    // });

var doReport = function (user) {
    async.waterfall([
        async.apply(queryGenerator.generateQuery, user),
        async.retryable(10, async.apply(googleOperations.reportingRequest, user)),
        googleOperations.parseGoogleResponse,
        async.apply(slackOperations.postMessage, user.slack.token, '#general')
    ], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log(results);
        }
    })
}

var parseWhen = function (when, callback) {
    var result = {
        minute: '*',
        hour: '*',
        day_month: '*',
        month: '*',
        day_week: '*'
    };
    var time = when.time.split(':');
    console.log(when.interval);
    console.log(time);
    switch (when.interval.toString()) {

        case 'Every hour/min':
            if (time[0] != 0) {
                result.hour = '*/' + time[0];
                result.minute = time[1];
            } else {
                result.hour = '*'
                result.minute = '*/' + time[1];
            }
            callback(null, result);
            break;
        case 'Daily':
            result.hour = time[0];
            result.minute = time[1];
            callback(null, result);
            break;
        case 'Monday':
            result.hour = time[0];
            result.minute = time[1];
            result.day_week = 1;
            callback(null, result);
            break;
        case 'Tuesday':
            result.hour = time[0];
            result.minute = time[1];
            result.day_week = 2;
            callback(null, result);
            break;
        case 'Wednesday':
            result.hour = time[0];
            result.minute = time[1];
            result.day_week = 3;
            callback(null, result);
            break;
        case 'Thursday':
            result.hour = time[0];
            result.minute = time[1];
            result.day_week = 4;
            callback(null, result);
            break;
        case 'Friday':
            result.hour = time[0];
            result.minute = time[1];
            result.day_week = 5;
            callback(null, result);
            break;
        case 'Saturday':
            result.hour = time[0];
            result.minute = time[1];
            result.day_week = 6;
            callback(null, result);
            break;
        case 'Sunday':
            result.hour = time[0];
            result.minute = time[1];
            result.day_week = 7;
            callback(null, result);
            break;
        default:
            console.log('Error parsing WHEN');
            callback('Error parsing WHEN', null);
            break;
    }
}


function graceful() {
    agenda.stop(function() {
        console.log('graceful quit')
        process.exit(0);
    });
}

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);



//Agenda configuration
module.exports.initAgenda = function (report, user) {
    agenda = new Agenda();
    agenda.database('mongodb://95.85.35.149/dummyDatabase');
    agenda.processEvery('10 seconds');

    agenda.on('ready', function() {
        removeStaleJobs(function (e, r) {
            if (e) {
                console.error("Unable to remove stale jobs. Starting anyways.");
            }
            createJob(report, user);
            // for(var i = 0; i < user.reports.length; i++) {
            //     createJob(user.reports[i], user);
            // }
           // agenda.start();
        });

        // restoreJobs();
        // agenda.start();
        // for(var i = 0; i < user.reports.length; i++) {
        //     createJob(user.reports[i], user);
        // }
    })
}



function removeStaleJobs(callback) {
    agenda._collection.update({
        lockedAt: {
            $exists: true
        }
    }, {
        $set: {
            lockedAt: null
        }
    }, {
        multi: true
    }, callback);
}

var restoreJobs = function () {
    agenda.jobs({}, function (err, jobs) {
        console.log(jobs);
        // for(var job in jobs) {
        //     job.start();
        // }
    })
}
