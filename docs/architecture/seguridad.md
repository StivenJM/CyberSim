# Fronteras de confianza y controles actuales

La frontera de seguridad efectiva es Express y sus adaptadores de persistencia. El navegador, sus flags de sesión, sus resultados de simulación y los identificadores recibidos por HTTP son entradas manipulables. Esta documentación registra los controles existentes y las brechas encontradas; no certifica seguridad de un despliegue.

## Matriz de acceso

| Área | Control implementado en servidor | Brecha observada |
|---|---|---|
| `/auth/me` | Verificación JWT | No exige confirmación de correo |
| `/auth/profesor/:id/estudiantes` | JWT, rol profesor, coincidencia con el ID del token | Control localizado, no reutilizado por grupos |
| Registro, login, tokens | bcrypt, firma JWT, tokens aleatorios con expiración | Login emite JWT a cuentas sin confirmar; registro docente público |
| `/progreso` | Validación parcial de campos | No autentica ni comprueba dueño; acepta resultados del cliente |
| `/groups` | Algunas reglas de existencia, código y propiedad declarada | No JWT; IDs ajenos pueden consultar o modificar datos |
| `/feedback`, `/course-analysis` | Campos requeridos; configuración de webhook | Sin JWT, propiedad o límites de generación |
| `/api/chat` y generador | Sesión/prompt y lógica del adaptador | Sin JWT, cuotas o límites de costo; sesiones no vinculadas a cuenta |

CORS limita el origen del navegador a `FRONTEND_URL` cuando `NODE_ENV=production`, pero no autentica a un solicitante HTTP. En desarrollo usa `*`. No hay rate limiting ni middleware de autorización global montado en el servidor.

## Identidad y sesión

Las contraseñas se hashean con bcrypt costo 10. El JWT dura una hora y contiene identidad, rol e ID del perfil. No hay refresh, logout de servidor ni lista de revocación. Cambiar contraseña no invalida tokens ya emitidos.

La UI verifica presencia de `authToken`, rol y `emailConfirmado` en `localStorage`. Esos valores pueden modificarse y no prueban autenticidad ni vigencia. Un script ejecutado en el origen puede acceder al token almacenado. Los guards sirven para navegación; la protección de cada recurso requiere verificación independiente en la API.

Registro exige ocho caracteres, mientras recuperación y formulario de alta permiten seis en sus validaciones respectivas. El formulario puede aceptar una clave que luego rechaza el backend. Recuperación oculta usuarios inexistentes, pero responde distinto a identidades existentes sin confirmar, lo que revela parte del estado de cuenta.

## Integridad y datos educativos

Progreso almacena lo que recibe: ID de estudiante, resultado, tiempo y acciones. No hay replay de eventos en servidor, validación de JSON de acciones o clave de idempotencia. El ranking se calcula sobre estos registros. No usar ese ranking como evidencia inviolable de evaluación.

Los endpoints públicos de grupos exponen nombres, códigos, correos y matrículas. La comparación de propietario en expulsión usa un ID proporcionado por el propio solicitante. Análisis no verifica que el profesor sea dueño del curso y usa el ID de curso devuelto por n8n al persistir.

La regla de matrícula única requiere atomicidad además de autorización: dos solicitudes pueden pasar la misma consulta previa e insertar dos filas. Consultar [modelo de datos](modelo-de-datos.md) y [revisión](revision-del-sistema.md).

## Servicios externos y recursos

OpenAI recibe pregunta, contexto recuperado e historial reciente. n8n recibe identificadores de estudiante/curso o un prompt. Piper recibe el texto generado. La información disponible no permite establecer retención o tratamiento de datos por esos servicios.

Las llamadas externas no tienen timeout explícito. La generación pública y la falta de cuota permiten consumo de recursos fuera de control de una cuenta. La memoria de chat tiene límite de mensajes por sesión, pero no de número total de sesiones activas. Los endpoints públicos de borrado de sesión y estadísticas no verifican al propietario.

Las respuestas n8n y el material RAG son entradas externas. No existe un validador completo de escenario en servidor ni una validación robusta de secciones de feedback. La normalización del frontend mejora compatibilidad; no constituye una frontera de autorización.

## Configuración y operación

Los `.env` y artefactos generados están ignorados. Las plantillas contienen valores de desarrollo; el seed usa cuentas y contraseña conocidas. Compose publica PostgreSQL con credenciales locales. Para un entorno remoto se necesitan secretos propios, HTTPS y políticas de acceso de la infraestructura.

Qdrant reconstruye protocolo a partir de `QDRANT_HTTPS`, no simplemente de la URL. La plantilla combina una URL HTTPS con `QDRANT_HTTPS=false`; debe corregirse en la configuración efectiva del entorno. El generador tiene un webhook externo de respaldo; configurar una URL explícita evita depender de un destino implícito.

Los logs y errores pueden contener mensajes internos de servicios. La API no centraliza redacción, correlación o manejo de errores. El manejador global de tres parámetros no actúa como middleware de errores de Express.

## Orden propuesto de corrección

1. Exigir JWT y correo confirmado donde corresponda; derivar IDs desde la identidad y comprobar propiedad/matrícula en cada recurso.
2. Aplicar límites de generación y aislar sesiones de tutor por identidad.
3. Validar cuerpos y respuestas externas; limitar campos de actualización de cursos.
4. Garantizar matrícula única de forma atómica y registro conjunto de identidad/perfil.
5. Corregir serialización de acciones, limpieza de relojes y señales de salud.
6. Probar casos de acceso cruzado y concurrencia contra PostgreSQL de pruebas.

Estas acciones son propuestas pendientes. El [ADR 0005](../project/adrs/0005-autorizacion-en-servidor.md) documenta la propuesta de autorización; el cambio de documentación no la implementa.

## Evidencia

- [Middleware JWT](../../apps/backend/src/auth/infrastructure/middlewares/authMiddleware.ts) y [montajes Express](../../apps/backend/src/server.ts).
- [Grupos](../../apps/backend/src/groups/infrastructure/controller/GroupsController.ts), [progreso](../../apps/backend/src/auth/infrastructure/controllers/ProgresoController.ts) y [chat](../../apps/backend/src/chat/infrastructure/controllers/ChatController.ts).
- [Sesión del navegador](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/hooks/useAuth.ts), [login](../../apps/backend/src/auth/application/useCases/LoginUseCase.ts) y [registro profesor](../../apps/backend/src/auth/application/useCases/RegisterProfesorUseCase.ts).
- [Plantilla de entorno](../../apps/backend/.env.example), [seed](../../apps/backend/prisma/seed.ts) y [Compose](../../docker-compose.yml).
