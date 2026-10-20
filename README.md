# CyberSim

Plataforma educativa para practicar ciberseguridad en escenarios 3D.

## Empieza aquí

| **Comprende el sistema** | **Prepara tu entorno** |
|---|---|
| **[Resumen de CyberSim](docs/architecture/resumen.md)** | **[Guía de primer arranque](docs/guides/desarrollo-local.md)** |
| Producto, arquitectura de alto nivel, flujo de una práctica y mapa del código. | Desde un clon nuevo hasta Docker, configuración, login y primer cambio. |

Con el repositorio disponible y Docker Desktop iniciado, desde la raíz en PowerShell:

```powershell
# Solo la primera vez: crea el .env privado sin sobrescribir uno existente.
./scripts/dev.ps1 init
docker compose up --build --watch
```

Aplicación: **http://localhost:5173** · n8n: **http://localhost:5678**.

La guía explica los accesos OpenAI, Google Drive y SMTP que debe facilitar el equipo. El arranque muestra lo que falta configurar; no declara esas integraciones listas solo por encender los contenedores. Node, pnpm y Prisma se ejecutan dentro de Docker.

## Sobre la aplicación

CyberSim es una plataforma educativa de ciberseguridad con oficinas y dispositivos simulados en 3D, objetivos por fases, estudiantes y docentes, cursos, historial de intentos, tutor con IA y generación de retroalimentación y desafíos.

El proyecto declara versión `5.0.0` y contiene dos workspaces de pnpm: una aplicación React/Vite y una API Express/Prisma. PostgreSQL almacena identidad y actividad educativa; la simulación se ejecuta en el navegador. El catálogo activo tiene cinco escenarios.

## Documentación de consulta

El [índice documental](docs/README.md) organiza las referencias opcionales por necesidad. El resumen y la guía de primer arranque son las entradas principales.

| Área | Contenido |
|---|---|
| [Arquitectura](docs/architecture/README.md) | Componentes, ECS, backend, API, datos, integraciones y seguridad |
| [Guías](docs/guides/README.md) | Uso, pruebas, escenarios, mantenimiento y operación |
| [Proyecto](docs/project/README.md) | Visión, requisitos, HU001–HU025, reglas y riesgos |
| [ADRs](docs/project/adrs/README.md) | Decisiones, alternativas y justificaciones |

[Estado del entorno y evidencia](docs/project/estado-desarrollo-docker.md) · [Entrada de desarrollo](DEVELOPMENT.md) · [Esquema Prisma](apps/backend/prisma/schema.prisma) · [Workflow CI](.github/workflows/ci.yml).

<details>
<summary>Checks pnpm y alcance de las pruebas</summary>

Los siguientes scripts se ejecutan en un entorno Node preparado. Para correrlos en Docker, seguir la sección de pruebas de la guía de primer arranque.

## Validación

```powershell
pnpm install --frozen-lockfile
pnpm db:generate
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @cybersim/frontend run test:e2e
```

Playwright requiere Chromium. `test:e2e` usa sesión y respuestas simuladas. La [suite de integración](docs/guides/tests-de-integracion.md) prueba ambos perfiles con API, PostgreSQL y servicios externos reales, tiene reset protegido y se ejecuta por separado fuera de CI. Procedimiento general y CI en [pruebas y calidad](docs/guides/pruebas-y-calidad.md).


</details>
