// Copyright 2013-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var google = require('googleapis');
var analytics = google.analytics('v3');
var OAuth2Client = google.auth.OAuth2;

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '45668073716-htaah8vqs4k5tf8ei3ag9iqseamtt2gv.apps.googleusercontent.com';
var CLIENT_SECRET = 'Tddw7zdDGw5V9SnxgQw95e0X';
var REDIRECT_URL = 'http://localhost:8080/auth/google/callback';

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

oauth2Client.setCredentials({
  access_token: 'ya29.Ci9nAw3rXgNifDHlr73sDxgM7eRPBbmyfhnLz9w_5Dp1tgzWBBNLA2mD4JIrj3A5Wg'
});

analytics.management.profiles.list(
  {
    'auth': oauth2Client,
    'accountId': '~all',
    'webPropertyId': '~all'
  }, function (err, response)
  {
    if (err)
    {
      console.log(err);
      return;
    }
    //var responseString = JSON.stringify(response.totalsForAllResults, null, 4);
    var profiles = response.items;
    for (var i = 0, profile; profile = profiles[i]; i++) {
      console.log('Account id ' + profile.accountId);
    }
  }
);


analytics.data.realtime.get
(
    {
    'auth': oauth2Client,
    'ids': 'ga:128782136',
    'metrics': 'rt:activeUsers',
  }, function (err, response)
      {
        if (err)
        {
          console.log(err);
          return;
        }
        // Hackish way to circumvent ':'
        //console.log(JSON.stringify(response, null, 4));
        //console.log(response.totalsForAllResults);
        var responseString = JSON.stringify(response.totalsForAllResults, null, 4);
        var activeUsers = responseString.toString().split(":")[2].split('"')[1];

        console.log("Current active users are: " + activeUsers);
      }
);
