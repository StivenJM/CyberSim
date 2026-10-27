# ADR 0025: Separar entorno, modelos, hechos e interpretación educativa

- Estado: **Propuesta**, no implementada.
- Fecha de documentación:26-10-2026.
- Alcance: cinco ejercicios del conjunto2.0 y su futuro registro evaluativo.
- Aprobación: el usuario autoriza investigación/documentación y conserva el marco; no consta aceptación de una implementación técnica ni autorización de publicación.

## Contexto

La pregunta es qué saben los estudiantes y cómo evaluarlos. El entorno actual ofrece oficina3D, monitor, escritorio, ECS y progreso; no contiene los cinco modelos ni una escala validada D1–D4. Un manifiesto o un objetivo terminado no produce por sí solo evidencia de comprensión. La [arquitectura propuesta](../../architecture/escenarios-investigativos.md) distingue ese estado observado de capacidades pendientes.

## Decisión propuesta

Conservar oficina→monitor→aplicaciones. Incorporar modelos cerrados por caso y un diario versionado por intento; verificadores reproducen **hechos B/Q/C**, separados del juicio humano de rúbrica y de la presentación. No puntuar un ID de parche ni una secuencia de clics como solución única. Mantener diagnóstico sellado, pruebas elegidas/docentes y segmentos de ayuda separados.

Usar operaciones criptográficas/SQL reales sobre datos inertes cuando importa la semántica; modelar cargas, permisos y reconstrucción sin ejecutar código o infraestructura externos. Los estados y límites están en las [fichas](../ejercicios/README.md). La arquitectura del cliente no es arbitraje anti-manipulación ni seguridad frente a su propietario.

## Alternativas y consecuencias

| Alternativa | Motivo de no elegirla como referencia |
|---|---|
| Resolver todo con manifiestos actuales | Faltan capacidades/verificadores; flexibilizar contratos no implementa esos comportamientos |
| Flags/cuestionario sin efectos observables | Confunde reconocimiento o selección con intervención y comprobación; puede servir como otra tarea, no sustituye este diseño |
| Infraestructura vulnerable real | Añade riesgo, operación y dificultad ajenos al foco; su fidelidad no acredita mayor validez educativa |
| Puntuar automáticamente todo mediante LLM | No hay evidencia local de exactitud/consistencia de ese juicio; conservar interpretación humana revisable |

Costes: nuevos contratos, modelos, vistas, persistencia y tests; mantenimiento de versiones y revisión humana. Beneficio esperado: trazabilidad entre afirmación, tarea y observación; todavía no demostrado con estudiantes. La validez se argumenta conforme al [marco](../marco-evaluacion-ciberseguridad.md), no se deduce de la arquitectura.

## Verificación y evolución

Los cálculos de autoría y sus límites constan en [comprobaciones](../ejercicios/verificacion-especificaciones.md). El [plan futuro](../ejercicios/plan-implementacion.md) mantiene todas las tareas de implementación pendientes. Una limitación de motor exige revisar ficha/decisión, no cambiar silenciosamente qué se evalúa. Este ADR no sustituye los ADRs observados sobre ECS, progreso, autorización ni escenarios modulares.
