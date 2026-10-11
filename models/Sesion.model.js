const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Sesion = sequelize.define(
  'sesiones',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    fecha_creacion: { type: DataTypes.DATE(3), allowNull: false, defaultValue: DataTypes.NOW },
    fecha_expiracion: { type: DataTypes.DATE(3), allowNull: false },
  },
  { indexes: [{ fields: ['fecha_expiracion'] }] },
);

module.exports = Sesion;
