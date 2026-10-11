# Guías individuales para entender y defender el backend

Estas guías explican el código de esta entrega parcial. Cada integrante tiene un documento con ubicación de los bloques, librerías, funciones, conexiones con los demás y preguntas con respuestas. El reparto asigna responsabilidades de estudio y revisión; los aportes realizados se registran en [REPARTO.md](../REPARTO.md).

## Abrí tu guía

| Integrante         | Guía                                                 | Tema                                 |
| ------------------ | ---------------------------------------------------- | ------------------------------------ |
| Gianluca Pizarro   | [01-gianluca-pizarro.md](01-gianluca-pizarro.md)     | Servidor, configuración y errores    |
| Tomás Minossi      | [02-tomas-minossi.md](02-tomas-minossi.md)           | MySQL, inicialización y Docker       |
| Iván Lerner        | [03-ivan-lerner.md](03-ivan-lerner.md)               | Modelo Usuario y persistencia        |
| Paulo López        | [04-paulo-lopez.md](04-paulo-lopez.md)               | Roles, asociaciones y claves         |
| Gade Silva y Lápiz | [05-gade-silva-y-lapiz.md](05-gade-silva-y-lapiz.md) | Registro y transacción               |
| Valentín Schueld   | [06-valentin-schueld.md](06-valentin-schueld.md)     | Hashes, contraseñas y tokens         |
| Mateo Romani       | [07-mateo-romani.md](07-mateo-romani.md)             | Login y comprobación de credenciales |
| Joaquín Casanou    | [08-joaquin-casanou.md](08-joaquin-casanou.md)       | Sesiones, cookies y logout           |
| Simón Castellani   | [09-simon-castellani.md](09-simon-castellani.md)     | Validaciones, rutas y demostración   |

## Cómo estudiar

1. Leé el objetivo de tu bloque y abrí sus archivos.
2. Usá el mapa de líneas para encontrar las partes que se explican. Los enlaces apuntan al código de GitHub; en un editor podés buscar el nombre de la función o ir al número de línea.
3. Entendé qué recibe cada función, qué consulta o modifica y qué entrega. No hace falta memorizar cada palabra de JavaScript.
4. Seguí el ejemplo de entrada y salida, e identificá quién ejecuta tu función.
5. Respondé las preguntas sin leer. Después explicá tu bloque señalando el código.
6. Hacé la práctica propuesta con una cuenta ficticia y anotá en REPARTO qué revisaste realmente.

Los números de línea corresponden al código con el que se escribieron estas guías. Si después cambia un archivo, buscá también por el nombre de la función.

## Lo que todos necesitan ubicar

```text
Cliente HTTP (Postman o curl)
    -> index.js (recibe JSON y monta rutas)
    -> routes/ (selecciona el controlador)
    -> controllers/ (valida y ejecuta la operación)
    -> models/ (representa tablas y relaciones)
    -> Sequelize + mysql2 (conexión y consultas)
    -> MySQL (datos persistentes)
```

Node.js ejecuta JavaScript en el servidor. Express atiende HTTP. Sequelize es el ORM: permite trabajar con modelos y genera consultas SQL. MySQL es el motor que almacena los datos. Un endpoint es la combinación de método y dirección, por ejemplo `POST /auth/login`.

| Objeto            | Significado que deben conocer                                                        |
| ----------------- | ------------------------------------------------------------------------------------ |
| `req`             | Solicitud entrante: cuerpo JSON, cookies, cabeceras y método                         |
| `res`             | Permite enviar el código HTTP, el JSON y las cookies de respuesta                    |
| `next()`          | Continúa con el siguiente middleware o controlador                                   |
| `async` / `await` | Permiten esperar operaciones como una consulta sin bloquear por completo el servidor |
| `require(...)`    | Carga un módulo; CommonJS reutiliza su exportación en cargas posteriores             |
| `module.exports`  | Define qué puede usar otro archivo de ese módulo                                     |
| Transacción       | Agrupa escrituras: se confirman juntas o se revierten ante un error                  |

## Recorrido que deben saber explicar entre todos

**Registro:** validar datos -> calcular hash de contraseña -> buscar rol Cliente -> guardar usuario y relación con rol en una transacción -> devolver `201`. El registro no abre una sesión.

**Login:** validar datos -> buscar correo -> comprobar contraseña y estado -> volver a comprobar el usuario bajo bloqueo de fila -> actualizar última conexión y guardar sesión -> enviar cookie y `200`.

**Consulta privada:** leer cookie -> buscar hash del token con vencimiento futuro -> comprobar usuario activo -> responder con los campos públicos.

**Logout:** comprobar sesión -> eliminar su fila -> borrar cookie -> responder `200`.

## Qué forma parte de esta entrega

Hay cuatro tablas y cinco endpoints. Se registra el rol Cliente, pero todavía no hay endpoints de administración de roles. El estado bloqueado se comprueba al entrar, pero no hay una pantalla ni un endpoint para bloquear cuentas. Se comprueba que el correo tenga formato válido; no se envía un correo de verificación. El backend no contiene interfaz gráfica ni integra IA.

La demostración completa está en [la guía de Simón](09-simon-castellani.md) y la instalación está en [README](../README.md).
