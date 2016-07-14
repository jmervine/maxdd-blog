#!/usr/bin/env node
const maxZone = process.env.MAXCDN_ZONE;
const endpoint = 'reports/' + maxZone + '/stats.json/hourly';

// Initialize MaxCDN lib
const maxcdn  = require('maxcdn').create(
    process.env.MAXCDN_ALIAS,
    process.env.MAXCDN_KEY,
    process.env.MAXCDN_SECRET);

// Initialize Datadog lib
const datadog = require("dogapi");

datadog.initialize({
    api_key: process.env.DATADOG_API_KEY,
    app_key: process.env.DATADOG_APP_KEY
});

// Helper to format the metrics result set from MaxCDN for sending to Datadog
function formatMetrics(results) {
    var now = parseInt(new Date().getTime() / 1000);

    // Convert strings to integers
    bytes    = parseInt(results.size, 10);
    requests = parseInt(results.hit, 10);
    hits     = parseInt(results.cache_hit, 10);
    misses   = parseInt(results.noncache_hit, 10);

    // Calculate cache hit percentage
    hitPercent = hits / requests * 100;

    // Ensure cache hit percentage is valid
    if (hitPercent === NaN) {
        hitPercent = 0;
    }

    // Return formatted metrics data
    return [
        { metric: "maxcdn.bytes",       points: [[ now, bytes ]]},
        { metric: "maxcdn.requests" ,   points: [[ now, requests ]]},
        { metric: "maxcdn.hits" ,       points: [[ now, hits ]]},
        { metric: "maxcdn.misses",      points: [[ now, misses ]]},
        { metric: "maxcdn.hit_percent", points: [[ now, hitPercent ]]}
    ];
}

// Exec
maxcdn.get(endpoint, function(error, results) {
    var onError = function(error) {
        console.log('    ERROR: s', error.data);
        process.exit(error.statusCode);
    }

    if (error)
        return onError(error);

    // Handle pagination
    if (results.data.page === results.data.pages)
        return console.log(JSON.stringify(formatMetrics(results.data.stats.shift()), null, 2));

    // Request status from the last page of data
    maxcdn.get(endpoint + '?page=' + results.data.pages, function(error, results) {
        if (error)
            return onError(error);

        return console.log(JSON.stringify(formatMetrics(results.data.stats.shift()), null, 2));
    });
});
