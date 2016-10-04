var listener = require('../app/listener');
var Configuration = require('../app/models/configuration');
var request = require('request');

var User = require('../app/models/user');

module.exports = function(app, passport)
{
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res)
    {
        res.render('index.ejs'); // load the index.ejs file
    });

    //Slack events router
    app.post('/', function(req, res) {
        console.log(req.body);
        //Slack event API handshake - https://api.slack.com/events-api
        if (req.body.challenge) {
            res.send(req.body.challenge);
        }
        if (!req.body || !req.body.event){
            return res.sendStatus(400);
        } else if (req.body.event.username !== 'NewsTed'){
            //Passing the user ID from the event API request.
            postMessage(req.body.event.user);
        }
        // Respond to Slack Event API we received their request
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end();
    });

    function postMessage(userId) {
        //Retrieve slack token from database for the specific user
        User.findOne({'slack.id': userId}, 'slack', function (err, user) {
            if (err) console.log(err);
            //Setting the request properties
            var propertiesObject = {
                token: user.slack.token,
                channel: 'C25VAJQQ5',
                text: 'pipes'
            };
            //Lets try to make a HTTP GET request to modulus.io's website.
            request(
                {
                    url: 'https://slack.com/api/chat.postMessage',
                    qs: propertiesObject
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body); // Show the HTML for the Modulus homepage.
                    }
                });
        });
    }



    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res)
    {
        res.render('profile.ejs',
            {
                user : req.user // get the user out of session and pass to template
            });
    });

    app.post('/profile/googleinfo', function(req, res) {
        console.log('DEBUG #1');
        res.render('profile.ejs',
            {
                googledata :req.googledata
            }
        );
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
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
            successRedirect : '/profile',
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
            listener.loop(res);
            res.redirect('/profile');

        });

    // the callback after google has authenticated the user
    // app.get('/connect/localhost', passport.authenticate('google',
    //     {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     }));


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
            successRedirect : '/profile',
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

    //Route to catch user configuration
    app.post('/profile/conf', function (req, res) {
        var conf = new Configuration();
        conf.configuration.viewsUpperLimit = req.body.viewsUpperLimit;
        conf.configuration.viewsLowerLimit = req.body.viewsLowerLimit;
        console.log(conf.viewsUpperLimit);
        //Save function saves user to database (?How?)
        conf.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log('success');
                }
            });
        res.send('200');
    });

};



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next)
{

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
