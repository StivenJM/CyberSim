# Guía de calidad para desarrolladores

Los recorridos de navegador con frontend, API y PostgreSQL reales tienen su propia [guía de tests de integración](tests-de-integracion.md). Incluyen reset protegido, datos de instalación y HUs de ambos perfiles; se ejecutan aparte de los checks habituales y de GitHub Actions.

Esta guía explica cómo comprobar que un cambio de CyberSim conserva el lint, el formato, los tipos, los tests y el build. Ejecuta los comandos desde la raíz del repositorio y repite los checks afectados después de corregir un fallo. Un build correcto confirma la compilación; las pruebas y verificaciones de ejecución cubren riesgos diferentes.

## 1. Elegir el entorno y preparar las dependencias

Puedes comprobar la calidad en Docker o con Node en el host. Usa una sola ruta para la validación básica y registra cuál ejecutaste.

| Entorno | Preparación | Cuándo usarlo |
|---|---|---|
| Docker | Docker Desktop iniciado, configuración local inicializada e imagen tools reconstruida | Validar con las dependencias Linux que usa el entorno de desarrollo |
| Host | Node >=22.13.0 y pnpm 12.14.0; Docker y CI usan Node 24.22.0 | Trabajar directamente con Node y ejecutar Playwright localmente |

Las versiones de pnpm y Biome están fijadas en [el manifiesto raíz](../../package.json). Si el repositorio acaba de clonarse, sigue primero [desarrollo local](desarrollo-local.md). Los checks básicos no necesitan credenciales de OpenAI, Google Drive ni SMTP.

### Ruta Docker

Inicializa la configuración si todavía no existe y reconstruye herramientas para que contengan las fuentes y configuraciones actuales:

```powershell
./scripts/dev.ps1 init
if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar la configuración local.' }
docker compose --profile tools build tools
if ($LASTEXITCODE -ne 0) { throw 'No se pudo construir la imagen de herramientas.' }
```

La imagen tools contiene el cliente Prisma generado. Las comprobaciones del apartado siguiente leen la copia de código de la imagen; vuelve a construirla si editaste fuentes o dependencias. No necesitan levantar frontend, backend ni proveedores externos.

### Ruta host

Comprueba las herramientas, instala respetando el lockfile y genera Prisma antes de comprobar los tipos:

```powershell
node --version
pnpm --version
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw 'La instalación no coincide con el lockfile.' }
pnpm db:generate
if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el cliente Prisma.' }
```

El comando pnpm debe mostrar la versión declarada en packageManager. Con Corepack disponible puedes habilitarlo mediante `corepack enable pnpm`. Generar Prisma no aplica migraciones ni requiere conexión a PostgreSQL.

## 2. Ejecutar la validación básica antes de un commit

| Check | Comando del host | Resultado que debes exigir |
|---|---|---|
| Lint, formato e imports | `pnpm lint` | Biome termina con código 0, sin errores ni advertencias |
| Tipos | `pnpm typecheck` | TypeScript termina correctamente en frontend y backend |
| Tests unitarios y contratos sin base | `pnpm test` | Ningún test falla; las omisiones se explican antes de aceptar el cambio |
| Build | `pnpm build` | Se generan los artefactos de ambas apps sin errores |

En PowerShell, este bloque ejecuta los checks en orden y se detiene ante el primer fallo.

**En Docker:**

```powershell
foreach ($check in @('lint', 'typecheck', 'test', 'build')) {
    docker compose --profile tools run --rm --no-deps tools pnpm $check
    if ($LASTEXITCODE -ne 0) { throw "Falló el check: $check" }
}
```

**En el host, después de instalar y generar Prisma:**

```powershell
foreach ($check in @('lint', 'typecheck', 'test', 'build')) {
    pnpm $check
    if ($LASTEXITCODE -ne 0) { throw "Falló el check: $check" }
}
```

No continúes al commit si un comando falla. En particular, que build termine correctamente no compensa un fallo de lint, tipos o tests. Las seis pruebas backend que requieren PostgreSQL se omiten en el test básico cuando CYBERSIM_TEST_DATABASE no está activado; ejecútalas mediante la base aislada del apartado 4 cuando corresponda, sin apuntarlas a una base de trabajo.

## 3. Mantener lint y formato con Biome

Biome 2.5.15 sustituye ESLint. `pnpm lint` es una comprobación de solo lectura que revisa reglas, formato y organización de imports; las advertencias también provocan fallo.

| Comando | Uso |
|---|---|
| `pnpm lint` | Comprobar lint, formato e imports sin escribir |
| `pnpm lint:fix` | Aplicar las correcciones automáticas seguras y revisar después el diff |
| `pnpm format` | Aplicar solamente formato |
| `pnpm format:check` | Diagnosticar solamente el formato sin escribir |

