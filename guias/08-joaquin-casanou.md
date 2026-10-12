# Joaquín Casanou: sesiones, cookies y cierre de sesión

## Tu objetivo

Explicar cómo el servidor reconoce a quien ya inició sesión, cómo comprueba el vencimiento y cómo revoca ese acceso. Tu bloque tiene un modelo y cuatro funciones; tres de ellas participan directamente del recorrido login -> consulta privada -> logout.

## Archivos y mapa del código

| Ubicación                                                                             | Qué encontrás                      |
| ------------------------------------------------------------------------------------- | ---------------------------------- |
| [models/Sesion.model.js, líneas 4–14](../models/Sesion.model.js#L4-L14)               | Tabla, campos e índice             |
| [sessions.controller.js, líneas 1–7](../controllers/sessions.controller.js#L1-L7)     | Importaciones y opciones de cookie |
| [sessions.controller.js, líneas 9–20](../controllers/sessions.controller.js#L9-L20)   | `createSession`                    |
| [sessions.controller.js, líneas 22–24](../controllers/sessions.controller.js#L22-L24) | `setSessionCookie`                 |
| [sessions.controller.js, líneas 26–49](../controllers/sessions.controller.js#L26-L49) | `requireSession`                   |
| [sessions.controller.js, líneas 51–57](../controllers/sessions.controller.js#L51-L57) | `logout` y exportaciones           |
| [routes/users.routes.js, línea 6](../routes/users.routes.js#L6)                       | Protección de `/users/me`          |
| [routes/auth.routes.js, línea 18](../routes/auth.routes.js#L18)                       | Protección de logout               |

## Librerías y módulos

Sequelize provee los modelos, `findOne` y `Op.gt`, que expresa una comparación mayor que en SQL. `cookie-parser` se ejecuta en `index.js` y deja los valores en `req.cookies`. Express ofrece `res.cookie`, `res.clearCookie` y `next`.

De `security.controller` usás `newToken` y `hashToken`. De `env.js` recibís la duración y el indicador de producción. No se compara la contraseña en cada consulta privada: se verifica la sesión creada tras el login.

## Modelo Sesion

| Campo              | Función                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `id`               | UUID primario de esa sesión                                        |
| `usuario_id`       | Dueño de la sesión; se relaciona con usuarios                      |
| `token_hash`       | SHA-256 del token, único; permite buscarlo sin guardar el original |
| `fecha_creacion`   | Momento de creación, con default de Sequelize                      |
| `fecha_expiracion` | Momento después del cual deja de aceptarse                         |

El índice sobre `fecha_expiracion` facilita consultas por ese campo; no elimina automáticamente filas vencidas. La unicidad de `token_hash` también proporciona un índice. Las relaciones se declaran en `models/index.js`, con alias usuario.

## Opciones de cookie

La cookie se llama `gymos_registro_session`. `httpOnly:true` evita que scripts del navegador la lean mediante `document.cookie`; el navegador igual puede enviarla en HTTP. `sameSite:'strict'` restringe su envío desde otros sitios. `secure` se activa en producción para usar HTTPS. `path:'/'` permite enviarla a las rutas de esta API.

La cookie contiene el token original. En MySQL se guarda su hash. El cliente debe conservarla: curl lo hace con `-c` al guardarla y `-b` al enviarla; Postman puede administrarla automáticamente.

## Función `createSession(usuarioId,transaction)`

**Recibe:** UUID del usuario y transacción abierta por login. **Devuelve:** promesa con el token original.

Genera el token, guarda su hash y calcula vencimiento sumando `env.sessionHours` a la hora actual. Por defecto son 24 horas. Pasa la transacción al insert para que crear la sesión y actualizar la última conexión se confirmen juntos.

Esta función escribe en MySQL, pero no envía una cookie por sí misma.

## Función `setSessionCookie(res,token)`

**Recibe:** respuesta Express y token original. **Efecto:** agrega Set-Cookie a la respuesta. No hace consultas SQL.

Usa las opciones comunes y `maxAge` en milisegundos. La fecha guardada en MySQL y la duración de la cookie se calculan por separado con la misma configuración. La base sigue siendo la que decide si la sesión es aceptable en el servidor.

## Función `requireSession(req,res,next)`

Es middleware de autenticación. No devuelve el perfil; prepara la solicitud para el siguiente controlador:

1. Lee el token de `req.cookies`.
2. Rechaza si falta o si no coincide con el formato esperado de 43 caracteres base64url. Devuelve `401`.
3. Calcula el hash y busca una fila con ese hash y `fecha_expiracion > ahora`. `Op.gt` expresa esa condición.
4. Con `include` carga el usuario de la sesión y sus roles. `attributes.exclude` evita traer `password_hash` del usuario.
5. Si no existe sesión válida o el usuario no está activo, borra la cookie y responde `401`.
6. Si todo es válido, coloca la sesión en `req.session`, el usuario en `req.user` y ejecuta `next()`.

`req.user` no viene del JSON que mandó el cliente: se obtiene de la sesión localizada en la base. Un cliente no puede elegir otra cuenta simplemente enviando un UUID en el cuerpo.

Una sesión vencida puede seguir físicamente en la tabla, pero deja de autorizar consultas. La comprobación también consulta el estado actual del usuario, de modo que bloquearlo impide seguir usando su sesión.

## Función `logout(req,res)`

Requiere que `requireSession` ya haya preparado `req.session`. Elimina esa fila con `destroy`, borra la cookie con las mismas opciones de alcance y responde `200`.

Elimina únicamente la sesión presentada, no todas las sesiones del usuario. Si luego se reutiliza su token, la consulta devuelve `401` porque el hash ya no tiene una fila válida. Si se intenta cerrar una sesión inexistente o vencida, el middleware devuelve `401` antes de llegar a logout.

## Conexión con los demás

Mateo crea la sesión y envía la cookie. Paulo define asociaciones y alias. Simón coloca `requireSession` antes de `getMe` o logout. Gianluca ejecuta cookie-parser antes de las rutas. Valentín produce tokens y hashes.

## Práctica que tenés que poder hacer

Seguir login, `/users/me`, logout y una nueva consulta `/users/me` usando el archivo de cookies del README. Debe responder `200`, `200`, `200` y `401`. En la base, señalar el hash y la fecha de vencimiento; el token original no está almacenado en la tabla.

## Preguntas con respuesta

**¿Borrar la cookie alcanza para revocar una sesión?** No. Logout elimina también la fila para que una copia del token deje de servir.

**¿Vencer la cookie y vencer la sesión son lo mismo?** No. El navegador maneja la cookie; MySQL y el middleware controlan la validez de la sesión.

**¿Esto es JWT?** No. Es un token aleatorio consultado en una tabla.

**¿Consultar el perfil renueva la duración?** No. Este código no extiende el vencimiento en cada solicitud.

## Preparación para la exposición

Podés explicar: «Mi bloque crea sesiones persistentes, las verifica en cada ruta privada y elimina la sesión al salir». Estás listo cuando podés distinguir token, hash, cookie y fila de sesión, y señalar las cuatro funciones.

## Lo que se suma con la pantalla de inicio

Sumá [AuthProvider y refresh, líneas 36–66](../client/src/lib.jsx#L36-L66), [api y aviso de vencimiento](../client/src/lib.jsx#L25-L31) y [Account.jsx, líneas 6–67](../client/src/pages/Account.jsx#L6-L67). Tu backend de sesiones no cambió.

### `AuthProvider({children})`, `useAuth()` y `refresh()`

El proveedor guarda `user`, `loading` y `error`, y los comparte con sus descendientes mediante contexto React. `useAuth()` lee ese contexto; no consulta por sí solo MySQL.

`refresh()` no recibe argumentos. Marca carga, limpia el error y consulta `/users/me` mediante `api`. Si responde 200, guarda `data.usuario`. Si responde 401, deja `user` en null sin mostrar un fallo de infraestructura. Otros errores se muestran con opción de reintentar. El `finally` termina la carga. Se usa `useCallback` para conservar la referencia de esta función entre renders.

El efecto inicial llama `refresh` y registra `session-expired`. Su callback `expire` limpia el usuario visual cuando una consulta protegida devuelve 401. La limpieza del efecto elimina ese listener. En desarrollo React StrictMode puede ejecutar el efecto inicial más de una vez; esa consulta GET no crea sesiones.

### `Account()` y el callback de logout

Mientras se verifica la sesión, muestra carga; con error ofrece reintentar; sin usuario usa `Navigate` hacia login. Con usuario muestra campos públicos. Esto organiza la pantalla: la protección SQL/HTTP sigue en `requireSession`.

El botón usa `action.run` para impedir envíos repetidos. Su callback llama `api('/auth/logout', {})`, que hace POST. Si responde correctamente, limpia el usuario compartido y se vuelve al login. Si la sesión ya no existe y devuelve 401, también limpia el estado. Si hay un error de red o servidor, lo muestra y no afirma que haya cerrado la sesión. No se borra una cookie HttpOnly con JavaScript.

**Práctica:** entrar, recargar la dirección de cuenta y mostrar que sigue conectado; salir y consultar `/users/me`, que debe devolver 401. Abrir `/cuenta` sin sesión debe mostrar login. Explicar por separado persistencia en MySQL, cookie del navegador y estado React.

**Pregunta:** ¿React conoce inmediatamente el vencimiento aunque no se haga ninguna solicitud? **Respuesta:** no hay temporizador ni polling. El servidor lo comprueba en cada petición privada; la interfaz se actualiza al recargar o recibir un 401. No afirmar comprobación continua.
