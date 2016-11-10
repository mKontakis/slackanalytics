var listener = require('../app/listener');
var googleTap = require('../app/googleTap');
var slackTap = require('../app/slackTap');
var scheduler = require('../app/scheduler');

var ObjectId = require('mongodb').ObjectID;

module.exports = function(app, passport)
{
    // =====================================
    // ROUTE INTERNAL POST REQUESTS ========
    // =====================================

    app.post('/newAlert', function(req, res, next)
    {

        if (req.body.reportId == '123')
        {
            // Create report
            var report = {
                "_id" : new ObjectId(),
                "reportId"    : req.body.reportId,
                "period"      : req.body.period,
                "when": {
                    "interval": (req.body.interval),
                    "time"    : req.body.timeHour + ":" + req.body.timeMinute
                }};

            // Save it and init agenda
            var dataSource;
            if (typeof req.body.dataSource[0] == 'string') {
                dataSource = req.body.dataSource[0].split(':')
                req.user.google.view.id = dataSource[1];
                req.user.google.view.name = dataSource[0];
            } else {
                dataSource = [];
            }

            req.user.reports.push(report);
            req.user.save();

            scheduler.initAgenda(report, req.user);

        } else if (req.body.reportId == '2')
        {
            var margins;
            if (typeof req.body.margins[0] == 'string') {
                margins = req.body.margins[0].split(',')
            } else {
                margins = [];
            }

            // Create alert
            var alert = {
                "_id" : new ObjectId(),
                "reportId"    : req.body.reportId,
                "threshold"   :
                {
                    "min"     : margins[0],
                    "max"     : margins[1]
                }};

            // Save it and init agenda
            var dataSource;
            if (typeof req.body.dataSource[0] == 'string') {
                dataSource = req.body.dataSource[0].split(':')
                req.user.google.view.id = dataSource[1];
                req.user.google.view.name = dataSource[0];
            } else {
                dataSource = [];
            }

            req.user.reports.push(alert);
            req.user.save();

            scheduler.initAgenda(alert, req.user);
        }

        var slackChannels, googleViews;

        slackTap.getSlackChannels(req.user, function (err, data)
        {
            slackChannels = data;

            googleTap.getAccountSummariesList(req.user, function (err, data)
            {
                googleViews = data.items;

                res.render('pages/alerts.ejs',
                    {
                        user         : req.user,
                        items        : googleViews,
                        channels     : slackChannels,
                        newEntry     : true
                    });
            });

        });

    });

    app.post('/deleteAlert', function(req, res, next)
    {
        // Delete

        var commentId = req.body.objectId; //commentId

        // commentId is the id of the sudocument that must be deleted. add only that

        // Redirect
        var slackChannels, googleViews;

        slackTap.getSlackChannels(req.user, function (err, data)
        {
            slackChannels = data;

            googleTap.getAccountSummariesList(req.user, function (err, data)
            {
                googleViews = data.items;

                res.render('pages/alerts.ejs',
                    {
                        user         : req.user,
                        items        : googleViews,
                        channels     : slackChannels,
                        newEntry     : false
                    });
            });

        });

    });


    // =====================================
    // ROUTE INTERNAL GET REQUESTS =========
    // =====================================

    // Populate Google Analytics Views drop-down
    app.get('/profile/views', function(req, res)
    {
        googleTap.getAccountSummariesList(req.user, function (err, data)
        {
            var items = data.items;

            res.send(items);
        });
    });


    // =====================================
    // ROUTE APP NAVIGATION ================
    // =====================================

    // Main Page
    app.get('/', function(req, res)
    {

        res.render('pages/index.ejs',
            {
                user : req.user, // get the user out of session and pass to template
                //items: data.items
            });

    });

    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/alerts', hasToken, function(req, res)
    {
        var slackChannels, googleViews;

        slackTap.getSlackChannels(req.user, function (err, data)
        {
            slackChannels = data;

            googleTap.getAccountSummariesList(req.user, function (err, data)
            {
                googleViews = data.items;

                res.render('pages/alerts.ejs',
                    {
                        user         : req.user,
                        items        : googleViews,
                        channels     : slackChannels,
                        newEntry     : false
                    });
            });

        });

    });

    // Alerts Page
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/createAlert', hasToken, function(req, res)
    {
        var slackChannels, googleViews;

        slackTap.getSlackChannels(req.user, function (err, data)
        {
            slackChannels = data;

            googleTap.getAccountSummariesList(req.user, function (err, data)
            {
                googleViews = data.items;

                res.render('pages/createAlert.ejs',
                    {
                        user         : req.user,
                        items        : googleViews,
                        channels     : slackChannels
                    });
            });

        });

    });

    // Reports Page
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/createReport', hasToken, function(req, res)
    {
        var slackChannels, googleViews;

        slackTap.getSlackChannels(req.user, function (err, data)
        {
            slackChannels = data;

            googleTap.getAccountSummariesList(req.user, function (err, data)
            {
                googleViews = data.items;

                res.render('pages/createReport.ejs',
                    {
                        user         : req.user,
                        items        : googleViews,
                        channels     : slackChannels
                    });
            });

        });

    });


    // Profile Page
    app.get('/profile', isLoggedIn, function(req, res)
    {
        res.render('pages/profile.ejs',
        {
            user : req.user, // get the user out of session and pass to template
        });
    });

    // Help Page
    app.get('/help', isLoggedIn, function(req, res)
    {
        res.render('pages/help.ejs',
        {
            user : req.user // get the user out of session and pass to template
        });
    });

    // Billing Page
    app.get('/billing', isLoggedIn, function(req, res)
    {
        res.render('pages/billing.ejs',
        {
            user : req.user // get the user out of session and pass to template
        });
    });

    // Logout
    app.get('/logout', function(req, res)
    {
        req.logout();
        res.redirect('/');
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // =====================================
    // SLACK ROUTES ========================
    // =====================================
    app.get('/auth/slack', passport.authenticate('slack'));

    app.get('/auth/slack/callback',
        passport.authenticate('slack',
        {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // =====================================
    // FACEBOOK AUTHORIZE ROUTES ===========
    // =====================================

    app.get('/connect/facebook', passport.authenticate('facebook',
    {
        scope : ['email', 'manage_pages', 'publish_pages' ],
        authType : 'https'
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/connect/facebook/callback', passport.authenticate('facebook',
    {
        successRedirect : '/profile?fb_setup=true#',
        failureRedirect : '/'
    }));

    // =====================================
    // GOOGLE AUTHORIZE ROUTES =============
    // =====================================

    app.get('/connect/google', passport.authenticate('google',
        {
            prompt : 'consent',
            accessType : 'offline',
            scope : ['profile', 'email', 'https://www.googleapis.com/auth/analytics','https://www.googleapis.com/auth/analytics.edit']
        }));

    app.get('/connect/localhost',
        passport.authenticate('google', { failureRedirect: '/' }),
        function(req, res) {
            res.redirect('/profile');

        });

    app.get('/connect/google/callback', passport.authenticate('google',
        {
            successRedirect : '/profile?ga_setup=true#',
            failureRedirect : '/'
        }));


    // =====================================
    // TWITTER AUTHORIZE ROUTES ============
    // =====================================

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authenticate('twitter', {
        scope : 'email',
        forceLogin : 'true'
    })
    );

    // handle the callback after twitter has authenticated the user
    app.get('/connect/twitter/callback',
        passport.authenticate('twitter',
        {
            successRedirect : '/profile?tw_setup=true#',
            failureRedirect : '/'
        }));

    // =============================================================================
    // UNLINK AND DELETE SOCIAL ACCOUNTS FROM SLACK USER ===========================
    // =============================================================================

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res)
    {
        var user            = req.user;
        user.facebook = undefined;
        user.save(function(err)
        {
            if (err)
            {
                console.log(err);
            }

            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res)
    {
        var user          = req.user;
        user.google = undefined ;
        user.save(function(err)
        {
            if (err)
            {
                console.log(err);
            }

            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res)
    {
        var user           = req.user;
        user.twitter = undefined;
        user.save(function(err)
        {
            if (err)
            {
                console.log(err);
            }

            res.redirect('/profile');
        });
    });

};

// =============================================================================
// UNLINK AND DELETE SOCIAL ACCOUNTS FROM SLACK USER ===========================
// =============================================================================

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next)
{

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function hasToken(req, res, next)
{

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && req.user.google.token)
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/profile');
}
