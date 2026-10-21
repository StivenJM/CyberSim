# ADR 0014: Plataforma de despliegue en un host único con Docker Compose

- Estado: aceptada por aprobación del plan de despliegue y criterio técnico delegado; implementación pendiente.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; el usuario aprobó iniciar el plan y pidió elegir la opción de menor riesgo.
- Alcance: topología de ejecución de staging y producción.
- Relación: complementa el [ADR 0006](0006-alcance-del-desarrollo-con-docker.md) y el [ADR 0010](0010-imagenes-desarrollo-por-destino.md); no los sustituye.

## Contexto

CyberSim se ejecuta hoy como un entorno de desarrollo empaquetado: ocho servicios de larga duración más trabajos de un solo uso, con 6.656 MiB de límites declarados y sin ninguna etapa de imagen de producción ([infra/node.Dockerfile](../../../infra/node.Dockerfile)). El backend no publica puerto y depende del proxy del servidor de desarrollo ([compose.yaml](../../../compose.yaml)).

Restricciones verificables: dos hosts on-prem de 16 GB, un operador, sin orquestador existente y sin requisito de alta disponibilidad declarado. El backend mantiene las sesiones de chat en memoria de proceso con un `epoch` por instancia ([sessions.ts](../../../apps/backend/src/integrations/sessions.ts)); reiniciar invalida las sesiones y varias réplicas no las compartirían.

## Decisión

Ejecutar cada entorno con Docker Compose en un host único, con un proyecto Compose por entorno. En producción, systemd inicia y supervisa el stack; en staging, Docker Desktop. Las imágenes se construyen fuera del host de producción.

## Consecuencias

- **Sin alta disponibilidad:** el host es un punto único de fallo. Se acepta con RTO de 4 h, backups fuera del host y arranque automático. No se promete continuidad.
- **Sin escalado horizontal del backend:** las sesiones en memoria lo impiden. Es un límite documentado, no una deuda inmediata.
- **Actualizaciones por imagen inmutable:** el rollback consiste en volver a un digest anterior.
- **Portabilidad:** mover staging exige el mismo par de archivos Compose, un archivo de entorno y los volúmenes; no cambios de código.

## Alternativas

- **Kubernetes:** añade control plane, ingress, almacenamiento y una disciplina operativa que nadie mantiene. Para un host y un operador, el riesgo operativo supera cualquier beneficio.
- **Docker Swarm:** menos superficie que Kubernetes, pero no aporta nada sobre Compose en un solo host.
- **systemd sin contenedores:** obliga a instalar y versionar Node, PostgreSQL, Qdrant, n8n y Piper en el host; se pierde la reproducibilidad y el aislamiento.
- **Servicios gestionados en cloud:** contradice la restricción on-prem de la universidad.

## Evidencia y validación

Docker documenta Compose para un servidor único, con overlays por entorno y sin bind mounts de código en producción: [Use Compose in production](https://docs.docker.com/compose/how-tos/production/).

Código relevante: [compose.yaml](../../../compose.yaml), [sessions.ts](../../../apps/backend/src/integrations/sessions.ts).

Criterio para considerarla implementada: `docker compose -f compose.base.yaml -f compose.deploy.yaml config` resuelve sin errores, el stack arranca con política de reinicio y sobrevive a un reinicio del host (con sesión iniciada en staging).
