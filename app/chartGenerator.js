const https = require('https');
var request = require('request');
var moment = require('moment');


module.exports.generateChart = function (samples, callback) {

    var timeFormat = 'HH:mm';

    var timestamps = [];
    var data = [];
    //console.log(samples);
    // for (var prop in samples) {
    //     console.log(samples[prop]);
    //     if (samples.hasOwnProperty(prop)) {
    //
    //     }
    // }


   // console.log("Debug #1 " + samples.size);
   //
   //  for (var i = 0; i < samples.length; i++){
   //      var obj = samples[i];
   //      for (var key in obj){
   //          var attrName = key;
   //          var attrValue = obj[key];
   //          console.log(attrName + " = " + attrValue);
   //      }
   //  }


    // for (var sample in samples) {
    //     if (samples.hasOwnProperty(sample)) {
    //         console.log(sample);
    //         continue;
    //     }
    //     var obj = samples[sample];
    //
    //     for (var prop in obj) {
    //         // skip loop if the property is from prototype
    //         if(!obj.hasOwnProperty(prop)) continue;
    //
    //
    //       //  console.log(prop + " = " + obj[prop]);
    //     }
    // }

   // console.log(samples.length);
    for(var i = 0; i < samples.length; i++) {
        timestamps.push(samples[i].timestamp);
        data.push(samples[i].value);
     //   console.log("Debug #2 " + timestamps[0]);
    }

    function newDateString(days) {
        return moment().add(days, 'd').format(timeFormat);
    }

    var body = JSON.stringify({
        template: 'testtemplate',
        options: {
            data: {
                labels: timestamps,
                datasets: [
                    {
                        label: "My First dataset",
                        data: data,
                        spanGaps: false
                    }
                ]
            }
        }
    });

    var options = {
        uri: 'https://charturl.com/short-urls.json',
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        },
        qs: {api_key:'dak-0d654c08-5238-4bfd-91ce-a3ecd5d3873c'},
        body: body
    };

    request.post(options, function (error, response, body) {
        if (!error && body) {

            var json = JSON.parse(body);
      //      console.log(json.short_url);
            callback(null, json.short_url);
        } else {
            callback(error);
            console.log(error);
        }
    });

    // var options = {
    //     hostname: 'charturl.com',
    //     port: 443,
    //     path: '/short-urls.json?api_key=dak-0d654c08-5238-4bfd-91ce-a3ecd5d3873c',
    //     method: 'POST',
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Content-Length": Buffer.byteLength(body)
    //     }
    // };
    //
    // var req = https.request(options, (res) => {
    //     console.log('statusCode: ', res.statusCode);
    //
    //     res.on('data', (d) => {
    //        // console.log(d);
    //         process.stdout.write(d.short_url);
    //     });
    // });
    //
    // req.end(body);
    //
    // req.on('error', (e) => {
    //     console.error(e);
    // });
}
