# Iván Lerner: modelo Usuario y persistencia

## Tu objetivo

Explicar qué información se guarda de una persona registrada, dónde se define cada campo y cómo los controladores usan el modelo. Tu archivo es corto: no contiene funciones propias, pero define las reglas de una de las tablas centrales.

## Archivos y mapa del código

| Ubicación                                                                                         | Qué encontrás                              |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [models/Usuario.model.js, líneas 1–4](../models/Usuario.model.js#L1-L4)                           | Importaciones y definición del modelo      |
| [models/Usuario.model.js, líneas 5–12](../models/Usuario.model.js#L5-L12)                         | Todos los atributos del usuario            |
| [models/Usuario.model.js, línea 15](../models/Usuario.model.js#L15)                               | Exportación del modelo                     |
| [controllers/register.controller.js, líneas 17–25](../controllers/register.controller.js#L17-L25) | Creación de una fila de usuario            |
| [controllers/login.controller.js, líneas 12–23](../controllers/login.controller.js#L12-L23)       | Consulta y actualización al iniciar sesión |
| [controllers/users.controller.js, líneas 1–11](../controllers/users.controller.js#L1-L11)         | Selección de datos públicos                |
| [config/schema.sql](../config/schema.sql)                                                         | Cómo queda la tabla en MySQL               |

## Librerías y conceptos

`DataTypes`, de Sequelize, permite declarar UUID, texto, enumeraciones y fechas. `sequelize`, importado desde `config/db.js`, es la instancia compartida; su método `define` devuelve el modelo Usuario.

El **modelo** describe cómo trabajar con la tabla. Una **instancia** representa una fila concreta, por ejemplo la cuenta de una persona. MySQL conserva esa fila cuando la aplicación termina. Exportar Usuario permite que otro archivo consulte o cree usuarios sin repetir la definición.

## Qué hace `sequelize.define('usuarios', atributos)`

Registra el modelo con nombre de tabla `usuarios`. No inserta personas ni crea la tabla por sí solo. `config/init-db.js` llama a `sync()` para preparar el esquema y el controlador de registro llama a `Usuario.create(...)` para insertar datos.

## Campos que tenés que entender

| Campo             | Regla                                                | Para qué se usa                                                |
| ----------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `id`              | UUID, clave primaria, valor generado con UUIDV4      | Identifica la cuenta y permite relacionarla con roles/sesiones |
| `nombre`          | Texto hasta 100 caracteres, no nulo                  | Nombre de la persona                                           |
| `apellido`        | Texto hasta 100, no nulo, por defecto `''`           | Apellido opcional en la API sin guardar NULL                   |
| `email`           | Texto hasta 150, obligatorio y único                 | Buscar la cuenta durante login y evitar registros duplicados   |
| `password_hash`   | Texto hasta 255, obligatorio                         | Resultado del proceso de protección de contraseña              |
| `estado`          | Sólo activo o bloqueado, inicialmente activo         | Impedir login y uso de sesiones a una cuenta bloqueada         |
| `fecha_registro`  | Fecha con milisegundos, por defecto NOW en Sequelize | Saber cuándo se creó la cuenta                                 |
| `ultima_conexion` | Fecha con milisegundos o NULL                        | Saber cuándo fue el último login exitoso                       |

`primaryKey` identifica cada fila. `unique` crea una restricción que impide repetir el correo incluso si dos solicitudes llegan juntas. `allowNull:false` prohíbe NULL: no significa por sí solo que un texto vacío sea inválido. El mínimo de dos caracteres del nombre y el formato de correo se verifican con Zod antes de guardar.

`defaultValue` es un valor que Sequelize aplica si no se entrega el campo. `timestamps:false` viene de la configuración compartida: por eso aparecen nuestras fechas y no las columnas automáticas `createdAt`/`updatedAt`.

## Métodos que usan este modelo

No fueron escritos como funciones en tu archivo: los ofrece Sequelize.

| Método                                  | Dónde aparece | Qué recibe y devuelve                                                          |
| --------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| `Usuario.create(...)`                   | Registro      | Atributos y transacción; inserta y devuelve la instancia creada                |
| `Usuario.findOne({where:{email}})`      | Login         | Correo normalizado; devuelve una instancia o NULL                              |
| `Usuario.findByPk(id, ...)`             | Login         | UUID; vuelve a leer la cuenta dentro de una transacción                        |
| `current.update({ultima_conexion:...})` | Login         | Campos a cambiar; actualiza esa fila                                           |
| `current.getRoles(...)`                 | Login         | Transacción opcional; trae los roles mediante la asociación definida por Paulo |

Un error de unicidad durante `create` llega al manejador de errores de `index.js`, que devuelve `409`.

## Qué se guarda y qué se devuelve

En el registro, el controlador entrega al modelo nombre, apellido, email y `password_hash`. No entrega el password original ni permite que el cliente elija estado, id o roles. Esos campos se controlan desde el servidor y los defaults.

`publicUser(user)` construye un objeto con los campos que la API permite devolver. Incluye id, nombre, apellido, email, estado, fechas y nombres de roles; omite `password_hash`. Un campo puede existir en MySQL sin que deba salir en la respuesta HTTP.

Ejemplo conceptual: registrar a Ana con una contraseña produce una fila con `estado:'activo'`, un UUID y un hash. La respuesta contiene a Ana y su rol Cliente. `ultima_conexion` es NULL hasta que inicia sesión correctamente. El login actualiza esa fecha; consultar `/users/me` no la actualiza.

## Cómo se conecta con los demás

Paulo relaciona Usuario con Rol y Sesion en `models/index.js`. Gade lo crea; Mateo lo busca y actualiza; Valentín produce el hash que se guarda; Joaquín lo carga para comprobar si una sesión sigue siendo válida.

## Práctica que tenés que poder hacer

Registrar una cuenta ficticia y consultar en la base `SELECT id, nombre, email, estado, fecha_registro, ultima_conexion FROM usuarios;`. Iniciar sesión y repetir la consulta para mostrar el cambio de `ultima_conexion`. Repetir el correo en otro registro y explicar el `409`.

## Preguntas con respuesta

**¿El correo puede ser clave primaria?** En este diseño la primaria es UUID; el correo es único pero tiene una finalidad distinta y podría cambiar en una futura función de perfil.

**¿Un hash es una contraseña cifrada que podemos recuperar?** No. El login vuelve a calcular y comparar; no la descifra.

**¿`estado` es un rol?** No. Activo/bloqueado indica si la cuenta puede usarse; Cliente es una categoría asignada mediante otra tabla.

**¿Si cambio el archivo se modifica la tabla existente?** No automáticamente. `sync()` sin alter no adapta columnas existentes; hace falta una migración.

## Preparación para la exposición

Podés explicar: «Mi bloque define qué conserva cada usuario y sus restricciones. Registro crea una fila; login la busca y actualiza; la API devuelve sólo campos públicos». Estás listo cuando podés ubicar cada campo y diferenciar validación de entrada, restricción de base y respuesta pública.

## Lo que se suma con la pantalla de inicio

Seguí siendo responsable del modelo Usuario. Ahora relacioná ese modelo con los datos visibles de [Account.jsx, líneas 30–47](../client/src/pages/Account.jsx#L30-L47) y con [publicUser, líneas 1–12](../controllers/users.controller.js#L1-L12).

### `Account()` y los campos del usuario

Es un componente React sin argumentos explícitos: obtiene `user` mediante `useAuth`. Devuelve la pantalla de cuenta, o un estado de carga/error, o una redirección al login. No consulta directamente Sequelize. El usuario compartido se carga con `GET /users/me` o con la respuesta del login.

`user.nombre` y `user.apellido` aparecen como nombre; `user.email` como correo; `user.estado` como estado. `roles` proviene de una asociación, no de una columna inventada en Usuario. La respuesta pública también incluye id y fechas, aunque esta pantalla no los muestra. Debés distinguir «no se muestra» de «no se devuelve»: el hash de contraseña sí se excluye explícitamente en el servidor.

React interpreta estos valores como texto dentro de JSX. No se usa `dangerouslySetInnerHTML`: un nombre con signos HTML no debe convertirse en código de la página. El estilo `overflow-wrap` permite partir un correo largo sin desbordar la tarjeta.

### Persistencia frente a estado visual

Cambiar `user` en React actualiza la pantalla, pero no ejecuta un UPDATE en MySQL. Esta entrega no tiene edición de perfil. El nombre se crea en el registro, y `ultima_conexion` cambia en el login. Recargar vuelve a consultar el servidor; no se reconstruye el usuario desde campos editables o desde localStorage.

**Práctica:** con una cuenta ficticia, comparar nombre, correo y estado entre la respuesta de `/users/me`, la pantalla y los campos del modelo. Identificar qué restricciones son de MySQL y cuáles son del formulario/Zod.

**Pregunta:** ¿La tarjeta puede mostrar `password_hash` si se agrega un campo visual? **Respuesta:** la API no lo entrega. El componente no debe consultar la base ni ampliar esa exposición.
