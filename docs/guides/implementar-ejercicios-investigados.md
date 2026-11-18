# Implementar después los cinco ejercicios investigados

**Estado actual:** los cinco manifiestos, el dominio y los verificadores se conservan. AndinaPay
funciona dentro de la oficina 3D; la integración equivalente de los demás casos y su registro de
evidencias siguen pendientes. Leer [contrato común](../project/ejercicios/README.md), ficha del caso, memo científico, [arquitectura propuesta](../architecture/escenarios-investigativos.md), [estado de implementación](../project/ejercicios/implementacion.md) y [tareas canónicas](../project/ejercicios/plan-implementacion.md), en ese orden.

## 1. Preparación sin alterar datos

1. Confirmar instrucciones, rama, cambios ajenos y versiones actuales; las rutas/capacidades descritas corresponden a la inspección del 26-10-2026, no a futuras revisiones.
2. Leer [creación de escenarios](escenarios.md), [arquitectura modular](../architecture/escenarios-modulares.md) y contratos/test actuales.
3. Identificar capacidades faltantes: **no** intentar resolverlas solo con un manifiesto, un perfil reservado, objetos libres o `eval`.
4. Conservar historial de ejercicios anteriores. Preparar sustitución no destructiva con revisión nueva y migración solo cuando esté autorizada; esta entrega no autoriza borrar intentos ni base.

## 2. Orden de construcción

Seguir I01–I12 del plan; todas están pendientes. Infraestructura de evidencia y modelos primero, contenido publicable después. Mantener una unidad por comportamiento con tests y documentación juntos; ramas y revisiones según política vigente. No hacer una implementación monolítica sin poder comprobar B/Q/C por caso.

Por regla observable: test determinista RED → implementación GREEN → refactor sin cambiar resultados. Incluir ruta legítima, adversa, límites y un rival que revele una mitigación incompleta. Los cálculos de autoría no sustituyen los tests de la aplicación.

## 3. Comprobaciones disponibles y nuevas

Desde raíz, comprobar primero que los scripts siguen existiendo:

```powershell
pnpm --filter @cybersim/scenario-contract test
pnpm --filter @cybersim/frontend exec vitest --run tests/scenarioCatalog.test.ts
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

Son formas verificadas en manifiestos locales, **no resultados ejecutados de esta entrega**. Elegir tests focales existentes de comandos/eventos/fases/tiempo, `scenarioNormalizer`, `ECSManager`, `Progreso`, `PrismaProgresoRepository` e `IntegrationContract` cuando se toque su comportamiento. Crear tests nuevos para casos/registro; no fingir que ya existen por nombrarlos en un comando.

Las pruebas de integración de simulación viven en `apps/frontend/tests/integration/simulacion.spec.ts`; preparar el entorno que exige la guía actual antes de ejecutarlas. No lanzar sincronización DB, migraciones, embeddings o publicación RAG sin revisar efectos y autorización.

## 4. Verificación que debe observarse

| Superficie | Evidencia de aceptación futura |
|---|---|
| Contrato | Rechaza capacidades/eventos/diffs desconocidos y versiones incompatibles; catálogo único |
| Dominio por caso | B/Q/C con estado y efectos exactos; alternativas válidas; bloquear todo falla función |
| UI | Oficina→monitor→vistas, teclado equivalente, guardar/compare/reset/entrega; no revelar clave en feedback ordinario |
| Registro | Mismo comando no duplica; fallo de guardado no confirma; ayuda segmenta antes de revelar; reanudación conserva exposiciones |
| Aislamiento | Fixture nuevo por prueba; sin red, host shell, código arbitrario, PII o dependencia vulnerable real |
| Rubricación | Hechos y respuesta humana separados; NE/omisión/conflicto explícitos, sin nota definitiva generativa |
| Publicación | Manifiesto/versiones/hash y corrección coinciden; variante B no se activa sin generarse/probarse; historial anterior legible |

Fallo inesperado: conservar entrada/revisión/recibo; distinguir defecto técnico de rechazo esperado; detener publicación afectada, no marcarla aprobada. Revisar de manera independiente los cambios futuros de seguridad, persistencia, concurrencia, contratos o dependencias. El actual trabajo documental no los implementó.

## 5. Antes de involucrar estudiantes

Revisión de contenido, recorrido cognitivo, accesibilidad, consentimiento y pilotaje de rúbrica conforme al marco. Medir tiempos/ambigüedades antes de imponer límites. Ningún test de software prueba equivalencia entre formas ni validez del perfil. Registrar diferencias de ayuda, recursos y exposición.

Actualizar la ficha y el memo cuando una restricción real obligue a cambiar una decisión; no cambiar silenciosamente el constructo para acomodarlo al motor. El espejo temporal de tareas puede borrarse después de consumirlo; el plan canónico queda versionado y es la referencia para revisar desviaciones.
