# CyberSim

CyberSim es una plataforma educativa de ciberseguridad. Combina una simulación 3D de redes y dispositivos con autenticación de estudiantes y profesores, progreso por escenario, grupos de trabajo, chat asistido por IA, generación de escenarios y retroalimentación automática.

## Inicio rápido

### Requisitos

- Node.js `20.19` o superior
- npm `9` o superior
- PostgreSQL disponible para la conexión configurada en el backend

### Instalación

```bash
npm install
copy apps\backend\.env.example apps\backend\.env
```

En PowerShell, `copy` es el comando equivalente a copiar el archivo de variables. En Linux o macOS se puede usar:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Completá `apps/backend/.env` con las credenciales y URLs de los servicios externos y, si hace falta, `apps/frontend/.env` con las variables `VITE_*`. Estos archivos no deben versionarse.

Con PostgreSQL disponible y las variables de conexión configuradas, sincronizá el esquema:

```bash
npm run db:push --workspace @cybersim/backend
```

### Desarrollo

Desde la raíz, abrí una terminal para cada aplicación:

```bash
# Terminal del frontend
npm run dev --workspace @cybersim/frontend
```

```bash
# Terminal del backend
npm run dev --workspace @cybersim/backend
```

La aplicación queda disponible en:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Configuración

El backend carga las variables desde `apps/backend/.env`. Las variables obligatorias para iniciar el servidor son:

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión de Prisma con PostgreSQL |
| `JWT_SECRET` | Firma de tokens de autenticación |
| `FRONTEND_URL` | URL usada en enlaces de confirmación y CORS en producción |
| `FROM_EMAIL` | Remitente de los correos |
| `SMTP_HOST` | Servidor SMTP |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Contraseña o app password SMTP |

Servicios opcionales según la funcionalidad utilizada:

| Variable | Funcionalidad |
|---|---|
| `OPENAI_API_KEY` | Chat y embeddings de GPT |
| `OPENAI_MODEL` | Modelo GPT usado para generar respuestas |
| `OPENAI_EMBEDDING_MODEL` | Modelo de embeddings usado para la búsqueda RAG |
| `QDRANT_URL` | Búsqueda semántica del chat |
| `QDRANT_API_KEY` | Autenticación contra Qdrant, si corresponde |
| `N8N_FEEDBACK_WEBHOOK_URL` | Generación de retroalimentación |
| `N8N_COURSE_ANALYSIS_WEBHOOK_URL` | Análisis de cursos |
| `N8N_SCENARIO_WEBHOOK_URL` | Generación de escenarios del agente malvado |
| `PIPER_TTS_API_URL` o `PIPER_TTS_BASE_URL` | Síntesis de voz del chat |

La configuración avanzada de Qdrant acepta también `QDRANT_PORT`, `QDRANT_HTTPS`, `QDRANT_COLLECTION_SECURITY`, `QDRANT_COLLECTION_CONTEXT`, `RAG_TOP_K` y `RAG_SCORE_THRESHOLD`.

Al cambiar el proveedor de embeddings, las colecciones de Qdrant deben volver a indexarse con el modelo configurado en `OPENAI_EMBEDDING_MODEL`. Los vectores generados por otro proveedor no son compatibles semánticamente con las consultas nuevas.

## Comandos disponibles

Cada comando se define y se ejecuta en el workspace indicado. Desde la raíz, añadí `--workspace @cybersim/frontend` o `--workspace @cybersim/backend`; dentro de `apps/frontend` o `apps/backend`, usá el comando directamente. El `package.json` de la raíz declara los workspaces y los requisitos del entorno.

