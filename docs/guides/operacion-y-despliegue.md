# Operación y despliegue

> Para el entorno Docker integrado usar [la guía actual de desarrollo](desarrollo-local.md) y [su arquitectura](../architecture/desarrollo-docker.md). Esta referencia conserva procedimientos y hallazgos anteriores; las variables por workspace, puertos publicados o bloqueos de arranque descritos aquí no sustituyen la configuración raíz y el diagnóstico actuales.

El repositorio contiene scripts de build/start y Compose para PostgreSQL local. No incluye una plataforma de despliegue completa, Dockerfiles para las apps, reverse proxy, workflows n8n o provisioning de Qdrant. Los pasos siguientes son un procedimiento para preparar una instancia con esos servicios ya administrados.

## Preparar el entorno

1. Revisar [hallazgos de seguridad](../architecture/seguridad.md) y [riesgos](../project/riesgos-y-pendientes.md) antes de exponer datos reales.
2. Aprovisionar PostgreSQL y servicios externos necesarios, con conexiones del entorno previsto.
3. Configurar variables backend según [la matriz](configuracion.md); `NODE_ENV=production`, `FRONTEND_URL` con el origen del sitio y credenciales propias.
4. Configurar `VITE_BACKEND_URL` y `VITE_API_URL` con la URL pública de la API antes del build frontend.
5. Definir cómo se guardan/restauran PostgreSQL, colecciones Qdrant y workflows n8n. La memoria conversacional no tiene backup persistente en el código actual.

## Compilar

```powershell
npm ci
npm run build --workspaces
```

Artefactos:

| Aplicación | Salida | Contenido |
|---|---|---|
| Frontend | `apps/frontend/dist` | HTML, CSS, JavaScript y assets públicos |
| Backend | `apps/backend/dist` | JavaScript compilado y cliente Prisma/runtime copiado |

El frontend produce un bundle grande en la revisión actual; revisar tamaño y carga para conexiones/equipos del público previsto. Las URLs `VITE_*` quedan fijadas en el build. Cambiar el entorno de la API no cambia un bundle ya publicado.

## Migrar y servir

Con una copia de seguridad y una conexión verificada de la base destino:

```powershell
npm run migrate:deploy --workspace @cybersim/backend
npm run start --workspace @cybersim/backend
```

La migración aplica el historial ya versionado. No usar `db:push`, `migrate reset` ni el seed como preparación de una base con datos reales. Migraciones con datos sensibles, nuevas restricciones o pérdida de columnas necesitan un procedimiento propio y ensayo sobre una copia.

Servir `apps/frontend/dist` mediante un hosting estático. React usa `BrowserRouter`: configurar fallback a `index.html` para rutas de interfaz como `/docente/grupo/1`, `/perfil` y `/auth/confirm`, sin interceptar endpoints reales de la API.

Express escucha en `0.0.0.0`; colocarlo detrás del mecanismo HTTPS y gestión de procesos de la infraestructura. `vite preview` es útil para revisar el build local, pero no define el hosting final. El proxy configurado en Vite no acompaña al sitio estático publicado.

## Verificación de una instancia

| Comprobación | Lo que demuestra | Límite |
|---|---|---|
| `GET /health` | Express atiende HTTP | No comprueba base ni servicios |
| Login y `/auth/me` con cuenta de prueba | Autenticación y lectura Prisma | No verifica toda la autorización |
| Guardado y consulta de intento de prueba | Persistencia de progreso | No demuestra que resultados de juego sean auténticos |
| `GET /api/chat/health` | Qdrant responde a consulta de colecciones | GPT/TTS figuran `true` sin pruebas reales |
| Una pregunta de chat | Embedding, recuperación y respuesta | Inspeccionar `success`, no solo status HTTP |
| Audio del chat | Síntesis y descarga WAV | Puede faltar y el texto seguir siendo válido |
| `GET /course-analysis/health` | Hay URL de webhook configurada | No llama n8n ni comprueba su resultado |
| Feedback/análisis con datos de prueba | Workflow y persistencia correspondiente | Genera registros y consume servicios |
| Desafío generado jugable | Generación y compatibilidad de cliente | No demuestra calidad de todas las generaciones |

Usar cuentas separadas de prueba para estas verificaciones. No llamar el webhook externo de respaldo del generador para un diagnóstico si aún no se ha identificado su entorno.

## Recuperación y mantenimiento

Reiniciar Express borra las conversaciones en memoria. Con varias réplicas, una sesión puede no conservar historia al cambiar de proceso. Si se requiere continuidad, hay que implementar memoria compartida o persistente y revisar aislamiento de usuario; el despliegue por sí solo no resuelve esa limitación.

PostgreSQL y Qdrant necesitan backups propios. Ensayar restauración además de comprobar que exista un archivo de backup. Para rollback de aplicación conservar artefactos y variables de la versión previa; el código anterior debe seguir siendo compatible con las migraciones aplicadas. El repositorio no automatiza rollback de esquema.

Los logs son de consola y no hay métricas centralizadas. Registrar fallos por servicio sin copiar claves, tokens, contraseñas o conversaciones reales en tickets. La documentación no define SLOs, política de retención ni operación institucional: son [pendientes de proyecto](../project/riesgos-y-pendientes.md).

Fuentes: [scripts backend](../../apps/backend/package.json), [build Prisma](../../apps/backend/scripts/copy-prisma-client.mjs), [server](../../apps/backend/src/server.ts), [Vite](../../apps/frontend/vite.config.ts), [CI](../../.github/workflows/ci.yml) y [modelo de datos](../architecture/modelo-de-datos.md).
