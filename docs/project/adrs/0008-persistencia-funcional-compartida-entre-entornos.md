# ADR 0008: Persistencia funcional con el mismo contrato entre entornos

> Actualización de implementación, 18 de octubre de 2026: esta decisión se refleja en [Compose](../../../compose.yaml), [infra](../../../infra), [schema Prisma](../../../apps/backend/prisma/schema.prisma) y [módulo de integraciones](../../../apps/backend/src/integrations). Consultar [estado y límites](../estado-desarrollo-docker.md). Las referencias siguientes a trabajo futuro o pruebas no realizadas conservan el contexto de la revisión original, sin revocar la implementación autorizada después.

- Estado: **Decisión vigente; modelos y migraciones incorporados al repositorio**.
- Fecha: **18 de octubre de 2026**.
- Alcance: persistencia de sincronización y operaciones de CyberSim; no despliegue de producción.
- Origen: el usuario exigió evitar dependencias funcionales exclusivas de desarrollo y pidió investigar la mejor opción. Después encargó cerrar los mecanismos técnicos; la selección se concreta en el contrato v1 y ADR 0009. No se atribuye una aprobación separada de cada campo ni funcionamiento validado.

## Contexto

La investigación Docker propuso `cybersim_dev_control` para agrupar preparación, sincronización y operaciones, separada de los resets de Prisma. El usuario cuestionó esa dependencia exclusiva de desarrollo. La [revisión específica](../../architecture/investigacion-persistencia-operativa.md) distingue estado funcional, datos internos n8n y preparación local, y compara alternativas de almacenamiento/mantenimiento.

## Decisión

La propuesta histórica queda concretada como selección de diseño en el [contrato v1 C02](../../architecture/contrato-desarrollo-docker.md) y el [ADR 0009](0009-contrato-tecnico-desarrollo-docker.md). Esas referencias fijan los cuatro modelos mínimos, incluido el singleton funcional, y su ciclo de vida; el esquema está definido en Prisma y en las migraciones versionadas.

- Retirar la recomendación de crear `cybersim_dev_control`; no limitarse a cambiarle el nombre.
- Persistir solo el estado funcional necesario de documentos/revisiones/operaciones en tablas específicas de la base PostgreSQL de CyberSim, con Prisma y el historial de migraciones existente.
- Conservar el mismo contrato de datos y migraciones en cada entorno donde se ejecuten esas funciones, sin compartir datos o credenciales entre entornos.
- Mantener workflows, credenciales y ejecuciones internas bajo la administración n8n; no modificar sus tablas privadas ni duplicar su motor de workflows.
- Mantener preflight, descarga/build y diagnósticos de Docker como procesos/artefactos de preparación, sin crearles una base funcional.
- Mantener memoria temporal del tutor D22 y las políticas D15/D23. No incorporar Redis ni otra cola por esta revisión.
- Según la [auditoría final H01–H03](../../architecture/auditoria-desarrollo-docker.md), concretar la selección única de revisión/firma en SQL, admisión común de operaciones y rechazo de resultados anteriores al reset. No usar SQL y aliases Qdrant como dos autoridades independientes. El mecanismo está representado en el coordinador y el módulo de conocimiento; sus casos de fallo deben contrastarse con la evidencia de aceptación.

## Consecuencias

Hay una sola datasource e historia de migraciones de CyberSim que mantener. El esquema incorpora coordinación, operaciones, documentos y revisiones; su creación usa el historial Prisma existente.

Un reset manual del schema de CyberSim también elimina este estado funcional. Se retira la garantía propuesta de conservarlo en una segunda base: tras reset, será necesario reconciliar n8n/Qdrant y rechazar operaciones anteriores antes de habilitar funciones afectadas. SQLite y credenciales n8n permanecen independientes conforme D15. No ejecutar resets automáticamente.

La misma persistencia podrá utilizarse contra PostgreSQL local o externa. Esto define compatibilidad de la aplicación, sin elegir hosting, despliegue o topología de producción. Si aparecen requisitos de aislamiento o una cola durable completa, revisar la decisión con evidencia, no añadir infraestructura por comodidad de desarrollo.

## Alternativas

Se compararon otra base neutral compartida entre entornos, schema PostgreSQL separado, Data Tables/static data de n8n, archivos/RAM y bibliotecas de colas PostgreSQL. La base/schema separados no se justifican solo para sobrevivir al reset de desarrollo; las otras alternativas no sustituyen por sí mismas la autoridad transaccional de los datos funcionales. El informe conserva fuentes, ventajas y límites.

## Evidencia de la revisión original

Revisión documental y de Prisma/código existentes, con investigación web. No hay implementación ni prueba runtime. Requerir migración desde cero y actualización, reinicios, reset de base de prueba, callbacks tardíos y reconciliación con Qdrant/n8n antes de aceptar el funcionamiento.
