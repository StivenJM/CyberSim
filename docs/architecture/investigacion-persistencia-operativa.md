# Persistencia operativa de CyberSim: revisión de la base adicional

Esta referencia conserva las alternativas, riesgos, fuentes y justificaciones que sustentan el sistema. Sus conclusiones se concretan en el [contrato vigente](contrato-desarrollo-docker.md) y los [ADRs](../project/adrs/README.md).

Para consultar lo incorporado al código, las verificaciones y los límites actuales, usar el [estado del entorno](../project/estado-desarrollo-docker.md). Los pendientes que aparecen en el informe original corresponden a su fecha de investigación; las decisiones vigentes están en [D01–D26](../project/decisiones-desarrollo-docker.md).

## Investigación y evidencia conservadas

El contenido original permanece completo, incluidas las opciones retiradas y el motivo de su sustitución.

<details>
<summary>Leer el informe original y todas sus referencias</summary>

Los textos siguientes conservan el contexto de su elaboración. Sus pendientes y expresiones de futuro describen esa revisión histórica; el estado vigente es el indicado arriba. No son instrucciones actuales de ejecución.

# Persistencia operativa de CyberSim: revisión de la base adicional

> Cierre posterior: [contrato v1 C02–C05](contrato-desarrollo-docker.md) y [ADR 0009](../project/adrs/0009-contrato-tecnico-desarrollo-docker.md) concretan cuatro modelos funcionales, revisión única y recuperación. El informe siguiente conserva alternativas y razones anteriores; el diseño ya está especificado, sin implementación.

- Fecha: **18 de octubre de 2026**.
- Base revisada: `8de71f5` y documentación local de la planificación Docker.
- Estado: **investigación y recomendación corregida; sin implementación**.
- Sustituye la recomendación de crear `cybersim_dev_control` del apartado I10 de la [investigación integral](investigacion-integral-desarrollo-docker.md).
- Criterio del usuario: no incorporar una dependencia funcional exclusiva de desarrollo; si el estado pertenece a la aplicación, mantener un contrato y ciclo de vida estables entre entornos. Se registra como D26 en la [planificación](../project/decisiones-desarrollo-docker.md).
- Precisión posterior: [auditoría final H01–H03](auditoria-desarrollo-docker.md). El manifiesto sería la autoridad única de revisiones físicas y firma de embeddings; la admisión global y la barrera tras reset requieren contratos explícitos. Estas precisiones siguen siendo propuestas.

## Resultado

**Recomiendo retirar la base adicional `cybersim_dev_control`.** La sincronización del conocimiento y el seguimiento de operaciones son responsabilidades de CyberSim cuando esas funciones se utilizan, con independencia de Docker o nodemon. El estado durable mínimo que necesiten debe pertenecer a la base PostgreSQL de la aplicación y mantenerse con el historial Prisma existente. La preparación específica de Docker no justifica una segunda base funcional.

No se propone renombrar esa base a `cybersim_control`: cambiar el nombre mantendría innecesariamente otro destino, permisos, creación y migraciones. Tampoco se propone almacenar todo en una tabla genérica de configuración. Hay que separar datos funcionales, detalles internos de n8n y diagnósticos de preparación.

Esta recomendación permite que el mismo código y migraciones operen contra una PostgreSQL local o externa. **Cada entorno tiene sus propios datos y credenciales**; paridad no significa compartir la base local con producción. No se está diseñando su despliegue ni cambiando las decisiones aceptadas sobre n8n o conversaciones.

## Qué fallaba en la propuesta anterior

La propuesta agrupaba bajo una misma base tres clases de información: preparación Docker, manifiestos del conocimiento y coordinación de operaciones. Además, justificaba su separación en parte para sobrevivir a resets de Prisma. Eso mezclaba comodidad del entorno con persistencia funcional.

Que el problema se observe al reiniciar nodemon no lo hace específico de desarrollo: un proceso también puede reiniciarse por actualizaciones o fallos. Si una función necesita conocer una operación pendiente o la revisión publicada para actuar correctamente, ese requisito corresponde a la aplicación. En cambio, saber si ya se descargó una imagen no debe convertirse en una tabla de la aplicación.

No existe evidencia en este repositorio de un requisito de separación de cargas, equipo propietario diferente o recuperación independiente que justifique otra base PostgreSQL para este estado. La protección de credenciales y estado interno n8n ya se resuelve con su almacenamiento propio según D15; no exige una segunda base de CyberSim.

