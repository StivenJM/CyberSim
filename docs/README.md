# Documentación de CyberSim

Esta documentación describe el código revisado el **13 de octubre de 2026**, sobre la revisión `cc0c9cb`. La versión declarada de los workspaces es `5.0.0`. Los archivos de código y configuración enlazados son la evidencia de cada descripción; las propuestas pendientes se identifican expresamente.

## Organización

| Carpeta | Contenido | Entrada |
|---|---|---|
| `architecture/` | Diseño técnico, módulos, contratos HTTP, datos, seguridad e informe de revisión | [Arquitectura](architecture/README.md) |
| `guides/` | Procedimientos para usuarios, desarrolladores, operadores y asistentes de IA | [Guías](guides/README.md) |
| `project/` | Propósito, alcance, reglas funcionales, vocabulario y riesgos del proyecto | [Proyecto](project/README.md) |
| `project/adrs/` | Registros de decisiones de arquitectura, con contexto y consecuencias | [ADRs](project/adrs/README.md) |

## Por dónde empezar

- Para una lectura rápida de la aplicación: [resumen de arquitectura con Mermaid](architecture/resumen.md).
- Para entender el producto: [visión del proyecto](project/vision-y-alcance.md) y [reglas funcionales](project/reglas-funcionales.md).
- Para definir y trazar trabajo: [requisitos](project/requisitos.md) e [historias HU001–HU025](project/historias-de-usuario.md).
- Para ejecutarlo: [desarrollo local](guides/desarrollo-local.md) y [configuración](guides/configuracion.md).
- Para usarlo: [guía de estudiantes y docentes](guides/uso-del-sistema.md).
- Para modificarlo: [visión técnica](architecture/vision-general.md), [mantenimiento](guides/mantenimiento.md) y [creación de escenarios](guides/escenarios.md).
- Para evaluar su estado: [informe de revisión](architecture/revision-del-sistema.md), [seguridad](architecture/seguridad.md) y [riesgos y pendientes](project/riesgos-y-pendientes.md).

## Convenciones

Los documentos técnicos explican **qué existe y cómo funciona**; las guías explican **cómo realizar una tarea**; los documentos de proyecto explican **para qué existe y qué reglas deben preservar sus cambios**. Un ADR registra una decisión y sus consecuencias, aunque su implementación esté detallada en `architecture/`.

El catálogo de HUs y el resumen visual se añadieron el 14 de octubre de 2026. La numeración parte de HU001 por acuerdo con el usuario; una historia definida no equivale a una historia aceptada/completada. Mermaid es el formato preferido para diagramas de estructura, relaciones y flujos que faciliten la lectura.

Las descripciones de comportamiento actual no equivalen a garantías de producción. El informe distingue revisión estática, pruebas ejecutadas y servicios externos no verificados. La fecha de un ADR retrospectivo es la fecha de documentación, no una fecha supuesta de aprobación.

Cuando cambie un contrato, escenario, regla o dependencia, actualizar su documento junto con el código. [La guía de mantenimiento](guides/mantenimiento.md) indica qué páginas revisar para cada cambio.
