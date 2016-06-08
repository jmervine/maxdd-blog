var async   = require('async');

// MaxCDN Credentials
var maxAlias  = process.env.MAXCDN_ALIAS;
var maxKey    = process.env.MAXCDN_KEY;
var maxSecret = process.env.MAXCDN_SECRET;

// Initialize MaxCDN lib
var maxcdn  = require('maxcdn').create(maxAlias, maxKey, maxSecret);

// Fetch MaxCDN stats information
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

async.parallel({
  stats:  maxcdnStats
}, function(err, results) {
  console.dir(results);
});