## Prácticas publicadas que orientan la decisión

| Fuente | Recomendación publicada | Aplicación a CyberSim, inferida en esta revisión |
|---|---|---|
| [Twelve-Factor: paridad](https://www.12factor.net/dev-prod-parity) | Reducir diferencias entre entornos, incluidos servicios de datos | No diseñar una persistencia funcional especial que se omita al desplegar la misma función |
| [Twelve-Factor: procesos administrativos](https://www.12factor.net/admin-processes) | Mantenimiento/migraciones como procesos de la misma versión de aplicación | Usar herramientas y migraciones versionadas, no SQL manual distinto para la base de control |
| [Evolutionary Database Design](https://martinfowler.com/articles/evodb.html), Pramod Sadalage y Martin Fowler | Versionar cambios de base junto al código y aplicarlos mediante migraciones | Extender el historial Prisma que CyberSim ya tiene |
| [AWS: idempotencia](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Identidad explícita y control de efectos repetidos | Conservar un registro mínimo de operación; no confiar únicamente en la memoria del proceso |
| [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html), Chris Richardson | Guardar intención y cambios relacionados en una transacción local; considerar duplicados en la entrega | Favorecer un único almacén para los cambios que deban confirmarse juntos; no introducir un outbox automáticamente |

Estas fuentes fundamentan principios y patrones; ninguna prescribe las tablas concretas de CyberSim ni demuestra que una base única sea correcta para todo sistema. Aquí la elección se apoya también en que hay un backend, PostgreSQL y un historial de migraciones existentes.

## Alternativas comparadas

| Opción | Ventajas | Costes o límites | Selección |
|---|---|---|---|
| Base exclusiva `cybersim_dev_control` | Conserva metadatos fuera del reset educativo | Diferencia artificial de entorno y segundo ciclo de vida | **Retirada** |
| Otra base neutral `cybersim_control` en todos los entornos | Separación por credenciales/backup/carga | Más provisión, conexiones, migraciones y coordinación entre bases | No justificada actualmente |
| Misma base, otro schema PostgreSQL | Organización y permisos por namespace | Requiere declarar multi-schema y gestionar alcance de migraciones; no garantiza inmunidad al reset | Posible evolución, no necesaria ahora |
| Misma base y schema actual, tablas funcionales específicas | Reutiliza Prisma, transacciones, backups y configuración | Reset de desarrollo también elimina esos datos | **Recomendada** |
| Datos persistidos solo dentro de n8n | Evita algunas tablas de aplicación | Acopla al backend con estado propio de workflows y otro almacén para las transacciones funcionales | Reservar para datos internos de n8n |
| Archivos JSON/RAM | Simples para diagnósticos locales | Sin las mismas garantías de consulta, concurrencia y transacción; RAM se pierde al reiniciar | Solo estado temporal/no autoritativo |
| Cola PostgreSQL con Graphile Worker/pg-boss | Bibliotecas existentes para trabajos durables | Otra semántica de colas/reintentos además de n8n | No añadir sin un requisito de cola que n8n/coordinación mínima no cubran |

PostgreSQL documenta que un [schema es un namespace con permisos](https://www.postgresql.org/docs/15/ddl-schemas.html), no una base física independiente. Prisma v7 [soporta multi-schema](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/multi-schema), pero introducirlo no elimina el trabajo de migración ni convierte el namespace en una copia de seguridad. CyberSim actualmente declara una datasource PostgreSQL sin multi-schema; mantener esa estructura reduce cambios.

Se revisaron también los [datos estáticos de workflows](https://docs.n8n.io/code/cookbook/builtin/get-workflow-static-data/), documentados como experimentales y con limitaciones de frecuencia, y [Data Tables de n8n](https://docs.n8n.io/data/data-tables/), que sí ofrecen persistencia mediante nodos/API. Data Tables es una alternativa válida para marcadores propios de workflows; no es necesario duplicar allí la autoridad sobre operaciones de CyberSim ni escribir en tablas privadas del SQLite n8n.

[Graphile Worker](https://worker.graphile.org/docs/schema) separa tablas privadas del motor y datos de seguimiento que pertenecen a la aplicación. Sus [API de trabajos](https://worker.graphile.org/docs/sql-add-job) y [pg-boss](https://github.com/timgit/pg-boss) muestran que usar PostgreSQL para trabajos no obliga a crear otra base. Son referencias comparadas, no dependencias elegidas ni una promesa de ejecución exactamente una vez de las llamadas a OpenAI.

## Qué datos conservar y quién es su dueño

Los siguientes nombres son propuestas de modelo, no tablas creadas ni esquema final aprobado:

| Información | Propietario y almacenamiento propuesto | Motivo |
|---|---|---|
| Identidad/revisión/hash de documento y retirada confirmada | CyberSim, `documento_conocimiento` en su PostgreSQL | Evitar duplicados, reconocer cambios y excluir conocimiento retirado |
| Conjunto publicado, configuración de embeddings y revisiones pendientes | CyberSim, `revision_indice_conocimiento` | Autoridad única propuesta de revisión física/firma de embeddings; no depender de una segunda conmutación autoritativa de aliases Qdrant |
| Identidad/estado de operación, vínculo a ejecución n8n, plazos y deduplicación | CyberSim, `operacion_integracion` | Correlacionar solicitudes, resultados y efectos; arbitrar D23 tras reinicios |
| Workflows, credenciales, tokens OAuth y ejecuciones internas | n8n, mediante su almacenamiento y APIs soportadas | No duplicar ni modificar su SQLite internamente |
| Vectores y payloads de búsqueda | Qdrant | Índice derivado que debe corresponder con documentos/revisiones validados |
| Estado de descarga/build, salida de preflight y acta local de verificación | Procesos de preparación, logs/artefactos descartables | No son registros funcionales ni autoridad suficiente para marcar listo |
| Conversación temporal del tutor | RAM y estado del navegador según D22 | Esta revisión no incorpora persistencia de conversaciones |

No almacenar automáticamente todos los checkpoints de Docker ni copiar el historial completo de ejecución de n8n a PostgreSQL. Persistir únicamente lo necesario para el contrato funcional. La tabla de operaciones no se convierte en un motor genérico de workflows: n8n sigue siendo quien ejecuta la lógica elegida en D03.

El backend sería propietario de las escrituras funcionales y de su validación; n8n le comunica resultados/progreso con identidad de operación mediante contratos internos. Esto no mueve la lógica de feedback, análisis o ingestión fuera de n8n. Mantener una sola autoridad por dato evita que cada componente decida por su cuenta qué revisión está activa.

## Creación y mantenimiento estables

Recomiendo un solo historial de migraciones para la base de CyberSim:

1. Modelar las tablas funcionales mínimas en el [schema existente](../../apps/backend/prisma/schema.prisma), con constraints e índices y sin condición `NODE_ENV` que las omita.
2. Crear y revisar migraciones SQL dentro de [la carpeta existente](../../apps/backend/prisma/migrations), junto al código y pruebas que las necesitan. Una instalación vacía y una actualizada deben llegar al mismo esquema compatible.
3. Aplicar las migraciones versionadas mediante el script existente `npm run migrate:deploy --workspace @cybersim/backend`. No se ejecutó ahora. Para generar nuevas migraciones se mantiene el flujo explícito de desarrollo.
4. Generar el cliente Prisma como etapa separada; `migrate deploy` no lo hace ni certifica ausencia de drift. Comprobar destinos de `DIRECT_URL` y `DATABASE_URL` antes de operar.
5. Crear filas funcionales al necesitarlas, de forma repetible; no insertar metadatos de documentos privados ni operaciones ficticias en el seed. Los usuarios de demostración siguen separados de la estructura obligatoria.
6. Aplicar cambios de estructura con el mismo mecanismo en cualquier entorno que ejecute estas funciones, contra su propia base. Cómo se ejecutará ese paso en un futuro despliegue queda fuera del alcance actual.

La [guía Prisma v7](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production) distingue creación y aplicación de migraciones; el [CLI v7](https://www.prisma.io/docs/orm/v7/reference/prisma-cli-reference) documenta sus límites. No usar scripts `CREATE TABLE IF NOT EXISTS` dispersos al iniciar la API como segunda fuente del esquema. Grants, índices especiales o SQL que Prisma no represente también deben quedar versionados y revisados.

Compartir PostgreSQL permite confirmar estado funcional y resultado en una transacción local cuando corresponda. No hace transaccionales las llamadas HTTP, Qdrant o el envío SMTP. La [documentación de transacciones Prisma v7](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions) permite componer cambios locales; no mantener una transacción abierta mientras responde OpenAI.

## Qué ocurre con un reset manual de desarrollo

La recomendación anterior prometía mantener el control fuera del reset educativo. Esa separación no estaba aceptada por el usuario y **se retira**: un reset dirigido al schema de CyberSim también elimina sus nuevas tablas funcionales y las recrea mediante migraciones. Es coherente con aceptar resetear los datos de desarrollo; no se diseña otra base solo para evitarlo.

El [reset Prisma v7](https://www.prisma.io/docs/cli/v7/migrate/reset) borra/recrea la base/schema correspondiente y reaplica migraciones; el seed debe ejecutarse explícitamente. No se ejecuta ahora ni se añade un reset automático al arranque.

Como n8n y Qdrant tienen almacenamiento independiente, después del reset podrían seguir existiendo una ejecución antigua y vectores que ya no tienen manifiesto en PostgreSQL. La futura implementación debe:

- Antes del reset previsto, detener admisión de operaciones y sincronización, y comprobar la finalización/cancelación de lo activo. El comando directo de Prisma no coordina esos procesos por sí solo.
- Al detectar manifiestos ausentes o una identidad de instalación distinta, marcar el conocimiento como pendiente de reconciliar y no aceptar callbacks/resultados de operaciones desconocidas.
- No confiar en aliases Qdrant o marcadores n8n antiguos como prueba de validez; inventariar fuentes, aplicar retiradas confirmadas y reconstruir/validar el estado correspondiente antes de habilitar recuperación.
- No volver a ejecutar peticiones antiguas de IA como efecto del reset ni restaurar automáticamente datos educativos desde n8n.
- Conservar SQLite y credenciales n8n conforme D15. Mantener esos archivos no garantiza que un workflow antiguo pueda continuar contra datos educativos reseteados.

Un reset ejecutado sin parar trabajo activo exige tratar el entorno como inconsistente y bloquear efectos tardíos mientras se reconcilia. La prueba de esa recuperación forma parte del trabajo futuro; no se afirma que el sistema actual ya detecte resets o tenga fencing.

## Coordinación sin diseñar otro motor de trabajos

Se conserva D23: una operación IA activa globalmente, una interactiva esperando y prioridad al usuario al terminar la unidad de fondo en curso. Las llamadas directas del backend y los workflows incluidos deben usar el mismo contrato.

Un registro durable con identificador y transición condicional de estado ayuda a arbitrar el turno y rechazar confirmaciones tardías. No basta con guardar `running=true`, ni con un lock que desaparece al reiniciar, ni con expirar un plazo y suponer que OpenAI dejó de procesar. Mantener estados `pendiente`, `en_curso`, `completada`, `fallida` e `incierta`, con identidad de operación/ejecución y transacciones cortas; los detalles de constraints se revisarán antes de implementar.

No proponer aquí un sistema completo de retries, scheduling, dead-letter queues y replay. Si durante la implementación el requisito exige uno, comparar una biblioteca madura con las capacidades de n8n en lugar de ampliarlo silenciosamente. Se mantienen los límites de [concurrencia n8n](https://docs.n8n.io/hosting/scaling/concurrency-control/): no abarcan todas las ejecuciones ni llamadas externas del backend.

## Criterios de validación futura

| Prueba | Resultado necesario |
|---|---|
| Base vacía y base existente | Mismo historial Prisma crea/actualiza las tablas funcionales; no requiere otra base de control |
| Cambio entre configuración local y otra PostgreSQL de prueba | El mismo código no depende de `cybersim_dev_control` ni de un modo exclusivo de desarrollo |
| Reinicio backend durante ejecución n8n | Reconciliación de la operación registrada, sin duplicar efectos ni admitir una operación incompatible |
| Reset manual de una base de prueba | Tablas recreadas, manifiesto pendiente, callbacks anteriores rechazados y n8n privado conservado |
| Qdrant persiste después del reset | No habilitar búsquedas sobre conocimiento sin validar por conservar vectores |
| Fallo entre SQL y publicación Qdrant | Detectar diferencia y resolver mediante protocolo; no atribuir atomicidad distribuida a PostgreSQL |
| Repetición de preparación Docker | Comprueba estado real sin requerir filas especiales de arranque en la base |

## Fuentes y límites

Las fuentes enlazadas se consultaron el 18 de octubre de 2026 y son documentación primaria o publicaciones de sus autores/mantenedores. Las propuestas específicas de tablas, propiedad y recuperación son inferencias para CyberSim. No se crearon bases/tablas, no se editaron archivos Prisma, no se instalaron colas ni se ejecutaron migraciones o resets. Validación de esta entrega: enlaces locales, estructura Markdown y coherencia de las referencias a la propuesta sustituida.

</details>
