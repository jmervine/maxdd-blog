var maxAlias  = process.env.MAXCDN_ALIAS;
var maxKey    = process.env.MAXCDN_KEY;
var maxSecret = process.env.MAXCDN_SECRET;

var async   = require('async');
var maxcdn  = require('maxcdn').create(maxAlias, maxKey, maxSecret);

function maxcdnStats(callback) {
    // Set endpoint
    var endpoint = 'reports/stats.json/hourly';

    // Log request
    console.log('==> Fetching maxcdn stats payload from:', endpoint);

    // Submit request
    maxcdn.get(endpoint, function(error, results) {
        // Handle errors
        if (error) {
            console.log('    ERROR: s', error.data);
            process.exit(error.statusCode);
        }

        // Return data
        callback(undefined, results.data.summary);
    });
}

function maxcdnStatus(callback) {
    // Set endpoint
    var endpoint = 'reports/statuscodes.json/daily';

    // Log request
    console.log('==> Fetching maxcdn status codes payload from:', endpoint);

    // Submit request
    maxcdn.get(endpoint, function(error, results) {
        // Handle errors
        if (error) {
            console.log('    ERROR: s', error.data);
            process.exit(error.statusCode);
        }

        // Retrun data
        callback(undefined, results.data.statuscodes);
    });
}

async.parallel({
  stats:  maxcdnStats,
  status: maxcdnStatus
}, function(err, results) {
  console.dir(results);
});