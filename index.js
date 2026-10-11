const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { ZodError } = require('zod');
const env = require('./config/env');
const { sequelize } = require('./config/db');
require('./models');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');

const server = express();
server.disable('x-powered-by');
server.use(helmet());
server.use(express.json({ limit: '16kb' }));
server.use(cookieParser());
server.use((req, res, next) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.get('Origin') &&
    req.get('Origin') !== env.origin
  ) {
    return res.status(403).json({ message: 'Origen de solicitud no autorizado.' });
  }
  next();
});
server.get('/health', async (req, res) => {
  await sequelize.authenticate();
  res.status(200).json({ status: 'ok', database: 'mysql' });
});
server.use('/auth', authRoutes);
server.use('/users', usersRoutes);
server.use((req, res) => res.status(404).json({ message: 'Ruta inexistente.' }));
server.use((error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Revisá los datos ingresados.',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
  if (error.name === 'SequelizeUniqueConstraintError')
    return res.status(409).json({ message: 'El correo ya está registrado.' });
  if (error.type === 'entity.parse.failed')
    return res.status(400).json({ message: 'JSON inválido.' });
  if (error.type === 'entity.too.large')
    return res.status(413).json({ message: 'Solicitud demasiado grande.' });
  if (error.status === 503) return res.status(503).json({ message: error.message });
  console.error(`Error interno: ${error.name || 'Error'}`);
  res.status(500).json({ message: 'No se pudo completar la operación.' });
});

async function start() {
  await sequelize.authenticate();
  const listener = server.listen(env.port, '127.0.0.1', () =>
    console.log(`Proyecto Gym OS API: http://localhost:${env.port}`),
  );
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () =>
      listener.close(async () => {
        await sequelize.close();
        process.exit(0);
      }),
    );
  }
}

start().catch(() => {
  console.error('No se pudo iniciar. Revisá MySQL, .env y npm run db:init.');
  process.exitCode = 1;
});
