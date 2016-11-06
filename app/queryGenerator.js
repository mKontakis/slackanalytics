var Report = require('./models/report');

//Generates the body of the HTTP Request for google analytics API
exports.generateQuery = function (userSchema, userReport, callback) {
    var requestBody = {};
    if (userReport) {
        var reportId = userReport.reportId;
        //Finding the report that the user signed up from the DB
        Report.findOne({'reportId': + reportId}, function (err, report) {
            if (err || !report) {
                console.log(err);
                callback(new Error("No Report exists in the database with id " + reportId));
            }
            //Adding viewId property to requestBody object
            requestBody["viewId"] = userSchema.google.view.id;

            //Getting all specs
            var specifications = report.specifications[0];
            //Iterating over the specifications
            for (var specification in specifications) {
                //SpecificationObject holds each specification. It is an array.
                var specificationObject = specifications[specification];
                //Creating JSON Array for each specification
                requestBody[specification] = [];
                //Iterating over the properties of each specification
                for (var specificationProperty in specificationObject) {
                    //Pushing object properties to the equivalent array that was created b4
                    requestBody[specification].push(specificationObject[specificationProperty]);
                }
            }
            personalizeQuery(requestBody, userReport, function (err, personalizedQuery) {
                callback(null, personalizedQuery);
            })

        }).lean();
    }
}

//Personalizing the request body to the user's preferences
var personalizeQuery = function (requestBody, report, callback) {
    switch (report.reportId) {
        case "2":
            requestBody.metricFilterClauses[0].filters[0].comparisonValue = report.threshold.max.toString();
            requestBody.metricFilterClauses[0].filters[1].comparisonValue = report.threshold.min.toString();
            callback(null, requestBody);
            break;
        default:
            callback(null, requestBody);
    }
}