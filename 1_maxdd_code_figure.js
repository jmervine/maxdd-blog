#!/usr/bin/env node
const maxZone = process.env.MAXCDN_ZONE;
const endpoint = 'reports/' + maxZone + '/stats.json/hourly';

// Initialize MaxCDN lib
const maxcdn  = require('maxcdn').create(
    process.env.MAXCDN_ALIAS,
    process.env.MAXCDN_KEY,
    process.env.MAXCDN_SECRET);

// Exec
maxcdn.get(endpoint, function(error, results) {
    var onError = function(error) {
        console.log('    ERROR: s', error.data);
        process.exit(error.statusCode);
    }

    if (error)
        return onError(error);

    console.dir(results.data);
});