En Docker, comprueba con `docker compose --profile tools run --rm --no-deps tools pnpm lint`. Para corregir archivos que vuelvan al host mediante las dependencias Linux de la imagen:

```powershell
docker compose --profile tools run --rm --no-deps tools pnpm exec biome check /host --config-path=/host/biome.json --write
docker compose --profile tools run --rm --no-deps tools pnpm exec biome format /host --config-path=/host/biome.json --write
```

El primer comando ya corrige formato; el segundo sirve si solo quieres formatear. El montaje /host conserva las ediciones y evita ejecutar herramientas desde node_modules del host. Revisa `git diff` y reconstruye tools antes de repetir sus checks. Evita corregir dentro de la copia efímera /workspace creyendo que los archivos volverán al repositorio.

La [configuración común](../../biome.json) se hereda en [frontend](../../apps/frontend/biome.json) y [backend](../../apps/backend/biome.json). Incluye fuentes JS/TS/TSX, tests, scripts, CSS y JSON mantenidos. Dependencias, builds, cobertura, cliente Prisma, exportaciones RAG y archivos privados o auxiliares quedan fuera. Git conserva LF para los archivos formateados, también en Windows.

No desactives reglas globales ni agregues supresiones solo para hacer pasar un cambio. Corrige la causa y justifica una excepción cuando la regla no represente el contrato del código. Las adaptaciones existentes de ECS, Three.js, CSS, mocks y controles se explican en [ADR 0012](../project/adrs/0012-biome-lint-y-formato.md). Las correcciones automáticas que cambien comportamiento necesitan revisión y pruebas del caso afectado.

## 4. Probar el comportamiento

### Unitarias y pruebas por workspace

```powershell
pnpm --filter @cybersim/frontend test
pnpm --filter @cybersim/backend test
pnpm --filter @cybersim/frontend coverage
```

En Docker, antepón `docker compose --profile tools run --rm --no-deps tools` a cada comando. Los filtros también permiten ejecutar lint, typecheck y build de una sola app durante el desarrollo; la validación antes de entregar debe cubrir ambas.

Frontend prueba el motor ECS y sistemas de simulación. Backend cubre login, registro, grupos, progreso y correo con mocks, además del contrato de integraciones. La cobertura frontend ayuda a localizar casos sin probar; su porcentaje no demuestra cobertura de la API ni de los proveedores reales, y no existe un umbral global de cobertura establecido en CI.

### PostgreSQL aislado

Con el PostgreSQL local preparado y disponible, usa la herramienta que crea su propia base temporal:

```powershell
docker compose up -d postgres
if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar PostgreSQL.' }
docker compose --profile tools run --rm --no-deps tools node infra/test-db.mjs
if ($LASTEXITCODE -ne 0) { throw 'Fallaron los tests con PostgreSQL aislado.' }
```

[infra/test-db.mjs](../../infra/test-db.mjs) necesita acceso a PostgreSQL y un usuario con permiso CREATE DATABASE. Crea una base con prefijo cybersim_contract_test_, aplica las migraciones y el seed allí, ejecuta todos los tests backend y elimina esa base al terminar. Los datos de prueba no se siembran en la base de trabajo. Si el proceso se interrumpe, comprueba si quedó una base con ese prefijo antes de la siguiente ejecución.

Usa este check al cambiar persistencia, migraciones, coordinación, permisos o contratos de integración. Si el servicio todavía está iniciándose, confirma que esté healthy con `docker compose ps postgres` antes de lanzar la prueba. No uses db:push ni reset como atajo para resolver un fallo.

### Navegador con Playwright

Con Node y pnpm preparados en el host:

```powershell
pnpm --filter @cybersim/frontend exec playwright install chromium
if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar Chromium.' }
pnpm test:e2e --workers=2 --reporter=line
if ($LASTEXITCODE -ne 0) { throw 'Fallaron las pruebas de navegador.' }
```

En Linux, si faltan bibliotecas del navegador, usa `pnpm --filter @cybersim/frontend exec playwright install --with-deps chromium`, como hace CI.

Playwright inicia Vite automáticamente en http://localhost:5173 y puede reutilizar un servidor fuera de CI. Libera ese puerto o asegúrate de que el servidor reutilizado corresponda al código que pruebas. Las suites actuales interceptan HTTP, siembran una sesión fixture y no necesitan Express ni PostgreSQL. Verifican rutas, formularios, vistas y el montaje de la escena 3D; no prueban autenticación ni IA real.

