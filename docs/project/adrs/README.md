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
| [0006](0006-alcance-del-desarrollo-con-docker.md) | Aceptada; composición incorporada | Desarrollo con Docker, OpenAI y Drive externos, n8n y Piper locales |
| [0007](0007-versionado-explicito-de-workflows.md) | Aceptada; herramientas incorporadas | Workflows versionados, importación inicial automática y actualizaciones explícitas |
| [0008](0008-persistencia-funcional-compartida-entre-entornos.md) | Vigente; schema y migraciones incorporados | Estado funcional en la base de CyberSim con Prisma, sin base exclusiva de desarrollo |
| [0009](0009-contrato-tecnico-desarrollo-docker.md) | Vigente; aceptación externa pendiente | Contrato v1 de revisión única, turno común, reset, permisos, bootstrap y voz supervisada |
| [0010](0010-imagenes-desarrollo-por-destino.md) | Aceptada e incorporada | Destinos de construcción e imágenes independientes para apps, herramientas y preparación |
| [0011](0011-pnpm-como-gestor-unico.md) | Incorporada por solicitud del usuario | pnpm fijado para desarrollo, Docker, mantenimiento y CI |

El estado de implementación y aceptación se mantiene en [estado del entorno](../estado-desarrollo-docker.md). Las decisiones D01–D26 están cerradas; las credenciales y pruebas reales del equipo siguen pendientes. ADR 0005 conserva un alcance de autorización más amplio que los recorridos de IA incorporados.

<details>
<summary>Cronología conservada de aceptación y cierre de decisiones</summary>

Las menciones de pendientes siguientes corresponden a cada ronda histórica; no reabren D16/D17 ni otras elecciones ya cerradas.

Los ADRs 0001–0005 se documentaron el 13 de octubre de 2026 a partir de `cc0c9cb`; esa fecha no es una fecha de aprobación anterior. Las alternativas de ADRs retrospectivos son opciones de comparación planteadas aquí, no una historia de deliberaciones verificadas. El ADR 0006 se documentó el 16 de octubre de 2026 desde las respuestas del usuario durante la planificación de desarrollo con Docker; no declara aprobado ni implementado todo el entorno.

El 18 de octubre se actualizó D04 en el ADR 0006 y se documentó el ADR 0007 tras investigar D06. El usuario confirmó tanto la reutilización del volumen como «JSON en Git y actualización explícita»; faltan detalles operativos e implementación.

En la segunda ronda del mismo día se incorporaron al ADR 0006 D15 (SQLite propio de n8n) y D18 (retirada automática de conocimiento tras confirmación). D16 necesita explicación y D17 queda aplazada hasta una tarea específica; no se presentan como decisiones aceptadas.

Posteriormente el usuario aceptó D16 (origen común de Drive) y pidió retomar D17 para explicar y recomendar su autorización. D17 sigue sin elección; el aplazamiento anterior se conserva solo como antecedente.

Al confirmar que el origen está en Mi unidad de una cuenta personal, el usuario eligió D17: cliente OAuth del equipo con autorización individual. La política está aceptada en el ADR 0006; faltan sus pasos de preparación.

En la tercera ronda se aceptaron D19 (recuperación sana y contexto suficiente), D20 (texto conservado ante fallo de voz) y D21 (generaciones independientes). En la cuarta, D22 (historial temporal con aviso), D23 (turno único con prioridad al usuario) y D24 (último índice válido con aviso). Se incorporan al alcance del ADR 0006; falta especificación operativa e implementación, no respuestas a esas preguntas.


</details>

## Crear o cambiar un ADR

El cierre posterior del 18 de octubre concreta el diseño en el contrato v1 y ADR 0009. Las menciones anteriores a mecanismos por cerrar se conservan como cronología; la configuración manual y aceptación real quedaron diferidas por el usuario. ADR 0005 se concreta solo en el subconjunto de recorridos de IA incluido, no en toda la aplicación.

Usar [la plantilla](plantilla.md), numeración consecutiva de cuatro dígitos y un nombre descriptivo. Registrar contexto, decisión, consecuencias, alternativas y evidencia. Cuando una nueva decisión sustituya otra, conservar ambas y enlazarlas. Actualizar este índice y las páginas afectadas cuando se implemente una propuesta.
