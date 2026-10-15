# Contrato documental

Leer esta referencia al seleccionar páginas para un sistema nuevo, reorganizar contenido o escribir una decisión. Los nombres siguientes son orientativos; conservar los documentos existentes que ya cumplen su propósito.

## Clasificar el contenido

| Pregunta | Área | Contenido útil |
|---|---|---|
| ¿Cómo está construido y dónde vive cada responsabilidad? | architecture | Componentes, dependencias, procesos, límites y mapa de código |
| ¿Cómo entiendo la aplicación rápidamente? | architecture | Resumen breve y diagrama Mermaid de procesos, flujos y servicios reales |
| ¿Qué sucede de entrada a salida? | architecture | Flujo de interfaz/API, reglas, persistencia y errores |
| ¿Qué contrato expone? | architecture | Rutas, entradas, respuestas y permisos efectivamente implementados |
| ¿Qué se conserva y qué garantiza su integridad? | architecture | Relaciones, restricciones, formatos, historial y estado temporal |
| ¿Qué integra y qué pasa si falla? | architecture | Adaptadores, servicios externos, configuración, tolerancia y límites |
| ¿Cómo lo preparo, uso, pruebo o mantengo? | guides | Prerrequisitos, pasos, comandos, resultado esperado y diagnóstico |
| ¿Para qué existe y para quién? | project | Problema, usuarios, objetivos y alcance |
| ¿Qué reglas del producto se deben preservar? | project | Reglas observables, restricciones y diferencias de implementación |
| ¿Qué necesita cada actor y cómo se acepta? | project | Requisitos y HUs con IDs estables, criterios verificables y estado respaldado |
| ¿Qué riesgo o decisión afecta al proyecto? | project | Impacto, asuntos pendientes y enlaces a evidencia técnica |
| ¿Por qué se adopta una opción significativa? | project/adrs | Contexto, decisión, estado, consecuencias y alternativas |

Un procedimiento de despliegue pertenece a guides; una vista de procesos/redes de despliegue pertenece a architecture; responsables y expectativas de servicio pertenecen a project. Una decisión técnica tiene su ADR en project/adrs y enlaza su diseño en architecture.

## Páginas por necesidad

Para un sistema sin documentación, establecer un índice y cubrir las áreas que realmente existen. No crear capítulos vacíos para tecnologías ausentes.

- **Architecture:** resumen visual de lectura rápida con Mermaid, visión técnica, cliente/servidor o módulos equivalentes, dominio central, API/contratos, datos, integraciones y fronteras de confianza. Agregar informe de revisión cuando la tarea incluya esa revisión.
- **Guides:** inicio local, configuración, uso por perfiles, validación, tareas de mantenimiento/extensión, operación y diagnóstico. Para una guía destinada a IA, explicar invariantes, puntos de cambio y fuentes de verdad; no copiar instrucciones genéricas de herramientas.
- **Project:** visión/alcance, requisitos, HUs enumeradas, reglas funcionales, glosario y riesgos/decisiones pendientes. No atribuir aprobaciones institucionales al hecho de que una regla aparezca en código.

En una actualización parcial, identificar páginas afectadas por el contrato modificado. No regenerar los índices ni todos los ADRs si no cambiaron sus enlaces o decisiones.

## Catálogo de HUs y trazabilidad

Cada historia tiene ID estable, nombre, actor/beneficio, criterios de aceptación y relación con reglas/evidencia. Usar el formato de IDs del proyecto; en un catálogo nuevo acordado desde uno, `HU001`, `HU002` y siguientes. Conservar historias retiradas como retiradas si sus IDs ya fueron utilizados.

Los criterios describen resultados verificables y errores relevantes. Registrar aparte el soporte observado y las brechas pendientes, sin convertir una definición en una certificación. Los requisitos no funcionales pueden tener sus propios IDs y vincularse a varias HUs.

