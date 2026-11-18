# Rutas del backend

Inventario de los 52 endpoints explícitos montados en [`server.ts`](../../apps/backend/src/server.ts): 37 en la API principal y 15 en la API interna. Las rutas corresponden a Express, antes de cualquier proxy del frontend. Cada combinación de método y ruta representa un endpoint.

**Acceso** usa únicamente Público (sin autenticación de sesión o servicio) y Privado (requiere autenticación). **Docente** corresponde al rol `profesor`. ✅ indica que el control de acceso admite el rol y ❌ que lo rechaza; siguen aplicándose las condiciones de propiedad y validación descritas más abajo. Las rutas públicas admiten llamadas de ambos roles y de visitantes sin sesión.

## API principal

Puerto configurado con `PORT`, por defecto `3000`.

| Método | Ruta | Función | Acceso | Docente | Estudiante |
|---|---|---|---|:---:|:---:|
| GET | `/health/live` | Comprobar que el proceso está activo | Público | ✅ | ✅ |
| GET | `/health` | Alias de comprobación del proceso | Público | ✅ | ✅ |
| GET | `/health/ready` | Consultar disponibilidad de los componentes esenciales | Público | ✅ | ✅ |
| GET | `/health/status` | Consultar estado de componentes, instalación y versión | Público | ✅ | ✅ |
| POST | `/auth/register/estudiante` | Registrar una cuenta de estudiante | Público | ✅ | ✅ |
| POST | `/auth/register/profesor` | Registrar una cuenta de docente | Público | ✅ | ✅ |
| POST | `/auth/login` | Iniciar sesión | Público | ✅ | ✅ |
| GET | `/auth/confirm` | Confirmar el correo mediante token | Público | ✅ | ✅ |
| POST | `/auth/resend-confirmation` | Reenviar confirmación del correo | Público | ✅ | ✅ |
| POST | `/auth/request-password-reset` | Solicitar recuperación de contraseña | Público | ✅ | ✅ |
| POST | `/auth/reset-password` | Cambiar la contraseña mediante token de recuperación | Público | ✅ | ✅ |
| GET | `/auth/me` | Consultar el perfil autenticado | Privado | ✅ | ✅ |
| GET | `/auth/profesor/:id/estudiantes` | Consultar los estudiantes del docente autenticado | Privado | ✅ | ❌ |
| POST | `/progreso` | Guardar progreso de un estudiante | Público | ✅ | ✅ |
| GET | `/progreso/estudiante/:idEstudiante/escenario/:slugEscenario` | Consultar progreso por estudiante y escenario | Público | ✅ | ✅ |
| GET | `/progreso/estudiante/:idEstudiante` | Consultar historial de progreso | Público | ✅ | ✅ |
| POST | `/attempts` | Crear un intento asociado al usuario autenticado | Privado | ✅ | ✅ |
| GET | `/attempts/:attemptId` | Consultar un intento propio | Privado | ✅ | ✅ |
| POST | `/attempts/:attemptId/commands` | Ejecutar un comando sobre un intento propio | Privado | ✅ | ✅ |
| GET | `/groups/profesor/:id_profesor` | Listar grupos de un docente | Público | ✅ | ✅ |
| GET | `/groups/estudiante/:id_estudiante` | Listar grupos de un estudiante | Público | ✅ | ✅ |
| GET | `/groups/:id_curso/estudiantes` | Listar estudiantes de un grupo | Público | ✅ | ✅ |
| POST | `/groups` | Crear un grupo | Público | ✅ | ✅ |
| PUT | `/groups/edit/:id` | Editar un grupo | Público | ✅ | ✅ |
| DELETE | `/groups/delete/:id` | Eliminar un grupo | Público | ✅ | ✅ |
| POST | `/groups/join` | Matricular un estudiante mediante código de acceso | Público | ✅ | ✅ |
| POST | `/groups/:id/generate-code` | Regenerar el código de acceso del grupo | Público | ✅ | ✅ |
| DELETE | `/groups/:id_curso/remove-student/:id_estudiante` | Retirar un estudiante del grupo | Público | ✅ | ✅ |
| DELETE | `/groups/leave/:id_curso/:id_estudiante` | Retirar la matrícula de un estudiante | Público | ✅ | ✅ |
| GET | `/feedback/check-status` | Consultar disponibilidad de retroalimentación propia | Privado | ❌ | ✅ |
| POST | `/feedback/generate` | Generar retroalimentación del estudiante autenticado | Privado | ❌ | ✅ |
| GET | `/course-analysis/latest/:id_curso` | Consultar el último análisis de un curso propio | Privado | ✅ | ❌ |
| POST | `/course-analysis/generate` | Generar análisis de un curso propio | Privado | ✅ | ❌ |
| POST | `/api/chat/session` | Crear una sesión de chat | Privado | ✅ | ✅ |
| DELETE | `/api/chat/session/:sessionId` | Eliminar una sesión de chat propia | Privado | ✅ | ✅ |
| POST | `/api/chat` | Consultar al tutor en una sesión propia | Privado | ✅ | ✅ |
| POST | `/api/agent-malvado/generate` | Generar un escenario educativo | Privado | ✅ | ✅ |

## API interna

