'use strict';

var express = require('express'),
    path = require('path'),
    config = require('./config');

/**
 * Express configuration
 */
module.exports = function(app) {
  if (app.get('env') === 'development') {
    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });
  }

  if (app.get('env') === 'production') {
    // app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));

  }

  // serve the build folder (html/js)
  app.use(express.static(path.join(config.root, 'build')));
  // serve the public folder
  app.use(express.static(path.join(config.root, 'lib', 'public')));


  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  // Router (only error handlers should come after this)
  app.use(app.router);

  // Error handler
  if (app.get('env') === 'development') {
    app.use(express.errorHandler());
  }
};