# Tomás Minossi: conexión MySQL y preparación del entorno

## Tu objetivo

Explicar cómo se pasa de descargar el repositorio a tener MySQL, sus cuatro tablas y el rol Cliente listos. Tenés que distinguir conexión, creación de tablas y datos iniciales: son operaciones distintas.

## Archivos y mapa del código

| Ubicación                                                       | Qué encontrás                                 |
| --------------------------------------------------------------- | --------------------------------------------- |
| [config/db.js, líneas 1–19](../config/db.js#L1-L19)             | Instancia compartida de Sequelize             |
| [config/init-db.js, líneas 4–16](../config/init-db.js#L4-L16)   | `initialize()`                                |
| [config/init-db.js, líneas 18–21](../config/init-db.js#L18-L21) | Tratamiento del fallo del comando             |
| [config/setup.js, líneas 1–14](../config/setup.js#L1-L14)       | Generación inicial de `.env`                  |
| [config/env.js](../config/env.js)                               | Variables que después consume la conexión     |
| [compose.yaml](../compose.yaml)                                 | Contenedor MySQL, puerto y volumen            |
| [config/schema.sql](../config/schema.sql)                       | Estructura SQL exportada de las cuatro tablas |
| [.env.example](../.env.example)                                 | Plantilla pública sin contraseñas             |

## Librerías y herramientas

`sequelize` es el ORM y administra la conexión y las consultas. `mysql2` es el driver que Sequelize utiliza para comunicarse con MySQL; por eso está en dependencias aunque no aparezca un `require('mysql2')` en `db.js`. `dotenv` carga las variables desde `.env` en `env.js`.

`node:fs`, `node:crypto` y `node:path` vienen con Node: permiten leer/escribir archivos, generar secretos aleatorios y localizar archivos. Docker Compose ejecuta MySQL 8.4 con la configuración de `compose.yaml`.

## Qué hace cada función y bloque

### `new Sequelize(...)` en `db.js`

Recibe nombre de base, usuario, contraseña y opciones. Crea una instancia que todos los modelos y controladores comparten mediante `require`. Construirla no crea una base ni implica que ya haya una conexión comprobada. La comprobación se hace con `authenticate()`.

| Opción                 | Qué significa en este proyecto                                             |
| ---------------------- | -------------------------------------------------------------------------- |
| `host` y `port`        | Dirección del servidor MySQL; por defecto 127.0.0.1:3308                   |
| `dialect:'mysql'`      | Selecciona el motor y su driver                                            |
| `logging:false`        | No imprime cada consulta SQL                                               |
| `timezone:'+00:00'`    | Configura Sequelize para trabajar con fechas en UTC                        |
| `timestamps:false`     | No agrega automáticamente `createdAt` y `updatedAt`; usamos fechas propias |
| `freezeTableName:true` | Conserva exactamente los nombres de tabla definidos                        |
| `charset` / `collate`  | Configuran texto UTF-8 y reglas de comparación                             |
| `pool:{min:0,max:5}`   | Reutiliza conexiones y limita su cantidad a cinco                          |

`module.exports = {sequelize}` permite que los modelos usen la misma conexión. Cambiar la contraseña en un modelo concreto no tendría sentido: se configura aquí a través de `env.js`.

### `initialize()` en `init-db.js`

No recibe argumentos. Se ejecuta con `npm run db:init`:

1. `authenticate()` comprueba acceso a la base configurada, que ya debe existir.
2. `sync()` crea las tablas que falten a partir de todos los modelos cargados por `require('../models')`.
3. `Rol.findOrCreate(...)` busca Cliente y sólo lo crea si falta. `defaults` contiene su descripción inicial.
4. `finally` cierra la conexión tanto si salió bien como si hubo un error.

El callback de `initialize().catch(...)` muestra un mensaje de fallo y deja `process.exitCode = 1`. No se inicia la API desde este archivo.

`sync()` se usa sin `force` y sin `alter`: repetir el comando conserva las tablas existentes y no adapta automáticamente sus columnas. Si en el futuro cambia un modelo, hará falta una migración del esquema. Tampoco duplica el rol Cliente al repetirlo.

### Bloque de `setup.js`

Es un script de preparación y no define una función propia. `existsSync(target)` evita reemplazar un `.env` ya creado. Si falta, lee `.env.example`, genera dos contraseñas independientes de 24 bytes aleatorios y las escribe como texto hexadecimal.

`writeFileSync(...,{mode:0o600,flag:'wx'})` pide permisos de lectura/escritura sólo al dueño en sistemas que los aplican y rechaza sobrescribir un archivo existente. Las contraseñas generadas se usan para MySQL; no son contraseñas de alumnos registrados.

### Bloques de `compose.yaml`

`image:mysql:8.4` elige el servidor. Las variables `MYSQL_DATABASE`, `MYSQL_USER` y las contraseñas preparan una base y un usuario al inicializar un volumen vacío. `ports` conecta el 3308 del host al 3306 dentro del contenedor; la API usa el puerto del host.

`registro-mysql` conserva datos aunque se reinicie el contenedor. El `healthcheck` ejecuta `mysqladmin ping` y permite a `up --wait` esperar hasta que responda. Cambiar las variables no reconfigura las credenciales de un volumen ya inicializado.

### `schema.sql`

Contiene `CREATE DATABASE`, `USE` y cuatro `CREATE TABLE IF NOT EXISTS`. Permite ver campos, claves e índices sin leer JavaScript. No incluye usuarios registrados, secretos ni filas del rol Cliente; para preparar ese rol también se ejecuta `db:init`.

Los UUID y algunas fechas por defecto se generan desde Sequelize. Si alguien inserta filas con SQL manual, debe aportar los valores obligatorios que no tengan un default SQL.

## Conexión con los demás

Iván define usuarios, Paulo roles/asociaciones y Joaquín sesiones. `initialize()` materializa esas definiciones en MySQL. Gade y Mateo utilizan tu instancia para las transacciones.

## Práctica que tenés que poder hacer

Seguir la instalación del README: `npm ci`, `npm run setup`, `docker compose up -d --wait mysql`, `npm run db:init`, `npm start`. Si usás MySQL propio, completar `.env` y preparar primero la base y el usuario.

En un gestor SQL sobre esta base de demostración, ejecutar `SHOW TABLES;` y `SELECT nombre FROM roles;`. Mostrar las cuatro tablas y Cliente. Ejecutar `db:init` otra vez y explicar por qué no se duplican tablas ni el rol.

## Preguntas con respuesta

**¿Sequelize es la base?** No: genera consultas y usa el driver; MySQL almacena los datos.

**¿Qué pasa si ejecutamos login antes de `db:init`?** Puede existir conexión, pero faltar las tablas. La comprobación de conexión no prepara el esquema.

**¿Por qué las contraseñas no van en `db.js`?** Porque dependen del entorno y deben quedar en `.env`, excluido del repositorio.

**¿Docker es obligatorio?** No. Se puede conectar a MySQL propio con las variables correctas.

## Preparación para la exposición

Podés explicar: «Mi bloque prepara el entorno, comparte una conexión Sequelize y crea las tablas y el rol inicial mediante un comando separado». Estás listo cuando podés señalar dónde se eligen el puerto, el dialecto, la contraseña y la persistencia del volumen.

## Lo que se suma con la pantalla de inicio

Tu bloque de base no cambió: siguen siendo cuatro tablas. Ahora también debés explicar cómo se instala el frontend sin mezclarlo con MySQL. Abrí [package.json](../package.json), [client/package.json](../client/package.json), [.gitignore](../.gitignore) y [config/frontend.js](../config/frontend.js).

### Tres operaciones que no se deben confundir

`npm ci`, ejecutado desde la raíz del repositorio, instala las dependencias exactas del lockfile e incluye el workspace `client`. React y React DOM ejecutan la interfaz; Vite y su plugin son herramientas de compilación. Express, Sequelize y mysql2 siguen ejecutándose en Node.

`npm run build` transforma JSX/CSS en archivos dentro de `client/dist`. No necesita conexión a MySQL, no ejecuta `sync`, no crea usuarios y no copia `.env` al navegador. `npm run db:init` hace lo contrario: prepara tablas y el rol Cliente, pero no construye ninguna pantalla. `npm start` compila mediante `prestart` y después arranca el servidor, que sí verifica la conexión con MySQL.

### Credenciales y archivos generados

`.env` continúa privado y `.gitignore` ahora también excluye `client/dist`. El código fuente de la interfaz y el lockfile se publican; el resultado compilado se vuelve a generar. El frontend llama direcciones relativas del mismo servidor, así que no recibe `DB_PASSWORD`, usuario SQL ni acceso directo a MySQL. No crear variables `VITE_*` con secretos: las variables de frontend pueden quedar incorporadas al JavaScript público.

**Práctica:** señalar qué paso instala dependencias, cuál genera archivos de navegador y cuál crea tablas. Mostrar los puertos: 3001 para pantalla/API, 3308 para MySQL local. No cambiar los puertos del proyecto completo.

**Pregunta:** ¿Borrar `client/dist` borra las cuentas? **Respuesta:** no; las cuentas están en MySQL y su volumen. La carpeta se reconstruye con `npm run build`. No hace falta eliminarla para la demostración.

**Qué tenés que poder explicar:** `initialize` y la conexión de tu guía original, más la separación navegador -> API -> base y la instalación del workspace.