Puerto configurado con `INTERNAL_PORT`, por defecto `3001`, en un servidor Express separado. Estas rutas no se montan en la API principal. Todas requieren `X-Service-Token` válido o `X-Maintenance-Token` válido; las rutas `/maintenance/*` requieren específicamente el segundo.

Las columnas Docente y Estudiante muestran ❌ porque un JWT de usuario no autoriza estas llamadas. Las credenciales de servicio o mantenimiento son independientes de esos roles.

| Método | Ruta | Función | Acceso | Docente | Estudiante |
|---|---|---|---|:---:|:---:|
| POST | `/internal/v1/operations/:id/attach` | Vincular una ejecución de n8n a una operación | Privado | ❌ | ❌ |
| POST | `/internal/v1/operations/:id/model` | Ejecutar una llamada al modelo para una operación autorizada | Privado | ❌ | ❌ |
| POST | `/internal/v1/operations/:id/retrieve` | Recuperar conocimiento para una operación autorizada | Privado | ❌ | ❌ |
| POST | `/internal/v1/knowledge/sync-start` | Iniciar una ronda de sincronización | Privado | ❌ | ❌ |
| POST | `/internal/v1/knowledge/sync-end` | Finalizar una ronda de sincronización | Privado | ❌ | ❌ |
| POST | `/internal/v1/knowledge/document` | Almacenar un documento de conocimiento | Privado | ❌ | ❌ |
| POST | `/internal/v1/knowledge/withdraw` | Retirar un documento de conocimiento | Privado | ❌ | ❌ |
| POST | `/internal/v1/knowledge/inventory` | Procesar el inventario de conocimiento | Privado | ❌ | ❌ |
| GET | `/internal/v1/knowledge/known` | Listar documentos conocidos de Drive | Privado | ❌ | ❌ |
| POST | `/internal/v1/knowledge/unit` | Procesar una unidad de indexación | Privado | ❌ | ❌ |
| GET | `/internal/v1/maintenance/status` | Consultar el estado operativo | Privado | ❌ | ❌ |
| POST | `/internal/v1/maintenance/pause` | Pausar la coordinación de integraciones | Privado | ❌ | ❌ |
| POST | `/internal/v1/maintenance/resume` | Reanudar la coordinación de integraciones | Privado | ❌ | ❌ |
| POST | `/internal/v1/maintenance/resolve-uncertain` | Resolver manualmente operaciones de estado incierto | Privado | ❌ | ❌ |
| POST | `/internal/v1/maintenance/preparation` | Guardar el estado de preparación del entorno | Privado | ❌ | ❌ |

## Condiciones de acceso

- La tabla describe las comprobaciones implementadas en el backend. Los permisos de las pantallas del frontend no restringen por sí mismos las llamadas HTTP.
- Las rutas de grupos y progreso no usan middleware de autenticación. Por eso figuran como Público con ✅ para ambos roles, aunque su función esté asociada a docentes o estudiantes. Retirar un estudiante compara el `id_profesor` enviado en el cuerpo con el propietario del curso, pero no autentica a quien lo envía.
- Las rutas privadas de la API principal usan `Authorization: Bearer <token>`. El middleware verifica firma, expiración, instalación, existencia de la cuenta, correo confirmado y correspondencia del perfil con el rol.
- `/auth/profesor/:id/estudiantes` exige rol profesor y que `:id` coincida con el docente autenticado. El análisis de curso exige rol profesor y propiedad del curso.
- La retroalimentación exige rol estudiante y utiliza su identidad autenticada; rechaza un `id_estudiante` ajeno cuando se proporciona.
- Intentos y chat admiten ambos roles, pero las consultas y modificaciones de intentos y sesiones requieren que pertenezcan al usuario autenticado.
- Público indica que no se exige sesión: el registro valida los datos, el inicio de sesión exige credenciales y la confirmación y el cambio de contraseña requieren sus tokens específicos.
- Las operaciones internas `attach`, `model` y `retrieve` también validan el permiso de la operación y su identificador. La sincronización aplica sus permisos y reglas de estado correspondientes.
- Los segmentos que empiezan con `:` son parámetros variables. Los parámetros de consulta y cuerpos JSON no crean rutas adicionales.
- La API principal devuelve 404 para rutas no registradas; no hay un endpoint `GET /`. Este inventario enumera métodos explícitos: no cuenta el `HEAD` implícito de Express ni las respuestas `OPTIONS` de CORS.

## Fuentes

- [Montaje de servidores y routers](../../apps/backend/src/server.ts).
- [Autenticación y roles](../../apps/backend/src/auth/infrastructure/middlewares/authMiddleware.ts).
- [Identidad](../../apps/backend/src/auth/infrastructure/controllers/AuthController.ts), [progreso](../../apps/backend/src/auth/infrastructure/controllers/ProgresoController.ts) y [grupos](../../apps/backend/src/groups/infrastructure/controller/GroupsController.ts).
- [Intentos](../../apps/backend/src/attempt/infrastructure/AttemptController.ts).
- [Chat, escenarios, retroalimentación, análisis y API interna](../../apps/backend/src/integrations/routes.ts).

Consultar también [rutas del frontend](rutas-frontend.md) y [arquitectura del backend](backend.md).
