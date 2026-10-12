# Reparto de responsabilidades y preparación de la defensa

Este documento asigna bloques para implementar, revisar y explicar. La asignación no acredita por sí sola autoría del código. Cada integrante debe dejar registradas las revisiones y modificaciones que realmente haya realizado. El backend inicial y la adaptación de la interfaz de esta entrega fueron preparados con asistencia de Codex.

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

Antes de preparar la exposición, cada integrante debe abrir su [guía individual](guias/README.md). Allí están las referencias a líneas del código, las funciones explicadas, ejemplos y respuestas a las preguntas de su bloque.

El proyecto combina una interfaz React y una API en JavaScript. Express recibe solicitudes HTTP; las rutas eligen el controlador; los controladores validan los datos y trabajan con los modelos de Sequelize; MySQL conserva los registros. Registro crea la cuenta; login verifica la contraseña y abre una sesión; la cookie permite consultar `/users/me`; logout invalida la sesión.

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

## Reparto actualizado con la pantalla de inicio

Las responsabilidades anteriores se mantienen. Estos archivos se suman al estudio y revisión; la explicación detallada está al final de cada guía individual.

| Integrante         | Archivos adicionales o conexión a estudiar                                               | Demostración                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Gianluca Pizarro   | `config/frontend.js`, `client/vite.config.js`, scripts en `package.json`                 | Compilar y servir React y API en el puerto 3001; abrir directamente `/login`                          |
| Tomás Minossi      | Workspaces en `package.json`, `client/package.json`, `.gitignore`                        | Distinguir instalación, compilación y creación de tablas; explicar que el frontend no contiene `.env` |
| Iván Lerner        | `client/src/pages/Account.jsx`, `publicUser`                                             | Relacionar campos de la cuenta con Usuario y explicar qué datos no se exponen                         |
| Paulo López        | `Account.jsx`, consultas de roles del login y la sesión                                  | Seguir el rol Cliente desde MySQL hasta la pantalla; no hay selector de rol                           |
| Gade Silva y Lápiz | `client/src/pages/Auth.jsx`: `field`, rama de registro de `submit`                       | Registrar y mostrar éxito, confirmación distinta y correo duplicado                                   |
| Valentín Schueld   | `client/src/lib.jsx`: `api`; formularios y cookie                                        | Explicar envío de credenciales, HttpOnly y ausencia de tokens en localStorage                         |
| Mateo Romani       | `Auth.jsx`: rama de login de `submit`, `Navigate`                                        | Contraseña incorrecta, login correcto y actualización del usuario compartido                          |
| Joaquín Casanou    | `lib.jsx`: `AuthProvider`, `refresh`; `Account.jsx`: logout                              | Recargar conservando sesión, salir y comprobar rechazo del acceso privado                             |
| Simón Castellani   | `client/src/main.jsx`, `App.jsx`, `pages/Landing.jsx`, `components/ui.jsx`, `styles.css` | Explicar componentes, rutas, botones y adaptación móvil de la portada original                        |

En la exposición, Simón presenta la portada al principio; después se sigue el orden del backend y se vuelve a los formularios para la demostración. Gianluca y Tomás explican cómo se ejecuta el conjunto. Cada responsable de registro, login o sesión recorre tanto su controlador como el tramo React que lo llama.
