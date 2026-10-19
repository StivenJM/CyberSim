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
| [Entorno Docker](desarrollo-docker.md) | ¿Cómo se conectan servicios, estado persistido y proveedores externos? |
| [Evaluación de Docker para desarrollo local](evaluacion-desarrollo-local-docker.md) | ¿Qué riesgos y alternativas fundamentaron las decisiones actuales? |
| [Investigación de versionado de workflows n8n](investigacion-versionado-workflows-n8n.md) | ¿Qué alternativas existen para D06 y por qué se recomienda actualización explícita? |
| [Segunda revisión del arranque Docker](revision-detallada-arranque-docker.md) | ¿Qué condiciones de fallo originaron D15–D18 y cómo se analizaron? |
| [Investigación integral de desarrollo Docker](investigacion-integral-desarrollo-docker.md) | ¿Qué alternativas se compararon para los diez pendientes y qué se recomienda para CyberSim? |
| [Revisión de persistencia operativa](investigacion-persistencia-operativa.md) | ¿Por qué se retira la base exclusiva de desarrollo y cómo mantener el estado funcional con Prisma? |
| [Auditoría de decisiones Docker](auditoria-desarrollo-docker.md) | ¿Qué fundamento, debilidad y corrección tiene cada decisión D01–D26 y cada uno de los 171 elementos concretos? |
| [Contrato técnico Docker v1](contrato-desarrollo-docker.md) | ¿Qué contratos, límites y garantías rigen el entorno y cuál es su evidencia ejecutable? |

Las decisiones observadas se registran en [ADRs](../project/adrs/README.md). Este índice y las rutas de código usan la estructura actual de workspaces de pnpm `apps/frontend` y `apps/backend`.
