var Agenda = require('agenda');
var async = require('async');

var UserModel = require('./models/user');
var queryGenerator = require('./queryGenerator');

var agenda;

var createJob = function(report, user) {
    if (report.reportId == '2') {
        //checking if job exists in the database. Avoiding duplicates
        agenda.jobs({name: "listener", "data.userId": user.slack.id}, function (err, jobs) {
            if (err) {
                console.log(err);
            } else {
                if (jobs.length > 0) {
                    agenda.start();
                } else {
                    var job = agenda.create('listener', {userId: user.slack.id, report: report});
                    job.repeatEvery('20 seconds');
                    job.computeNextRunAt();
                    job.save();
                    agenda.start();
                }
            }
        })
    } else {
        parseWhen(report.when, function (err, data) {
            var cronPattern = data.minute + ' '
                + data.hour + ' '
                + data.day_month + ' '
                + data.month + ' '
                + data.day_week + ' ';

            agenda.create('dummyjob', {userId: user.slack.id, report: report}).repeatEvery(cronPattern).save();
            agenda.start();
        })
    }
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
    switch (when.interval.toString()) {

        case 'Every hour/min':
            if (time[0] != 0) {
                result.hour = '*/' + time[0];
                result.minute = time[1];
            } else {
                result.hour = '*';
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
        console.log('graceful quit');
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
    module.exports.agenda = agenda;
    require('./reportOne')(agenda);
    agenda.on('ready', function() {
        removeStaleJobs(function (e, r) {
            if (e) {
                console.error("Unable to remove stale jobs. Starting anyways.");
            }
            if (report && user) {
                createJob(report, user);
            } else {
                agenda.start();
            }
        });
    }
    )
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