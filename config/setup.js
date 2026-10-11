const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const target = path.join(__dirname, '../.env');
if (existsSync(target)) {
  console.log('.env ya existe. Se conserva la configuración.');
} else {
  const source = readFileSync(path.join(__dirname, '../.env.example'), 'utf8');
  const content = source
    .replace(/^DB_PASSWORD=$/m, `DB_PASSWORD=${randomBytes(24).toString('hex')}`)
    .replace(/^MYSQL_ROOT_PASSWORD=$/m, `MYSQL_ROOT_PASSWORD=${randomBytes(24).toString('hex')}`);
  writeFileSync(target, content, { mode: 0o600, flag: 'wx' });
  console.log('.env creado con contraseñas independientes.');
}
