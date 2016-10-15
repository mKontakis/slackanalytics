var CronJob = require('cron').CronJob;
//var Report = require('./models/report');
var fs = require('fs');
var async = require('async');

var slackOperations = require('./slackTap');
var googleOperations = require('./googleTap');
var user = require('./models/user');
var queryGenerator = require('./queryGenerator');

var report;
var createJob = function (report, user) {
    this.report = report;
 //   var when = report.when;

    parseWhen(report[1].when, function (err, data) {
        try {
            var cronPattern = data.minute + ' '
                + data.hour + ' '
                + data.day_month + ' '
                + data.month + ' '
                + data.day_week + ' ';
            console.log(cronPattern);
            //Creating the cron job.
            new CronJob(cronPattern,function () {
                doReport(user);
            }, null, true, null, null); //True start the cron job.
        } catch (ex) {
            console.log("cron pattern not valid");
        }
    });
}

var doReport = function (user) {
    async.waterfall([
        async.apply(queryGenerator.generateQuery, user),
        async.retryable(5, async.apply(googleOperations.reportingRequest, user)),
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
    switch (when.interval) {

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

exports.initTesting = function () {

    user.User.findOne({'slack.id':'U25V31BML'}, function (err, user) {

        user.reports = {reports: []};
        var report = {
            reportId: '123',
            period: 'Monthly',
            when: {
                interval: 'Every hour/min',
                time: "00:01"
            }};

        user.reports.push(report);
        user.save(function (err, updatedUser) {
            if (err) console.log(err);
            console.log('Updated');
            createJob(updatedUser.reports, updatedUser);
        })
    });
}
