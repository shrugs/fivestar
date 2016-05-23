'use strict';

var api = require('./controllers/api');
var path = require('path');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/search', api.search);
  app.post('/api/search', api.search);


  // All undefined api routes should return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });

  app.get('/googlec6c01967525fe5d3.html', function(req, res) {
    res.status(200).sendfile('googlec6c01967525fe5d3.html');
  });

  if (app.get('env') === 'development') {
    // if we're in development, proxy all requests to webpack-dev-server
    app.all('*', function(req, res) {
      proxy.web(req, res, {
        target: 'http://localhost:3808'
      });
    });

    proxy.on('error', function(e) {
      console.log('Could not connect to proxy, please try again...');
    });
  } else {
    app.all('*', function(req, res) {
      res.sendfile(path.join(__dirname, '..', 'build', 'index.html'));
    });
  }
};