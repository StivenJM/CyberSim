# Arquitectura

Documentación técnica del sistema implementado. Para procedimientos de ejecución consultar [las guías](../guides/README.md); para contexto del producto y decisiones consultar [proyecto](../project/README.md).

| Documento | Pregunta que responde |
|---|---|
| [Arquitectura de un vistazo](resumen.md) | ¿Cómo entiendo rápidamente la aplicación con un diagrama Mermaid? |
| [Visión general](vision-general.md) | ¿Qué procesos y servicios componen CyberSim? |
| [Frontend](frontend.md) | ¿Cómo se organizan las pantallas, rutas y estado del cliente? |
| [Simulación ECS](simulacion-ecs.md) | ¿Cómo se construyen escenarios y se ejecutan acciones, eventos y fases? |
| [Backend](backend.md) | ¿Cómo se componen los módulos y sus reglas de aplicación? |
| [API HTTP](api-http.md) | ¿Qué endpoints, entradas, respuestas y protecciones existen? |
| [Modelo de datos](modelo-de-datos.md) | ¿Qué se persiste y qué restricciones garantiza PostgreSQL? |
| [Integraciones e IA](integraciones.md) | ¿Cómo funcionan chat, RAG, voz y webhooks? |
| [Seguridad](seguridad.md) | ¿Dónde están las fronteras de confianza y los controles actuales? |
| [Revisión del sistema](revision-del-sistema.md) | ¿Qué se verificó y qué problemas requieren atención? |

Las decisiones observadas se registran en [ADRs](../project/adrs/README.md). Este índice y las rutas de código usan la estructura actual de npm workspaces `apps/frontend` y `apps/backend`.
