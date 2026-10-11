const { Op } = require('sequelize');
const env = require('../config/env');
const { Sesion, Usuario, Rol } = require('../models');
const { newToken, hashToken } = require('./security.controller');

const cookieName = 'gymos_registro_session';
const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: env.production, path: '/' };

async function createSession(usuarioId, transaction) {
  const token = newToken();
  await Sesion.create(
    {
      usuario_id: usuarioId,
      token_hash: hashToken(token),
      fecha_expiracion: new Date(Date.now() + env.sessionHours * 60 * 60 * 1000),
    },
    { transaction },
  );
  return token;
}

function setSessionCookie(res, token) {
  res.cookie(cookieName, token, { ...cookieOptions, maxAge: env.sessionHours * 60 * 60 * 1000 });
}

async function requireSession(req, res, next) {
  const token = req.cookies[cookieName];
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return res.status(401).json({ message: 'Iniciá sesión para continuar.' });
  }
  const session = await Sesion.findOne({
    where: { token_hash: hashToken(token), fecha_expiracion: { [Op.gt]: new Date() } },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Rol, as: 'roles' }],
      },
    ],
  });
  if (!session || session.usuario.estado !== 'activo') {
    res.clearCookie(cookieName, cookieOptions);
    return res.status(401).json({ message: 'La sesión no es válida o venció.' });
  }
  req.session = session;
  req.user = session.usuario;
  next();
}

async function logout(req, res) {
  await req.session.destroy();
  res.clearCookie(cookieName, cookieOptions);
  res.status(200).json({ message: 'Sesión cerrada.' });
}

module.exports = { createSession, setSessionCookie, requireSession, logout };
