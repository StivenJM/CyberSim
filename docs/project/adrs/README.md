# Registros de decisiones de arquitectura

Los ADRs se conservan en `docs/project/adrs/` según la organización del proyecto. Incluyen decisiones técnicas porque documentan su contexto, alcance y consecuencias para el proyecto; los detalles de implementación viven en `docs/architecture/`.

## Estados

- **Observada en implementación (retrospectiva)**: el código usa esa opción. La documentación no atribuye aprobación, autor o fecha histórica desconocidos.
- **Propuesta**: resultado recomendado que requiere evaluación e implementación; no está vigente por estar escrito.
- **Aceptada**: decisión aprobada con evidencia identificada en el registro.
- **Sustituida / rechazada**: conservar contexto y enlazar el registro que la reemplaza o la razón de rechazo.

## Índice

| ADR | Estado | Decisión |
|---|---|---|
| [0001](0001-workspaces-y-modulos.md) | Observada, retrospectiva | Dos npm workspaces y módulos por funcionalidad |
| [0002](0002-simulacion-ecs-en-cliente.md) | Observada, retrospectiva | Ejecutar la simulación ECS en el navegador |
| [0003](0003-persistencia-de-intentos.md) | Observada, retrospectiva | Persistir identidad/actividad en PostgreSQL e intentos por slug |
| [0004](0004-ia-y-conocimiento-externos.md) | Observada, retrospectiva | Separar tutor/RAG y generación externa; memoria temporal |
| [0005](0005-autorizacion-en-servidor.md) | Propuesta | Autorizar recursos educativos y generación desde identidad del servidor |

Todos se documentaron el 13 de octubre de 2026 a partir de `cc0c9cb`; esa fecha no es una fecha de aprobación anterior. Las alternativas de ADRs retrospectivos son opciones de comparación planteadas aquí, no una historia de deliberaciones verificadas.

## Crear o cambiar un ADR

Usar [la plantilla](plantilla.md), numeración consecutiva de cuatro dígitos y un nombre descriptivo. Registrar contexto, decisión, consecuencias, alternativas y evidencia. Cuando una nueva decisión sustituya otra, conservar ambas y enlazarlas. Actualizar este índice y las páginas afectadas cuando se implemente una propuesta.
