# Ciclo de intento y evidencia

Implementación de I02 sobre el sobre `attempt` de `@cybersim/scenario-contract`. El agregado vive en
`packages/attempt-ledger` y no depende del navegador ni de la base de datos.

## Separación respecto del progreso legado

`progreso` sigue registrando intentos, acciones y finalización de los ejercicios anteriores. El sobre
`attempt` declara `progressKind: 'attempt-evidence'` y un `attemptId` propio; ninguna consulta de
progreso terminado se interpreta como dominio adquirido ni como nivel D1–D4.

## Estados

| Estado | Significado | Entradas | Salidas |
|---|---|---|---|
| `in-progress` | Intento medido activo | `create`, `resume` | `pause`, `deliver`, `technical-incident` |
| `paused` | Reanudable con la misma revisión y la misma exposición | `pause` | `resume`, `deliver` |
| `delivered` | Entrega congelada: revisión, pruebas y evidencia selladas | `deliver` | — (solo explicación y adjudicación) |
| `technical-incident` | Incidencia declarada por la plataforma, no un fallo del alumno | `record-incident` con `blocking` | — |
| `practice` | Práctica separada; no produce evidencia medida | `create` con `practice` | — |

`NE`, `no_attempt` y `requires_review` no son estados del intento: pertenecen a la evidencia y a la
adjudicación por dimensión.

## Comandos

Cada comando lleva `operationId` (clave de idempotencia) y `expectedRevision` (revisión sobre la que
actuó el cliente).

| Comando | Regla principal |
|---|---|
| `save-diagnosis` | Sella D1 una sola vez, antes de cualquier menú de soluciones |
| `save-revision` | Crea una revisión inmutable con el siguiente número y un `diffHash` |
| `run-test` | Registra una prueba del alumno ligada a fixture y revisión |
| `reveal-aid` | Registra el segmento **antes** de devolver su texto |
| `deliver` | Exige diagnóstico sellado, al menos una revisión y la revisión vigente |
| `record-explanation` | Solo después de la entrega (D2/D4) |
| `adjudicate` | Solo después de la entrega; nivel ordinal o `NE` por dimensión |
| `record-incident` | Conserva la evidencia previa; `blocking` cambia el estado |
| `pause` / `resume` | No alteran revisión ni exposición |
| `reset` | Nueva revisión del mismo `attemptId`; conserva historial y ayudas |

Un intento entregado rechaza guardar, probar, revelar ayuda y reiniciar: la entrega congela la
evidencia y no se reescribe.

## Idempotencia y concurrencia

- Repetir un `operationId` devuelve `replayed` con la operación ya almacenada; no duplica revisiones,
  pruebas, ayudas ni efectos. Es el camino de recuperación cuando se pierde la respuesta después de
  persistir.
- `expectedRevision` distinto de la revisión vigente devuelve `revision-conflict` sin mutar el intento en
  los comandos que crean o interpretan evidencia (diagnóstico, revisión, prueba, ayuda, entrega, reset,
  explicación, adjudicación). Una pestaña obsoleta no sobrescribe el trabajo de otra.
- `pause`, `resume` y `record-incident` son operativos: no escriben evidencia y aceptan una revisión
  anterior porque un evento de plataforma puede llegar después de que el cliente avanzara.
- Si el servicio recibe los conjuntos de versiones del intérprete, un intento producido con otra rúbrica,
  forma, fixtures, motor, verificador o ayudas se rechaza con `version-mismatch` en lugar de leerse bajo
  la rúbrica nueva.
- La creación valida el registro completo antes de insertarlo: un caso, identificador o versión inválidos
  se rechazan y no dejan un intento almacenado inutilizable.
- El puerto `AttemptStore.save(record, expectedSequence)` hace compare-and-swap sobre la secuencia de
  comandos. Dos escrituras concurrentes con la misma secuencia producen un solo `applied` y un
  `revision-conflict`; el orden lo fija el intento, nunca la llegada de la petición.
- Si la persistencia no confirma, el resultado es `persistence-failure` y no se devuelve ningún efecto
  nuevo (tampoco el texto de una ayuda recién revelada).

## Ayuda, reset y batería docente

- La exposición A0–A3 se guarda como `aids[]` con `segmentId` cerrado por caso y nivel; el segmento no
  puede repetirse y no desaparece con un reset.
- Las pruebas del alumno solo admiten un verificador y un fixture del registro cerrado del caso; no se
  puede inventar un identificador de prueba.
- La batería que ejecuta el corrector tras la entrega se guarda con `source: 'teacher'`. Los selectores
  `studentTests` y `teacherTests` la mantienen separada de las pruebas elegidas por el alumno, y un
  mismo identificador puede existir una vez en cada registro. Esa batería nunca cuenta como prueba
  elegida.
- El reset crea una revisión nueva del mismo `attemptId`; no abre un intento distinto ni borra el
  diagnóstico previo.

## Propiedad y privacidad

`AttemptService.execute` compara el actor seudónimo del registro con el solicitante y devuelve
`forbidden` sin tocar el almacenamiento. El contrato no guarda nombres, correos ni expedientes; el
llamador debe pasar un seudónimo. Nada de esto se envía a RAG o a un modelo.

La evaluación sigue ocurriendo en el cliente: este agregado no es un árbitro anti-manipulación. El
backend solo puede ser autoridad si persiste el intento y recalcula los hechos; esa persistencia no
está implementada todavía.

## Informe y rúbrica

`buildAttemptReport(record, automatic?)` produce un perfil por dimensión (D1–D4) con la evidencia
citada y los segmentos de ayuda. Reglas aplicadas:

- Cada dimensión conserva un nivel ordinal (`0`–`3`, `NE`) o `null`; **no** existe total, promedio,
  porcentaje ni nota derivada.
- El estado distingue `assessed`, `requires_review`, `no_attempt`, `technical_error` y
  `not_presented`. Una incidencia técnica bloqueante nunca se presenta como desconocimiento.
- Las pruebas del alumno y la batería docente viajan en listas separadas; D4 solo cita pruebas
  elegidas por el alumno.
- Un desacuerdo entre la adjudicación humana y la batería automática se conserva como
  `disagreements[]`, sin corregir ni borrar ninguna de las dos versiones.
- El texto original de las explicaciones se conserva literal, con su marca temporal.
- La exposición de ayuda se clasifica como `before-delivery` o `after-delivery` y no se elimina.

## Brechas pendientes

- Adaptador Prisma y endpoint HTTP: requieren una migración de esquema. La migración no se ejecutó en
  esta entrega porque el plan prohíbe ejecutar migraciones sin autorización separada.
- Vistas de escritorio, banco de pruebas y accesibilidad: I03.
- Verificadores B/Q/C de cada caso: I04–I08.
