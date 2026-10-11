const { Sequelize } = require('sequelize');
const { db } = require('./env');

const sequelize = new Sequelize(db.name, db.user, db.password, {
  host: db.host,
  port: db.port,
  dialect: 'mysql',
  logging: false,
  timezone: '+00:00',
  define: {
    timestamps: false,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: { min: 0, max: 5 },
});

module.exports = { sequelize };
