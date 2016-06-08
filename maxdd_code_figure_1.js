var maxAlias  = process.env.MAXCDN_ALIAS;
var maxKey    = process.env.MAXCDN_KEY;
var maxSecret = process.env.MAXCDN_SECRET;

var async   = require('async');
var MaxCDN  = require('maxcdn');

function maxcdnStats(callback) {
    var endpoint = 'reports/stats.json/hourly';
    console.log('==> Fetching maxcdn stats payload from:', endpoint);
    maxcdn.get(endpoint, function(error, results) {
        if (error) {
            console.log('    ERROR: s', error.data);
            process.exit(error.statusCode);
        }

        callback(undefined, results.data.summary);
    });
}

async.parallel({
  status: maxcdnStats
}, function(err, results) {
  console.dir(results.stats.data);
});
