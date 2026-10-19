# Pruebas y calidad

Los checks se ejecutan por workspace desde la raíz. La [revisión del sistema](../architecture/revision-del-sistema.md) registra resultados de una ejecución concreta y sus límites; esta guía describe el procedimiento reproducible.

## Preparación sin Docker

Requiere Node >=22.13.0 (Docker y CI usan 24.22.0) y pnpm 12.14.0. Con Corepack disponible, ejecutar desde la raíz:

```powershell
corepack pnpm --version
corepack pnpm install --frozen-lockfile
corepack pnpm db:generate
```

`packageManager` fija la versión. Con el comando `pnpm` habilitado, los comandos siguientes funcionan directamente. `pnpm-workspace.yaml` declara las apps y autoriza explícitamente los scripts de instalación necesarios para Prisma, bcrypt y esbuild. La generación del cliente Prisma se ejecuta después de instalar las dependencias. Las instalaciones y los arranques son pasos separados.

## Validación básica

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Generar el cliente Prisma antes de typecheck backend si aún no existe:

```powershell
pnpm --filter @cybersim/backend run db:generate
```

Build frontend incluye typecheck y Vite. Build backend genera Prisma, compila TypeScript y copia el cliente generado. Generar/compilar no migra ni prueba la conexión a la base.

## Unitarias

| Ubicación | Cobertura funcional observada |
|---|---|
| `apps/frontend/tests` | Core ECS, componentes, tiempo, fases/eventos, jerarquía, activos, comandos, redes y presupuesto |
| `apps/backend/tests` | Login, registro, progreso, grupos y correo con dependencias simuladas |

```powershell
pnpm --filter @cybersim/frontend run test
pnpm --filter @cybersim/backend run test
pnpm --filter @cybersim/frontend run coverage
```

El reporte de cobertura excluye ciertos controllers/builders y configuración HTTP. No interpretar cobertura parcial como cobertura de API o integraciones. No existen suites unitarias específicas de chat, feedback, análisis o normalización del generador entre los archivos de test revisados.

## E2E de interfaz

Instalar Chromium si no está disponible, desde el frontend:

```powershell
Set-Location apps/frontend
pnpm --filter @cybersim/frontend exec playwright install chromium
Set-Location ../..
pnpm --filter @cybersim/frontend run test:e2e
```

En Linux/CI el workflow usa `pnpm --filter @cybersim/frontend exec playwright install --with-deps chromium`. El script `test:e2e:ui` abre la interfaz de Playwright. La configuración usa Vite en `http://localhost:5173`, arranque automático y reutilización de servidor fuera de CI.

Las suites actuales siembran sesión en `localStorage`, interceptan respuestas HTTP e inyectan un escenario fixture. No requieren Express ni PostgreSQL para sus flujos cubiertos; **no verifican autenticación, persistencia o IA real**. No confundir que el canvas sea visible con haber probado todas las reglas del juego.

```powershell
pnpm --filter @cybersim/frontend run test:e2e --grep-invert @slow
pnpm --filter @cybersim/frontend run test:e2e --grep @slow
```

`@slow` identifica el smoke WebGL de la escena. Guardar trazas y reporte cuando se investiga un fallo, evitando incluir datos reales en fixtures.

## CI implementado

El [workflow](../../.github/workflows/ci.yml) se ejecuta en PRs hacia `develop` y `main`:

- Job de calidad: instalación congelada con pnpm, lint, generación Prisma, typecheck, unitarias y build. Intenta merge temporal con base; si hay conflictos, imprime un mensaje y permite seguir el job.
- Job E2E: instalación, Chromium, tests DOM que bloquean y smoke 3D con `continue-on-error: true`.
- Reporte Playwright como artifact con retención de siete días.

## Validación de la migración a pnpm (2026-10-19)

Se verificó pnpm 11.25.0 con Node 24.21.0 en Windows y Node 24.22.0 en las imágenes Linux. El cambio y sus consecuencias se registran en [ADR 0011](../project/adrs/0011-pnpm-como-gestor-unico.md).

| Comprobación | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | Correcto en Windows y en las etapas Docker completas y filtradas |
| `pnpm lint`, `pnpm typecheck`, `pnpm build` | Correctos en Windows y en la imagen tools Linux; los checks Linux se ejecutaron sin red |
| `pnpm test` | 84 frontend y 47 backend aprobados; los 6 tests que requieren PostgreSQL se ejecutaron por separado |
| `node infra/test-db.mjs` en tools con PostgreSQL temporal | 53 tests backend aprobados, incluidos los 6 de PostgreSQL; 5 migraciones y seed aplicados, base de tests eliminada al terminar |
| `pnpm test:e2e --workers=2 --reporter=line` | 12 E2E aprobados, incluido el smoke 3D |
| Build de frontend, backend, tools y preparation | Cuatro imágenes construidas; apps separadas y preparador sin node_modules, con catálogo exportado |
| Arranque de frontend/backend con sus comandos pnpm | Frontend HTTP 200 y `/health/live` backend HTTP 200; huella calculada con los archivos pnpm |
| `node infra/db-init.mjs` con directorio Prisma montado | Migraciones, seed y coordinación inicial correctos en PostgreSQL temporal |
| `./tests/scripts/dev-init.tests.ps1` | Creación y reparación de entorno aprobadas |
| `./tests/scripts/dev-maintenance.tests.ps1` | Argumentos, filtros, migraciones, dependencias y fallos sin reanudación aprobados con Docker simulado |
| Añadir/retirar dependencias con `--lockfile-only` dentro de Docker | Correcto sobre manifiestos temporales montados en `/host`; no instala ni reemplaza node_modules del host |

