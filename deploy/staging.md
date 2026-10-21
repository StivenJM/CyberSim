# Guía de staging

> Entorno **temporal** de pruebas. Datos sintéticos. No es producción.
> Windows Home + Docker Desktop. Requiere una sesión iniciada tras cada reinicio.

Esta guía cubre la puesta en marcha y el mantenimiento del staging. El contrato
de despliegue y las decisiones están en [`README.md`](README.md) y en los ADR
0014–0024.

---

## 1. Qué es y qué no es

| Sí | No |
|---|---|
| Pruebas de despliegue, rutas, TLS y datos demo | Producción o datos reales |
| Acceso desde equipos de la LAN del laboratorio | Exposición a internet |
| Recuperación tras reinicio con sesión iniciada | Alta disponibilidad |
| Datos descartables | Backups obligatorios |

**Limitaciones conocidas:** Windows Home no soporta Hyper-V; Docker Desktop no
corre como servicio; el certificado es de la CA interna de Caddy; las cuentas
demo tienen contraseñas conocidas. Nada de esto se corrige con configuración:
son límites del host y del alcance.

---

## 2. Requisitos del host

- Windows 10/11 Home, 16 GB RAM, 256 GB disco, virtualización activa.
- WSL 2 y Docker Desktop *per-user* con backend WSL 2.
- Docker Compose **>= 2.24**.
- IP reservada (DHCP o fija) y `SITE_HOST` estable.
- Firewall: solo TCP 443, con alcance limitado a la subred del laboratorio.
- `%USERPROFILE%\.wslconfig`:

  ```ini
  [wsl2]
  memory=10GB
  swap=2GB
  ```

- Suspensión e hibernación deshabilitadas.

---

## 3. Primera puesta en marcha

### 3.1 Código

```powershell
cd C:\Users\User
git clone <URL-DEL-REPO> CyberSim
cd CyberSim
git checkout feat/deploy-staging-production
```

### 3.2 Comprobar el puerto y la red

```powershell
netstat -ano | findstr :443
Get-NetConnectionProfile
```

- Si 443 está ocupado, identificar el proceso con `Get-Process -Id <PID>` y
  liberar el puerto antes de continuar.
- Anotar el perfil de red (`Private` o `Public`): la regla de firewall debe
  coincidir.

### 3.3 Crear el entorno

```powershell
.\deploy\bootstrap-staging.ps1 -SiteAddress https://172.31.107.26
```

Genera `deploy/env/staging` con secretos de 48 bytes, LF y ACL restringida.
Completar después OpenAI, Google Drive y SMTP si se van a usar.

> **No volver a ejecutar el bootstrap** una vez inicializada la base: regenera
> los secretos y la contraseña de PostgreSQL deja de coincidir con el volumen.

### 3.4 Firewall

```powershell
# Ajustar el perfil y la subred a la red real del laboratorio
New-NetFirewallRule -DisplayName "CyberSim HTTPS" -Direction Inbound -Action Allow `
  -Protocol TCP -LocalPort 443 -Profile Private -RemoteAddress 172.31.107.0/24
```

Si el perfil es `Public`, cambiar `-Profile Private` por `-Profile Public`.
No abrir 443 a toda la red del campus: staging usa cuentas demo conocidas.

### 3.5 Desplegar

```powershell
docker compose -f compose.yaml -f compose.deploy.yaml `
  --env-file deploy/env/staging -p cybersim-staging up -d --build
```

La primera vez descarga imágenes y compila backend y frontend. Puede tardar
varios minutos.

### 3.6 Verificar

```powershell
docker compose -f compose.yaml -f compose.deploy.yaml `
  --env-file deploy/env/staging -p cybersim-staging ps

# Salud del backend sin depender de curl.exe (Schannel roto en este host)
docker compose -f compose.yaml -f compose.deploy.yaml `
  --env-file deploy/env/staging -p cybersim-staging exec backend `
  node -e "fetch('http://localhost:3000/health/ready').then(async r=>console.log(r.status, await r.text()))"
```

Esperado: `200 {"ready":true,...,"database":"ready","coordinator":"ready"}`.

Desde el navegador de otro equipo:

1. Abrir `https://172.31.107.26`.
2. Aceptar la advertencia del certificado (CA interna; no hay cadena pública).
3. Iniciar sesión con `profesor@test.com` / `password123`.
4. Cargar un escenario y guardar un intento.

Si el navegador muestra `ERR_SSL_PROTOCOL_ERROR`, revisar que `SITE_HOST`
exista y coincida con el host de `SITE_ADDRESS` (ver §6).

---

## 4. Mantenimiento rutinario

### 4.1 Antes de cada uso o demo

```powershell
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging ps
```

Comprobar: `postgres` y `backend` en `healthy`, `frontend` arriba y 443
publicado. Después abrir la aplicación y verificar login.

### 4.2 Actualizar a una nueva versión

