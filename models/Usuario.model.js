const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Usuario = sequelize.define('usuarios', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false, defaultValue: '' },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  estado: { type: DataTypes.ENUM('activo', 'bloqueado'), allowNull: false, defaultValue: 'activo' },
  fecha_registro: { type: DataTypes.DATE(3), allowNull: false, defaultValue: DataTypes.NOW },
  ultima_conexion: { type: DataTypes.DATE(3), allowNull: true },
});

module.exports = Usuario;
