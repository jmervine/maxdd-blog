var async   = require('async');

// Initialize MaxCDN lib
var maxcdn  = require('maxcdn').create(
    process.env.MAXCDN_ALIAS,
    process.env.MAXCDN_KEY,
    process.env.MAXCDN_SECRET);

// Initialize Datadog lib
var datadog = require("dogapi").initialize({
    api_key: process.env.DATADOG_API_KEY,
    app_key: process.env.DATADOG_APP_KEY
});

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

        // Return data
        callback(undefined, results.data.summary);
    });
}

// Fetch MaxCDN status information
function maxcdnStatus(callback) {
    // Set endpoint
    var endpoint = 'reports/statuscodes.json/daily';

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
    // Convert strings to integers
    cacheSize = parseInt(results.stats.size, 10);
    cacheHit  = parseInt(results.stats.cache_hit, 10);
    cacheMiss = parseInt(results.stats.noncache_hit, 10);

    // Calculate cache hit percentage
    cacheHitPercent = ((cacheHit / cacheMiss) * 100.0);

    // Ensure cache hit percentage is valid
    if (cacheHitPercent === NaN) {
        cacheHitPercent = 0;
    }

    // Generate initial metrics payload with basic stats information
    var metrics = [
        { metric: "maxcdn.cache_bites",       points: cacheSize },
        { metric: "maxcdn.cache_hits" ,       points: cacheHit },
        { metric: "maxcdn.cache_misses",      points: cacheMiss },
        { metric: "maxcdn.cache_hit_percent", points: cacheHitPercent }
    ];

    // Insert status code metrics in to metrics payload
    [ "2", "3", "4", "5" ].forEach(function(n) {
        var name = "maxcdn." + n + "xx_count";
        var dataset = { metric: name, points: 0 };

        // Group similar status codes in to dataset defined above
        results.status.forEach(function(status) {
            if (status.status_code.startsWith(n)) {
                dataset.points += parseInt(status.hit, 10);
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
    console.dir(metrics);
});
