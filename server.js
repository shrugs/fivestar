'use strict';

var express = require('express');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

var app = express();

if (app.get('env') === 'development') {
  require('dotenv').config();
}

// Redirect to HTTPS
app.use(function (req, res, next) {
  // Insecure request?
  if (req.get('x-forwarded-proto') === 'http') {
    // Redirect to https://
    return res.redirect('https://' + req.get('host') + req.url);
  }

  next();
});

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

// Start server
app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
