# API HTTP

Referencia de las rutas montadas por Express. URL local: `http://localhost:3000`. Los paths de esta página son los de la API, antes de cualquier proxy. Las entradas son JSON salvo los parámetros de ruta y query.

## Convenciones y autorización real

La mayoría de respuestas sigue `{ "success": true, "data": ... }` y los errores `{ "success": false, "error": "..." }`. Algunas rutas de grupos devuelven `{ success, message }` o solamente `{ error }`. Chat y generador tienen sus propios contratos. No hay versión en los paths, paginación general ni esquema OpenAPI versionado.

En las tablas, **pública** significa que el código no exige JWT; no implica que los datos deban ser públicos. Las rutas protegidas esperan `Authorization: Bearer <token>`. Los guards de React no protegen una llamada directa a Express. Las brechas detectadas están en [seguridad](seguridad.md).

## Servidor e identidad

| Método y ruta | Entrada | Respuesta / estado de éxito | Protección |
|---|---|---|---|
| `GET /` | Ninguna | Mensaje, versión literal `1.0.0`, mapa de áreas; 200 | Pública |
| `GET /health` | Ninguna | `{ status: "ok", message }`; 200 | Pública |
| `POST /auth/register/estudiante` | Correo, contraseña, código y nombres | Perfil creado dentro de `data`; 201 | Pública |
| `POST /auth/register/profesor` | Correo, contraseña y nombres | Perfil creado dentro de `data`; 201 | Pública |
| `POST /auth/login` | `correo_electronico`, `contrasenia` | `data: { role, user, token, confirmado }`; 200 | Pública |
| `GET /auth/confirm` | Query `token` | `data: { success, message }`; 200 | Pública, token de confirmación |
| `POST /auth/resend-confirmation` | `correo_electronico` | `data: { success, message }`; 200 | Pública |
| `POST /auth/request-password-reset` | `correo_electronico` | `data: { success, message }`; 200 | Pública |
| `POST /auth/reset-password` | `token`, `nueva_contrasenia` | `data: { success, message }`; 200 | Pública, token de recuperación |
| `GET /auth/me` | Ninguna | `data: { role, user, email, confirmado }`; 200 | JWT |
| `GET /auth/profesor/:id/estudiantes` | ID del profesor | `data: perfiles[]`, `total`; 200 | JWT, rol profesor y mismo ID |

Registro de estudiante:

```json
{
  "correo_electronico": "estudiante@epn.edu.ec",
  "contrasenia": "UnaClaveDeEjemplo123",
  "codigo_unico": 202600001,
  "primernombre": "Ana",
  "segundo_nombre": "María",
  "primer_apellido": "Pérez",
  "segundo_apellido": "López"
}
```

El profesor usa los mismos campos salvo `codigo_unico`. No usar `nombre_completo` como sustituto de los cuatro campos: el backend no lo transforma. `user` del login es un perfil con `id_estudiante` o `id_profesor`, nombres y vínculo a identidad; no existe un `id` genérico garantizado. La contraseña de registro debe tener al menos ocho caracteres. Dominios admitidos: `gmail.com`, `hotmail.com`, `outlook.com`, `epn.edu.ec`.

Login devuelve 400 si faltan campos, 401 si las credenciales no coinciden. Las validaciones de registro, confirmación y recuperación suelen devolver 400. `/me` devuelve 404 si no encuentra la identidad; el acceso docente puede devolver 403.

## Progreso

| Método y ruta | Entrada | Respuesta | Protección |
|---|---|---|---|
| `POST /progreso` | `id_estudiante`, `slug_escenario`, `terminado`, `tiempo`, `acciones` | Fila insertada en `data`; 201 | Pública |
| `GET /progreso/estudiante/:idEstudiante/escenario/:slugEscenario` | ID y slug | `data: { terminado, intentos }`; 200 | Pública |
| `GET /progreso/estudiante/:idEstudiante` | ID | Historial en `data`, ordenado por ID ascendente; 200 | Pública |

Ejemplo de un intento; `acciones` es una **cadena** JSON, no un objeto en el contrato actual:

```json
{
  "id_estudiante": 1,
  "slug_escenario": "tutorial",
  "terminado": false,
  "tiempo": 65,
  "acciones": "{\"accionesEsperadas\":[],\"accionesRealizadas\":[]}"
}
```

Cada POST es un intento nuevo; un reenvío no se deduplica. El caso de uso rechaza tiempo negativo. No se valida pertenencia, catálogo de slugs ni consistencia del JSON de acciones. Sin intentos, la consulta por escenario devuelve `terminado: false, intentos: 0`. El historial incluye ID, slug, título, resultado, tiempo, fecha y acciones.

## Cursos y matrículas

