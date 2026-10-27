# Escenarios investigados 2.0 — implementación técnica

Objetivo: implementar las tareas I01–I12 de `docs/workspace/tasks.md` (plan canónico:
`docs/project/ejercicios/plan-implementacion.md`) sobre el repositorio CyberSim, con tests y
documentación junto al código. Rama: `new-branch`. Runner: `pnpm -r run test` (vitest por paquete).

Estrategia de entrega: `ask-on-risk` (por defecto). Commits por unidad de trabajo revisable en la rama
actual, sin push, sin PR, sin seed, sin migraciones y sin publicación.

## Specs

S1. Orden de construcción obligatorio: I01 → I02/I03 → I04–I08 → I09 → I10 → I11. I12 es validación
de campo posterior con personas y no es requisito para el prototipo.

S2. Invariantes preservadas: cinco casos; D1–D4; niveles ordinales 0–3 y NE; A0–A3; separación entre
pruebas elegidas por el alumno y batería docente; ninguna suma de flags equivale a conocimiento.

S3. I01 — Contratos y especificación técnica de datos: tipos y registro de capacidades en
`packages/scenario-contract/src/index.ts`, normalizador, builder y catálogo; extensiones cerradas por
caso, nunca strings ni `eval` libres. Esquema de intento/evidencia con versiones de
tarea/forma/fixtures/motor/verificador/rúbrica/ayudas y hash; actor seudonimizado, secuencia,
`operationId`, revisión esperada, pruebas, diagnóstico sellado, segmentos, entrega, adjudicación e
incidencias. Progreso legado separado. Compatibilidad de serialización explícita y rechazo de
versiones desconocidas: no interpretar un intento viejo con una rúbrica nueva.

S4. I01 — Tests exigidos: los defaults anteriores quedan intactos; entradas desconocidas se rechazan
sin mutación; IDs únicos; contratos consumidor/productor coherentes. La migración no destructiva se
planifica, no se ejecuta como parte de la autoría de manifiestos.

S5. I02 — Ciclo de intento y evidencia: agregado crear→D1→revisiones/pruebas→entrega→D2→informe;
pausado/incidencia/práctica distintos. Guardado y entrega idempotentes; conflicto de revisión no
sobrescribe; fallo de persistencia impide confirmar. Orden por intento, no por llegada concurrente.
Persistir ayuda antes de revelarla; reset crea revisión del mismo `attemptId` y conserva
historial/exposición; reanudación no repite como autónomo lo ya asistido. Pruebas docentes en registro
separado. Minimizar datos: no se envía expediente a LLM/RAG.

S6. I02 — Tests exigidos: duplicado, dos escrituras concurrentes, pérdida de respuesta después de
persistir, reconexión antes/después de entrega, error a mitad de prueba, reset asistido, propiedad del
intento en servidor.

S7. I03 — Escritorio, banco de pruebas y accesibilidad: reutilizar oficina→transición→monitor→ventanas;
registrar vistas tipadas; un monitor con aplicaciones del caso. Acceso directo por teclado al mismo
contenido. D1 antes de menús, D2 tras el cierre, originales A0 siempre disponibles. Banco aislado por
ejecución; timeout/crash produce incidencia, no bloqueo seguro.

S8. I04–I08 — Un caso por tarea, cada uno con dominio, UI, tests y documentación juntos; el dominio
reproduce B/Q/C y las rutas válidas por propiedades, nunca por ID de parche ni secuencia de clics.

S9. I09 — Autoría de escenarios y sustitución de catálogo solo tras capacidades verificadas; retirada
visible sin destruir intentos históricos. Generar variantes B solo si se publicarán. Publicación y seed
siguen siendo operaciones que requieren autorización separada: esta entrega NO las ejecuta.

S10. I10 — Informe y rúbricas: perfil por dimensión/ayuda con evidencia citada; no promediar niveles
ordinales ni introducir 70/100; separar resultados automáticos de juicio humano; distinguir
NE/no_attempt/technical_error/requires_review.

S11. I11 — Verificación técnica y documentación: correr focales y suites observando resultados reales,
actualizar documentación de comportamiento implementado, versiones, comandos y brechas. Ningún flag
verde acredita validez educativa.

S12. I12 — No ejecutable en esta entrega: exige población, ética, especialistas y muestra. Se entrega
como planificación documentada, no como trabajo de campo.

S13. Reglas de entrega: no tachar una tarea por escribir un manifiesto ni por leer el plan; no
inventar éxito; no ejecutar seed, migraciones, publicación, despliegue ni operaciones remotas.

## Tasks

| ID | Specs | Ruta | Estado |
|---|---|---|---|
| T1 | S3, S4 | inline | pendiente |
| T2 | S5, S6 | inline | pendiente |
| T3 | S7 | inline | pendiente |
| T4–T8 | S8 | pendiente | pendiente |
| T9 | S9 | pendiente | pendiente |
| T10 | S10 | pendiente | pendiente |
| T11 | S11 | pendiente | pendiente |
| T12 | S12, S13 | documentación | pendiente |

## Log

L1 (solicitud literal del usuario):
> Quiero que hagas estas tareas que salieron de la planificación de una investigación, ahí mismo ya se cuenta el objetivo de lo que se quiere
>
> docs\workspace\tasks.md

L2. Estado inicial observado: rama `new-branch` con documentación de investigación sin versionar
(`docs/project/ejercicios/`, `docs/architecture/escenarios-investigativos.md`,
`docs/guides/implementar-ejercicios-investigados.md`, ADR 0025). El plan declara todas las tareas
pendientes y la entrega documental no implementó la aplicación.

L3. Alcance decidido: I12 se documenta como planificación (requiere personas e institución) y la
publicación/seed de I09 queda fuera por no estar autorizada. El resto se implementa en orden.
