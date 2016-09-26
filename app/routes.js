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
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google',
        {
            prompt : 'consent',
            accessType : 'offline',
            scope : ['profile', 'email', 'https://www.googleapis.com/auth/analytics','https://www.googleapis.com/auth/analytics.edit']
        }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google',
            {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

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

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook',
        {
            scope : ['email', 'manage_pages', 'publish_pages' ]
        }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook',
            {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook',
        {
            scope : 'email'
        }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback', passport.authorize('facebook',
        {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google',
        {
            scope : ['profile', 'email']
        }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback', passport.authorize('google',
        {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));



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
