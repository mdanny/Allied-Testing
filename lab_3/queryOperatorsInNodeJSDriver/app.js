var MongoClient = require('mongodb').MongoClient,
    express = require('express'),
    app = express(),
    engines = require('consolidate'),
    commandLineArgs = require('command-line-args'),
    assert = require('assert');


var options = commandLineOptions();

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

MongoClient.connect('mongodb://localhost:27017/crunchbase', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    app.get('/', function(req, res){

        var query = queryDocument(options);
        var projection = {"_id": 1, "name": 1, "founded_year": 1,
                      "number_of_employees": 1, "crunchbase_url": 1};

        db.collection('companies').find(query, projection).toArray(function(err, docs) {
            res.render('companies', { 'companies': docs } );
        });

    });

    app.use(function(req, res){
        res.sendStatus(404);
    });

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});


function queryDocument(options) {

    console.log(options);

    var query = {
        "founded_year": {
            "$gte": options.firstYear,
            "$lte": options.lastYear
        }
    };

    if ("employees" in options) {
        query.number_of_employees = { "$gte": options.employees };
    }

    return query;

}


function commandLineOptions() {

    var cli = commandLineArgs([
        { name: "firstYear", alias: "f", type: Number },
        { name: "lastYear", alias: "l", type: Number },
        { name: "employees", alias: "e", type: Number }
    ]);

    var options = cli.parse()
    if ( !(("firstYear" in options) && ("lastYear" in options))) {
        console.log(cli.getUsage({
            title: "Usage",
            description: "The first two options below are required. The rest are optional."
        }));
        process.exit();
    }

    return options;

}


