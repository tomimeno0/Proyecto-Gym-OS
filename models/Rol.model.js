const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Rol = sequelize.define('roles', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(255), allowNull: false },
});

module.exports = Rol;
