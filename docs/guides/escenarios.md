# Crear y mantener escenarios

> Para el entorno Docker integrado usar [la guía actual de desarrollo](desarrollo-local.md) y [su arquitectura](../architecture/desarrollo-docker.md). Esta referencia conserva procedimientos y hallazgos anteriores; las variables por workspace, puertos publicados o bloqueos de arranque descritos aquí no sustituyen la configuración raíz y el diagnóstico actuales.

Un escenario es una definición educativa declarativa. El cliente la transforma en entidades ECS; el backend conoce principalmente su slug y título. Consultar primero [simulación ECS](../architecture/simulacion-ecs.md) y los ejemplos activos.

## Crear un nivel estático

1. Elegir como base un escenario activo con el mismo tipo de interacción; no partir de un archivo deshabilitado sin revisar compatibilidad.
2. Crear `apps/frontend/src/data/escenarios/escenarioNombre.ts` con un export identificable, ID numérico único y slug estable. Guiarse por `DefinicionEscenario` y los enums del cliente.
3. Definir categoría, descripción, zonas, redes, oficinas, espacios y dispositivos. Referenciar redes y dispositivos por los nombres exactos que esperan los eventos.
4. Definir fases consecutivas desde uno, inicialmente solo la primera activa y ninguna completada. Los objetivos deben coincidir exactamente con `nombreEvento` o `nombreAtaque`.
5. Definir notificación, ejecución, verificación/mitigación y evento de cierre de cada fase. El cierre final corresponde a completación de escenario.
6. Definir `accionesEsperadas` con acción, objeto, ventana temporal y valor, coherentes con lo que registran los sistemas.
7. Exportarlo en `data/escenarios/index.ts`. El `NivelController` obtiene el catálogo de esos exports; exportar allí solo definiciones de escenario.
8. Añadir slug/título en `data/escenarios/registry.ts` y `apps/backend/src/auth/domain/scenarioMetadata.ts`.
9. Si el nivel debe entrar en RAG, añadirlo también a los imports y a `ESCENARIOS_ACTIVOS` del exportador.
10. Actualizar catálogo/reglas del proyecto y ejecutar las validaciones indicadas abajo.

Los puntos 7, 8 y 9 son registros independientes en la implementación actual; modificar uno no actualiza los otros. Cambiar un slug puede desvincular visualmente el historial persistido. Preservarlo o planificar una migración de registros y metadatos.

## Contrato temporal y de objetivos

`SistemaTiempo` compara segundos por igualdad. Utilizar tiempos enteros alcanzables y definir `tiempoEnOcurrir` para verificaciones que dependan del reloj. La propiedad es opcional en TypeScript, pero omitirla puede hacer que nunca se ejecute un evento.

`SistemaFase` avanza en el orden de la lista ordenada por notificación. Los IDs deben corresponder a índices de fase consecutivos. Una diferencia de mayúsculas, acentos o texto entre nombre y objetivo puede detener el avance. Diseñar el orden y los nombres junto con las verificaciones.

| Tipo de reto | Revisar |
|---|---|
| Hardening/malware | Nombre de configuración, dispositivo y condición de mitigación |
| Firewall/tráfico | Origen, destino, red, dirección, protocolo y resultado esperado |
| VPN | Dispositivos VPN, gateway/cliente, dominios, hosts y protección |
| Firma digital | Nombres de documento, firma y clave; veredicto correcto |
| App o consola | Acción y objeto de enums, nombres de apps y valores registrados |

No describir el presupuesto como una restricción efectiva mientras sus comprobaciones de monto estén desactivadas. Los dispositivos `decorativo` se usan para escena, no para objetivos que exijan interacción.

## Desafíos generados

El servidor pide al webhook una definición; el cliente puede reconstruir fases, insertar routers, normalizar valores y reprogramar tiempos. Esta recuperación de formato no prueba que el reto sea resoluble. Revisar datos y probar al menos un recorrido completo antes de usar una generación como referencia educativa.

Los resultados usan el slug `ai-generated-scenario`, aunque la definición externa tenga otro. Distintos retos comparten historial y ranking. No agregar ese slug al catálogo estático suponiendo que exista una definición reproducible. Si se necesita trazabilidad por generación, diseñar primero almacenamiento de definición/versión e identidad de intento.

## Exportar para RAG

```powershell
pnpm --filter @cybersim/frontend run export:rag
```

El script escribe en **`apps/frontend/scripts/rag-output/`** porque resuelve la ruta desde su propio archivo. Actualmente hay JSON previos en **`scripts/rag-output/`** de la raíz. No asumir que se actualizaron: revisar la salida y decidir cuál es el destino que realmente utiliza la ingestión externa.

Revisar ambos JSON: conteos, slugs, textos, topología, nombres y datos de prueba. La lista de cinco imports es explícita: el exportador no descubre automáticamente nuevos archivos.

Para consumir esos JSON en Qdrant, el operador del workflow debe definir colección, fragmentación, modelo de embeddings, dimensión y actualización de puntos. Nada de eso se publica al ejecutar el script. Reindexar de forma coherente si cambia el modelo de embeddings; consultar [integraciones](../architecture/integraciones.md).

## Validar el cambio

```powershell
pnpm --filter @cybersim/frontend run typecheck
pnpm --filter @cybersim/frontend run lint
pnpm --filter @cybersim/frontend run test
pnpm --filter @cybersim/frontend run build
```

Comprobar además en el navegador: aparición del nivel, desbloqueo esperado, escena/topología sin referencias rotas, objetivos alcanzables, pausa/reanudación, cierre y guardado de un intento. El E2E actual usa un fixture y no prueba un nivel nuevo automáticamente.

Si se cambian reglas del motor, agregar cobertura dirigida a ese comportamiento. Una modificación de metadatos por sí sola no necesita tests que copien los mismos valores.

## Fuentes

- [Tipos](../../apps/frontend/src/shared/types/EscenarioTypes.ts), [enums de dispositivos/eventos](../../apps/frontend/src/shared/types/DeviceEnums.ts) y [acciones](../../apps/frontend/src/shared/types/AccionesEnums.ts).
- [Ejemplo de tutorial](../../apps/frontend/src/data/escenarios/escenarioTutorial.ts), [índice](../../apps/frontend/src/data/escenarios/index.ts), [registro frontend](../../apps/frontend/src/data/escenarios/registry.ts) y [metadatos backend](../../apps/backend/src/auth/domain/scenarioMetadata.ts).
- [Exportador](../../apps/frontend/scripts/export-rag-knowledge.ts), [normalización](../../apps/frontend/src/visual/features/agent-malvado/presentation/utils/scenarioNormalizer.ts) y [builder del generador](../../apps/frontend/src/visual/features/agent-malvado/presentation/hooks/useScenarioBuilder.ts).
