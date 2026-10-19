# Documentación de CyberSim

## Empieza aquí

Estas dos páginas reúnen la información necesaria para comprender CyberSim y comenzar a desarrollar:

| **1. Entiende el sistema** | **2. Inícialo desde cero** |
|---|---|
| **[Resumen de CyberSim](architecture/resumen.md)** | **[Guía de primer arranque para desarrolladores](guides/desarrollo-local.md)** |
| Qué hace la aplicación, cómo se conectan sus componentes, dónde están el código y los datos, y cómo trabajar sobre ella. Incluye el diagrama Mermaid. | Requisitos, obtención del proyecto, configuración inicial, arranque Docker, credenciales externas, comprobación del entorno y primer cambio. |

Lee primero el resumen y sigue después la guía si aún no tienes el entorno preparado. Las referencias siguientes amplían temas concretos cuando los necesites.

## Consulta opcional

| Si necesitas… | Consulta |
|---|---|
| Modificar escenarios o reglas de simulación | [Escenarios](guides/escenarios.md) y [motor ECS](architecture/simulacion-ecs.md) |
| Investigar un módulo, contrato o integración | [Índice técnico](architecture/README.md) y [arquitectura Docker](architecture/desarrollo-docker.md) |
| Ejecutar checks o mantener el proyecto | [Pruebas y calidad](guides/pruebas-y-calidad.md) y [mantenimiento](guides/mantenimiento.md) |
| Comprender requisitos y comportamiento de usuarios | [Proyecto](project/README.md), [HUs](project/historias-de-usuario.md) y [uso del sistema](guides/uso-del-sistema.md) |
| Saber por qué se eligió una solución | [Decisiones D01–D26](project/decisiones-desarrollo-docker.md), [ADRs](project/adrs/README.md) y [auditoría](architecture/auditoria-desarrollo-docker.md) |
| Consultar evidencia, límites y configuración pendiente | [Estado del entorno](project/estado-desarrollo-docker.md), [riesgos](project/riesgos-y-pendientes.md) y [revisión del sistema](architecture/revision-del-sistema.md) |

## Organización

| Carpeta | Contenido | Entrada |
|---|---|---|
| `architecture/` | Diseño técnico, módulos, contratos HTTP, datos, seguridad e informe de revisión | [Arquitectura](architecture/README.md) |
| `guides/` | Procedimientos para usuarios, desarrolladores, operadores y asistentes de IA | [Guías](guides/README.md) |
| `project/` | Propósito, alcance, reglas funcionales, vocabulario y riesgos del proyecto | [Proyecto](project/README.md) |
| `project/adrs/` | Registros de decisiones de arquitectura, con contexto y consecuencias | [ADRs](project/adrs/README.md) |

## Base de la documentación

Las páginas Docker y el resumen se actualizaron el **18 de octubre de 2026** desde el código local. Versión declarada: `5.0.0`. Los informes fechados conservan el alcance de su revisión y sus justificaciones; no sustituyen la referencia vigente. El [contrato C01–C12](architecture/contrato-desarrollo-docker.md) mantiene el detalle de los requisitos técnicos.

## Convenciones

Los documentos técnicos explican **qué existe y cómo funciona**; las guías explican **cómo realizar una tarea**; los documentos de proyecto explican **para qué existe y qué reglas deben preservar sus cambios**. Un ADR registra una decisión y sus consecuencias, aunque su implementación esté detallada en `architecture/`.

El catálogo de HUs y el resumen visual se añadieron el 14 de octubre de 2026. La numeración parte de HU001 por acuerdo con el usuario; una historia definida no equivale a una historia aceptada/completada. Mermaid es el formato preferido para diagramas de estructura, relaciones y flujos que faciliten la lectura.

Las descripciones de comportamiento actual no equivalen a garantías de producción. El informe distingue revisión estática, pruebas ejecutadas y servicios externos no verificados. La fecha de un ADR retrospectivo es la fecha de documentación, no una fecha supuesta de aprobación.

Cuando cambie un contrato, escenario, regla o dependencia, actualizar su documento junto con el código. [La guía de mantenimiento](guides/mantenimiento.md) indica qué páginas revisar para cada cambio.
