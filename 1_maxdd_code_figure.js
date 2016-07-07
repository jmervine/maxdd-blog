#!/usr/bin/env node
var async   = require('async');

// Initialize MaxCDN lib
var maxcdn  = require('maxcdn').create(
    process.env.MAXCDN_ALIAS,
    process.env.MAXCDN_KEY,
    process.env.MAXCDN_SECRET);

var maxZone = process.env.MAXCDN_ZONE;

// Fetch MaxCDN stats information
function maxcdnStats(callback) {
    // Set endpoint
    var endpoint = 'reports/' + maxZone + '/stats.json/hourly';

    // Submit request
    maxcdn.get(endpoint, function(error, results) {
        // Handle errors
        if (error) {
            console.log('    ERROR: s', error.data);
            process.exit(error.statusCode);
        }

        // Return last hour of data
        callback(undefined, results.data.stats.pop());
    });
}

async.parallel({
    stats:  maxcdnStats
}, function(err, results) {
    console.dir(results);
});