Para commits futuros, seleccionar la historia realmente asociada al cambio y respetar el formato de commit local. No reescribir historia Git ni atribuir IDs a commits históricos sin evidencia. Un commit documental transversal puede no llevar HU. Si hay duda entre varias historias, no adivinar la asociación.

## Resumen visual de arquitectura

Mantener una página corta con un diagrama de contenedores/componentes principales, una tabla de responsabilidades y el límite entre estado local, persistido y externo. Mostrar solo servicios presentes; distinguir integración externa de infraestructura incluida en el repositorio.

Usar Mermaid como formato preferido: `flowchart` para estructura, `sequenceDiagram` para un flujo, `erDiagram` para relaciones persistidas y `stateDiagram-v2` para estados cuando corresponda. Enlazar al detalle en lugar de concentrar todas las clases o endpoints en el resumen. Verificar que flechas y etiquetas describan comunicación y responsabilidades reales.

## Esqueleto de una guía

Adaptar a la tarea:

1. Objetivo y destinatario.
2. Requisitos y entorno/directorio de ejecución.
3. Pasos o comandos respaldados por el repositorio.
4. Resultado observable y cómo comprobarlo.
5. Límites, fallos habituales y enlaces a contratos necesarios.

Separar rutas de Windows de instrucciones para otros shells cuando cambie la sintaxis. No prometer que copiar una plantilla hace funcionar servicios externos. Si hay pasos que escriben datos o consumen recursos externos, declarar el efecto en ese paso.

## ADRs

Ubicación: `docs/project/adrs/`. Mantener el esquema de numeración existente; si no hay uno, utilizar cuatro dígitos consecutivos y nombres descriptivos. Un índice registra título, estado y enlace.

Estados que distinguen evidencia:

- **Observada en implementación (retrospectiva):** el código adopta la opción; no consta aprobación histórica.
- **Propuesta:** decisión recomendada que aún no se ha aprobado/implementado según la evidencia disponible.
- **Aceptada:** existe evidencia de la aceptación; especificar su origen y distinguir trabajo pendiente de implementación.
- **Sustituida / rechazada:** conservar el registro y enlazar sucesor o motivo.

Contenido mínimo de un registro:

```markdown
# ADR NNNN: Decisión

- Estado: estado respaldado por evidencia.
- Fecha de documentación: fecha real de elaboración.
- Alcance: responsabilidades o comportamiento afectados.
- Aprobación: evidencia disponible, o declaración de que no consta.

## Contexto

Problema y restricciones verificables; señalar supuestos.

## Decisión

Opción observada, aceptada o propuesta y sus límites.

## Consecuencias

Beneficios, costos y efectos sobre usuarios, datos u operación.

## Alternativas

Tradeoffs relevantes; no inventar deliberaciones históricas.

## Evidencia y validación

Enlaces a código o aprobación, comprobaciones realizadas y pendientes.
```

Cambiar el estado solo con evidencia. Una propuesta no se convierte en aceptada por la creación de su archivo. Una corrección menor no exige un ADR si no cambia una decisión significativa.

## Revisión y evidencia

Para cada hallazgo técnico, identificar condición concreta, fuente, impacto, prioridad propuesta y siguiente acción. Distinguir un defecto observado de un riesgo inferido y de un incidente reproducido. No convertir la revisión documental en un pentest o reparación no solicitados.

Registrar qué parte se leyó y qué se probó. Verificar especialmente afirmaciones como “protegido”, “opcional”, “persistente”, “saludable”, “atómico”, “idempotente” y “end-to-end” contra implementación y alcance de pruebas. Un comentario que las usa no basta.

En una reorganización, actualizar enlaces entrantes y mantener una página breve de compatibilidad cuando conserve accesos útiles. No conservar copias completas contradictorias de una misma explicación.

## Convención del proyecto

La división architecture/guides/project, la ubicación de ADRs y las historias de usuario enumeradas son la convención acordada para este proyecto. La skill contiene instrucciones Markdown y referencias locales; su funcionamiento no requiere configuración específica de un proveedor de IA.
