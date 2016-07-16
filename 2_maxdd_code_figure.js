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
        console.dir(results.data.stats.shift());

    // Request status from the last page of data
    maxcdn.get(endpoint + '?page=' + results.data.pages, function(error, results) {
        if (error)
            return onError(error);

        console.dir(results.data.stats.shift());
    });
});
