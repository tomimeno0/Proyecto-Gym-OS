const { sequelize } = require('../config/db');
const { Usuario, Rol, UsuarioRol } = require('../models');
const { registerSchema } = require('./validation.controller');
const { hashPassword } = require('./security.controller');
const { publicUser } = require('./users.controller');

async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const password_hash = await hashPassword(data.password);
  const user = await sequelize.transaction(async (transaction) => {
    const role = await Rol.findOne({ where: { nombre: 'Cliente' }, transaction });
    if (!role) {
      const error = new Error('Ejecutá npm run db:init antes de registrar usuarios.');
      error.status = 503;
      throw error;
    }
    const created = await Usuario.create(
      {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password_hash,
      },
      { transaction },
    );
    await UsuarioRol.create({ usuario_id: created.id, rol_id: role.id }, { transaction });
    created.roles = [role];
    return created;
  });
  res
    .status(201)
    .json({ message: 'Cuenta creada. Ya podés iniciar sesión.', usuario: publicUser(user) });
}

module.exports = { register };
