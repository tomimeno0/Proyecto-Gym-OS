const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UsuarioRol = sequelize.define('usuario_roles', {
  usuario_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  rol_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  fecha_asignacion: { type: DataTypes.DATE(3), allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = UsuarioRol;
