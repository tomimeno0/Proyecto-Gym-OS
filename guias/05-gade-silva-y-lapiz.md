# Gade Silva y Lápiz: registro de usuarios

## Tu objetivo

Explicar `register(req,res)` de principio a fin: qué recibe, qué valida, qué guarda, qué ocurre si falla y qué devuelve. Tu responsabilidad es coordinar varias piezas sin repetir las funciones de validación, seguridad o modelos.

## Archivos y mapa del código

| Ubicación                                                                                           | Qué encontrás                                 |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [controllers/register.controller.js, líneas 1–5](../controllers/register.controller.js#L1-L5)       | Dependencias del registro                     |
| [controllers/register.controller.js, líneas 7–9](../controllers/register.controller.js#L7-L9)       | Entrada, validación y hash                    |
| [controllers/register.controller.js, líneas 10–16](../controllers/register.controller.js#L10-L16)   | Apertura de transacción y búsqueda de Cliente |
| [controllers/register.controller.js, líneas 17–29](../controllers/register.controller.js#L17-L29)   | Creación del usuario y asignación del rol     |
| [controllers/register.controller.js, líneas 30–35](../controllers/register.controller.js#L30-L35)   | Respuesta pública y exportación               |
| [routes/auth.routes.js, línea 16](../routes/auth.routes.js#L16)                                     | Endpoint que ejecuta la función               |
| [controllers/validation.controller.js, líneas 3–11](../controllers/validation.controller.js#L3-L11) | Reglas del registro                           |

## Qué librerías utiliza tu bloque

Tu archivo importa módulos del proyecto, no hace un `require` directo de una librería externa. Esos módulos ofrecen:

- La instancia de Sequelize para agrupar escrituras en una transacción.
- Modelos Sequelize `Usuario`, `Rol` y `UsuarioRol` para consultar e insertar.
- Un esquema Zod para validar el JSON.
- `hashPassword`, basado en `node:crypto`, para proteger la contraseña.
- `publicUser` para seleccionar los datos de respuesta.

Express llama a tu función y le entrega `req` y `res`. Este controlador no manda correos ni abre una sesión automáticamente.

## Contrato de `register(req,res)`

**Recibe:** una solicitud `POST /auth/register`, con nombre, email, password y apellido opcional en `req.body`.

**Modifica:** una fila en `usuarios` y una fila en `usuario_roles`.

**Entrega:** respuesta HTTP `201` con mensaje y usuario público, si ambas escrituras se confirman. Su valor de retorno JavaScript no es lo que recibe el cliente; el cliente recibe lo enviado por `res.json`.

## Qué hace cada parte de la función

### 1. `registerSchema.parse(req.body)`

Verifica tipos, campos permitidos, límites y formato. Normaliza el correo a minúsculas y sin espacios alrededor; recorta nombre/apellido y completa el apellido con `''` si falta. No recorta la contraseña: sus espacios forman parte del valor.

Si los datos son inválidos, `parse` lanza un error antes de escribir. Express 5 lo envía al manejador central, que responde `400`. El registro no necesita su propio try/catch para repetir ese manejo.

### 2. `hashPassword(data.password)`

Espera el hash de la contraseña producido por el bloque de Valentín. No se guarda `data.password` en la base. El cálculo se hace antes de abrir la transacción para no mantenerla abierta durante un trabajo criptográfico que no necesita SQL.

### 3. Callback de `sequelize.transaction(...)`

Este callback recibe `transaction`, que se pasa a cada operación de base del bloque. Sequelize confirma la transacción si el callback termina correctamente; si lanza un error, revierte sus escrituras.

Primero `Rol.findOne` busca Cliente. Si no existe, se crea un error con `status=503` y se lanza: el equipo debe ejecutar `db:init`. Es un problema de preparación del sistema, no una contraseña equivocada.

Después `Usuario.create` inserta sólo nombre, apellido, email y hash. El modelo completa UUID, estado activo y fecha. La lista explícita de campos impide copiar sin control todo el JSON a la tabla.

`UsuarioRol.create` asigna el usuario nuevo al rol encontrado. Ambos inserts comparten la transacción. Si falla la relación, no queda un usuario a medio registrar.

### 4. `created.roles = [role]` y `return created`

La relación ya se guardó con `UsuarioRol.create`. La asignación `created.roles` sólo prepara el objeto en memoria para que `publicUser` pueda devolver los nombres de roles sin otra consulta. No es una segunda escritura a la base.

El `return created` es el resultado del callback. Sequelize lo entrega como valor de `user` después de confirmar la transacción.

### 5. `res.status(201).json(...)`

Se ejecuta después de que la transacción se completó. `publicUser(user)` omite el hash y selecciona la información pública. Devuelve el mensaje «Cuenta creada. Ya podés iniciar sesión». El usuario todavía debe llamar a `/auth/login` para recibir una cookie.

## Ejemplo concreto

Entrada ficticia:

```json
{
  "nombre": "Ana",
  "apellido": "Demo",
  "email": " ANA@EXAMPLE.COM ",
  "password": "ClaveEjemplo-2026"
}
```

La base guarda `ana@example.com`, un hash y su relación con Cliente. La respuesta incluye un UUID generado, nombre, correo normalizado, fechas y `roles:["Cliente"]`. No incluye `password` ni `password_hash`.

## Qué puede fallar

| Situación                                             | Resultado                                               |
| ----------------------------------------------------- | ------------------------------------------------------- |
| Datos inválidos o campo extra `rol`                   | `400`, no se crea usuario                               |
| Correo que ya existe                                  | Restricción única de MySQL; el manejador devuelve `409` |
| Falta el rol Cliente                                  | `503`, no se crea usuario                               |
| Falla una escritura dentro de la transacción          | Se revierte; un fallo no clasificado devuelve `500`     |
| Límite de solicitudes alcanzado antes del controlador | `429` desde `authLimiter`                               |

La unicidad se decide también en la base. No depender de una búsqueda previa evita que dos registros simultáneos creen el mismo correo.

## Conexión con los demás

Simón valida y enlaza la ruta. Valentín produce el hash. Iván define el usuario y Paulo la relación con Cliente. Gianluca transforma los errores en HTTP. Mateo se encarga del login posterior.

## Práctica y preguntas para defenderlo

Registrá una cuenta ficticia siguiendo el README. Mostrá `201`, la fila de usuario y su relación con Cliente. Repetí el correo para obtener `409` y mandá una contraseña corta para obtener `400`.

**¿Por qué transacción?** Para guardar usuario y rol juntos, sin cuentas incompletas.

**¿Dónde se elige el rol?** En `Rol.findOne({where:{nombre:'Cliente'}})`, dentro del servidor.

**¿Dónde se cifra la contraseña?** No se cifra para recuperarla: se calcula un hash en `hashPassword`.

**¿El `return created` responde HTTP?** No. Sale del callback; la respuesta al cliente se envía al final con `res.status(201).json(...)`.

## Preparación para la exposición

Podés explicar: «Mi bloque recibe los datos validados, protege la contraseña y guarda usuario y rol juntos. Después responde con datos públicos». Estás listo cuando podés señalar esos cinco pasos en la función sin leerla palabra por palabra.
