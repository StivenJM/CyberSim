# ADR 0019: Readiness desacoplado del entorno de desarrollo

- Estado: aceptada por criterio técnico delegado; implementación pendiente.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; decisión incluida en el plan aprobado (Fase 1).
- Alcance: señales de salud, monitorización y despliegue automatizado.
- Relación: complementa el [ADR 0015](0015-ingress-unico-con-caddy.md).

## Contexto

`/health/ready` consulta `http://frontend:5173/__dev/fingerprint` ([routes.ts](../../../apps/backend/src/integrations/routes.ts)), un endpoint que solo existe en el servidor de desarrollo de Vite. En un despliegue estático nunca responderá: la verificación queda en `unavailable` y el estado nunca pasa a `passed`. Cualquier monitor o agente de despliegue lo interpretaría como caída permanente.

Además, la misma señal devuelve 503 si falta SMTP, Drive u otra dependencia opcional, mezclando **disponibilidad para servir** con **inventario de dependencias**.

## Decisión

1. **Readiness** responde si el proceso puede atender tráfico: proceso vivo y base de datos accesible. Es la señal que usan el proxy, el agente de despliegue y la monitorización.
2. **Diagnóstico** se expone en un endpoint separado con el inventario completo (Qdrant, Piper, SMTP, Drive, OpenAI configurado). No devuelve 503 por dependencias opcionales.
3. El frontend emite un **`build-info.json`** en el build (versión y hash). Readiness lo consulta a través del proxy para verificar que el frontend servido corresponde al release; si no puede leerlo, lo reporta como diagnóstico, no como caída.
4. `/health/live` se mantiene como liveness puro.

## Consecuencias

- La monitorización deja de producir falsos negativos en un despliegue estático.
- El agente pull puede decidir correctamente si un release quedó sano.
- Se añade un artefacto de build (`build-info.json`) que debe regenerarse en cada release; si se sirve desde caché, la verificación de versión sería engañosa.
- Cambia el contrato de `/health/ready`: los consumidores actuales deben revisarse.

## Alternativas

- **Eliminar la comprobación del frontend:** pierde la verificación de que el bundle servido es el esperado; un despliegue parcial podría pasar desapercibido.
- **Mantenerla como está:** garantiza un 503 permanente en producción.
- **Readiness solo de proceso:** no detecta una base caída, que es el fallo más probable.

## Evidencia y validación

- Comportamiento actual: [routes.ts](../../../apps/backend/src/integrations/routes.ts) (fingerprint y estado), [server.ts](../../../apps/backend/src/server.ts) (liveness).
- Principio de disposabilidad y arranque rápido: [12-Factor VI](https://12factor.net/processes) y [12-Factor IX](https://12factor.net/disposability).
- Healthchecks de contenedor: [Docker: HEALTHCHECK](https://docs.docker.com/reference/dockerfile/#healthcheck).

Criterio para considerarla implementada: con el stack estático, `/health/ready` devuelve 200; al detener PostgreSQL devuelve 503; el endpoint de diagnóstico lista las dependencias sin alterar readiness.
