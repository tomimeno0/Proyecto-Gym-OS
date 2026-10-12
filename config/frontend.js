const path = require('node:path');
const express = require('express');

function setupFrontend(server) {
  const directory = path.join(__dirname, '..', 'client', 'dist');
  server.use(
    '/assets',
    express.static(path.join(directory, 'assets'), { maxAge: '1y', immutable: true }),
  );
  server.get(['/', '/nosotros', '/login', '/registro', '/cuenta'], (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile('index.html', { root: directory });
  });
}

module.exports = setupFrontend;
