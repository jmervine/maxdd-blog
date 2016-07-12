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
        callback(undefined, results.data.stats.pop());
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

// Helper to format the metrics result set from MaxCDN for sending to Datadog
function formatMetrics(results) {
    var now = parseInt(new Date().getTime() / 1000);

    // Convert strings to integers
    bytes    = parseInt(results.stats.size, 10);
    requests = parseInt(results.stats.hit, 10);
    hits     = parseInt(results.stats.cache_hit, 10);
    misses   = parseInt(results.stats.noncache_hit, 10);

    // Calculate cache hit percentage
    hitPercent = hits / requests * 100;

    // Ensure cache hit percentage is valid
    if (hitPercent === NaN) {
        hitPercent = 0;
    }

    // Generate initial metrics payload with basic stats information
    var metrics = [
        { metric: "maxcdn.bytes",       points: [[ now, bytes ]]},
        { metric: "maxcdn.requests" ,   points: [[ now, requests ]]},
        { metric: "maxcdn.hits" ,       points: [[ now, hits ]]},
        { metric: "maxcdn.misses",      points: [[ now, misses ]]},
        { metric: "maxcdn.hit_percent", points: [[ now, hitPercent ]]}
    ];

    // Insert status code metrics in to metrics payload
    [ "2", "3", "4", "5" ].forEach(function(n) {
        var name = "maxcdn." + n + "xx_count";
        var dataset = { metric: name, points: [[ now, 0 ]] };

        // Group similar status codes in to dataset defined above
        results.status.forEach(function(status) {
            if (status.status_code.startsWith(n)) {
                dataset.points[0][1] += parseInt(status.hit, 10);
            }
        });

        // Add dataset to metrics payload
        metrics.push(dataset);
    });

    // Return metrics data
    return metrics;
}

async.parallel({
    stats:  maxcdnStats,
    status: maxcdnStatus
}, function(err, results) {
    var metrics = formatMetrics(results);

    // Initialize Datadog lib
    var datadog = require("dogapi");

    datadog.initialize({
        api_key: process.env.DATADOG_API_KEY,
        app_key: process.env.DATADOG_APP_KEY
    });

    datadog.metric.send_all(metrics, function(err, data, code) {
        // Log and abort on error
        if (err) {
            console.log("ERROR:", err);
            process.exit(1);
        }

        console.dir(data);

        // Log and abort on bad status code
        if (code > 299) {
            console.log("ERROR: Invalid response code (%s) from datadog!", code);
            process.exit(1);
        }
    });
});
