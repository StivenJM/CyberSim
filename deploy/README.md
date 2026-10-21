# Despliegue de CyberSim

Contrato de despliegue. El entorno de desarrollo sigue usando `compose.yaml`
sin cambios.

- **Puesta en marcha y mantenimiento de staging:** [staging.md](staging.md).
- **Decisiones de arquitectura:** ADR 0014–0024 en `docs/project/adrs/`.
- **Plan y riesgos:** `workspace/0.1.fases-cd.md`.

## Requisitos

- Docker Engine o Docker Desktop con Compose **>= 2.24** (por `!override`).
- Puerto **443** libre.
- Un archivo de entorno real por host, copiado desde `deploy/env/*.example`.
- `SITE_ADDRESS` y `FRONTEND_URL` con el **mismo origen exacto**.
- `SITE_HOST` con el host de `SITE_ADDRESS` (sin `https://`). Es obligatorio
  para que Caddy elija el certificado cuando el cliente conecta por IP y no
  envía SNI.

## Contrato de entorno

| Variable | Uso |
|---|---|
| `COMPOSE_PROJECT_NAME` | Aísla proyecto, red y volúmenes |
| `SITE_ADDRESS` | Origen público, por ejemplo `https://172.31.107.26` |
| `SITE_HOST` | Host sin esquema; debe coincidir con `SITE_ADDRESS` |
| `FRONTEND_URL` | CORS y enlaces de correo; igual a `SITE_ADDRESS` |
| `RELEASE_VERSION` | Etiqueta de las imágenes construidas localmente |
| `SEED_DEMO_DATA` | `true` solo en desarrollo/staging; nunca en producción |
| `POSTGRES_*` | Usuario, contraseña y base |
| `JWT_SECRET`, `INTERNAL_SIGNING_KEY`, tokens de n8n | Secretos propios por entorno |
| `OPENAI_*`, `GOOGLE_*`, `SMTP_*` | Integraciones externas |

Las plantillas están en `deploy/env/*.example`; los archivos reales están
ignorados por Git. En Windows, `deploy/bootstrap-staging.ps1` genera secretos,
LF y ACL restringida.

## Comandos base

```sh
docker compose -f compose.yaml -f compose.deploy.yaml \
  --env-file deploy/env/staging -p cybersim-staging up -d --build
```

El overlay reemplaza el servidor de Vite por la imagen estática con Caddy,
publica solo 443, activa `NODE_ENV=production`, fija el seed según el entorno y
persiste la CA de Caddy. El procedimiento completo, la verificación y el
mantenimiento están en [staging.md](staging.md).

## Producción

Producción no se despliega con este comando manual. Usa el agente pull y
`deploy.sh <version>` de la Fase 4, con el Release aprobado. Antes del go-live
deben estar cerradas las compuertas:

- autorización en `/groups` y `/progreso`;
- privacidad y retención aprobadas por la institución.

Ver ADR 0021 y 0023.
