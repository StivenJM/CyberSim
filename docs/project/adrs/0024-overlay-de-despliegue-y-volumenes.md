# ADR 0024: Overlay de despliegue y aislamiento de volúmenes

- Estado: aceptada por criterio técnico delegado; verificada en un stack local.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; decisión incluida en el plan aprobado (Fase 1).
- Alcance: contrato de despliegue, nombres de volumen, rutas de salud y plantillas de entorno.
- Relación: implementa los [ADR 0014](0014-plataforma-de-despliegue-en-host-unico.md) y [ADR 0017](0017-aislamiento-de-entornos.md); complementa el [ADR 0015](0015-ingress-unico-con-caddy.md).

## Contexto

`compose.yaml` describe el entorno de desarrollo: el servicio `frontend` es el servidor de Vite, publica `127.0.0.1:5173`, el seed está activo y el volumen de PostgreSQL tiene un nombre fijo (`cybersim_postgres_data`). Un despliegue no puede heredar nada de eso.

Duplicar el archivo completo en un `compose.production.yaml` evita las reglas de fusión, pero crea dos fuentes de verdad que se separan con el tiempo: un límite de memoria, un healthcheck o una imagen que se actualiza en un archivo y no en el otro. El desacoplamiento se paga con deriva silenciosa, que es un riesgo mayor que una regla de fusión explícita.

## Decisión

1. **Overlay sobre el archivo base:** `docker compose -f compose.yaml -f compose.deploy.yaml`. No se duplica el grafo de servicios.
2. **El servicio `frontend` conserva el nombre** pero en despliegue usa la imagen estática con Caddy. Se sobrescriben `build.target`, `image`, `command`, `environment` y `ports`.
3. **`ports: !override`** reemplaza la publicación de Vite por `443:443`. Sin `!override`, Compose fusionaría ambas listas y dejaría 5173 expuesto. Esto exige **Compose >= 2.24**.
4. **Se retira el `name:` fijo del volumen de PostgreSQL.** El nombre por defecto es `<proyecto>_postgres_data`: en desarrollo el proyecto se llama `cybersim`, por lo que el volumen sigue siendo `cybersim_postgres_data`; staging y producción quedan aislados por su nombre de proyecto.
5. **Caddy expone `/health/*` en la raíz** además de `/api/health/*` (que recorta el prefijo). Monitorización y agente usan la ruta raíz; el frontend conserva la ruta con `/api`.
6. **Plantillas de entorno en `deploy/env/*.example`**, con los archivos reales ignorados por Git. Los valores sensibles nunca viven en el compose.
7. **Producción no construye en el host:** el agente pull usa referencias por digest y `--no-build`. `--build` queda para desarrollo y para la primera verificación local.

## Consecuencias

- Una sola definición de PostgreSQL, Qdrant, n8n, Piper y sus límites; el overlay solo cambia lo que difiere.
- El bloque `develop` del servicio `frontend` se hereda y se ignora sin `--watch`; no afecta al despliegue, pero debe recordarse al leer el archivo.
- La versión mínima de Compose pasa a ser un requisito operativo verificable.
- `/health/status` es público en la LAN y muestra el estado de configuración de dependencias y la versión del build. No expone secretos; la superficie se limita con firewall y, si hiciera falta, con una regla de red interna.
- El archivo de entorno real es el único artefacto específico del host; un error al elegirlo apunta al entorno equivocado. El comando de despliegue debe exigir el nombre del entorno.
- Los volúmenes de Caddy (`/data`, `/config`) persisten la CA interna; sin ellos, cada recreación emite una CA distinta.

## Alternativas

- **Archivo independiente de producción:** sin reglas de fusión, pero duplica servicios y límites; la deriva entre ambos archivos es un riesgo operativo y de seguridad.
- **Refactor a `compose.base.yaml` + `compose.dev.yaml` + `compose.deploy.yaml`:** es la solución más limpia a largo plazo, pero cambia el flujo de desarrollo actual y añade una migración que no es necesaria para habilitar staging. Se reevalúa cuando staging esté probado.
- **Mantener el nombre fijo del volumen:** impide ejecutar dos entornos en el mismo host y convierte un `down -v` mal dirigido en pérdida de datos del otro entorno.
- **Publicar 80 para redirigir a 443:** no aporta nada en una LAN sin dominio público; se publica solo 443.

## Evidencia y validación

- `docker compose config` con el overlay: `frontend.ports` resuelve únicamente a 443; `backend.build.target` es `backend-runtime`; `NODE_ENV=production`; `migrate.SEED_DEMO_DATA=false`; `postgres_data` resuelve a `cybersim-deploycheck_postgres_data`.
- `docker compose config` sin overlay: el proyecto sigue siendo `cybersim`, el volumen `cybersim_postgres_data`, el puerto 5173 y el seed activo.
- Stack local con el overlay (PostgreSQL, migración, backend y web): `/health/ready` y `/api/health/ready` responden 200 con `database` y `coordinator` en `ready`; `/health/status` responde 200; `/build-info.json` sirve la versión; `/` y la ruta SPA responden 200; `/api/auth/me` responde 401; el conteo de estudiantes es 0 con el seed desactivado; las políticas de reinicio son `unless-stopped`.
- Hallazgo corregido durante la verificación: `docker compose up` sin `--build` reutilizó una imagen `tools-dev` anterior al cambio del seed y ejecutó el seed. El comando documentado incluye `--build`; producción usa digest, no imágenes locales.
- Criterio para considerarla implementada: el stack del overlay arranca, migra, responde salud y no crea cuentas demo con el seed desactivado.
