// ... below MaxCDN init

// Initialize Datadog lib
var datadog = require("dogapi").initialize({
    api_key: process.env.DATADOG_API_KEY,
    app_key: process.env.DATADOG_APP_KEY
});

// ...