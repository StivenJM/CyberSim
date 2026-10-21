# Despliegue de CyberSim

Este directorio contiene el contrato de despliegue. El entorno de desarrollo sigue
usando `compose.yaml` sin cambios.

## Requisitos

- Docker Engine o Docker Desktop con Compose **>= 2.24** (por `!override`).
- Puerto **443** libre.
- Un archivo de entorno real por host, copiado desde `deploy/env/*.example`.
- `SITE_ADDRESS` y `FRONTEND_URL` con el **mismo origen exacto**.
- Compose >= 2.24 se comprueba con `docker compose version`.

## Preparar un entorno

En Windows, el script genera el archivo con secretos aleatorios, saltos de línea
LF y permisos restringidos:

```powershell
.\deploy\bootstrap-staging.ps1 -SiteAddress https://172.31.107.26
```

El destino por defecto es `deploy/env/staging`. Rechaza una barra final y no
imprime los secretos. En Linux, copiar la plantilla y generar cada secreto con
`openssl rand -base64 48`.

Editar `deploy/env/staging` y completar:

- `SITE_ADDRESS` y `FRONTEND_URL` (por ejemplo `https://cybersim-staging.lab`).
- `POSTGRES_PASSWORD` y todos los secretos.
- `SEED_DEMO_DATA=true` solo en staging; en producción `false`.
- Credenciales de OpenAI, Google Drive y SMTP si se van a usar.

El archivo real (`deploy/env/staging` o `deploy/env/production`) está ignorado por Git.

## Desplegar en staging

```sh
docker compose -f compose.yaml -f compose.deploy.yaml \
  --env-file deploy/env/staging -p cybersim-staging up -d --build
```

La primera vez descarga imágenes, aplica migraciones y sincroniza el catálogo.
No crea cuentas demo salvo que `SEED_DEMO_DATA=true`.

## Verificar

```sh
curl -k https://<SITE_ADDRESS>/health/ready      # 200 {"ready":true}
curl -k https://<SITE_ADDRESS>/health/status     # inventario completo
curl -k https://<SITE_ADDRESS>/build-info.json   # versión y commit del frontend
curl -k https://<SITE_ADDRESS>/                  # SPA
```

Si `ready` es 503, revisar `components.database` y `components.coordinator`.
Si el navegador advierte por el certificado, es esperado: Caddy usa su CA interna
(ADR 0018). Instalar la raíz de Caddy o usar un certificado institucional elimina
la advertencia sin cambiar el diseño.

## Operación

```sh
# Estado y logs
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging ps
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging logs -f backend

# Detener conservando datos
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging down

# Destruir datos (solo staging desechable)
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging down -v
```

`n8n` no se publica: se administra por túnel SSH al puerto `5678` en loopback.

## Producción

Producción no se despliega con este comando manual. Usa el agente pull y
`deploy.sh <version>` de la Fase 4, con el Release aprobado. Antes del go-live
deben estar cerradas las compuertas: autorización en `/groups` y `/progreso`,
y privacidad/retención aprobada.

## Procedimiento del host de staging (Windows Home)

1. Activar virtualización en BIOS/UEFI.
2. `wsl --install` como administrador y reiniciar.
3. Instalar Docker Desktop *per-user*, backend WSL 2, iniciar y aceptar términos.
4. Activar el inicio de Docker Desktop al iniciar sesión.
5. Crear `%USERPROFILE%\.wslconfig` con `memory=10GB` y `swap=2GB`.
6. Reservar IP por DHCP o solicitar IP fija.
7. Firewall de Windows: entrada **solo TCP 443**. Comprobar el perfil con
   `Get-NetConnectionProfile`: si la red es `Public`, una regla para `Private`
   no aplica. Limitar el alcance a la subred del laboratorio con `-RemoteAddress`
   en lugar de abrir 443 a toda la red del campus. Staging usa cuentas demo
   conocidas y no debe quedar expuesto a una red amplia.
8. Deshabilitar suspensión e hibernación.
9. Verificar `docker run --rm hello-world` y `docker compose version >= 2.24`.

Tras un reinicio, Docker Desktop necesita una sesión iniciada. Es una limitación
del host, no del despliegue (ADR 0022).