```powershell
git pull

docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging `
  build migrate backend frontend

# Migraciones y catálogo antes de recrear la aplicación
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging `
  run --rm migrate

docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging `
  up -d
```

Verificar §3.6. Si algo falla, ver §4.7 (staging es descartable).

### 4.3 Tras reiniciar el PC o Docker Desktop

1. Iniciar sesión en Windows.
2. Abrir Docker Desktop y esperar a que el motor esté listo.
3. `docker compose ... up -d`.
4. Verificar §3.6.

`restart: unless-stopped` levanta los contenedores, pero **Docker Desktop debe
estar ejecutándose**. Sin sesión iniciada, staging está caído.

### 4.4 Logs y diagnóstico

```powershell
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging logs --tail 100 backend
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging logs --tail 100 frontend
docker stats --no-stream
```

Diagnóstico completo de dependencias (Qdrant, Piper, SMTP, Drive, OpenAI):
abrir `https://172.31.107.26/health/status` o ejecutar el comando de §3.6 contra
`/health/status`.

### 4.5 Disco

```powershell
docker system df
docker image prune -f
docker builder prune -f
```

Conservar al menos la imagen actual y la anterior si se quiere volver atrás.
No borrar los volúmenes: contienen la base y la CA de Caddy.

### 4.6 Secretos

- Rotar un secreto de aplicación: editar `deploy/env/staging`, recrear los
  servicios afectados con `up -d`.
- **No** rotar `POSTGRES_PASSWORD` sin cambiar también el rol en PostgreSQL; en
  staging es más simple reconstruir (§4.7).
- Mantener el archivo con ACL restringida; no versionarlo.

### 4.7 Reconstruir staging desde cero

Solo con datos sintéticos:

```powershell
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging down -v
docker compose -f compose.yaml -f compose.deploy.yaml --env-file deploy/env/staging -p cybersim-staging up -d --build
```

Esto elimina base, Qdrant, n8n y la CA de Caddy. Es el procedimiento de
recuperación aceptado para staging.

### 4.8 Respaldos (opcional)

Staging es descartable. Si necesitas conservar datos para una demo:

```powershell
docker exec cybersim-staging-postgres-1 pg_dump -U cybersim -Fc cybersim > staging.dump
```

No se automatiza: el respaldo obligatorio es de producción (Fase 3).

### 4.9 Cambio de IP

Si cambia la IP del equipo, actualizar en `deploy/env/staging`:

- `SITE_ADDRESS=https://<nueva-ip>`
- `SITE_HOST=<nueva-ip>`
- `FRONTEND_URL=https://<nueva-ip>`

Después recrear el frontend. El certificado anterior deja de servir. La solución
estable es una reserva DHCP.

---

## 5. Problemas conocidos

| Síntoma | Causa | Acción |
|---|---|---|
| `ERR_SSL_PROTOCOL_ERROR` | Falta `SITE_HOST`/`default_sni` o no coincide con el origen | Corregir y recrear `frontend` |
| Advertencia de certificado | CA interna de Caddy | Aceptar o instalar la raíz; es esperado |
| `ready` 503, `database: unavailable` | PostgreSQL o migración | `ps`, logs de `postgres` y `migrate` |
| 443 ocupado | Otro proceso de Windows | `netstat -ano` y liberar |
| El stack no vuelve tras reiniciar | Docker Desktop sin sesión | Iniciar sesión y `up -d` |
| `curl.exe` falla con `SEC_E_INTERNAL_ERROR` | Schannel/LSA del host | Usar navegador o el comando Node de §3.6 |
| Chat pierde contexto tras reiniciar | Sesiones en memoria | Comportamiento conocido |
| n8n no responde desde otro equipo | Solo publica en loopback | Túnel SSH al puerto 5678 |

---

## 6. Criterios de aceptación de staging

| # | Criterio | Cómo se comprueba |
|---|---|---|
| 1 | Acceso desde otro equipo de la LAN | Abrir `https://172.31.107.26` desde otro equipo |
| 2 | Login y guardado | `profesor@test.com` / `password123`; cargar escenario y guardar intento |
| 3 | Solo 443 expuesto | `Get-NetTCPConnection` y firewall |
| 4 | Reinicio de Docker Desktop | Cerrar y abrir; el stack vuelve con datos |
| 5 | Reinicio de Windows + sesión | Reiniciar, iniciar sesión, `up -d`, verificar |
| 6 | Consumo <= 10 GB | `docker stats --no-stream` |

---

## 7. Paso a producción

Producción no se despliega con esta guía. Cambia el host a Ubuntu, el disparo a
un Release aprobado, los datos a reales y los respaldos a obligatorios. Antes
del go-live deben estar cerradas las compuertas:

- autorización en `/groups` y `/progreso` (RP-01);
- privacidad y retención aprobadas por la institución.

Ver el plan en `workspace/0.1.fases-cd.md` y los ADR 0021 y 0023.
