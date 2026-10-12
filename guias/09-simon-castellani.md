# Simón Castellani: validaciones, rutas y demostración HTTP

## Tu objetivo

Explicar cómo se elige el controlador, qué datos se aceptan y qué devuelve la API. Además coordinás la demostración del recorrido completo con Postman o curl. No necesitás memorizar el código de seguridad o SQL: sí entender cuándo se ejecuta cada bloque y cómo reconocer sus resultados.

## Archivos y mapa del código

| Ubicación                                                                                 | Qué encontrás                      |
| ----------------------------------------------------------------------------------------- | ---------------------------------- |
| [validation.controller.js, líneas 1–3](../controllers/validation.controller.js#L1-L3)     | Librería y esquema del correo      |
| [validation.controller.js, líneas 4–11](../controllers/validation.controller.js#L4-L11)   | `registerSchema`                   |
| [validation.controller.js, líneas 12–19](../controllers/validation.controller.js#L12-L19) | `loginSchema` y exportaciones      |
| [users.controller.js, líneas 1–12](../controllers/users.controller.js#L1-L12)             | `publicUser(user)`                 |
| [users.controller.js, líneas 14–18](../controllers/users.controller.js#L14-L18)           | `getMe(req,res)`                   |
| [routes/auth.routes.js, líneas 1–20](../routes/auth.routes.js#L1-L20)                     | Limitador y rutas de autenticación |
| [routes/users.routes.js, líneas 1–8](../routes/users.routes.js#L1-L8)                     | Ruta privada del perfil            |
| [index.js, líneas 35–36](../index.js#L35-L36)                                             | Prefijos de las rutas              |

## Librerías que se usan

Zod define y ejecuta validaciones del JSON. `Router`, de Express, agrupa endpoints. `express-rate-limit` limita solicitudes por IP. `users.controller.js` utiliza JavaScript y `res`, proporcionado por Express; no consulta por sí mismo la base.

## Esquemas de validación

No son funciones propias declaradas con `function`: son objetos de Zod con un método `parse`, que llaman los controladores de registro/login. `parse` devuelve datos validados y transformados, o lanza un error que se responde como `400`.

### Esquema `email`

Recibe texto, recorta espacios externos, convierte a minúsculas y aplica formato de correo y longitud máxima de 150. `pipe` encadena las transformaciones con la validación de formato. Esto normaliza `ANA@EXAMPLE.COM` como `ana@example.com`.

La validación comprueba formato; no verifica propiedad ni existencia del buzón.

### `registerSchema`

| Campo      | Regla                                              |
| ---------- | -------------------------------------------------- |
| `nombre`   | Texto, recortado, entre 2 y 100 caracteres         |
| `apellido` | Texto, recortado, hasta 100; si falta, se usa `''` |
| `email`    | Usa el esquema compartido                          |
| `password` | Texto de 10 a 128 caracteres; no se recorta        |

`.strict()` rechaza campos que no están definidos, como `rol`, `estado` o `administrador`. El cliente no puede atribuirse un rol mandando más propiedades.

### `loginSchema`

Acepta únicamente email y password de 1 a 128 caracteres. El registro exige un mínimo mayor porque crea credenciales; login recibe una candidata para comprobarla. Una contraseña corta no vacía puede pasar la validación de login y luego ser rechazada como incorrecta con `401`.

## Función `publicUser(user)`

**Recibe:** una instancia de usuario cuyos roles hayan sido cargados por el controlador anterior. **Devuelve:** objeto con id, nombre, apellido, email, estado, fechas y una lista de nombres de roles.

No guarda datos ni hace SQL. Construye una lista explícita de campos y omite `password_hash`. El `map` de roles devuelve nombres en lugar de instancias completas; si no se cargaron roles, devuelve una lista vacía. Registro y login también reutilizan esta función.

## Función `getMe(req,res)`

Recibe una solicitud que ya pasó por `requireSession`. Responde `200` con `publicUser(req.user)`. No recibe un UUID elegido por el cliente: muestra a la persona que identificó la cookie.

Si no hay sesión válida, `requireSession` responde antes y `getMe` no se ejecuta. La autenticación vive en el middleware; el formato público de la respuesta vive aquí.

## Rutas y orden de ejecución

Los archivos de rutas crean un Router y lo exportan. En `index.js` se montan los prefijos:

| Definición local | Prefijo  | Endpoint completo     | Pasos                    |
| ---------------- | -------- | --------------------- | ------------------------ |
| `POST /register` | `/auth`  | `POST /auth/register` | authLimiter -> register  |
| `POST /login`    | `/auth`  | `POST /auth/login`    | authLimiter -> login     |
| `POST /logout`   | `/auth`  | `POST /auth/logout`   | requireSession -> logout |
| `GET /me`        | `/users` | `GET /users/me`       | requireSession -> getMe  |

Un middleware puede responder y detener el recorrido; si llama `next()`, continúa con el siguiente. El método importa: pedir `GET /auth/login` no ejecuta la ruta POST y termina en `404`.

### `authLimiter`

`rateLimit(...)` crea el middleware. Permite 30 solicitudes por IP cada 15 minutos. La misma instancia se utiliza en registro y login: comparten el contador y también cuentan solicitudes exitosas. Al superar el límite responde `429` con su mensaje, sin ejecutar el controlador.

Usa el almacén en memoria predeterminado, por lo que sus contadores se reinician con el proceso. No significa bloquear permanentemente una cuenta en MySQL. Las opciones de cabeceras habilitan información estándar del límite y deshabilitan cabeceras antiguas.

## Práctica: demostración completa que podés preparar

Con el backend ya arrancado y una base de demostración, ejecutar desde la raíz del repositorio. Usá un correo ficticio nuevo si ya probaste antes el mismo.

### 1. Salud y acceso sin sesión

```sh
curl -i http://localhost:3001/health
curl -i http://localhost:3001/users/me
```

Esperado: `200` y luego `401`. El servidor responde pero el perfil exige autenticación.

### 2. Registrar y repetir el correo

```sh
curl -i http://localhost:3001/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana","apellido":"Demo","email":"ana-defensa@example.com","password":"ClaveEjemplo-2026"}'
```

Primera vez: `201` y rol Cliente. Al repetir exactamente la solicitud: `409`.

### 3. Contraseña incorrecta y login correcto

```sh
curl -i http://localhost:3001/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana-defensa@example.com","password":"Incorrecta"}'
curl -i -c /tmp/gymos-defensa-cookies.txt http://localhost:3001/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana-defensa@example.com","password":"ClaveEjemplo-2026"}'
```

Esperado: `401` y después `200`. El segundo comando conserva la cookie recibida. No cambia la contraseña de la cuenta.

### 4. Consultar perfil, salir y volver a consultar

```sh
curl -i -b /tmp/gymos-defensa-cookies.txt http://localhost:3001/users/me
curl -i -b /tmp/gymos-defensa-cookies.txt -c /tmp/gymos-defensa-cookies.txt -X POST http://localhost:3001/auth/logout
curl -i -b /tmp/gymos-defensa-cookies.txt http://localhost:3001/users/me
```

Esperado: `200`, `200`, `401`. En Postman conservá las cookies con su administrador automático y usá cuerpo raw JSON.

### 5. Validación

```sh
curl -i http://localhost:3001/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"A","email":"no-es-correo","password":"corta","rol":"Administrador"}'
```

Esperado: `400`. Señalá los campos inválidos y el campo no permitido. Ningún usuario se crea con esa solicitud.

## Códigos que tenés que reconocer

| Código | Significado aquí                            |
| ------ | ------------------------------------------- |
| `200`  | Salud, login, perfil o logout exitosos      |
| `201`  | Cuenta creada                               |
| `400`  | Entrada inválida o JSON mal escrito         |
| `401`  | Credenciales o sesión rechazadas            |
| `403`  | Origen explícito de solicitud no autorizado |
| `404`  | Endpoint inexistente                        |
| `409`  | Correo duplicado                            |
| `413`  | JSON mayor que el límite de tamaño          |
| `429`  | Límite de solicitudes alcanzado             |
| `503`  | Falta el rol inicial en el registro         |
| `500`  | Fallo interno no clasificado                |

## Preguntas y preparación para la exposición

**¿Zod reemplaza las restricciones de MySQL?** No. Zod valida el cuerpo; MySQL también aplica unicidad y relaciones.

**¿`publicUser` autentica al usuario?** No. Selecciona datos de alguien ya identificado por el controlador/middleware anterior.

**¿Dónde se transforma un error de parse en HTTP 400?** En el middleware de errores de `index.js`.

**¿Por qué hay `/me` y no una lista pública de cuentas?** Para mostrar sólo el usuario de la sesión y no exponer a todos.

Podés explicar: «Mi bloque define las entradas permitidas, conecta endpoints con controladores y muestra resultados con HTTP». Estás listo cuando podés encontrar cada ruta, identificar su middleware anterior y ejecutar la demostración sin perder la cookie.

## Lo que se suma: portada, navegación y componentes

Además de las rutas y validaciones, preparás la presentación de la interfaz reutilizada. Abrí [main.jsx](../client/src/main.jsx), [App.jsx](../client/src/App.jsx), [Landing.jsx](../client/src/pages/Landing.jsx), [ui.jsx](../client/src/components/ui.jsx) y [styles.css](../client/src/styles.css).

### Entrada y rutas

`main.jsx` obtiene el nodo `root` del HTML y usa `createRoot(...).render(...)` de React DOM para montar `App` dentro de StrictMode. No levanta el servidor. El plugin React de Vite compila JSX.

`App()` devuelve `BrowserRouter`, el proveedor de autenticación y cinco rutas. `/` y `/nosotros` usan `Landing`; la segunda pasa `about`. `/login` y `/registro` usan `Auth` con distintos `mode` y `key`: cambiar de modo reinicia el estado del formulario. `/cuenta` usa `Account`. `Link` cambia de pantalla sin una recarga completa; Express también registra esas direcciones para permitir abrirlas directamente. Una dirección desconocida responde 404 del servidor.

### `Brand()` y `Landing({about=false})`

`Brand` devuelve el enlace al inicio, el ícono Activity y el nombre GYM—OS. Se reutiliza en portada, formularios y cuenta. Los íconos provienen de `lucide-react`; no dependen de un servidor externo.

`Landing` consulta `useAuth` y devuelve la portada original del proyecto completo. `about` cambia el título y el párrafo de presentación. Si no hay usuario, los botones llevan a login/registro; si lo hay, llevan a cuenta. El título principal, la figura GO FURTHER y la identidad verde/crema se conservaron. No se importaron dashboard, rutinas, nutrición, progreso ni asistente IA.

El arreglo de tres tarjetas se recorre con `map`, que devuelve un `article` por elemento. La clave `key` identifica cada tarjeta. Son contenido de presentación, no rutas o servicios implementados. La nota de alcance lo aclara. El arte decorativo tiene `aria-hidden`; el enlace Saltar al contenido permite llegar al main con teclado.

### Componentes compartidos

`Button({children, busy, ...props})` devuelve un botón, muestra el ícono de carga cuando corresponde y lo deshabilita mientras espera. `children` es el contenido del botón; las demás propiedades permiten pasar el callback o tipo.

`Field({label, hint, children, ...props})` usa `useId` para generar una asociación única entre label e input. Si hay ayuda, conecta `aria-describedby`. Recibe valor, callback y restricciones del formulario; no valida ni escribe la base por sí mismo.

`Feedback({error, success})` devuelve los avisos cuando existen. Error usa `role=alert`, éxito `role=status`; si hay detalles de Zod, muestra campo y mensaje. No cambia el código HTTP ni captura errores: los recibe de `useAction`.

### Estilos y demostración

`styles.css` define colores, columnas, botones y formularios. Las media queries de 960, 760 y 430 px adaptan tamaños, apilan portada/tarjetas y reorganizan el formulario. En móvil se oculta el panel decorativo del formulario, pero no los inputs. `prefers-reduced-motion` respeta la preferencia de movimiento reducido.

**Práctica en navegador:** inicio -> Crear mi cuenta -> registro válido -> login -> cuenta -> recargar -> cerrar sesión. Mostrar también confirmación diferente, contraseña incorrecta y correo duplicado. Revisar anchos de celular, etiquetas de inputs y foco de teclado. Esta práctica es una instrucción para el equipo; no significa que una revisión visual ya se haya realizado.

**Pregunta:** ¿`GET /login` ahora ejecuta el login? **Respuesta:** no. `/login` devuelve la pantalla; sólo `POST /auth/login` ejecuta el controlador. `GET /auth/login` sigue siendo 404.
