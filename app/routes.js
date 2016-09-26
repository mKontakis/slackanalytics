module.exports = function(app, passport)
{
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res)
    {
        res.render('index.ejs'); // load the index.ejs file
    });

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
            scope : ['email', 'manage_pages', 'publish_pages' ]
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

    // the callback after google has authenticated the user
    app.get('/connect/google/callback', passport.authenticate('google',
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
        user.facebook.token = undefined;
        user.save(function(err)
        {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res)
    {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err)
        {
            res.redirect('/profile');
        });
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
