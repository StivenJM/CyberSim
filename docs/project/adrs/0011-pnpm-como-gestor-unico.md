# ADR 0011: pnpm como gestor de dependencias

- Estado: Incorporada por solicitud del usuario; verificaciones registradas en la guía de calidad.
- Fecha: 2026-10-19.
- Alcance: desarrollo local, Docker, mantenimiento y CI.
- Relación: actualiza el gestor descrito en ADR 0001, el contrato Docker y ADR 0010; conserva las dos apps y los destinos independientes.

## Contexto

El usuario solicitó sustituir npm por pnpm y comprobar lint, tests, build y Docker. Los scripts de infraestructura, Playwright y la huella del backend también consumían comandos o archivos de npm.

## Decisión

Fijar pnpm 12.14.0 en [package.json](../../../package.json) y declarar las apps en [pnpm-workspace.yaml](../../../pnpm-workspace.yaml). Es la última versión estable comprobada en el [registro oficial](https://registry.npmjs.org/pnpm/latest) el 2026-10-19, elegida por solicitud expresa del usuario tras la validación inicial con 11.25.0. Usar exclusivamente `pnpm-lock.yaml`, importado del lockfile anterior, con instalaciones congeladas en Docker y CI. Node requiere >=22.13.0; Docker y CI usan 24.22.0.

Declarar las dependencias usadas directamente: `pg` para las herramientas de infraestructura en la raíz, `three-stdlib` en frontend y `@types/express-serve-static-core` en backend. Mantener las versiones ya presentes. La resolución de peers unifica Three.js con la versión 0.180.0 del frontend y elimina la copia anterior 0.170.0.

Autorizar explícitamente los scripts de instalación de Prisma, bcrypt, esbuild y fsevents. Generar el cliente Prisma con el script del backend después de instalar. Los comandos de arranque no instalan dependencias automáticamente.

Docker instala por filtro en las imágenes de aplicación y conserva la instalación completa para herramientas. La base activa pnpm con Corepack y ejecuta `pnpm --version` para descargar el ejecutable nativo de pnpm 12 durante el build. CI usa `pnpm/action-setup` v6 fijada por commit, que admite pnpm 12 y lee la versión de `packageManager`. BuildKit cachea el store; los enlaces y dependencias permanecen dentro de las imágenes Linux. Compose Watch reconstruye ante cambios del lockfile o configuración de pnpm. La huella de evidencia incorpora lockfile, configuración del workspace y manifiesto raíz.

El mantenimiento modifica manifiestos/lockfile en `/host`, sin instalar paquetes allí. Las migraciones usan las herramientas de `/workspace` y montan el directorio Prisma para persistir SQL en el host.

## Consecuencias

Los comandos de calidad se ejecutan desde la raíz (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`). Las operaciones por app usan `pnpm --filter @cybersim/frontend …` o `pnpm --filter @cybersim/backend …`. Cambiar el gestor exige reinstalar dependencias locales y reconstruir imágenes.

El aislamiento de pnpm exige declarar los paquetes importados directamente. Los futuros paquetes con scripts de instalación necesitan una decisión explícita en `allowBuilds`.

## Alternativas

Conservar npm no satisface la solicitud. Activar hoisting global ocultaría dependencias sin declarar; se mantienen los enlaces aislados de pnpm. No se actualizan masivamente los paquetes ni se incorpora otro coordinador de monorepo.

## Evidencia y validación

Implementación en [Dockerfile](../../../infra/node.Dockerfile), [Compose](../../../compose.yaml), [mantenimiento](../../../scripts/dev.ps1), [CI](../../../.github/workflows/ci.yml) y [huella del backend](../../../apps/backend/src/integrations/evidence.ts). Procedimiento y resultados en [pruebas y calidad](../../guides/pruebas-y-calidad.md).

Referencias oficiales: [importación del lockfile](https://pnpm.io/cli/import), [scripts de dependencias](https://pnpm.io/settings/build) y [Docker](https://pnpm.io/docker).
