# Pruebas y calidad

Los checks se ejecutan por workspace desde la raíz. La [revisión del sistema](../architecture/revision-del-sistema.md) registra resultados de una ejecución concreta y sus límites; esta guía describe el procedimiento reproducible.

## Validación básica

```powershell
npm run lint --workspaces
npm run typecheck --workspaces
npm run test --workspaces
npm run build --workspaces
```

Generar el cliente Prisma antes de typecheck backend si aún no existe:

```powershell
npm run db:generate --workspace @cybersim/backend
```

Build frontend incluye typecheck y Vite. Build backend genera Prisma, compila TypeScript y copia el cliente generado. Generar/compilar no migra ni prueba la conexión a la base.

## Unitarias

| Ubicación | Cobertura funcional observada |
|---|---|
| `apps/frontend/tests` | Core ECS, componentes, tiempo, fases/eventos, jerarquía, activos, comandos, redes y presupuesto |
| `apps/backend/tests` | Login, registro, progreso, grupos y correo con dependencias simuladas |

```powershell
npm run test --workspace @cybersim/frontend
npm run test --workspace @cybersim/backend
npm run coverage --workspace @cybersim/frontend
```

El reporte de cobertura excluye ciertos controllers/builders y configuración HTTP. No interpretar cobertura parcial como cobertura de API o integraciones. No existen suites unitarias específicas de chat, feedback, análisis o normalización del generador entre los archivos de test revisados.

## E2E de interfaz

Instalar Chromium si no está disponible, desde el frontend:

```powershell
Set-Location apps/frontend
npx playwright install chromium
Set-Location ../..
npm run test:e2e --workspace @cybersim/frontend
```

En Linux/CI el workflow usa `npx playwright install --with-deps chromium`. El script `test:e2e:ui` abre la interfaz de Playwright. La configuración usa Vite en `http://localhost:5173`, arranque automático y reutilización de servidor fuera de CI.

Las suites actuales siembran sesión en `localStorage`, interceptan respuestas HTTP e inyectan un escenario fixture. No requieren Express ni PostgreSQL para sus flujos cubiertos; **no verifican autenticación, persistencia o IA real**. No confundir que el canvas sea visible con haber probado todas las reglas del juego.

```powershell
npm run test:e2e --workspace @cybersim/frontend -- --grep-invert @slow
npm run test:e2e --workspace @cybersim/frontend -- --grep @slow
```

`@slow` identifica el smoke WebGL de la escena. Guardar trazas y reporte cuando se investiga un fallo, evitando incluir datos reales en fixtures.

## CI implementado

El [workflow](../../.github/workflows/ci.yml) se ejecuta en PRs hacia `develop` y `main`:

- Job de calidad: instalación, lint, unitarias y build. Intenta merge temporal con base; si hay conflictos, imprime un mensaje y permite seguir el job.
- Job E2E: instalación, Chromium, tests DOM que bloquean y smoke 3D con `continue-on-error: true`.
- Reporte Playwright como artifact con retención de siete días.

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