La comparación de lockfiles no encontró versiones nuevas respecto a npm; la resolución de peers eliminó la copia redundante `three@0.170.0` y conserva `three@0.180.0`. Se declararon tres dependencias directas que antes dependían de hoisting, usando versiones ya presentes.

La validación usó contenedores y PostgreSQL temporales, sin los volúmenes de datos del proyecto. No prueba proveedores externos ni representa una ejecución remota del workflow de GitHub Actions. Vite conserva su aviso por tamaño del bundle; no impide el build.

## Actualización a pnpm 12.14.0 (2026-10-19)

Por solicitud del usuario se actualizó a la última versión estable indicada por el [registro oficial](https://registry.npmjs.org/pnpm/latest). La versión queda fijada en `packageManager`, `engines.pnpm` y la base Docker. CI utiliza `pnpm/action-setup` v6 fijada por commit y obtiene la versión desde el manifiesto. Docker ejecuta `pnpm --version` al preparar la base para dejar descargado el binario nativo de pnpm 12.

Se repitieron y aprobaron con pnpm 12.14.0:

- Instalación congelada en Windows y en las etapas Docker completas y filtradas, sin modificar el lockfile.
- Lint, typecheck, tests y build en Windows y en la imagen tools Linux; estos últimos checks también funcionaron sin red.
- 84 tests frontend y 53 backend con PostgreSQL temporal, incluidas las 5 migraciones y el seed; la base aislada de tests se eliminó al terminar.
- 12 E2E en Chromium, incluido el smoke 3D.
- Construcción de las cuatro imágenes, exportación del catálogo y comprobación del preparador sin node_modules y sin red.
- Inicializador de migraciones con el directorio Prisma montado; arranque frontend/backend y respuestas HTTP 200; cálculo de la huella del backend.
- Añadir y retirar dependencias con `--lockfile-only` en manifiestos temporales, conservando intacto node_modules del host.
- Pruebas PowerShell de mantenimiento, incluidos los fallos que deben impedir reanudar las integraciones.

Se conservan los límites de la validación anterior: el workflow remoto y los proveedores externos no se ejecutaron; Vite mantiene el aviso de tamaño del bundle.

No hay un paso Semgrep en el workflow vigente, aunque el README anterior lo enumeraba. Tampoco hay pruebas reales de webhooks, migraciones PostgreSQL o autorización cruzada en CI. Los jobs validan combinaciones de checkout distintas: E2E no hace el merge temporal del job de calidad.

## Concurrencia manual

Los scripts de `tests/concurrencia/` hacen llamadas a una instancia real y modifican matrículas/intentos. Ejecutarlos solo con cuentas y base de prueba. Variables comunes: `CYBERSIM_API_URL`, `TEST_EMAIL`, `TEST_PASSWORD`; grupos usa `TEST_CODIGO` y progreso `TEST_SLUG`.

```powershell
node tests/concurrencia/test-concurrencia-grupos.mjs
node tests/concurrencia/test-concurrencia-progreso.mjs
```

El script de grupos contiene un problema: interpreta GET de cursos como array directo, pero la API devuelve `{ success, data }`. Su limpieza y conteo final pueden no funcionar. Revisar/corregir el harness antes de confiar en un resultado. El de progreso espera diez filas distintas porque cada POST representa un intento; no prueba deduplicación ni que las filas sean resultados válidos del juego.

## Qué verificar para cambios relevantes

| Cambio | Evidencia adicional útil |
|---|---|
| Autorización | 401 sin JWT, 403 por rol/propiedad, acceso cruzado y cuenta sin confirmar |
| Matrícula o registro | Operaciones simultáneas y rollback ante falla parcial con PostgreSQL de prueba |
| Progreso | JSON de acciones parseable, error HTTP visible y deduplicación si se introduce |
| Tiempo ECS | Ambos intervalos limpiados al terminar, reiniciar y cambiar de escenario |
| IA/RAG | Respuesta vacía/incorrecta, caída, timeout y aislamiento de sesión con mocks |
| Configuración HTTP | Base absoluta, proxy local y hosting estático con las rutas reales |

En un entorno restringido Windows, `EPERM` de `realpath` o renombrado puede ser del sandbox y ocurrir antes de ejecutar tests. Registrar esa causa separadamente de una regresión; repetir en un entorno permitido antes de concluir que el código falla.

Fuentes: [Vite/Vitest](../../apps/frontend/vite.config.ts), [Playwright](../../apps/frontend/playwright.config.ts), [helpers E2E](../../apps/frontend/tests/e2e/helpers/auth.ts) y [scripts de concurrencia](../../tests/concurrencia/test-concurrencia-grupos.mjs).
