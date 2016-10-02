// load all the things we need
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var SlackStrategy = require('passport-slack').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var refresh = require('passport-oauth2-refresh');

// load up the user model
var User = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport)
{
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done)
    {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done)
    {
        User.findById(id, function(err, user)
        {
            done(err, user);
        });
    });

    // =========================================================================
    // SLACK ==================================================================
    // =========================================================================

    passport.use(
        new SlackStrategy(
            {
                clientID: configAuth.slackbotAuth.clientID,
                clientSecret: configAuth.slackbotAuth.clientSecret,
                callbackURL: configAuth.slackbotAuth.callbackURL,
                scope: 'users:read emoji:read'
            },
            function(accessToken, refreshToken, profile, done)
            {
                console.log("dummyBug");
                var dummy = new Dummy();
                dummy.facebook.token = "dummy";
                dummy.save(function(err)
                {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });

                // make the code asynchronous
                // User.findOne won't fire until we have all our data back from Google
                process.nextTick(function()
                {
                    // try to find the user based on their google id
                    User.findOne({ 'slack.id' : profile.id }, function(err, user)
                    {
                        if (err)
                            return done(err);

                        if (user)
                        {
                            // if a user is found, log them in
                            return done(null, user);
                        } else
                        {
                            // if the user isnt in our database, create a new user
                            var newUser          = new User();

                            // set all of the relevant information
                            newUser.slack.id    = profile.id;
                            newUser.slack.token = accessToken;
                            newUser.slack.teamId  = refreshToken;
                            newUser.slack.name = profile; // pull the first email

                            // save the user
                            newUser.save(function(err)
                            {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                });

            }

        ));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy(
        {

            // pull in our app id and secret from our auth.js file
            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL,
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        // facebook will send back the token and profile
        function(req, token, refreshToken, profile, done)
        {
            // asynchronous
            process.nextTick(function()
            {
                // check if the user is already logged in
                if (!req.user)
                {
                    // find the user in the database based on their facebook id
                    User.findOne({ 'facebook.id' : profile.id }, function(err, user)
                    {
                        // if there is an error, stop everything and return that
                        // ie an error connecting to the database
                        if (err)
                            return done(err);

                        // if the user is found, then log them in
                        if (user)
                        {
                            return done(null, user); // user found, return that user
                        } else
                        {
                            // if there is no user found with that facebook id, create them
                            var newUser            = new User();

                            // set all of the facebook information in our user model
                            newUser.facebook.id    = profile.id; // set the users facebook id
                            newUser.facebook.token = token; // we will save the token that facebook provides to the user
                            //newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                            //newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                            // save our user to the database
                            newUser.save(function(err)
                            {
                                if (err)
                                    throw err;

                                // if successful, return the new user
                                return done(null, newUser);
                            });
                        }

                    });

                } else
                {
                    // user already exists and is logged in, we have to link accounts
                    var user            = req.user; // pull the user out of the session

                    // update the current users facebook credentials
                    user.facebook.id    = profile.id;
                    user.facebook.token = token;
                    //user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                    //user.facebook.email = profile.emails[0].value;

                    // save the user
                    user.save(function(err)
                    {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }

            });

        }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================

    var googleStrategy = new GoogleStrategy({
            clientID        : configAuth.googleAuth.clientID,
            clientSecret    : configAuth.googleAuth.clientSecret,
            callbackURL     : configAuth.googleAuth.callbackURL,
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, refreshToken, profile, done)
        {
            // asynchronous
            process.nextTick(function()
            {
                // check if the user is already logged in
                if (!req.user)
                {
                    User.findOne({ 'google.id' : profile.id }, function(err, user)
                    {
                        if (err)
                            return done(err);

                        if (user)
                        {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.google.token)
                            {
                                user.google.token = token;
                                //user.google.name  = profile.displayName;
                                user.google.refreshToken = refreshToken;
                                //user.google.email = profile.emails[0].value; // pull the first email

                                user.save(function(err)
                                {
                                    if (err)
                                        throw err;
                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else
                        {
                            var newUser          = new User();

                            newUser.google.id    = profile.id;
                            newUser.google.token = token;
                            newUser.google.refreshToken = refreshToken;
                            //newUser.google.name  = profile.displayName;
                            //newUser.google.email = profile.emails[0].value; // pull the first email

                            newUser.save(function(err)
                            {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });

                } else
                {
                    // user already exists and is logged in, we have to link accounts
                    var user               = req.user; // pull the user out of the session

                    user.google.id    = profile.id;
                    user.google.token = token;
                    user.google.refreshToken = refreshToken;
                    //user.google.name  = profile.displayName;
                    //user.google.email = profile.emails[0].value; // pull the first email

                    user.save(function(err)
                    {
                        if (err)
                            throw err;
                        return done(null, user);
                    });

                }

            });

        });

    passport.use(googleStrategy);
    /**
     * https://github.com/fiznool/passport-oauth2-refresh
     * When the access tokens needs refresh call requestNewAccessToken();
     * Ex:
     * var refresh = require('passport-oauth2-refresh');
       refresh.requestNewAccessToken('facebook', 'some_refresh_token', function(err, accessToken, refreshToken) {
       
               You have a new access token, store it in the user object,
               or use it to make a new request.
               `refreshToken` may or may not exist, depending on the strategy you are using.
               You probably don't need it anyway, as according to the OAuth 2.0 spec,
               it should be the same as the initial refresh token.

        });
     */
    refresh.use(googleStrategy);

    // passport.use(new GoogleStrategy(
    //     {
    //
    //         clientID        : configAuth.googleAuth.clientID,
    //         clientSecret    : configAuth.googleAuth.clientSecret,
    //         callbackURL     : configAuth.googleAuth.callbackURL,
    //         passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    //
    //     },
    //     function(req, token, refreshToken, profile, done)
    //     {
    //         // asynchronous
    //         process.nextTick(function()
    //         {
    //             // check if the user is already logged in
    //             if (!req.user)
    //             {
    //                 User.findOne({ 'google.id' : profile.id }, function(err, user)
    //                 {
    //                     if (err)
    //                         return done(err);
    //
    //                     if (user)
    //                     {
    //                         // if there is a user id already but no token (user was linked at one point and then removed)
    //                         if (!user.google.token)
    //                         {
    //                             user.google.token = token;
    //                             //user.google.name  = profile.displayName;
    //                             user.google.refreshToken = refreshToken;
    //                             //user.google.email = profile.emails[0].value; // pull the first email
    //
    //                             user.save(function(err)
    //                             {
    //                                 if (err)
    //                                     throw err;
    //                                 return done(null, user);
    //                             });
    //                         }
    //
    //                         return done(null, user);
    //                     } else
    //                     {
    //                         var newUser          = new User();
    //
    //                         newUser.google.id    = profile.id;
    //                         newUser.google.token = token;
    //                         newUser.google.refreshToken = refreshToken;
    //                         //newUser.google.name  = profile.displayName;
    //                         //newUser.google.email = profile.emails[0].value; // pull the first email
    //
    //                         newUser.save(function(err)
    //                         {
    //                             if (err)
    //                                 throw err;
    //                             return done(null, newUser);
    //                         });
    //                     }
    //                 });
    //
    //             } else
    //             {
    //                 // user already exists and is logged in, we have to link accounts
    //                 var user               = req.user; // pull the user out of the session
    //
    //                 user.google.id    = profile.id;
    //                 user.google.token = token;
    //                 user.google.refreshToken = refreshToken;
    //                 //user.google.name  = profile.displayName;
    //                 //user.google.email = profile.emails[0].value; // pull the first email
    //
    //                 user.save(function(err)
    //                 {
    //                     if (err)
    //                         throw err;
    //                     return done(null, user);
    //                 });
    //
    //             }
    //
    //         });
    //
    //     }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy(
        {
            consumerKey     : configAuth.twitterAuth.consumerKey,
            consumerSecret  : configAuth.twitterAuth.consumerSecret,
            callbackURL     : configAuth.twitterAuth.callbackURL,
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, token, tokenSecret, profile, done)
        {
            // asynchronous
            process.nextTick(function()
            {
                // check if the user is already logged in
                if (!req.user)
                {
                    User.findOne({ 'twitter.id' : profile.id }, function(err, user)
                    {
                        if (err)
                            return done(err);

                        if (user)
                        {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.twitter.token)
                            {
                                user.twitter.token       = token;
                                user.twitter.username    = profile.username;
                                user.twitter.displayName = profile.displayName;

                                user.save(function(err)
                                {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else
                        {
                            // if there is no user, create them
                            var newUser                 = new User();

                            newUser.twitter.id          = profile.id;
                            newUser.twitter.token       = token;
                            newUser.twitter.username    = profile.username;
                            newUser.twitter.displayName = profile.displayName;

                            newUser.save(function(err)
                            {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else
                {
                    // user already exists and is logged in, we have to link accounts
                    var user                 = req.user; // pull the user out of the session

                    user.twitter.id          = profile.id;
                    user.twitter.token       = token;
                    user.twitter.username    = profile.username;
                    user.twitter.displayName = profile.displayName;

                    user.save(function(err)
                    {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });
                }

            });

        }));

};
