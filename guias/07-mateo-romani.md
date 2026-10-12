# Mateo Romani: inicio de sesión

## Tu objetivo

Explicar `login(req,res)` y diferenciar una contraseña correcta de una sesión válida. Tu bloque comprueba las credenciales, actualiza la cuenta y coordina la creación de una sesión persistente antes de enviar la cookie.

## Archivos y mapa del código

| Ubicación                                                                           | Qué encontrás                                   |
| ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| [login.controller.js, líneas 1–6](../controllers/login.controller.js#L1-L6)         | Módulos que usa login                           |
| [login.controller.js, línea 8](../controllers/login.controller.js#L8)               | `dummyHash`, preparado al cargar el módulo      |
| [login.controller.js, líneas 10–16](../controllers/login.controller.js#L10-L16)     | Validación, búsqueda y comprobación inicial     |
| [login.controller.js, líneas 17–25](../controllers/login.controller.js#L17-L25)     | Callback de transacción y segunda comprobación  |
| [login.controller.js, líneas 26–31](../controllers/login.controller.js#L26-L31)     | Respuesta fallida o cookie y respuesta pública  |
| [routes/auth.routes.js, línea 17](../routes/auth.routes.js#L17)                     | Enlace de `POST /auth/login` con tu controlador |
| [sessions.controller.js, líneas 9–24](../controllers/sessions.controller.js#L9-L24) | Funciones que crean sesión y envían cookie      |

## Librerías y módulos que utiliza

Express entrega `req`/`res`. Zod valida el JSON mediante `loginSchema`. Sequelize ofrece consultas, transacción y bloqueo de fila. El bloque de seguridad usa `node:crypto` para comparar contraseñas. Las funciones de sesión y `publicUser` son módulos propios.

No hay JWT: la cookie transporta un token aleatorio y MySQL conserva el hash asociado al usuario.

## Contrato de `login(req,res)`

**Recibe:** email y password en el cuerpo de `POST /auth/login`.

**Consulta:** usuario por email, contraseña guardada, estado y roles.

**Modifica:** `ultima_conexion` del usuario y una nueva fila en `sesiones`, si todo es válido.

**Responde:** `200`, cookie y usuario público; o `401` si fallan credenciales/estado. Los datos inválidos generan `400` y el limitador puede impedir llegar al controlador con `429`.

## Qué hace cada bloque

### `dummyHash` al cargar el archivo

`hashPassword(...)` es async y devuelve una promesa. Se inicia una vez al cargar el módulo y se conserva. Es un hash de una contraseña ficticia, no una cuenta ni un acceso alternativo.

Cuando no existe el usuario, `verifyPassword` recibe ese hash en lugar de saltarse scrypt. Esto reduce una diferencia de trabajo evidente entre correo conocido y desconocido. No garantiza que todas las solicitudes tarden exactamente lo mismo.

### Validar y buscar: líneas 11–12

`loginSchema.parse(req.body)` exige email válido y password de 1 a 128 caracteres. El email se normaliza. El mínimo es distinto del registro: login comprueba una credencial; no crea una nueva contraseña. Si falta un campo o aparece uno desconocido, se responde `400` desde el manejo central de errores.

`Usuario.findOne({where:{email:data.email}})` trae una instancia o NULL. La búsqueda usa un campo único y no devuelve una lista de personas.

### Comprobar contraseña y estado: líneas 13–16

`verifyPassword` devuelve si la contraseña coincide con el hash. La condición exige que exista usuario, que la comparación sea válida y que el estado sea activo. Las tres causas de rechazo comparten `401` y el mensaje «Correo o contraseña incorrectos».

No se anuncia que un correo existe ni que fue bloqueado. Si se rechaza aquí, no se crea una sesión.

### Callback de transacción: líneas 17–25

Recibe `transaction`. Vuelve a buscar al usuario por UUID con `findByPk` y `lock:transaction.LOCK.UPDATE`: MySQL bloquea esa fila mientras dura la transacción para coordinar escrituras concurrentes.

Se comprueba de nuevo existencia, estado y hash de contraseña. Entre la primera lectura y esta segunda puede haber un cambio. Si ya no coincide, se devuelve NULL sin crear la sesión. Es un resultado rechazado que el bloque siguiente transforma en `401`.

Si la cuenta sigue válida:

1. `current.update` guarda la fecha del login exitoso.
2. `current.getRoles` trae los roles usando la asociación de Paulo.
3. `createSession(current.id,transaction)` genera un token y guarda su hash y vencimiento.
4. Se devuelve `{token,user:current}` como resultado interno.

Si una escritura falla y lanza un error, Sequelize revierte las escrituras de la transacción. El trabajo de scrypt ya se hizo antes de tomar el bloqueo de fila.

### Cookie y respuesta: líneas 26–28

Si la transacción devolvió NULL, responde `401`. En caso exitoso se ejecuta `setSessionCookie`, después de que terminó la transacción. Así se evita entregar al cliente un token antes de confirmar su sesión en MySQL.

`publicUser` omite datos sensibles. El token se envía en la cabecera Set-Cookie; no aparece en el JSON. La respuesta JSON contiene mensaje y usuario con nombres de roles.

## Ejemplo que tenés que poder seguir

Ana se registró con `ana@example.com`. Envía ese correo y su contraseña. Login busca la fila, verifica el hash, actualiza última conexión y crea una sesión. El cliente conserva la cookie y la manda a `/users/me`.

Si vuelve a iniciar sesión, se crea otra fila de sesión. Este código admite varias sesiones por usuario; no invalida las anteriores automáticamente. Si escribe mal la contraseña, no se crea una nueva fila.

## Conexión con los demás

Gade crea la cuenta, Iván define sus campos, Valentín verifica la contraseña, Paulo habilita `getRoles`, Joaquín crea la sesión y la cookie, y Simón selecciona los campos públicos. Gianluca maneja los errores no respondidos dentro del login.

## Práctica y preguntas para defenderlo

Usá el ejemplo de login del README guardando cookies con `curl -c`. Mostrá `200`, Set-Cookie y luego `/users/me`. Repetí con contraseña errónea y con correo inexistente: deben devolver `401` y el mismo mensaje.

**¿Registro y login son lo mismo?** No. Registro crea la cuenta; login verifica una cuenta y abre una sesión.

**¿Por qué volver a consultar dentro de la transacción?** Para comprobar que la cuenta no cambió antes de crear la sesión y coordinar la escritura bajo bloqueo.

**¿`dummyHash` permite ingresar sin cuenta?** No. Aunque coincida una comparación, la condición también exige que `user` exista y esté activo.

**¿`getRoles` está escrito en este archivo?** No. Lo genera Sequelize por la asociación `belongsToMany` con alias roles.

## Preparación para la exposición

Podés explicar: «Mi bloque comprueba credenciales y estado, confirma los cambios del login en MySQL y recién después envía la cookie». Estás listo cuando podés ubicar las dos lecturas del usuario, la transacción y el momento exacto en que se entrega la cookie.

## Lo que se suma con la pantalla de inicio

Tu explicación ahora comienza en [Auth.jsx, líneas 8–63](../client/src/pages/Auth.jsx#L8-L63) y termina en [Account.jsx](../client/src/pages/Account.jsx). Estudiá la rama `mode === 'login'` y su relación con tu controlador; Gade cubre el registro.

### `Auth({mode})`, `field` y la rama de login de `submit`

React guarda email y password en estado. `field(key)` conecta cada input con ese estado. El componente espera a que se compruebe la sesión actual; si ya hay usuario, `Navigate` redirige a `/cuenta`. Esto evita mostrar un formulario innecesario, pero no concede permisos en el backend.

`submit(e)` evita la recarga del navegador y ejecuta una operación con `action.run`. En login envía solamente `{email, password}` a `/auth/login`. `api` hace el POST y convierte un código fallido en error. El formulario muestra el error sin navegar ni fingir que hay una sesión.

Cuando tu controlador responde 200, el navegador recibe la cookie y React recibe `data.usuario`. `setUser(data.usuario)` actualiza el contexto compartido; al volver a renderizar, `Navigate` lleva a la cuenta. Se limpia la contraseña del estado. El frontend no guarda el token, no verifica scrypt y no decide si la contraseña es correcta.

### Errores y estados que tenés que distinguir

`loading` significa que se está recuperando la sesión anterior. `action.busy` significa que se está procesando el envío del formulario. Un fallo de conexión al recuperar la sesión muestra Reintentar; el 401 de `/users/me` significa simplemente que no hay sesión. Un 401 del login muestra el mensaje de credenciales incorrectas. La confirmación de contraseña sólo existe en registro.

El servidor devuelve la propiedad `usuario`, no `user`; adaptar ese nombre fue necesario al reutilizar la interfaz. El controlador conserva la comparación segura, el bloqueo de fila, la actualización de fecha y la creación de sesión que explicaste antes.

**Práctica:** intentar una contraseña incorrecta y comprobar que se permanece en login; después ingresar correctamente, ver nombre/rol y recargar. Señalar dónde se crea la cookie, dónde cambia el estado React y dónde se produce la redirección.

**Pregunta:** ¿`setUser` inicia una sesión en MySQL? **Respuesta:** no. Actualiza la interfaz después de que el controlador creó la sesión. Al consultar datos privados, el servidor vuelve a exigir la cookie válida.
