
var request = require('request');
var moment = require('moment');

module.exports.generateChart = function (samples, callback) {
    var timestamps = [];
    var data = [];

    for(var i = 0; i < samples.length; i++) {
        //Parsing the Date string to Date object and format it and push it to the array
        timestamps.push(moment(samples[i].timestamp).format("Do - HH:mm"));
        //Push element to array
        data.push(samples[i].value);
    }

    //Chart customization
    var body = JSON.stringify({
        template: 'testtemplate',
        options: {
            data: {
                labels: timestamps,
                datasets: [
                    {
                        label: "My First dataset",
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: "butt",
                       //  borderDash: [],
                       // borderDashOffset: 0.0,
                        borderJoinStyle: "miter",
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
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

    //Executing the HTTP Request
    request.post(options, function (error, response, body) {
        if (!error && body) {
            var json = JSON.parse(body);
            callback(null, json.short_url);
        } else {
            callback(error);
            console.log(error);
        }
    });

}
