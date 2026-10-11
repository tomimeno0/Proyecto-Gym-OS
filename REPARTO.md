# Reparto de responsabilidades y preparación de la defensa

Este documento asigna bloques para implementar, revisar y explicar. La asignación no acredita por sí sola autoría del código. Cada integrante debe dejar registradas las revisiones y modificaciones que realmente haya realizado. El backend inicial de esta entrega fue preparado con asistencia de Codex.

Se consideran nueve integrantes. Se conserva «Gade Silva y Lápiz» como un solo nombre, según el listado recibido.

## Distribución

| Integrante         | Bloque asignado                         | Archivos principales                                                                              | Qué debe demostrar                                                        |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Gianluca Pizarro   | Servidor y configuración de ejecución   | `index.js`, `config/env.js`, `package.json`                                                       | Arrancar la API, explicar middleware y mostrar `/health`                  |
| Tomás Minossi      | Conexión y preparación de MySQL         | `config/db.js`, `config/init-db.js`, `config/setup.js`, `compose.yaml`                            | Preparar una base vacía y explicar las variables de conexión              |
| Iván Lerner        | Modelo de usuario y campos              | `models/Usuario.model.js`                                                                         | Explicar UUID, tipos, campos obligatorios y correo único                  |
| Paulo López        | Roles y relaciones                      | `models/Rol.model.js`, `models/UsuarioRol.model.js`, `models/index.js`                            | Explicar muchos a muchos y la asignación del rol Cliente                  |
| Gade Silva y Lápiz | Registro de usuarios                    | `controllers/register.controller.js`                                                              | Crear una cuenta y explicar la transacción usuario-rol                    |
| Valentín Schueld   | Protección de contraseñas y tokens      | `controllers/security.controller.js`                                                              | Explicar scrypt, sal, hash y comparación de contraseñas                   |
| Mateo Romani       | Inicio de sesión                        | `controllers/login.controller.js`                                                                 | Explicar credenciales válidas, errores y actualización de última conexión |
| Joaquín Casanou    | Persistencia y cierre de sesiones       | `models/Sesion.model.js`, `controllers/sessions.controller.js`                                    | Explicar cookie, vencimiento, acceso privado y logout                     |
| Simón Castellani   | Validaciones, rutas y demostración HTTP | `controllers/validation.controller.js`, `controllers/users.controller.js`, `routes/`, `README.md` | Demostrar JSON válido e inválido, registro duplicado y recorrido completo |

## Lo mínimo que todos deben comprender

El proyecto es una API en JavaScript. Express recibe solicitudes HTTP; las rutas eligen el controlador; los controladores validan los datos y trabajan con los modelos de Sequelize; MySQL conserva los registros. Registro crea la cuenta; login verifica la contraseña y abre una sesión; la cookie permite consultar `/users/me`; logout invalida la sesión.

Cada uno estudia su bloque y conoce las entradas y salidas del bloque anterior y siguiente. Todos deben poder ejecutar el proyecto y explicar el recorrido general.

## Preguntas para preparar cada bloque

### Gianluca Pizarro

- ¿Qué hace `express.json()` y por qué se ejecuta antes de las rutas?
- ¿Qué diferencia hay entre `npm run dev` y `npm start`?
- ¿Qué hace el manejador central de errores y qué códigos devuelve?

### Tomás Minossi

- ¿Cómo se conectan Express, Sequelize y MySQL?
- ¿Por qué `.env` no se sube a GitHub?
- ¿Qué crea `db:init` y por qué no se usa `sync({force:true})`?

### Iván Lerner

- ¿Qué representa cada campo del usuario?
- ¿Qué diferencias hay entre clave primaria, `allowNull:false` y `unique:true`?
- ¿Por qué se guarda `password_hash` y no la contraseña?

### Paulo López

- ¿Por qué hace falta la tabla `usuario_roles`?
- ¿Qué hacen las dos asociaciones `belongsToMany`?
- ¿Por qué el cliente no puede elegir su rol en el JSON de registro?

### Gade Silva y Lápiz

- ¿Qué pasos ejecuta el registro y en qué orden?
- ¿Qué ocurre si se registra dos veces el mismo correo?
- ¿Por qué usuario y rol se guardan en una transacción?

### Valentín Schueld

- ¿Qué diferencia hay entre hash y cifrado reversible?
- ¿Para qué sirve la sal aleatoria y por qué dos contraseñas iguales pueden tener hashes distintos?
- ¿Por qué un token aleatorio se guarda con SHA-256 y la contraseña utiliza scrypt?

### Mateo Romani

- ¿Cómo se comprueba una contraseña sin guardarla en texto plano?
- ¿Por qué correo inexistente y contraseña incorrecta reciben el mismo mensaje?
- ¿Qué guarda el login y qué se devuelve al usuario?

### Joaquín Casanou

- ¿Qué es una cookie HttpOnly y dónde se guarda la sesión?
- ¿Cómo se detecta que una sesión venció o que un usuario fue bloqueado?
- ¿Por qué borrar sólo la cookie no alcanza para cerrar una sesión en el servidor?

### Simón Castellani

- ¿Qué diferencia hay entre rutas, controladores y modelos?
- ¿Qué validaciones se aplican al correo, nombre y contraseña?
- ¿Cuándo devuelve la API `201`, `400`, `401`, `409` y `429`?

## Orden de exposición sugerido

1. Gianluca presenta el servidor y la estructura.
2. Tomás muestra MySQL y la configuración.
3. Iván explica el usuario.
4. Paulo explica roles y relaciones.
5. Gade recorre el registro.
6. Valentín explica la protección de credenciales.
7. Mateo recorre el login.
8. Joaquín explica sesión, consulta privada y cierre.
9. Simón realiza la demostración y recorre errores de validación.

## Revisión individual

Completar después de trabajar efectivamente sobre el bloque. Los commits deben usar la identidad real de quien realiza cada cambio.

| Integrante         | Revisión realizada | Cambio o comprobación realizada | Commit, si hubo cambios |
| ------------------ | ------------------ | ------------------------------- | ----------------------- |
| Gianluca Pizarro   | Pendiente          | —                               | —                       |
| Tomás Minossi      | Pendiente          | —                               | —                       |
| Iván Lerner        | Pendiente          | —                               | —                       |
| Paulo López        | Pendiente          | —                               | —                       |
| Gade Silva y Lápiz | Pendiente          | —                               | —                       |
| Valentín Schueld   | Pendiente          | —                               | —                       |
| Mateo Romani       | Pendiente          | —                               | —                       |
| Joaquín Casanou    | Pendiente          | —                               | —                       |
| Simón Castellani   | Pendiente          | —                               | —                       |
