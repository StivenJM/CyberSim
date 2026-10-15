---
name: document-system
description: "Crear o actualizar la documentación de CyberSim desde código y configuración en docs/architecture, docs/guides y docs/project, con requisitos e historias de usuario enumeradas, ADRs y un resumen visual Mermaid. Usar para documentar un repositorio, mantener documentación tras cambios o contrastarla con la implementación. No activar para una explicación aislada sin documentación persistente."
---

# Documentar CyberSim

Crear o mantener documentación verificable de este repositorio CyberSim, útil para humanos y asistentes de IA. Respetar el alcance pedido: una actualización puntual no requiere repetir una revisión completa ni crear todas las páginas de un sistema nuevo. Mantener el idioma y las convenciones existentes; si se parte de cero, escribir en el idioma del usuario.

## Contexto de este proyecto

Esta skill pertenece al repositorio CyberSim y se conserva en `.agents/skills/document-system/`. Las rutas de documentación se interpretan desde la raíz de este proyecto.

Consultar [el índice documental](../../../docs/README.md), [el resumen de arquitectura](../../../docs/architecture/resumen.md) y [el catálogo de historias de usuario](../../../docs/project/historias-de-usuario.md) según la tarea. El catálogo comenzó en HU001; conservar sus IDs y consultar el último existente antes de añadir historias.

## Organización requerida

Esta es la convención persistente acordada con el usuario para crear y mantener documentación. Aplicarla también al actualizar documentos existentes o incorporar una funcionalidad. Mantener exactamente estas tres áreas principales y ubicar los ADRs como subcarpeta de project. Cambiar esta distribución solo si el usuario solicita otra organización.

| Destino | Responsabilidad |
|---|---|
| `docs/architecture/` | Aspectos técnicos y resumen de lectura rápida con diagrama Mermaid: componentes, flujos, API, datos, integraciones y límites |
| `docs/guides/` | Procedimientos ejecutables para humanos o IA: desarrollo, configuración, uso, pruebas, mantenimiento y operación |
| `docs/project/` | Aspectos no técnicos: propósito, alcance, requisitos, historias de usuario enumeradas, reglas, vocabulario y riesgos |
| `docs/project/adrs/` | Decisiones de arquitectura con contexto, estado y consecuencias, aunque sus detalles técnicos estén en architecture |

Usar `docs/README.md` como entrada y un índice por área cuando ayude a navegar. Conservar páginas canónicas existentes y actualizar enlaces; no imponer nombres de archivo o un número de documentos/ADRs. Para decidir contenido de una página o redactar un ADR, consultar [el contrato documental](references/documentation-contract.md).

## Revisar evidencia antes de escribir

- Identificar raíz, instrucciones aplicables, cambios locales y documentación existente. Conservar trabajo del usuario y de otras tareas.
- Leer manifiestos y scripts, puntos de entrada, rutas y permisos, modelo de datos, consumidores/productores de contratos, pruebas y CI que afecten el alcance. Seguir flujos representativos de punta a punta: interfaz, regla, persistencia o servicio externo.
- Comprobar comportamiento en código ejecutable, no solo en comentarios, nombres de carpetas o documentación previa. Distinguir configuración de ejemplo, valores por defecto, requisitos de arranque y disponibilidad operativa.
- Para una revisión completa, cubrir cliente, servidor, contenido/simulación si existen, identidad/autorización, persistencia, integraciones, pruebas, build y operación. Registrar áreas no accesibles o no verificadas.
- En cambios puntuales, seguir el contrato afectado y actualizar solo páginas, índices y decisiones relacionadas. No arrastrar una tecnología o limitación de otro proyecto como regla general.

Enlazar fuentes del repositorio con rutas relativas desde las páginas. Para hechos externos que deban verificarse, usar documentación oficial y enlazar la página que los respalda. No copiar secretos desde archivos de entorno; las plantillas y nombres de variables suelen bastar para explicar configuración.

## Escribir y mantener