Para separar los recorridos durante el diagnóstico:

```powershell
pnpm test:e2e --grep-invert @slow
pnpm test:e2e --grep @slow
```

El segundo comando incluye el smoke WebGL. Para consultar el reporte HTML usa `pnpm --filter @cybersim/frontend exec playwright show-report playwright-report/e2e` después de una ejecución con el reporter HTML predeterminado, o revisa trazas y errores en los artefactos de la ejecución. Los reportes E2E e integración usan carpetas hermanas para que una ejecución no borre las evidencias de la otra.

## 5. Asegurar el build y revisar sus artefactos

`pnpm build` ejecuta ambos workspaces. El frontend pasa TypeScript y genera su bundle con Vite. El backend genera Prisma, compila TypeScript y copia el cliente generado para la ejecución.

| Artefacto | Comprobación |
|---|---|
| `apps/frontend/dist/index.html` y assets | Existen al terminar Vite; las variables VITE_* corresponden al entorno previsto |
| `apps/backend/dist/server.js` | Existe el servidor compilado |
| `apps/backend/dist/generated/prisma` | El cliente generado está incluido en el backend compilado |

El aviso de Vite por tamaño del bundle no equivale a un error de compilación. Regístralo y evalúa su impacto si el cambio aumenta la carga. Un import sin resolver, un error TypeScript o un comando con salida distinta de 0 sí impide aceptar el build.

Si cambias Docker, dependencias o generación de artefactos, comprueba además los cuatro destinos:

```powershell
docker compose --profile tools config --quiet
if ($LASTEXITCODE -ne 0) { throw 'La configuración Compose es inválida.' }
docker compose --profile tools --parallel 1 build frontend backend tools preparation
if ($LASTEXITCODE -ne 0) { throw 'Falló la construcción de imágenes.' }
```

Construir imágenes de desarrollo no sustituye `pnpm build`: sus comandos principales ejecutan servidores de desarrollo, no los artefactos de producción. Tampoco un build acredita conexión a PostgreSQL, acceso a proveedores externos ni funcionamiento de todas las rutas. Para publicar, continúa con [operación y despliegue](operacion-y-despliegue.md).

## 6. Resolver un fallo

| Síntoma | Qué revisar antes de repetir |
|---|---|
| Error de Biome | Archivo, regla y línea; aplicar format o lint:fix si corresponde y revisar el diff |
| Cliente Prisma ausente | Ejecutar db:generate en el host o reconstruir tools en Docker |
| Fallo de instalación congelada | Coherencia entre manifiestos y lockfile; no regenerarlo solo para ocultar el fallo |
| Test fallido | Primera aserción y escenario de reproducción; ejecutar el test específico con el filtro del workspace |
| Seis tests backend omitidos | Son los casos con PostgreSQL: ejecutar la herramienta de base aislada |
| Build fallido | Primera causa real de TypeScript/Vite/Prisma, antes de los errores derivados |
| Playwright no inicia | Chromium instalado, puerto 5173 y requisitos de WebGL; revisar la traza del caso |
| Docker comprueba código anterior | Reconstruir tools; no basta con editar los archivos del host |
| EPERM antes de ejecutar un check | Distinguir permisos del entorno de una regresión; repetir en un entorno permitido sin dar por aprobado el check |

Añade una prueba que reproduzca el problema cuando se trate de comportamiento. No cambies la expectativa de un test, omitas una suite o rebajes una regla para obtener un resultado verde sin explicar el motivo técnico.

## 7. Criterio de aceptación y relación con CI

Antes de entregar o hacer commit:

1. Instalación reproducible y cliente Prisma preparados.
2. Lint sin errores ni advertencias, tipos correctos, tests sin fallos y build correcto en ambas apps.
3. Casos relevantes de PostgreSQL y navegador ejecutados; omisiones y límites registrados.
4. Artefactos comprobados y diff revisado, incluidos los cambios automáticos de Biome.
5. Comandos, entorno, resultados y advertencias materiales indicados en la entrega.

El [workflow actual](../../.github/workflows/ci.yml) ejecuta instalación congelada, lint, generación Prisma, typecheck, tests y build en PRs hacia develop y main. Otro job instala Chromium con --with-deps y ejecuta los E2E. El smoke 3D está marcado continue-on-error; revisa ese resultado aunque CI permita continuar. Las pruebas PostgreSQL reales no se ejecutan automáticamente en ese workflow.

El job de calidad intenta un merge temporal con la base, mientras E2E usa el checkout del PR. Resolver conflictos y verificar el estado que se pretende integrar sigue siendo parte de la entrega. Una ejecución local correcta no acredita que el workflow remoto ya se haya ejecutado.

