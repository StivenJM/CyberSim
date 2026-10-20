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