Separar explícitamente comportamiento implementado, decisiones observadas, propuestas y asuntos desconocidos. La documentación debe permitir verificar cada afirmación importante. No inventar funciones, aprobaciones, responsables, fechas históricas, métricas o garantías de seguridad.

Explicar en architecture cómo está construido el sistema; en guides cómo realizar una tarea y reconocer su resultado; en project qué propósito, requisitos y reglas se deben preservar. Enlazar entre áreas en vez de duplicar contratos o procedimientos.

Mantener un resumen de arquitectura breve y fácilmente accesible, con un diagrama Mermaid del sistema real, responsabilidades principales, ubicación del estado y enlaces al detalle. Preferir Mermaid para relaciones, flujos y estados que mejoren la comprensión; no sustituir explicación por un diagrama ilegible ni añadir figuras sin propósito.

## Requisitos e historias de usuario

Mantener en project un catálogo canónico de HUs con ID estable, título, actor, formato «Como… quiero… para…», criterios de aceptación observables y evidencia/estado actual. Separar requisitos no funcionales de las historias de interacción. Relacionar las HUs con reglas, módulos o documentos relevantes sin copiar su detalle técnico.

Conservar IDs existentes y no reutilizarlos ni renumerarlos. Si se crea un catálogo nuevo, establecer explícitamente el comienzo de la serie; no tomar un ID de ejemplo como una historia real. Señalar si las historias se reconstruyen del código y qué criterios siguen pendientes: definir una HU no demuestra que se haya aceptado o completado.

La HU permite trazar cambios futuros, no atribuir commits pasados automáticamente. Incluir IDs en una recomendación de commit solo según las convenciones del repositorio y la asociación establecida para los cambios seleccionados. No crear una HU artificial solo para justificar un commit documental.

Si se solicita una revisión completa, registrar hallazgos con evidencia, impacto, prioridad propuesta y validación realizada en un informe técnico. Resumir su impacto de proyecto mediante enlaces, sin duplicar el análisis técnico. Documentar problemas no autoriza corregir código o ejecutar mutaciones de datos fuera de la tarea pedida.

Los ADRs van siempre dentro de project. Crear uno cuando una decisión significativa esté sustentada o se haya pedido documentar una propuesta. Un ADR retrospectivo es una decisión observada, no una aprobación supuesta. Conservar registros anteriores y enlazar sustituciones. No crear un ADR por cada detalle de implementación.

## Validar proporcionalmente

- Comprobar enlaces locales, rutas de archivos y recursos referenciados; bloques Markdown cerrados y navegación de índices.
- Contrastar comandos con scripts realmente definidos, directorios de ejecución, variables y orden de preparación. Diferenciar proxy de desarrollo, preview y despliegue publicado cuando aplique.
- Revisar consistencia entre rutas, DTOs, consumidores, controles de acceso y restricciones de base. Un guard de pantalla o CORS no demuestra autorización del servidor.
- Ejecutar checks pertinentes para una revisión completa o para resolver una afirmación dudosa. Un cambio documental pequeño no exige todos los tests del sistema. No ejecutar seed, migraciones, scripts de concurrencia o generación externa solo para documentar sin revisar su alcance y autorización.
- Registrar comandos ejecutados, resultados, fecha/base de revisión si corresponde y límites. Diferenciar análisis estático, mocks, pruebas de integración reales y restricciones del entorno. No reutilizar resultados históricos como evidencia de un estado nuevo.

Evitar cambios innecesarios en fechas de páginas no revisadas. Un test con respuestas simuladas no confirma un proveedor real; un build correcto no prueba conexión a base; un health check puede verificar solo configuración o proceso.

## Entrega

Entregar archivos Markdown persistentes y navegables, no solo un plan en el chat. Resumir qué se creó/actualizó, enlazar el índice o páginas afectadas y señalar hallazgos relevantes y validaciones reales. Mantener los accesos breves del README y documentos de entrada cuando corresponda, conservando enlaces de compatibilidad si se reorganiza contenido.
