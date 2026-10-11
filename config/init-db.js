const { sequelize } = require('./db');
const { Rol } = require('../models');

async function initialize() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await Rol.findOrCreate({
      where: { nombre: 'Cliente' },
      defaults: { descripcion: 'Usuario registrado en GYM-OS.' },
    });
    console.log('Tablas y rol Cliente preparados.');
  } finally {
    await sequelize.close();
  }
}

initialize().catch(() => {
  console.error('No se pudo inicializar la base. Revisá MySQL y .env.');
  process.exitCode = 1;
});