| Workspace | Comando | Descripción |
|---|---|---|
| Frontend | `npm run dev` | Inicia Vite |
| Frontend | `npm run build` | Comprueba los tipos y compila el frontend |
| Frontend | `npm run preview` | Sirve el frontend compilado |
| Frontend | `npm run typecheck` | Comprueba los tipos del frontend |
| Frontend | `npm run lint` | Ejecuta ESLint del frontend |
| Frontend | `npm test` | Ejecuta las pruebas unitarias del frontend |
| Frontend | `npm run test:e2e` | Ejecuta Playwright |
| Frontend | `npm run test:e2e:ui` | Abre la interfaz de Playwright |
| Frontend | `npm run coverage` | Genera el reporte de cobertura |
| Frontend | `npm run export:rag` | Exporta el conocimiento de escenarios para RAG |
| Backend | `npm run dev` | Inicia la API en desarrollo |
| Backend | `npm run build` | Compila la API y empaqueta el cliente Prisma |
| Backend | `npm start` | Inicia la API compilada |
| Backend | `npm run typecheck` | Comprueba los tipos del backend |
| Backend | `npm run lint` | Ejecuta ESLint del backend |
| Backend | `npm test` | Ejecuta las pruebas unitarias del backend |
| Backend | `npm run db:generate` | Genera el cliente Prisma |
| Backend | `npm run db:push` | Sincroniza el esquema Prisma con la base local |
| Backend | `npm run db:migrate` | Ejecuta migraciones de desarrollo |
| Backend | `npm run db:seed` | Carga datos iniciales |
| Backend | `npm run db:studio` | Abre Prisma Studio |
| Backend | `npm run migrate:deploy` | Aplica migraciones en despliegue |

Antes de abrir un pull request, ejecutá como mínimo:

```bash
npm run lint --workspaces
npm run test --workspaces
npm run build --workspaces
semgrep scan --config auto .
```

## Arquitectura

El proyecto usa una aplicación React con Vite y un backend Express en TypeScript. El código está organizado por funcionalidades y separa dominio, casos de uso e infraestructura cuando corresponde.

```text
apps/
├── frontend/               # Aplicación React, simulación 3D y datos de escenarios
│   ├── src/
│   └── tests/
└── backend/                # API Express, Prisma, chat e integraciones
    ├── src/
    ├── prisma/
    └── tests/

Cada workspace mantiene sus dependencias, configuración, pruebas y código ejecutable. No existe un paquete compartido entre ellos: la comunicación se realiza exclusivamente mediante HTTP.
```

Persistencia:

- PostgreSQL almacena usuarios, cursos, grupos, progreso y análisis.
- Prisma gestiona el esquema y las migraciones en `apps/backend/prisma/`.
- Qdrant almacena las colecciones vectoriales utilizadas por el chat.
- n8n integra los flujos de retroalimentación y generación de contenido.

## API principal

El backend expone las siguientes áreas bajo `http://localhost:3000`:

| Ruta base | Responsabilidad |
|---|---|
| `/health` | Estado del servidor |
| `/auth` | Registro, login, confirmación y recuperación de contraseña |
| `/progreso` | Guardado y consulta del progreso |
| `/groups` | Gestión de grupos, cursos y estudiantes |
| `/feedback` | Generación y consulta de retroalimentación |
| `/course-analysis` | Generación y consulta del análisis de cursos |
| `/api/chat` | Chat, salud de servicios y sesiones |
| `/api/agent-malvado` | Generación de escenarios |

Endpoints útiles para comprobar integraciones:

```text
GET /health
GET /api/chat/health
GET /course-analysis/health
```

## Pruebas

Las pruebas unitarias están en `apps/frontend/tests/` y `apps/backend/tests/`. Las pruebas E2E del frontend están en `apps/frontend/tests/e2e/` y usan Playwright.

```bash
# Unitarias
npm run test --workspaces

# E2E
npx playwright install --with-deps chromium
npm run test:e2e --workspace @cybersim/frontend
```

Las pruebas E2E que necesitan backend y base de datos deben ejecutarse con los servicios locales configurados y PostgreSQL activo.

## Base de datos

Configurá la conexión a PostgreSQL en `apps/backend/.env`. Los scripts del backend administran el esquema y los datos mediante Prisma; el aprovisionamiento de PostgreSQL se gestiona por separado.

```bash
npm run db:push --workspace @cybersim/backend
```

## Producción

Para compilar el proyecto completo:

```bash
npm ci
npm run build --workspaces
```

El backend compilado se inicia con:

```bash
npm run start -w @cybersim/backend
```

En producción, configurá las variables de entorno mediante el proveedor de hosting. No incluyas secretos, claves de API, contraseñas ni archivos `.env` en el repositorio.

## Documentación adicional

- [`DEVELOPMENT.md`](DEVELOPMENT.md): flujo breve de desarrollo local.
- [`docs/arquitectura.md`](docs/arquitectura.md): arquitectura, flujos e integraciones del sistema.
- [`apps/backend/prisma/schema.prisma`](apps/backend/prisma/schema.prisma): modelo de datos.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): validaciones automáticas de pull requests.
