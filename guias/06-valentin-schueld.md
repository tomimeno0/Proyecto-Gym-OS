# Valentín Schueld: contraseñas, hashes y tokens

## Tu objetivo

Explicar las cuatro funciones de `security.controller.js`, por qué se usan dos algoritmos distintos y qué información se guarda. Tenés que poder seguir una contraseña desde el registro hasta su comprobación en el login.

## Archivos y mapa del código

| Ubicación                                                                             | Qué encontrás                                  |
| ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [security.controller.js, líneas 1–4](../controllers/security.controller.js#L1-L4)     | Herramientas de Node y configuración de scrypt |
| [security.controller.js, líneas 6–10](../controllers/security.controller.js#L6-L10)   | `hashPassword(password)`                       |
| [security.controller.js, líneas 12–18](../controllers/security.controller.js#L12-L18) | `verifyPassword(password,encoded)`             |
| [security.controller.js, líneas 20–22](../controllers/security.controller.js#L20-L22) | `newToken()`                                   |
| [security.controller.js, líneas 24–28](../controllers/security.controller.js#L24-L28) | `hashToken(token)` y exportación               |
| [register.controller.js, línea 9](../controllers/register.controller.js#L9)           | Uso del hash en registro                       |
| [login.controller.js, líneas 8–15](../controllers/login.controller.js#L8-L15)         | Uso en comprobación de credenciales            |
| [sessions.controller.js, líneas 9–19](../controllers/sessions.controller.js#L9-L19)   | Uso para crear una sesión                      |

## Librerías y preparación

Este archivo utiliza módulos incorporados en Node.js: `node:crypto` y `node:util`. No requiere instalar bcrypt ni JWT; esas tecnologías no forman parte de esta implementación.

| Herramienta       | Función en el archivo                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `scrypt`          | Derivar un hash de contraseña con un costo de cálculo y memoria                                              |
| `randomBytes`     | Generar sal y tokens con aleatoriedad criptográfica                                                          |
| `timingSafeEqual` | Comparar buffers de igual longitud evitando una comparación que termine al encontrar el primer byte distinto |
| `createHash`      | Calcular SHA-256 para tokens                                                                                 |
| `promisify`       | Convertir scrypt basado en callback a una función utilizable con await                                       |

`options` fija `N=32768`, `r=8`, `p=1` y `maxmem=64 MiB`. Tenés que saber que son parámetros de costo y límite de memoria, sin memorizar sus fórmulas. Se usa la misma configuración al guardar y verificar. El formato guardado no incluye esos parámetros: cambiar sólo `options` rompería la comprobación de hashes anteriores.

## Función `hashPassword(password)`

**Entrada:** la contraseña ya validada, como texto. **Salida:** una promesa con una cadena `scrypt$SAL$HASH`. **Efecto en base:** ninguno; el controlador de registro guarda el resultado.

Genera una sal de 16 bytes y la representa en hexadecimal. Luego ejecuta scrypt con la contraseña, esa sal y un resultado de 64 bytes. La sal y el hash se empaquetan con el nombre del algoritmo.

La sal no tiene que ser secreta. Evita que dos usuarios con la misma contraseña compartan automáticamente el mismo hash y dificulta reutilizar tablas de hashes preparadas. No se necesita conservar la contraseña original.

## Función `verifyPassword(password,encoded)`

**Entradas:** contraseña que se está intentando usar y cadena guardada. **Salida:** promesa con true o false. **Efecto en base:** ninguno.

Separa la cadena almacenada y rechaza un formato que no tenga tres partes o que no empiece por scrypt. Recupera la sal, recalcula scrypt sobre la contraseña recibida y compara el resultado con el hash guardado. Antes de usar `timingSafeEqual` verifica que los buffers tengan la misma longitud.

No descifra ni recupera la contraseña. La comparación segura de buffers no significa que toda la solicitud de login tarde exactamente lo mismo en cualquier situación; otras consultas también consumen tiempo.

## Función `newToken()`

**Entrada:** ninguna. **Salida:** texto aleatorio obtenido de 32 bytes y codificado como base64url. **Efecto en base:** ninguno.

Ese formato produce aquí 43 caracteres sin relleno. Es el identificador secreto de una sesión. Joaquín valida el formato al leer la cookie y Mateo lo entrega al cliente sólo después de confirmar un login exitoso.

El token no contiene el UUID, el rol o un JSON firmado. Es un identificador aleatorio cuya información se busca en la tabla de sesiones.

## Función `hashToken(token)`

**Entrada:** token original. **Salida:** su SHA-256 en hexadecimal, de 64 caracteres. **Efecto en base:** ninguno.

Se usa al crear la sesión para almacenar el hash y al recibir la cookie para buscar el mismo hash. El token original se envía en una cookie; la base no lo conserva en texto plano. Si la cookie se altera, el hash resultante no coincide con la sesión.

## Por qué scrypt para contraseñas y SHA-256 para tokens

| Elemento   | Cómo se obtiene                            | Protección elegida                                              |
| ---------- | ------------------------------------------ | --------------------------------------------------------------- |
| Contraseña | La elige una persona; puede ser predecible | scrypt con sal y costo para dificultar probar muchas candidatas |
| Token      | Se genera con 32 bytes aleatorios          | SHA-256 para identificarlo sin conservar el original en MySQL   |

Un hash rápido no convierte una contraseña débil en una contraseña fuerte. En cambio, el token ya se genera con alta aleatoriedad y se usa un hash determinista para buscarlo eficientemente.

## Conexión con los demás

Gade llama a `hashPassword` antes de insertar el usuario. Mateo llama a `verifyPassword`; su `dummyHash` también usa `hashPassword` para hacer trabajo de scrypt aunque el correo no exista. Joaquín usa `newToken` y `hashToken` para sesiones. Tus funciones no deciden códigos HTTP ni abren transacciones.

## Práctica que tenés que poder hacer

Este comando usa sólo valores ficticios y no modifica la base:

```sh
node -e "const s=require('./controllers/security.controller'); (async()=>{const a=await s.hashPassword('ClaveEjemplo-2026'); const b=await s.hashPassword('ClaveEjemplo-2026'); console.log('Hashes distintos:',a!==b); console.log('Clave correcta:',await s.verifyPassword('ClaveEjemplo-2026',a)); console.log('Clave incorrecta:',await s.verifyPassword('OtraClave',a)); console.log('Longitud token:',s.newToken().length);})()"
```

El resultado esperado es true, true, false y 43. No hace falta mostrar hashes de cuentas reales para demostrarlo.

## Preguntas con respuesta

**¿La sal es una clave para descifrar?** No. Permite reproducir el cálculo para comparar; el hash no se descifra.

**¿Por qué cambia el hash con la misma contraseña?** Por la sal aleatoria distinta.

**¿Quién guarda el hash?** Registro en `usuarios.password_hash`; creación de sesión en `sesiones.token_hash`.

**¿Quién responde 401?** Los controladores de login o sesión, según el resultado de estas funciones.

## Preparación para la exposición

Podés explicar: «Mi bloque protege contraseñas con scrypt y prepara tokens aleatorios cuyos hashes se guardan en MySQL». Estás listo cuando podés explicar las entradas y salidas de las cuatro funciones y distinguir sal, contraseña, token y hash.

## Lo que se suma con la pantalla de inicio

Conservá el estudio de `hashPassword`, `verifyPassword`, `newToken` y `hashToken`. Sumá [api(path, body), líneas 3–34](../client/src/lib.jsx#L3-L34) y [los campos de contraseña de Auth](../client/src/pages/Auth.jsx#L135-L154).

### Qué hace `api(path, body)`

Es una función async del navegador. Recibe una ruta relativa y, opcionalmente, un objeto. Sin objeto hace GET; con objeto hace POST, declara JSON y serializa el cuerpo. `credentials: 'same-origin'` permite que el navegador gestione cookies para el mismo origen; la función nunca lee el token.

Espera la respuesta, interpreta JSON y devuelve sus datos cuando el código HTTP es exitoso. Si falla la conexión o llega una respuesta que no es JSON, genera un mensaje comprensible. Si HTTP falla, crea un `Error` con `message`, `details` y `status`; `Feedback` muestra el mensaje. Un 401 fuera de `/auth/` emite `session-expired`, para que el estado visual deje de mostrar una cuenta conectada. Esto no crea ni revoca sesiones: sólo comunica el rechazo del servidor.

### Dónde se protegen las credenciales

`type=password` oculta visualmente los caracteres; no cifra la solicitud. En esta computadora se usa HTTP de loopback; una publicación real debe usar HTTPS y la cookie segura de producción. scrypt se ejecuta en el backend, no en React. La contraseña existe temporalmente en los inputs y se limpia del estado tras una operación exitosa; no se persiste en localStorage, sessionStorage o en el bundle.

La cookie HttpOnly no es accesible mediante JavaScript. En MySQL se guarda sólo el hash del token. No incluir claves de Cohere ni contraseñas SQL en archivos frontend: el JavaScript compilado es público. Esta entrega no integra IA.

**Práctica:** señalar la separación formulario -> `api` -> controlador -> hash. Explicar por qué leer una cookie en React no es necesario y por qué una validación del navegador no protege por sí sola al servidor.

**Pregunta:** ¿Usar JSON cifra la contraseña? **Respuesta:** no; JSON es un formato. HTTPS protege el transporte, scrypt protege su almacenamiento y HttpOnly reduce la exposición de la cookie al JavaScript.
