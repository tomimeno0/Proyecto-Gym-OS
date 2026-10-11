const Usuario = require('./Usuario.model');
const Rol = require('./Rol.model');
const UsuarioRol = require('./UsuarioRol.model');
const Sesion = require('./Sesion.model');

Usuario.belongsToMany(Rol, {
  through: UsuarioRol,
  foreignKey: 'usuario_id',
  otherKey: 'rol_id',
  as: 'roles',
});
Rol.belongsToMany(Usuario, {
  through: UsuarioRol,
  foreignKey: 'rol_id',
  otherKey: 'usuario_id',
  as: 'usuarios',
});
Usuario.hasMany(Sesion, { foreignKey: 'usuario_id', as: 'sesiones', onDelete: 'CASCADE' });
Sesion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario', onDelete: 'CASCADE' });

module.exports = { Usuario, Rol, UsuarioRol, Sesion };