| Método y ruta | Entrada | Respuesta | Protección |
|---|---|---|---|
| `GET /groups/profesor/:id_profesor` | ID | Cursos en `data`; 200 | Pública |
| `GET /groups/estudiante/:id_estudiante` | ID | Cursos con `nombre_profesor` en `data`; 200 | Pública |
| `GET /groups/:id_curso/estudiantes` | ID | Perfiles con correo en `data`; 200 | Pública |
| `POST /groups` | `id_profesor`, `nombre` | Curso con código y expiración en `data`; 201 | Pública |
| `PUT /groups/edit/:id` | ID; body de actualización de curso | Curso actualizado en `data`; 200 | Pública |
| `DELETE /groups/delete/:id` | ID | `{ success, message }`; 200 | Pública |
| `POST /groups/join` | `codigo_acceso`, `id_estudiante` | Matrícula en `data`; 201 | Pública |
| `POST /groups/:id/generate-code` | ID | Curso con nuevo código en `data`; 200 | Pública |
| `DELETE /groups/:id_curso/remove-student/:id_estudiante` | IDs; body `id_profesor` | `{ success, message }`; 200 | Pública; compara ID declarado con propietario |
| `DELETE /groups/leave/:id_curso/:id_estudiante` | IDs | `{ success, message }`; 200 | Pública |

Los errores suelen devolver 400. El código vence en siete días. La regla de un grupo por estudiante se comprueba en aplicación, sin garantía transaccional. Editar pasa el body al repositorio; no hay validación de esquema HTTP ni whitelist efectiva de campos en runtime.

## Retroalimentación y análisis

| Método y ruta | Entrada | Respuesta | Protección |
|---|---|---|---|
| `GET /feedback/check-status` | Query `id_estudiante`, `slug_escenario` | `{ success, habilitado, intentos_actuales, intentos_al_generar, ultima_retroalimentacion }`; 200 | Pública |
| `POST /feedback/generate` | `id_estudiante`, `slug_escenario` | `data: { analisis, fortaleza, area_mejora, consejo }`; 200 | Pública |
| `POST /course-analysis/generate` | `id_curso`, `id_profesor`, números positivos | Análisis estructurado en `data`; 200 | Pública |
| `GET /course-analysis/latest/:id_curso` | ID | Análisis en `data` o `null`; 200 | Pública |
| `GET /course-analysis/health` | Ninguna | Configuración presente: 200; ausente: 503 | Pública |

Feedback y análisis devuelven 400 por entrada inválida y normalmente 500 ante fallo de servicio/persistencia. Generación de análisis devuelve 503 sin webhook configurado. El resultado de análisis contiene `id_curso`, `fecha_generacion`, estadísticas en `resumen` y cinco secciones `{ titulo, contenido }` en `analisis`: `resumen_ejecutivo`, `patrones`, `fortalezas`, `areas_mejora`, `recomendaciones`.

## Chat y generador

| Método y ruta | Entrada | Respuesta | Protección |
|---|---|---|---|
| `POST /api/chat` | `sessionId`; `message` o `context` | `{ message, audio, hasAudio, sessionId, timestamp, success }`; normalmente 200 | Pública |
| `GET /api/chat/health` | Ninguna | `{ status, services, memory }`; 200 o error 500 | Pública |
| `GET /api/chat/stats` | Ninguna | `{ success, stats: { activeSessions, totalMessages } }`; 200 | Pública |
| `DELETE /api/chat/session/:sessionId` | ID de sesión | `{ success, message }`; 200; 404 si no existe | Pública |
| `POST /api/agent-malvado/generate` | `prompt` opcional | `{ success, data, error? }`; 200 o 400, error inesperado 500 | Pública |

Contexto de chat:

```json
{
  "sessionId": "sesion-local-de-ejemplo",
  "message": "¿Para qué sirve un firewall?",
  "context": {
    "objectName": "Router",
    "contextId": "router",
    "displayText": "Router seleccionado",
    "ariaLabel": "Consultar router",
    "imageUrl": ""
  }
}
```

Sin `sessionId` el controller devuelve 400. Mensaje vacío y sin `contextId` devuelve HTTP 200 con `success: false`. También puede devolver HTTP 200 con fallo de procesamiento porque el repositorio captura sus errores; revisar `success` además de `response.ok`. `audio` es una data URL WAV o `null`.

El generador utiliza un prompt de respaldo si no se recibe uno. Devuelve datos externos sin un esquema de escenario validado por el servidor; la normalización posterior ocurre en el frontend. El controller crea seed y timestamp, pero el adaptador envía a n8n solamente `prompt`.

## Evidencia y evolución

- Montajes: [server.ts](../../apps/backend/src/server.ts).
- [AuthController](../../apps/backend/src/auth/infrastructure/controllers/AuthController.ts), [ProgresoController](../../apps/backend/src/auth/infrastructure/controllers/ProgresoController.ts) y [GroupsController](../../apps/backend/src/groups/infrastructure/controller/GroupsController.ts).
- [FeedbackController](../../apps/backend/src/feedback/infrastructure/controllers/FeedbackController.ts) y [CourseAnalysisController](../../apps/backend/src/course-analysis/infrastructure/controllers/CourseAnalysisController.ts).
- [ChatController](../../apps/backend/src/chat/infrastructure/controllers/ChatController.ts) y [ScenarioBuilderController](../../apps/backend/src/agent-malvado/infrastructure/controllers/ScenarioBuilderController.ts).

Actualizar esta referencia cuando se cambien rutas, cuerpos, envelopes o autenticación; las interfaces TypeScript por sí solas no validan entradas HTTP.
