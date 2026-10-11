const { Router } = require('express');
const { requireSession } = require('../controllers/sessions.controller');
const { getMe } = require('../controllers/users.controller');

const routes = Router();
routes.get('/me', requireSession, getMe);

module.exports = routes;
