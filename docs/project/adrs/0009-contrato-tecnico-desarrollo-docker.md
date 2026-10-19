# ADR 0009: Contrato técnico v1 para desarrollo con Docker

> Actualización de implementación, 18 de octubre de 2026: esta decisión se refleja en [Compose](../../../compose.yaml), [infra](../../../infra), [schema Prisma](../../../apps/backend/prisma/schema.prisma) y [módulo de integraciones](../../../apps/backend/src/integrations). Consultar [estado y límites](../estado-desarrollo-docker.md). Las referencias siguientes a trabajo futuro o pruebas no realizadas conservan el contexto de la revisión original, sin revocar la implementación autorizada después.

- Estado: **Contrato vigente; implementación local incorporada, aceptación externa y de recursos pendiente**.
- Fecha: **18 de octubre de 2026**.
- Alcance: cierre de los mecanismos auditados para desarrollo; no despliegue de producción.
- Evidencia del encargo: el usuario pidió terminar la consolidación técnica —publicación, turno global, reset, arranque, cancelación y autorización— y dejó expresamente para después preparación manual y pruebas.

## Contexto

D01–D26 establecen las preferencias y límites del entorno. La auditoría H01–H12 mostró que faltaban mecanismos de coordinación y algunas recomendaciones podían producir estados incompatibles. El usuario delegó concretarlos sin volver a elegir cada detalle interno.

## Selección de diseño

El [contrato Docker v1](../../architecture/contrato-desarrollo-docker.md) es la referencia normativa del sistema; el [cierre de proyecto](../estado-desarrollo-docker.md) identifica consecuencias e hitos.

- PostgreSQL de CyberSim conserva datos funcionales con un solo historial Prisma; revisión/firmas tienen autoridad única y las consultas usan colecciones físicas.
- Un coordinador y transporte de IA en backend arbitran las llamadas incluidas; n8n conserva lógica, prompts e ingestión por contratos internos.
- Identidad de instalación/generación, permiso por operación y rechazo de resultados antiguos protegen reset/reinicio. La pérdida de confirmación remota no se presenta como cancelación demostrada.
- Se concreta autorización de tutor, escenarios, feedback y análisis, propiedad de sesiones/cursos y JWT vinculado a instalación.
- La preparación usa un grafo sin ciclos y estados por capacidad; primer consentimiento/configuración y aceptación de proveedores se separan del comando cotidiano.
- Workflows se administran con API pública n8n y clave local de preparación, con mapa lógico y apply explícito. Se sustituye la recomendación anterior de bootstrap por Server CLI; no cambia D06.
- Piper usa un worker de proceso supervisado, presupuesto acotado y entrega del texto si falla la voz.

No se añade base exclusiva de desarrollo, Redis, otro motor de trabajos, memoria persistente de tutor o proveedores locales que el usuario descartó.

## Consecuencias

Hay un contrato único para mantener, con límites iniciales y pruebas definidas. El singleton de coordinación es estado funcional compartido entre entornos, no una base de preparación Docker. Una API pública administrativa n8n añade una clave inicial que el equipo provisionará después; solo herramientas/preparador la reciben.

Se aceptan costes de coherencia: incertidumbre bloquea admisión hasta reconciliación, revisión preparada consume disco temporal y generación/modelos requieren evaluación. Las capacidades no verificadas se muestran pendientes, sin simular éxito.

La autorización concretada cubre un subconjunto del ADR 0005, que mantiene otras propuestas. Se conserva el alcance del ADR 0006, la política del ADR 0007 y se materializa la selección de persistencia del ADR 0008. No se declara aprobación independiente de cada parámetro ni autorización de implementación por este encargo documental.

## Alternativas y razones

Dos autoridades alias/SQL dejan una frontera de caída; límites independientes de n8n/backend no cumplen globalidad; abortar HTTP no demuestra parar IA o síntesis. CLI offline es una alternativa legítima para n8n, pero requiere coordinar disponibilidad/propietario y acceso al mismo almacenamiento. Para este contrato se elige API pública y bootstrap por elemento con la instancia accesible.

Los informes anteriores conservan investigación y alternativas; cuando discrepen, prevalece el contrato v1. Un cambio posterior de diseño debe explicar la evidencia y actualizar trazabilidad, sin alterar silenciosamente una preferencia del usuario.

## Evidencia de la revisión original

Revisión estática y documental de fuentes/versiones/rutas; checks de enlaces e IDs. Preparación manual, compatibilidad real, recursos y pruebas funcionales quedan diferidos. El siguiente encargo recomendado es B1, infraestructura y edición, sin secretos externos reales ni reset automático.
