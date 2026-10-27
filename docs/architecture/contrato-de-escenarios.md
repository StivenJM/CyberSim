# Contrato de escenarios

El contrato compartido define la identidad reproducible de un ejercicio de ciberseguridad. El contenido detallado permanece tipado por el frontend porque utiliza enums y estructuras del ECS; el sobre versionado es independiente del runtime y puede validarse también en backend o herramientas.

## Sobre versionado

| Campo | Regla |
|---|---|
| `id` | Entero positivo y único en el catálogo incorporado |
| `slug` | Kebab-case estable; no se reutiliza para otro ejercicio |
| `schemaVersion` | Versión soportada por `@cybersim/scenario-contract` |
| `revision` | Entero positivo; cambia cuando cambia el contenido publicado |
| `status` | `draft`, `validated`, `published` o `archived` |
| `capabilities` | Identificadores del registro cerrado de ciberseguridad |
| `environment` | Perfil confiable y su versión |
| `engineVersion` | Versión del compilador/runtime esperada |
| `assetCatalogVersion` | Versión de modelos/prefabs permitidos |
| `seed` | Entero no negativo para resultados deterministas |
| `exercise` | Opcional: referencia cerrada a uno de los cinco casos investigados |
| `contentHash` | SHA-256 de la serialización canónica sin el propio hash |

## Contenido del ejercicio

`DefinicionEscenario` conserva metadatos, presupuesto, zonas, redes, personas, oficinas, espacios, dispositivos, activos, fases, eventos, ataques y acciones esperadas. Esos datos no ejecutan código: seleccionan tipos, acciones y verificadores existentes.

## Capas de validación

1. **Estructural:** identidad, versión, estados, arrays y tipos básicos.
2. **Registro cerrado:** capacidad y perfil de entorno admitidos.
3. **Referencial:** IDs únicos por ámbito, dispositivos, redes y fases existentes.
4. **Integridad:** coincidencia del `contentHash` SHA-256.
5. **Compilación:** adaptación satisfactoria al contrato del ECS.
6. **Comportamiento:** pruebas deterministas y recorrido del flujo del ejercicio.

El catálogo falla al importar si una definición incorporada no supera las primeras cuatro capas. Esto evita que un escenario parcialmente válido aparezca en selección.

## Catálogo y descubrimiento

Vite descubre `apps/frontend/src/data/escenarios/escenario*.ts`. Un módulo puede exportar otras funciones, pero el catálogo solo acepta objetos con `schemaVersion` y `slug`. Valida todas las revisiones encontradas y expone al usuario únicamente las `published`.

Los scripts Node de sincronización y RAG aplican la misma convención de nombre y filtran revisiones publicadas. No existe una lista manual adicional.

## Persistencia

`escenario` mantiene la identidad mutable de presentación. `revision_escenario` conserva el manifiesto, hash, versiones, semilla, estado y fechas de una revisión inmutable. `progreso` mantiene el slug por compatibilidad y añade número/hash; cuando la revisión está en el catálogo persistido también guarda su clave foránea.

La sincronización es idempotente. Una revisión existente con el mismo hash no cambia; el mismo número con otro hash se rechaza; una revisión nueva archiva la publicada anterior.

## Compatibilidad

- Intentos anteriores: `id_revision_escenario`, revisión y hash permanecen nulos.
- API de progreso: revisión y hash son opcionales por compatibilidad, pero si aparece uno deben aparecer ambos.
- Runtime ECS: recibe el mismo contenido que antes, ahora producido por `compileScenario`.
- Escenarios generados: conservan su adaptación de formato, pero la salida final usa `defineScenario` y `compileScenario`.

## Invariantes para futuras extensiones

- Un manifiesto no registra funciones ni componentes.
- Un slug publicado no cambia; un cambio incompatible crea otro slug.
- Una revisión publicada nunca se sobrescribe.
- Una capacidad desconocida se rechaza, no se degrada silenciosamente.
- Los activos se resuelven desde registros confiables del código.
- Un intento conserva como mínimo revisión y hash de su definición.

## Extensión de casos investigados

`packages/scenario-contract/src/investigated.ts` registra los cinco casos del conjunto 2.0
(`cwe-321-andinapay`, `cwe-89-bibliotecaviva`, `cwe-434-talentoandino`, `cwe-306-andeanlogix`,
`cwe-502-nubeandina`) con identificadores literales de su ficha: operaciones, controles,
verificadores (B/Q/C), fixtures y segmentos de ayuda.

- El campo opcional `exercise` solo puede **reducir** esas listas; añadir un identificador que la
  ficha no define es un error de validación, nunca un string libre.
- `caseId` y `form` (`A`/`B`) son cerrados. Un caso desconocido rechaza el manifiesto.
- La capacidad del caso (`crypto-key-rotation`, `sql-query-binding`, `file-admission`,
  `authorization-matrix`, `session-restore`) es obligatoria en el manifiesto que lo referencia.
  `defineScenario` la añade automáticamente a partir del registro.
- El catálogo rechaza dos definiciones que declaren el mismo `caseId`.
- Las capacidades previas no cambian: la lista anterior sigue admitida y validada.

## Intento y evidencia (`attempt`)

`packages/scenario-contract/src/attempt.ts` define el sobre de un intento evaluable, separado del
`progreso` legado:

| Grupo | Contenido |
|---|---|
| Identidad | `attemptId`, `caseId`, actor seudonimizado, `progressKind: 'attempt-evidence'` |
| Versiones | `task`, `form`, `fixtures`, `engine`, `verifier`, `rubric`, `aids` + `versionHash` |
| Orden | `sequence` y registro de operaciones con `operationId`, revisión esperada y resultado |
| Evidencia | diagnóstico sellado, revisiones, pruebas (alumno/docente), segmentos de ayuda |
| Cierre | entrega congelada, explicaciones, adjudicación por dimensión y incidencias |
| Integridad | `contentHash` SHA-256 de la serialización canónica |

Reglas aplicadas por `validateAttemptRecord`:

- Una `schemaVersion` desconocida se rechaza sin interpretar el resto del registro.
- Los campos desconocidos, enums desconocidos, IDs duplicados y secuencias no consecutivas son
  errores; la entrada no se muta.
- Una entrega exige diagnóstico sellado (`sealedBeforeMenu: true`) y una revisión existente.
- Las pruebas del alumno y la batería docente son registros separados: el mismo identificador de
  batería puede aparecer una vez en cada uno, nunca dos veces en el mismo.
- Los niveles de rúbrica son ordinales (`0`–`3`, `NE`) más un `kind` de adjudicación; no existe
  promedio ni porcentaje.
- `isAttemptCompatible` compara el juego completo de versiones y devuelve el primer campo
  incompatible: un intento viejo no se interpreta con una rúbrica, verificador o fixtures nuevos.

El contrato no persiste nada por sí mismo: el ciclo de vida del agregado (idempotencia, conflicto
de revisión, ayuda persistida antes de revelarse) pertenece a I02 y se documenta en
[ciclo de intento y evidencia](intento-evidencia.md).
