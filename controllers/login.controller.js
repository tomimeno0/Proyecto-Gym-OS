const { sequelize } = require('../config/db');
const { Usuario } = require('../models');
const { loginSchema } = require('./validation.controller');
const { hashPassword, verifyPassword } = require('./security.controller');
const { createSession, setSessionCookie } = require('./sessions.controller');
const { publicUser } = require('./users.controller');

const dummyHash = hashPassword('cuenta-inexistente-comparacion');

async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const user = await Usuario.findOne({ where: { email: data.email } });
  const valid = await verifyPassword(data.password, user ? user.password_hash : await dummyHash);
  if (!user || !valid || user.estado !== 'activo') {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
  }
  const result = await sequelize.transaction(async (transaction) => {
    const current = await Usuario.findByPk(user.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!current || current.estado !== 'activo' || current.password_hash !== user.password_hash)
      return null;
    await current.update({ ultima_conexion: new Date() }, { transaction });
    current.roles = await current.getRoles({ transaction });
    const token = await createSession(current.id, transaction);
    return { token, user: current };
  });
  if (!result) return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
  setSessionCookie(res, result.token);
  res.status(200).json({ message: 'Sesión iniciada.', usuario: publicUser(result.user) });
}

module.exports = { login };
