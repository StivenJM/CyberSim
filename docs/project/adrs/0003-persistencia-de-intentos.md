# ADR 0003: Persistencia relacional e intentos por slug

- Estado: **Observada en implementación (retrospectiva)**.
- Fecha de documentación: 2026-10-13.
- Base revisada: `cc0c9cb`.
- Alcance: identidad, cursos, matrículas, progreso y análisis.
- Aprobación histórica: no consta.

## Contexto

Se necesita conservar usuarios, pertenencia y actividad más allá de una partida. Los escenarios son contenido del cliente y el esquema no contiene una tabla activa para sus definiciones.

## Decisión observada

Usar PostgreSQL con Prisma y migraciones versionadas para estado educativo. Registrar cada envío de resultado como una fila `progreso`, identificada por estudiante y `slug_escenario`. Conservar el historial y considerar completado un slug si hay algún éxito. Guardar feedback y análisis generados en tablas específicas.

## Consecuencias

El historial permite contar intentos y calcular ranking. No hay FK al catálogo: un slug nuevo puede persistirse sin crear una tabla/definición. Cambiar el slug necesita coordinación con datos existentes; distintos desafíos bajo el slug generado se mezclan.

Reenvíos crean filas nuevas porque no hay clave de idempotencia. Las acciones se guardan como texto y pueden no ser JSON válido. La integridad de un grupo por estudiante no está garantizada en la tabla de matrículas. Identidad y perfil se crean por separado, sin transacción conjunta.

## Alternativas de comparación

Persistir definiciones/versiones y relacionar intentos permitiría reproducibilidad. Guardar solo el mejor resultado reduciría historial, pero perdería secuencia pedagógica. Guardar acciones en JSON estructurado facilitaría validación/consulta. Esas opciones no están implementadas por este ADR retrospectivo.

## Evidencia y validación

[Esquema](../../../apps/backend/prisma/schema.prisma), [repositorio de progreso](../../../apps/backend/src/auth/infrastructure/repositories/PrismaProgresoRepository.ts), [feedback](../../../apps/backend/src/feedback/infrastructure/repositories/PrismaFeedbackPersistenceRepository.ts) y [análisis](../../../apps/backend/src/course-analysis/infrastructure/repositories/PrismaCourseAnalysisRepository.ts). La [revisión](../../architecture/revision-del-sistema.md) no ejecutó migraciones ni concurrencia contra una base real. Los límites y relaciones están en [modelo de datos](../../architecture/modelo-de-datos.md).
