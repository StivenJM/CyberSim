# ADR 0013: escenarios modulares y versionados

- Estado: aceptada e incorporada por solicitud del usuario
- Fecha de documentación: 20 de octubre de 2026

## Contexto

Los ejercicios estaban definidos como objetos TypeScript grandes y se registraban de forma independiente para selección, RAG y nombres del backend. El entorno 3D y el ECS ya ofrecían piezas reutilizables, pero el contenido no tenía un contrato de publicación ni una identidad de revisión asociada a los intentos.

Se prevé incorporar más ejercicios y, en el futuro, permitir que un administrador los prepare desde la aplicación. La extensibilidad no debe convertir datos editoriales en código ejecutable ni diluir el dominio de ciberseguridad.

## Decisión

Adoptar una arquitectura híbrida:

- capacidades, verificadores, activos y perfiles visuales confiables permanecen en código;
- cada ejercicio es un manifiesto declarativo con versión, revisión, capacidades, entorno, semilla y SHA-256;
- un catálogo único descubre, valida y publica definiciones;
- el paquete del contrato expone TypeScript fuente a los workspaces, de modo que desarrollo, tests y builds no dependen de un paso previo de compilación;
- un compilador canónico adapta manifiestos incorporados o generados al ECS;
- PostgreSQL conserva revisiones inmutables y los intentos registran la revisión utilizada;
- el ciclo de autoría persistido es `draft → validated → published → archived`.

## Consecuencias

- Agregar un ejercicio con capacidades existentes requiere principalmente un archivo y pruebas, no modificar registros paralelos.
- Agregar una capacidad sigue siendo un cambio de código revisado.
- El historial puede distinguir dos revisiones del mismo slug.
- Los datos anteriores siguen legibles, aunque no puedan recuperar una revisión que nunca almacenaron.
- La publicación requiere sincronizar explícitamente revisiones con PostgreSQL.
- Una futura interfaz administrativa deberá usar los mismos validadores y estados; no está incluida en esta decisión.

## Evidencia

- `packages/scenario-contract/src/index.ts`
- `apps/frontend/src/scenarios/`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/scripts/sync-scenarios.ts`
- [Resumen de arquitectura](../../architecture/escenarios-modulares.md)