Las integraciones reales se comprueban con el procedimiento de [desarrollo local](desarrollo-local.md#pruebas-de-integraciones); pueden necesitar credenciales, destinatario de prueba y presupuesto. Ningún check básico sustituye esa aceptación.

## Concurrencia manual

Los scripts de `tests/concurrencia/` hacen llamadas a una instancia real y modifican matrículas/intentos. Ejecutarlos solo con cuentas y base de prueba. Variables comunes: `CYBERSIM_API_URL`, `TEST_EMAIL`, `TEST_PASSWORD`; grupos usa `TEST_CODIGO` y progreso `TEST_SLUG`.

```powershell
node tests/concurrencia/test-concurrencia-grupos.mjs
node tests/concurrencia/test-concurrencia-progreso.mjs
```

El script de grupos contiene un problema: interpreta GET de cursos como array directo, pero la API devuelve `{ success, data }`. Su limpieza y conteo final pueden no funcionar. Revisar/corregir el harness antes de confiar en un resultado. El de progreso espera diez filas distintas porque cada POST representa un intento; no prueba deduplicación ni que las filas sean resultados válidos del juego.

## Verificación de esta guía (2026-10-19)

Antes del commit se ejecutaron de nuevo instalación congelada, generación Prisma, lint, format:check, typecheck, tests y build con pnpm 12.14.0 y Node 24.21.0 en Windows. Los checks terminaron correctamente: Biome revisó 529 archivos sin errores ni advertencias, frontend aprobó 84 tests y backend 47; los 6 casos PostgreSQL se omitieron en esta pasada básica y mantienen su procedimiento separado. Ambos builds se generaron correctamente; Vite conservó su aviso de tamaño del bundle.

Se comprobó además el comando Docker de Biome sobre /host con configuración explícita y sin escritura: 529 archivos correctos. Las verificaciones PostgreSQL, E2E y Linux de la migración a Biome se conservan como evidencia anterior en el desplegable siguiente; no se presentan como repetidas en esta pasada documental.

## Evidencia de ejecuciones anteriores

Estos resultados describen ejecuciones concretas, no un estado permanente del repositorio. El procedimiento vigente es el de los apartados anteriores. La [revisión del sistema](../architecture/revision-del-sistema.md) conserva resultados y límites de revisiones previas.

<details>
<summary>Migraciones a pnpm y Biome: resultados del 19 de octubre de 2026</summary>

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

## Validación de Biome (2026-10-19)

Se sustituyó ESLint por Biome 2.5.15, adaptando la base frontend/backend de Cuero. Las comprobaciones no modifican archivos; las advertencias de Biome hacen fallar `lint`.

| Comprobación | Resultado |
|---|---|
| `pnpm lint` y `pnpm format:check` | 529 archivos comprobados en Windows, sin errores ni advertencias; 527 en la imagen tools, que no incluye los dos scripts manuales de concurrencia de la raíz |
| `pnpm --filter @cybersim/frontend lint` | 420 archivos correctos en Windows y en su imagen Linux |
| `pnpm --filter @cybersim/backend lint` | 91 archivos correctos en Windows y en su imagen Linux |
| Instalación congelada | Correcta tras retirar las dependencias de ESLint e incorporar Biome |
| Typecheck y build | Ambos workspaces correctos en Windows y Linux |
| Tests | 84 frontend y 53 backend con PostgreSQL temporal: 137 aprobados; migraciones y seed correctos |
| Playwright | 12 E2E aprobados, incluido el smoke 3D |
| Docker | Cuatro imágenes construidas; inicializador correcto y frontend/backend con HTTP 200 |
| Infraestructura y mantenimiento | JSON de workflows, imágenes y calibración con valores conservados; pruebas PowerShell de mantenimiento correctas; Compose válido |

Los checks Linux de lint, formato, tipos, unitarias y build funcionaron sin red. Las pruebas de base utilizaron PostgreSQL temporal y no modificaron los volúmenes del proyecto. No se ejecutó el workflow remoto ni se comprobaron proveedores externos. Vite mantiene el aviso existente por tamaño del bundle; Biome no emite advertencias. Las excepciones deliberadas están descritas en [ADR 0012](../project/adrs/0012-biome-lint-y-formato.md).

</details>

Fuentes: [scripts raíz](../../package.json), [frontend](../../apps/frontend/package.json), [backend](../../apps/backend/package.json), [Biome](../../biome.json), [Vitest/Vite](../../apps/frontend/vite.config.ts), [Playwright](../../apps/frontend/playwright.config.ts) y [PostgreSQL aislado](../../infra/test-db.mjs).
