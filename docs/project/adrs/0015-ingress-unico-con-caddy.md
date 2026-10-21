# ADR 0015: Ingress único con Caddy y frontend estático en el mismo origen

- Estado: aceptada por aprobación del plan y criterio técnico delegado; implementación pendiente.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; decisión incluida en el plan aprobado.
- Alcance: publicación de la aplicación, TLS, rutas y entrega del frontend.
- Relación: depende del [ADR 0014](0014-plataforma-de-despliegue-en-host-unico.md).

## Contexto

Hoy el único ingreso es el servidor de desarrollo de Vite en `127.0.0.1:5173` ([compose.yaml](../../../compose.yaml)). Ese servidor hace dos cosas que un build estático no hereda: sirve la SPA y reescribe `/api`. La reescritura conserva el prefijo para `/api/chat` y `/api/agent-malvado`, y lo elimina para el resto ([vite.config.ts](../../../apps/frontend/vite.config.ts)).

El frontend resuelve la API como `/api` relativo cuando `VITE_BACKEND_URL` está vacío ([apiConfig.ts](../../../apps/frontend/src/shared/config/apiConfig.ts)), lo que permite un solo artefacto si frontend y API comparten origen.

## Decisión

Servir el frontend compilado y el proxy desde la misma imagen de Caddy, en un único origen y un único puerto público (443):

- `/` sirve la SPA con fallback a `index.html`.
- `/api/chat*` y `/api/agent-malvado*` se reenvían a `backend:3000` **sin recortar**.
- El resto de `/api/*` se reenvía a `backend:3000` **recortando** `/api`.
- `/health/*` se reenvía a `backend:3000` sin recortar, para monitorización y agente de despliegue.

## Consecuencias

- **Un solo certificado y un solo origen:** desaparece el CORS entre sitios y no hace falta reconstruir el frontend por entorno. `FRONTEND_URL` sigue siendo necesaria para los enlaces de correo.
- **La configuración del proxy pasa a ser contrato:** una ruta nueva debe clasificarse explícitamente; si se equivoca, falla en silencio con 404.
- **El backend deja de ser alcanzable desde la LAN:** reduce superficie, pero obliga a diagnosticar a través del proxy o de la red interna.
- **La imagen web y la backend se versionan juntas:** el release debe desplegar ambas.
- **La CA interna vive en `/data`:** sin un volumen persistente, cada recreación del contenedor emite una CA distinta y la confianza instalada en los dispositivos deja de servir.

## Alternativas

- **nginx:** válido y muy conocido, pero exige gestionar el ciclo de vida del certificado por separado y una configuración más larga para el mismo resultado. Mayor probabilidad de certificado vencido.
- **Traefik:** enrutamiento dinámico por etiquetas; más piezas móviles para dos rutas.
- **Subdominios separados para API y frontend:** obliga a CORS, dos certificados y un build distinto por entorno. Se descarta por superficie y por reproducibilidad.
- **Mantener `vite preview`:** es un servidor de previsualización, sin TLS ni garantías de producción.

## Evidencia y validación

- Semántica de rutas verificada en [vite.config.ts](../../../apps/frontend/vite.config.ts) y montaje en [server.ts](../../../apps/backend/src/server.ts).
- Resolución de la URL de API en [apiConfig.ts](../../../apps/frontend/src/shared/config/apiConfig.ts).
- Caddy documenta HTTPS automático, CA local para nombres internos y reescritura de prefijos: [Automatic HTTPS](https://caddyserver.com/docs/automatic-https), [`handle_path`](https://caddyserver.com/docs/caddyfile/directives/handle_path).

Criterio para considerarla implementada: desde otro equipo de la LAN, login y guardado de un intento funcionan a través del proxy; `/api/chat` conserva el prefijo y `/auth/me` llega sin `/api`; ninguna ruta devuelve 404 por reescritura.
