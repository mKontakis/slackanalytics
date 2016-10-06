var google = require('googleapis');
var analytics = google.analytics('v3');
var OAuth2Client = google.auth.OAuth2;

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '45668073716-htaah8vqs4k5tf8ei3ag9iqseamtt2gv.apps.googleusercontent.com';
var CLIENT_SECRET = 'Tddw7zdDGw5V9SnxgQw95e0X';
var REDIRECT_URL = 'http://localhost/auth/google/callback';

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

