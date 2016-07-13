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

        // Return data
        callback(undefined, results.data.stats.shift());
    });
}

// Fetch MaxCDN status information
function maxcdnStatus(callback) {
    // Set endpoint
    var endpoint = 'reports/' + maxZone + '/statuscodes.json/daily';

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

