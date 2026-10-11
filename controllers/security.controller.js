const { scrypt: scryptCallback, randomBytes, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(scryptCallback);
const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64, options);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

async function verifyPassword(password, encoded) {
  const parts = String(encoded).split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const hash = await scrypt(password, parts[1], 64, options);
  const expected = Buffer.from(parts[2], 'hex');
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

function newToken() {
  return randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

module.exports = { hashPassword, verifyPassword, newToken, hashToken };
