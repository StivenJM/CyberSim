# ADR 0017: Aislamiento de entornos por proyecto Compose y archivos de entorno

- Estado: aceptada por criterio técnico delegado; implementación pendiente.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; el usuario exigió entornos independientes en configuraciones, credenciales y datos.
- Alcance: staging y producción; no modifica el entorno de desarrollo.
- Relación: aplica el [ADR 0008](0008-persistencia-funcional-compartida-entre-entornos.md) al despliegue.

## Contexto

El [ADR 0008](0008-persistencia-funcional-compartida-entre-entornos.md) fija el mismo contrato de datos y migraciones en cada entorno **sin compartir datos ni credenciales**. El [ADR 0006](0006-alcance-del-desarrollo-con-docker.md) decidió, para desarrollo, reutilizar el volumen `cybersim_postgres_data`.

Hoy el volumen tiene nombre explícito ([compose.yaml](../../../compose.yaml)), lo que impediría ejecutar dos stacks en el mismo host sin que compartan base de datos. Además, todas las credenciales viven en un único `.env` generado por el bootstrap de desarrollo.

## Decisión

1. Un **proyecto Compose por entorno**: `cybersim-staging` y `cybersim-prod`.
2. Un **archivo de entorno por host** (`.env.staging`, `.env.production`), no versionado, con permisos restringidos y secretos distintos.
3. **Retirar el `name:` explícito** del volumen de PostgreSQL. Docker Compose antepone el nombre del proyecto, por lo que en desarrollo el volumen sigue llamándose `cybersim_postgres_data` (proyecto `cybersim`, clave `postgres_data`), mientras que en despliegue queda aislado por el nombre del proyecto.
4. Secretos independientes por entorno: `JWT_SECRET`, `INTERNAL_SIGNING_KEY`, `N8N_ENCRYPTION_KEY`, tokens internos y `OPENAI_API_KEY`.
5. **Nunca** copiar volúmenes entre entornos. `n8n_data` está cifrado con su propia clave; con otra, las credenciales quedan ilegibles.
6. **Nunca** restaurar un dump de producción en staging sin anonimizar.

## Consecuencias

- Dos entornos pueden convivir en un host sin compartir datos, lo que también sirve si staging se traslada temporalmente.
- El archivo de entorno se convierte en el único artefacto específico del host; un error al elegirlo apunta al entorno equivocado. El script de despliegue debe exigir el nombre del entorno y rechazar el valor por defecto.
- Los respaldos deben etiquetarse por entorno para evitar restauraciones cruzadas.
- El entorno de desarrollo conserva su volumen y su flujo actual: la decisión no revoca D04.

## Alternativas

- **Perfiles de Compose en un solo proyecto:** comparten nombres de volumen y red; el aislamiento depende de disciplina manual. Se descarta.
- **Un repositorio por entorno:** duplica el compose y produce divergencia; el objetivo es el mismo artefacto con distinta configuración.
- **Hosts separados como único mecanismo de aislamiento:** es cierto hoy, pero staging se moverá y podría compartir host; el aislamiento debe estar en la configuración, no solo en la máquina.

## Evidencia y validación

- Requisito de no compartir datos ni credenciales: [ADR 0008](0008-persistencia-funcional-compartida-entre-entornos.md).
- Reutilización del volumen en desarrollo: [ADR 0006](0006-alcance-del-desarrollo-con-docker.md).
- Nombres de proyecto y volumen: [compose.yaml](../../../compose.yaml) y la documentación de [proyectos Compose](https://docs.docker.com/compose/how-tos/project-name/).
- Cifrado de credenciales de n8n con clave propia: [compose.yaml](../../../compose.yaml) (`N8N_ENCRYPTION_KEY`).

Criterio para considerarla implementada: `docker compose -p cybersim-prod config` y `-p cybersim-staging config` producen volúmenes distintos; un `down -v` en staging no afecta a producción; los secretos de ambos archivos no coinciden.
