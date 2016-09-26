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
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res)
    {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login',
    {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res)
    {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup',
    {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

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
    }
    ));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google',
            {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));

    // =====================================
    // SLACK ROUTES =======================
    // =====================================
    app.get('/auth/slack', passport.authenticate('slack'));

    app.get('/auth/slack/callback',
            passport.authenticate('slack',
            {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));

    // app.get('/auth/slack/callback',
    //   passport.authorize('slack', { failureRedirect: '/' }),
    //   function(req, res) {
    //     // Successful authentication, redirect home.
    //     res.redirect('/profile');
    //   });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email', 'manage_pages', 'publish_pages' ]}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook',
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
