# CyberSim

CyberSim es una plataforma educativa de ciberseguridad con oficinas y dispositivos simulados en 3D, objetivos por fases, estudiantes y docentes, cursos, historial de intentos, tutor con IA y generación de retroalimentación y desafíos.

El proyecto declara versión `5.0.0` y contiene dos npm workspaces: una aplicación React/Vite y una API Express/Prisma. PostgreSQL almacena identidad y actividad educativa; la simulación se ejecuta en el navegador. El catálogo activo tiene cinco escenarios.

## Inicio

Requisitos: Node.js `>=20.19.0`, npm `>=9.0.0` y PostgreSQL. El servidor actual también exige variables de SMTP, OpenAI, Qdrant, Piper y webhook de feedback al arrancar; seguir la [guía local](docs/guides/desarrollo-local.md) y la [matriz de configuración](docs/guides/configuracion.md).

Desde la raíz, con archivos de entorno y servicios preparados:

```powershell
npm ci
docker compose up -d postgres
npm run db:generate --workspace @cybersim/backend
npm run migrate:deploy --workspace @cybersim/backend
```

En terminales separadas:

```powershell
npm run dev --workspace @cybersim/backend
```

```powershell
npm run dev --workspace @cybersim/frontend
```

Frontend: `http://localhost:5173`. API: `http://localhost:3000`. `GET /health` comprueba que Express atiende, sin verificar todas sus dependencias.

## Validación

```powershell
npm run lint --workspaces
npm run typecheck --workspaces
npm run test --workspaces
npm run build --workspaces
npm run test:e2e --workspace @cybersim/frontend
```

Playwright requiere Chromium. Las suites E2E actuales usan sesión y respuestas simuladas; no prueban integraciones reales. Procedimiento y CI en [pruebas y calidad](docs/guides/pruebas-y-calidad.md). Resultados y límites en [el informe del sistema](docs/architecture/revision-del-sistema.md).

## Documentación

| Carpeta | Contenido |
|---|---|
| [docs/architecture](docs/architecture/README.md) | Resumen visual Mermaid, frontend, ECS, backend, API, datos, integraciones, seguridad y revisión |
| [docs/guides](docs/guides/README.md) | Desarrollo, configuración, uso, pruebas, escenarios, mantenimiento y operación |
| [docs/project](docs/project/README.md) | Visión, alcance, requisitos, HUs enumeradas, reglas funcionales, glosario y riesgos |
| [docs/project/adrs](docs/project/adrs/README.md) | Decisiones observadas y propuestas, con estados y evidencia |

[Índice completo](docs/README.md) · [Entrada de desarrollo](DEVELOPMENT.md) · [Esquema Prisma](apps/backend/prisma/schema.prisma) · [Workflow CI](.github/workflows/ci.yml).

[Arquitectura de un vistazo](docs/architecture/resumen.md) · [Requisitos](docs/project/requisitos.md) · [Historias HU001–HU025](docs/project/historias-de-usuario.md).

La revisión detectó brechas de autorización en recursos educativos y generación, además de riesgos de integridad y operación. Están documentadas con evidencia y prioridades; esta actualización documental no las corrige en código.
