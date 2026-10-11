const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');
const { register } = require('../controllers/register.controller');
const { login } = require('../controllers/login.controller');
const { requireSession, logout } = require('../controllers/sessions.controller');

const routes = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Esperá 15 minutos.' },
});

routes.post('/register', authLimiter, register);
routes.post('/login', authLimiter, login);
routes.post('/logout', requireSession, logout);

module.exports = routes;
