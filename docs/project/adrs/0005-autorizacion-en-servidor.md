# ADR 0005: Autorización de recursos desde identidad autenticada

- Estado: **Propuesta; no implementada en esta documentación**.
- Fecha de documentación: 2026-10-13.
- Base revisada: `cc0c9cb`.
- Alcance: progreso, cursos, matrículas, feedback, análisis, chat y generador.
- Origen: hallazgos H-01 a H-03 de la revisión.
- Aprobación: pendiente; no se asignan responsables o plazos.
- Cierre parcial posterior, 18 de octubre: el usuario encargó concretar la autorización limitada de los recorridos de IA en el [contrato Docker v1 C06](../../architecture/contrato-desarrollo-docker.md) y [ADR 0009](0009-contrato-tecnico-desarrollo-docker.md). El resto de esta propuesta transversal sigue fuera de ese alcance; no se declara implementado.

## Contexto

Solo dos rutas de auth aplican JWT y una de ellas autorización docente. Otros endpoints reciben IDs sin autenticar al solicitante. Los guards de navegador son modificables, la API expone datos educativos y la generación puede consumir servicios externos sin control por cuenta.

## Decisión propuesta

Exigir JWT válido y confirmación de cuenta en áreas educativas/generación. Obtener identidad y rol de información verificada por el servidor. Para operaciones propias, derivar ID del token y rechazar identificadores incompatibles. Para consultas/modificaciones docentes, comprobar propiedad del curso y relación con estudiante.

Mantener públicas solo las rutas que lo necesitan por su función, como registro/login y consumo de tokens de correo, con límites adecuados. Aislar sesiones de chat por cuenta, proteger borrado/estadísticas y definir cuotas de generación. Conservar una respuesta de autorización consistente y actualizar consumidores para enviar Bearer.

El mecanismo concreto de incorporación docente y visibilidad del ranking debe alinearse con las decisiones de proyecto pendientes. Autorizar progreso no demuestra autenticidad de todas las acciones simuladas; esa es otra decisión de validación de resultados.

## Consecuencias

Reduce lectura/modificación cruzada y permite atribuir uso de IA. Requiere actualizar llamadas frontend que hoy no envían token, casos de uso y tests. Varios datos obtenidos para ranking deben limitarse al grupo del solicitante. El paso de UI a API debe preservar una experiencia clara cuando el token venza.

## Alternativas

Proteger solo pantallas no cubre solicitudes directas. Restringir por CORS tampoco autentica usuarios. Una autorización global única sin ownership deja acceso entre cuentas. La propuesta combina verificación de identidad con controles por recurso y función.

## Criterios para aceptar e implementar

1. Endpoints educativos rechazan solicitudes sin token o con token inválido/expirado.
2. Cuentas sin confirmar no acceden a recursos que exigen confirmación.
3. Estudiante no escribe ni lee actividad privada de otro; docente no modifica grupos ajenos.
4. Expulsión y análisis utilizan identidad comprobada, no un ID de profesor declarado en body.
5. Chat no permite borrar sesiones ajenas y el uso de generación tiene límites verificables.
6. UI envía credenciales y maneja 401/403 sin perder silenciosamente resultados.
7. Tests de acceso cruzado verifican API y relaciones reales o repositorios de prueba, además de navegación.

## Evidencia

[Middleware existente](../../../apps/backend/src/auth/infrastructure/middlewares/authMiddleware.ts), [router de grupos](../../../apps/backend/src/groups/infrastructure/controller/GroupsController.ts), [progreso](../../../apps/backend/src/auth/infrastructure/controllers/ProgresoController.ts), [chat](../../../apps/backend/src/chat/infrastructure/controllers/ChatController.ts) y [seguridad](../../architecture/seguridad.md). Esta propuesta no sustituye los ADRs observados; agrega una frontera de acceso pendiente.
