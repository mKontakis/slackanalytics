var Report = require('./models/report');
var User = require('./models/user');


//Generates the body of the HTTP Request for google analytics API
exports.generateQuery = function (userSchema, callback) {
    var requestBody = {};
    var reportId = userSchema.reports[1].reportId;
    //Finding the report that the user signed up from the DB
    Report.findOne({'reportId': + reportId}, function (err, report) {
        if (err) {
            console.log(err);
        }
        //TODO: viewId must be fetched from users' schema
        //Adding viewId property to requestBody object
        requestBody["viewId"] = userSchema.google.view.id;

        //Getting all specs
        var specifications = report.specifications[0];
        //Iterating over the specifications
        for (var specification in specifications) {
            var specificationObject = specifications[specification];
            //Creating JSON Array for each specification
            requestBody[specification] = [];
            //Iterating over the properties of each specification
            for (var specificationProperty in specificationObject) {
                if (specificationObject[specificationProperty]) {
                    //Pushing object properties to the equivalent array that was created b4
                    requestBody[specification].push({expression: specificationProperty});
                }
            }
        }
        //console.log(JSON.stringify(requestBody));
        callback(null, requestBody);
    }).lean();
}