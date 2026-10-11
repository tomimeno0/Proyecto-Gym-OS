# Proyecto Gym OS

Entrega parcial del backend: registro de usuarios, inicio de sesión y base de datos de autenticación. JavaScript, Express, Sequelize y MySQL. Sin frontend.

## Instalación

Requisitos: Node.js 22.12 o superior, npm y MySQL 8.4. Docker Compose permite ejecutar la base incluida.

```sh
npm ci
npm run setup
docker compose up -d --wait mysql
npm run db:init
npm run dev
```

Si Docker Compose está instalado como comando independiente, reemplazar `docker compose` por `docker-compose`. Con una instalación propia de MySQL, crear una base vacía llamada `gym_os_registro`, otorgar acceso a un usuario exclusivo y completar `DB_*` en `.env`. No hace falta Docker en ese caso.

La API escucha en `http://localhost:3001` y Docker publica MySQL en `127.0.0.1:3308`. `npm run setup` genera las contraseñas privadas sin reemplazar una configuración existente. No publicar `.env`.

`npm run db:init` crea las tablas faltantes y el rol Cliente. No borra datos ni modifica automáticamente tablas existentes. Para posteriores cambios de esquema hacen falta migraciones explícitas. `npm start` ejecuta la API sin recarga automática.

## Estructura

Se sigue la organización de REPASO COMPLETO: CommonJS (`require` / `module.exports`), servidor principal en `index.js`, conexión en `config/db.js`, modelos por entidad y rutas separadas de controladores.

```text
index.js
config/
  db.js
  env.js
  init-db.js
  setup.js
  schema.sql
controllers/
  register.controller.js
  login.controller.js
  users.controller.js
  sessions.controller.js
  security.controller.js
  validation.controller.js
models/
  Usuario.model.js
  Rol.model.js
  UsuarioRol.model.js
  Sesion.model.js
  index.js
routes/
  auth.routes.js
  users.routes.js
```

## API

Todas las solicitudes y respuestas usan JSON. Los correos se normalizan a minúsculas y se recortan espacios. Las contraseñas de registro tienen entre 10 y 128 caracteres; nombre entre 2 y 100. El apellido es opcional. Los campos desconocidos se rechazan.

| Método | Ruta             | Resultado                               |
| ------ | ---------------- | --------------------------------------- |
| GET    | `/health`        | Confirma conexión con MySQL             |
| POST   | `/auth/register` | Crea usuario y asigna el rol Cliente    |
| POST   | `/auth/login`    | Verifica credenciales y crea una sesión |
| GET    | `/users/me`      | Devuelve el usuario conectado           |
| POST   | `/auth/logout`   | Elimina la sesión y borra la cookie     |

### Registrar una cuenta

```sh
curl -i http://localhost:3001/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Ejemplo","apellido":"Demo","email":"ejemplo@example.com","password":"ClaveEjemplo-2026"}'
```

Devuelve `201`. Un correo duplicado devuelve `409`; datos inválidos, `400`. Después del registro se inicia sesión mediante el endpoint siguiente.

### Iniciar sesión

```sh
curl -i -c /tmp/gymos-cookies.txt http://localhost:3001/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ejemplo@example.com","password":"ClaveEjemplo-2026"}'
```

Devuelve `200` y una cookie HttpOnly; una contraseña incorrecta, usuario inexistente o bloqueado devuelve `401`. La respuesta nunca contiene el hash de la contraseña ni el token de sesión.

### Consultar el usuario conectado y cerrar sesión

```sh
curl -i -b /tmp/gymos-cookies.txt http://localhost:3001/users/me
curl -i -b /tmp/gymos-cookies.txt -c /tmp/gymos-cookies.txt -X POST http://localhost:3001/auth/logout
curl -i -b /tmp/gymos-cookies.txt http://localhost:3001/users/me
```

La última consulta devuelve `401`. Postman también permite ejecutar estas solicitudes y conservar la cookie automáticamente.

## Base de datos

El SQL de referencia está en [config/schema.sql](config/schema.sql). La preparación recomendada es `npm run db:init` para crear también el rol inicial.

| Tabla           | Contenido                                                                 | Relación                                       |
| --------------- | ------------------------------------------------------------------------- | ---------------------------------------------- |
| `usuarios`      | UUID, nombre, apellido, correo único, hash de contraseña, estado y fechas | Un usuario puede tener varios roles y sesiones |
| `roles`         | UUID, nombre único y descripción                                          | Incluye el rol Cliente                         |
| `usuario_roles` | Usuario, rol y fecha de asignación                                        | Tabla intermedia de muchos a muchos            |
| `sesiones`      | UUID, usuario, hash del token y vencimiento                               | Cada sesión pertenece a un usuario             |

Registro y asignación del rol se guardan en una transacción: si falla una operación, no queda un usuario incompleto. El login actualiza la última conexión y crea la sesión dentro de otra transacción.

Las contraseñas se protegen con scrypt y una sal aleatoria por usuario. Las sesiones usan tokens aleatorios y guardan solamente su hash SHA-256. Vencen a las 24 horas por defecto, configurables con `SESSION_HOURS`. Las consultas privadas comprueban vencimiento y estado del usuario en cada solicitud. Registro y login tienen límite de intentos. Las solicitudes de navegador con un origen distinto al configurado se rechazan.

## Equipo y defensa

El reparto de responsabilidades, archivos y preguntas está en [REPARTO.md](REPARTO.md). Cada integrante debe revisar, ejecutar y comprender su bloque, y registrar sus modificaciones reales.

Las [guías individuales de estudio](guias/README.md) explican el interior de los archivos: librerías, ubicación de los bloques, entradas y salidas de cada función, operaciones sobre la base, errores y prácticas para la defensa. Hay una guía para cada uno de los nueve integrantes.
