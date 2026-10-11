const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });

function integer(name, fallback, min, max) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} debe ser un entero entre ${min} y ${max}.`);
  }
  return value;
}

if (!process.env.DB_PASSWORD) throw new Error('Falta DB_PASSWORD. Ejecutá npm run setup.');
const production = process.env.NODE_ENV === 'production';
const port = integer('PORT', 3001, 1, 65535);
const origin = process.env.APP_ORIGIN || `http://localhost:${port}`;
if (production && !origin.startsWith('https://')) throw new Error('Producción requiere HTTPS.');

module.exports = {
  production,
  port,
  origin,
  sessionHours: integer('SESSION_HOURS', 24, 1, 168),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: integer('DB_PORT', 3308, 1, 65535),
    name: process.env.DB_NAME || 'gym_os_registro',
    user: process.env.DB_USER || 'gymos_registro',
    password: process.env.DB_PASSWORD,
  },
};
