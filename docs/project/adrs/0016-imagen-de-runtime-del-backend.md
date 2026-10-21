# ADR 0016: Imagen de runtime del backend

- Estado: aceptada por criterio técnico delegado; verificación de construcción pendiente.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; el usuario delegó la elección de menor riesgo con investigación.
- Alcance: construcción, contenido y privilegios de la imagen del backend.
- Relación: extiende el [ADR 0010](0010-imagenes-desarrollo-por-destino.md), que solo cubre destinos de desarrollo.

## Contexto

El backend compila con `prisma generate && tsc` y copia el cliente generado de `src/generated/prisma` a `dist/generated/prisma` ([package.json](../../../apps/backend/package.json), [copy-prisma-client.mjs](../../../apps/backend/scripts/copy-prisma-client.mjs)). El esquema genera el cliente en una ruta propia, no en `node_modules`.

Dependencias relevantes: `bcrypt` (módulo nativo), `@prisma/adapter-pg` y `@prisma/client` (Prisma 7 con adaptador de driver), y `pg`. El monorepo usa pnpm 12.14 con lockfile único.

Riesgos a evitar: incluir el toolchain y las dependencias de desarrollo en producción; ejecutar como root; hornear secretos en capas; depender de enlaces simbólicos del store de pnpm que no sobreviven a una copia.

## Decisión

1. **Etapa de runtime separada** de la etapa de construcción, sobre la misma base fijada por digest (`node:24.22.0-bookworm-slim`).
2. **`pnpm --filter @cybersim/backend --prod deploy`** para producir un paquete portable con `node_modules` aislado y sin dependencias de desarrollo.
3. Copiar **explícitamente** `dist` (que ya incluye `dist/generated/prisma`) y los artefactos necesarios; no confiar en que `pnpm deploy` los incluya, porque respeta `.gitignore`.
4. Añadir solo `ca-certificates` y `openssl` en runtime (TLS saliente y compatibilidad de Prisma).
5. **`USER node` (uid 1000)** y `CMD ["node","dist/server.js"]` en forma exec.
6. `init: true` en Compose para el manejo de señales; el proceso ya cierra con SIGTERM y `process.exit` diferido 30 s ([server.ts](../../../apps/backend/src/server.ts)).
7. Sin `corepack`, sin pnpm y sin código fuente en la imagen final.

## Consecuencias

- Menor superficie: sin compilador, sin dependencias de desarrollo, sin gestor de paquetes.
- Los volúmenes `/state` y `/cache` deben ser escribibles por uid 1000. Como Docker crea los volúmenes nombrados como root, hace falta un servicio de inicialización que ajuste la propiedad una vez, o volúmenes preparados. No se resuelve con `USER root` en la aplicación.
- `pnpm deploy` puede fallar si el grafo tiene peers ambiguos; el build debe verificar el resultado y no asumir éxito.
- El cliente Prisma generado debe viajar dentro de `dist`; si se mueve la ruta de generación, el runtime falla al arrancar.

## Alternativas

- **Alpine:** imagen menor, pero musl obliga a compilar `bcrypt` y complica los binarios de Prisma; requeriría toolchain en el build y pruebas específicas. El ahorro de tamaño no compensa el riesgo de un fallo nativo en producción.
- **Distroless:** mínima superficie, pero sin shell ni utilidades de diagnóstico y con requisitos propios para Prisma/OpenSSL. Se difiere hasta tener observabilidad madura.
- **Una sola etapa:** incluye fuentes, toolchain y devDependencies; es la opción de mayor superficie.
- **Copiar `node_modules` del workspace:** arrastra devDependencies y enlaces del store de pnpm, que no son portables entre etapas.

## Evidencia y validación

- [Docker: buenas prácticas de build](https://docs.docker.com/build/building/best-practices/) (multi-stage, usuario no root, fijar digest).
- [nodejs/docker-node: buenas prácticas](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md) (uid 1000, `CMD` en forma exec, init, límites de memoria).
- [pnpm deploy](https://pnpm.io/cli/deploy) (paquete portable, `--prod`, respeta `files`/`.npmignore`/`.gitignore`).
- Código: [node.Dockerfile](../../../infra/node.Dockerfile), [copy-prisma-client.mjs](../../../apps/backend/scripts/copy-prisma-client.mjs), [prisma.ts](../../../apps/backend/src/auth/infrastructure/db/prisma.ts).

Criterio para considerarla implementada: la imagen arranca sin código montado, responde `/health/live`, el proceso corre como uid 1000, no contiene `devDependencies` ni el compilador de TypeScript, y el cliente Prisma generado está presente en `dist`.
