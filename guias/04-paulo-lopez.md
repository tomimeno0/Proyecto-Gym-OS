# Paulo López: roles y relaciones de base de datos

## Tu objetivo

Explicar por qué un rol se guarda separado del usuario, para qué sirve la tabla intermedia y dónde se declaran las asociaciones. También tenés que ubicar las relaciones con sesiones, aunque su funcionamiento lo expone Joaquín.

## Archivos y mapa del código

| Ubicación                                                                                         | Qué encontrás                                 |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [models/Rol.model.js, líneas 1–10](../models/Rol.model.js#L1-L10)                                 | Definición del rol                            |
| [models/UsuarioRol.model.js, líneas 1–10](../models/UsuarioRol.model.js#L1-L10)                   | Tabla intermedia                              |
| [models/index.js, líneas 1–4](../models/index.js#L1-L4)                                           | Carga de los cuatro modelos                   |
| [models/index.js, líneas 6–17](../models/index.js#L6-L17)                                         | Relación de muchos a muchos en ambos sentidos |
| [models/index.js, líneas 18–21](../models/index.js#L18-L21)                                       | Relaciones con sesiones y exportaciones       |
| [config/init-db.js, líneas 8–11](../config/init-db.js#L8-L11)                                     | Creación inicial del rol Cliente              |
| [controllers/register.controller.js, líneas 11–27](../controllers/register.controller.js#L11-L27) | Asignación del rol al registrar               |

## Librerías y conceptos

Los modelos usan `DataTypes` y `sequelize.define`, de Sequelize. `belongsToMany`, `hasMany` y `belongsTo` son métodos del ORM. Las claves foráneas que generan conectan filas en MySQL.

Un rol representa una categoría del usuario. En esta entrega se prepara únicamente Cliente. Tener una estructura de roles no significa que ya exista administración de permisos: no hay endpoints para crear administradores o cambiar roles.

## Qué hace cada bloque

### `sequelize.define('roles', ...)`

Define tres campos. `id` es un UUID primario; `nombre` es texto obligatorio y único hasta 50 caracteres; `descripcion` es texto obligatorio hasta 255. Se exporta el modelo Rol para usarlo desde inicialización, registro y asociaciones.

`Rol.findOrCreate` en `init-db.js` deja disponible Cliente antes del primer registro. Registrar una persona no vuelve a crear un rol nuevo para ella: reutiliza el mismo rol.

### `sequelize.define('usuario_roles', ...)`

La tabla intermedia tiene `usuario_id`, `rol_id` y `fecha_asignacion`. Los dos IDs forman una **clave primaria compuesta**: identifica la pareja usuario-rol. Un usuario puede tener varias parejas con roles distintos, y el mismo rol puede aparecer vinculado a muchas personas. La misma pareja no debe repetirse.

La fecha se completa por defecto desde Sequelize. Las referencias se completan al declarar las asociaciones en `models/index.js`; por eso es importante cargar ese archivo, y no sólo un modelo aislado, antes de crear las tablas.

### `Usuario.belongsToMany(Rol, ...)`

Declara el recorrido usuario -> roles:

| Opción                    | Qué significa                                                      |
| ------------------------- | ------------------------------------------------------------------ |
| `through:UsuarioRol`      | Usa la tabla intermedia para guardar la relación                   |
| `foreignKey:'usuario_id'` | Columna de la tabla intermedia que identifica al usuario de origen |
| `otherKey:'rol_id'`       | Columna que identifica al rol de destino                           |
| `as:'roles'`              | Nombre de la asociación para consultas y métodos generados         |

Por esta asociación Sequelize ofrece `usuario.getRoles()`, utilizado por el login. En consultas con `include` se debe usar el alias `roles`.

### `Rol.belongsToMany(Usuario, ...)`

Declara el recorrido inverso: rol -> usuarios. Usa la misma tabla intermedia, intercambia las claves y define el alias `usuarios`. Las dos declaraciones no crean dos tablas intermedias distintas.

Ejemplo: Ana y Bruno pueden tener Cliente sin duplicar el rol. Se guardan dos filas en `usuarios`, una fila Cliente en `roles` y dos filas en `usuario_roles`. Una futura ampliación podría asignar un segundo rol a Ana agregando otra pareja.

### `Usuario.hasMany(Sesion, ...)` y `Sesion.belongsTo(Usuario, ...)`

Expresan uno a muchos: un usuario puede abrir varias sesiones y cada sesión pertenece a un usuario. `usuario_id` está en `sesiones`. Los alias son `sesiones` y `usuario`; Joaquín usa este último cuando carga la sesión y su dueño.

`onDelete:'CASCADE'` indica que borrar un usuario elimina sus sesiones relacionadas. Es una regla de integridad de datos; no es el cierre de sesión normal, que borra una sola fila de sesión.

### Exportación conjunta de `models/index.js`

Entrega `{Usuario, Rol, UsuarioRol, Sesion}` a otros archivos. Además de ser un punto de importación, ejecuta las asociaciones al cargarse. CommonJS reutiliza el módulo después de su primera carga dentro del proceso.

## Claves e integridad en SQL

En [schema.sql](../config/schema.sql) podés señalar las `FOREIGN KEY` de `usuario_roles` hacia `usuarios` y `roles`. Impiden relacionar IDs que no existen. También hay restricciones únicas y acciones CASCADE generadas para estas asociaciones. Esas reglas siguen existiendo en MySQL, aunque la consulta no venga del controlador habitual.

Clave primaria identifica una fila; clave foránea apunta a una fila de otra tabla; índice ayuda a buscar o imponer una restricción. No son tres nombres para la misma cosa.

## Conexión con los demás

Gade busca Cliente y crea la pareja usuario-rol dentro de la misma transacción que el usuario. Mateo obtiene los roles con `getRoles`. Joaquín usa `include` para cargar el usuario y sus roles al validar una sesión. Simón devuelve sólo los nombres mediante `publicUser`.

## Práctica que tenés que poder hacer

Registrar dos cuentas ficticias y consultar, en la base de demostración:

```sql
SELECT u.email, r.nombre
FROM usuarios u
JOIN usuario_roles ur ON ur.usuario_id = u.id
JOIN roles r ON r.id = ur.rol_id;
```

Señalar que dos correos comparten el rol Cliente sin duplicar ese rol. Después ubicar en `models/index.js` cómo Sequelize representa ese recorrido.

## Preguntas con respuesta

**¿Por qué no una columna rol en usuarios?** Porque este diseño admite más de un rol por persona y evita repetir la definición del rol.

**¿El cliente manda qué rol quiere?** No. El registro elige Cliente en el servidor y la validación rechaza campos adicionales como `rol`.

**¿Qué pasa si Cliente no existe?** El registro devuelve `503`; se prepara con `db:init`.

**¿Ya existe un panel de roles?** No. En esta entrega están las tablas, asociaciones y la asignación inicial.

## Preparación para la exposición

Podés explicar: «Mi bloque conecta usuarios y roles mediante una tabla intermedia, y define las asociaciones que después consultan los controladores». Estás listo cuando podés dibujar las tres tablas, explicar la pareja de IDs y encontrar los alias en el código.

## Lo que se suma con la pantalla de inicio

Ahora debés seguir el rol hasta la interfaz. Abrí [Account.jsx, líneas 43–44](../client/src/pages/Account.jsx#L43-L44), [login.controller.js, líneas 17–28](../controllers/login.controller.js#L17-L28), [sessions.controller.js, líneas 31–47](../controllers/sessions.controller.js#L31-L47) y [publicUser](../controllers/users.controller.js#L1-L12).

### De la relación SQL al texto visible

En el registro, `UsuarioRol.create` guarda la relación y `created.roles = [role]` prepara la respuesta. En login, `current.getRoles()` consulta la asociación definida en tu bloque. Al recuperar una sesión, el `include` anidado carga Usuario y sus roles con el alias `roles`. Las tres respuestas pasan por `publicUser`, que transforma las instancias en nombres mediante `map`.

El resultado que recibe React es `roles: ['Cliente']`. En `Account`, `user.roles.join(', ')` convierte ese arreglo en un texto para mostrarlo. `join` no consulta MySQL ni cambia permisos. No se trata de tres formas distintas de guardar roles: se guarda la relación una vez y se carga según el recorrido.

### Dónde termina tu responsabilidad

`Account()` es un componente de React y `useAuth()` lee el usuario compartido. Estudiá su campo Rol y la forma de datos que necesita; no hace falta memorizar toda la maquetación. El formulario no incluye selector de rol y la solicitud de registro sólo envía nombre, apellido, correo y contraseña. Zod rechaza propiedades extra. No hay endpoints de administración de roles en esta entrega.

**Práctica:** registrar una cuenta ficticia, iniciar sesión y señalar Cliente. Recargar y explicar que el rol vuelve desde el `include`, no de una lista fija en React. Señalar también las dos filas relacionadas mediante `usuario_roles` sin modificar la base de demostración.

**Pregunta:** ¿Cambiar el texto Cliente en el navegador cambia el rol? **Respuesta:** no. Cambiar la presentación no modifica la tabla intermedia ni concede permisos; el servidor conserva la relación.
