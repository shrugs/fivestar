'use strict';

var api = require('./controllers/api'),
    index = require('./controllers');

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

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);

  app.get('/googlec6c01967525fe5d3.html', function(req, res) {
    res.status(200).sendFile('googlec6c01967525fe5d3.html');
  });

  app.get('/*', index.index);
};