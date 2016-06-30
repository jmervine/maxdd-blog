#!/usr/bin/env node
var async   = require('async');

// Initialize MaxCDN lib
var maxcdn  = require('maxcdn').create(
    process.env.MAXCDN_ALIAS,
    process.env.MAXCDN_KEY,
    process.env.MAXCDN_SECRET);

// Fetch MaxCDN stats information
function maxcdnStats(callback) {
    // Set endpoint
    var endpoint = 'reports/stats.json/hourly';

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

// Fetch MaxCDN status information
function maxcdnStatus(callback) {
    // Set endpoint
    var endpoint = 'reports/statuscodes.json/hourly';

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

