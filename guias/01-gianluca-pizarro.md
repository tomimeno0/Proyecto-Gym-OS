# Gianluca Pizarro: servidor, configuración y errores

## Tu objetivo

Poder abrir `index.js` y explicar cómo queda lista la API, por qué importa el orden de sus pasos y cómo se responde cuando algo falla. Tu bloque recibe la solicitud antes de que llegue al registro o login y envía los errores que esos controladores produzcan.

## Archivos y mapa del código

| Archivo y ubicación                                   | Qué encontrás                                        |
| ----------------------------------------------------- | ---------------------------------------------------- |
| [index.js, líneas 1–9](../index.js#L1-L9)             | Importaciones y carga de modelos/rutas               |
| [index.js, líneas 11–25](../index.js#L11-L25)         | Creación del servidor y middleware común             |
| [index.js, líneas 26–32](../index.js#L26-L32)         | Salud, montaje de rutas y respuesta 404              |
| [index.js, líneas 33–52](../index.js#L33-L52)         | Manejador central de errores                         |
| [index.js, líneas 54–72](../index.js#L54-L72)         | Función `start`, cierre del servidor y fallo inicial |
| [config/env.js, líneas 1–30](../config/env.js#L1-L30) | Lectura y validación de configuración                |
| [package.json](../package.json)                       | Dependencias, CommonJS y comandos npm                |

## Librerías y módulos que se usan

| Herramienta                | Para qué se usa acá                                                               |
| -------------------------- | --------------------------------------------------------------------------------- |
| `express`                  | Crear la API, registrar middleware y responder HTTP                               |
| `cookie-parser`            | Convertir la cabecera Cookie en `req.cookies`                                     |
| `helmet`                   | Agregar cabeceras de seguridad HTTP                                               |
| `zod`, mediante `ZodError` | Reconocer los errores de validación enviados por los controladores                |
| `dotenv`                   | Cargar la configuración de `.env` en `process.env`                                |
| `node:path`                | Construir la ruta al archivo `.env`                                               |
| `sequelize`                | Probar la conexión MySQL y cerrarla; la instancia se importa desde `config/db.js` |

`node:path` y `process` pertenecen a Node.js. Las otras librerías de la tabla se instalan con npm. `require('./models')` carga las definiciones y asociaciones, aunque no se asigne su resultado a una variable. No crea las tablas: eso lo hace el comando de inicialización de Tomás.

## Qué hace cada función y bloque

### Preparación de `server`

`express()` devuelve la aplicación. `disable('x-powered-by')` oculta esa cabecera. Los `use(...)` se ejecutan en el orden en que se registraron:

1. `helmet()` coloca cabeceras de protección.
2. `express.json({limit:'16kb'})` interpreta el cuerpo JSON y limita su tamaño. Después, los controladores pueden leer `req.body`.
3. `cookieParser()` prepara `req.cookies` para el bloque de sesiones.
4. El callback de control de origen revisa las solicitudes que modifican datos. Si traen `Origin` y es diferente de `env.origin`, devuelve `403`; en el resto llama `next()`.

El control de origen no verifica contraseñas ni decide quién está conectado. Las solicitudes sin cabecera Origin pueden pasar; la autenticación privada la realiza `requireSession`.

### Callback de `GET /health`

Recibe una solicitud sin pedir sesión, ejecuta `sequelize.authenticate()` y devuelve `200` con `{status:'ok', database:'mysql'}`. Sirve para comprobar que la API llega a MySQL. No comprueba que las cuatro tablas o el rol Cliente estén preparados.

### Montaje de rutas y respuesta 404

`server.use('/auth', authRoutes)` agrega el prefijo `/auth` a las rutas del archivo. Por eso `/login` termina siendo `/auth/login`. Lo mismo ocurre con `/users` y `/me`.

El callback que devuelve `404` está después de esas rutas. Sólo se alcanza si ninguna ruta anterior respondió.

### Callback central de errores

Tiene cuatro parámetros: `(error, req, res, next)`. Eso identifica un middleware de errores de Express. Esta entrega usa Express 5: los errores lanzados y las promesas rechazadas de los controladores async se encaminan hacia él.

| Caso detectado                                      | Respuesta                                       |
| --------------------------------------------------- | ----------------------------------------------- |
| `ZodError`                                          | `400`, con campo y descripción de cada problema |
| `SequelizeUniqueConstraintError`                    | `409`, correo ya registrado                     |
| JSON mal escrito                                    | `400`                                           |
| Cuerpo demasiado grande                             | `413`                                           |
| Error marcado como `503`, como falta de rol Cliente | `503`                                           |
| Otro fallo                                          | `500`, mensaje general                          |

Se registra el nombre del error interno, pero la respuesta general no entrega el stack ni las credenciales.

### `start()`

No recibe argumentos. Primero espera que MySQL responda y después escucha en `env.port`, ligado a `127.0.0.1`. Por defecto es el puerto 3001, accesible desde esta computadora. El callback de `listen` avisa por consola que arrancó.

También registra callbacks para `SIGINT` y `SIGTERM`: deja de aceptar conexiones nuevas y, cuando cierra el servidor HTTP, cierra Sequelize. `start().catch(...)` informa si falla el arranque y marca código de salida 1.

### `integer(name, fallback, min, max)` en `env.js`

Recibe el nombre de una variable, valor por defecto y límites. Lee la variable, la convierte a número y verifica que sea un entero dentro del rango. Devuelve el número o lanza un error. Se usa para puertos y duración de sesión.

El resto de `env.js` exige `DB_PASSWORD`, calcula `production`, exige HTTPS en producción y exporta la configuración que consumen los otros archivos.

## Cómo se conecta con los demás

Simón registra las rutas, Gade/Mateo atienden registro/login y Joaquín comprueba sesiones. Todos dependen de tu middleware JSON y del manejador de errores. Tomás provee la conexión usada por `start` y `/health`.

## Práctica que tenés que poder hacer

Con MySQL preparado, ejecutar `npm start` y consultar `GET http://localhost:3001/health`. Después solicitar `/inexistente` para mostrar el `404` y enviar JSON mal escrito a `/auth/login` para mostrar el `400`. En `package.json`, señalar que `dev` usa `node --watch` y `start` usa `node` sin recarga automática.

## Preguntas con respuesta

**¿Por qué JSON va antes de las rutas?** Porque el controlador necesita que el cuerpo ya esté convertido en `req.body`.

**¿Helmet hace el login?** No. Agrega cabeceras; las credenciales las verifica el controlador de login.

**¿La API arranca y crea la base automáticamente?** No. El arranque prueba conexión. Las tablas y el rol se preparan con `npm run db:init`.

**¿Qué diferencia hay entre 404 y 500?** El primero indica que la ruta no existe; el segundo, que una operación falló internamente.

## Preparación para la exposición

Podés explicar: «Mi bloque prepara Express, transforma el JSON, organiza las rutas, centraliza errores y arranca después de comprobar MySQL». Para defenderlo, señalá los bloques del mapa y mostrales una solicitud normal y una fallida.

Estás listo cuando podés ubicar `start`, el control de origen, el middleware JSON y el manejador de errores sin leer toda la guía.
