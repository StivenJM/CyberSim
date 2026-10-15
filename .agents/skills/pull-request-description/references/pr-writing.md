# Formato de una descripción de PR

Esta es una convención de CyberSim construida a partir de las fuentes al final de este documento; no es un estándar universal ni un formato impuesto por esas empresas. Respetar una plantilla existente o una estructura solicitada por el usuario.

## Núcleo del cuerpo

Usar estas cuatro secciones cuando no haya otra plantilla. Ajustar la extensión al cambio: una corrección pequeña puede ocupar pocas líneas; una rama transversal necesita explicar sus áreas principales sin narrar cada commit.

| Sección | Contenido |
|---|---|
| `## Summary` | Problema o necesidad y comportamiento resultante en uno o dos párrafos breves. Un ejemplo antes/después ayuda si concreta el cambio. |
| `## Changes` | Cambios significativos agrupados por intención o responsabilidad; decisiones y tradeoffs solo cuando ayudan a valorar la solución. |
| `## Validation` | Comandos/comprobaciones ejecutados, resultados y alcance. Separar pruebas realizadas, evidencia de CI y verificaciones pendientes. |
| `## Impact` | Efectos para usuarios o mantenedores, compatibilidad y limitaciones relevantes. Expresar beneficios esperados como expectativas si no están medidos. |

En Validation, si no hubo pruebas aplicables verificadas, escribirlo con claridad, por ejemplo: «Tests were not run for this description; validation of this branch is pending». Adaptar esa frase a la evidencia; una comprobación estática no equivale a una prueba funcional.

Cuando existan pasos útiles para el revisor, añadirlos como comprobaciones propuestas con acción y resultado esperado, separados de los resultados obtenidos. No marcar casillas de tareas que no se verificaron.

## Secciones condicionales

- `## Deployment and rollback`: para cambios que requieren preparación operativa, migraciones o coordinación de versiones. Indicar orden y comandos comprobados contra los scripts de la rama. En BD explicar el efecto en registros existentes y si quitar el cambio implicaría pérdida de datos. No ejecutar los pasos. Si la reversión no está definida, señalarlo.
- `## Reviewer notes`: para decisiones complejas, límites conocidos o un orden de lectura útil. Señalar riesgos concretos sustentados, con el nivel de incertidumbre; evitar advertencias hipotéticas que no ayuden a revisar.
- `## Related work`: para HUs, requisitos, ADRs, issues o PRs con asociación comprobada. En documentación de CyberSim, enlazar architecture para diseño técnico, guides para procedimientos y project para requisitos/HUs/ADRs.
- `## Visual evidence`: cuando haya capturas o diagramas existentes que aporten evidencia. Añadir enlaces reales accesibles para el revisor; no usar rutas absolutas de la máquina. Mermaid puede resumir un flujo arquitectónico cambiado si aclara la revisión y el destino lo admite; no es obligatorio.

Una rama heterogénea sigue necesitando una descripción completa. Se puede señalar una separación útil para revisión en Reviewer notes, sin dividir o reescribir la rama como parte de esta tarea.

## Criterios de calidad

- Abrir con el resultado y su motivo. Evitar frases como «Several improvements were made».
- Explicar la versión final del cambio. Descartar narrativas del chat y enfoques abandonados salvo que justifiquen una decisión vigente.
- Conectar cada cambio importante con su propósito. Evitar repetir las mismas frases entre Summary, Changes e Impact.
- Diferenciar validación con mocks de integración real; un build no demuestra conexión a la BD.
- No llenar secciones para aparentar profundidad. La estructura existe para facilitar la revisión.

## Fuentes consultadas

Consultadas el 15 de octubre de 2026. Estas fuentes justifican los principios; las reglas de títulos, HUs y campos copiables son decisiones locales del proyecto.

- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills): manifiesto SKILL.md con name/description, recursos opcionales y descubrimiento de skills del repositorio en .agents/skills. Los metadatos de interfaz son opcionales.
- [Google Engineering Practices: Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html): conservar contexto sobre qué cambia y por qué, con una descripción útil para revisores y futuros mantenedores.
- [GitHub: Helping others review your changes](https://docs.github.com/en/pull-requests/concepts/helping-others-review-your-changes): explicar problema, enfoque y resultado; orientar la revisión cuando el cambio lo requiera.
- [GitLab: Code Review Guidelines](https://docs.gitlab.com/development/code_review/): aportar contexto, validación y atención a consecuencias de compatibilidad y despliegue según el cambio. Las políticas internas de aprobación de GitLab no se trasladan al proyecto.
