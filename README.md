# CyberSim

CyberSim es una plataforma educativa de ciberseguridad. Combina una simulación 3D de redes y dispositivos con autenticación de estudiantes y profesores, progreso por escenario, grupos de trabajo, chat asistido por IA, generación de escenarios y retroalimentación automática.

## Inicio rápido

### Requisitos

- Node.js `18` o superior
- npm `9` o superior
- Docker Desktop, para ejecutar PostgreSQL localmente

### Instalación

```bash
npm install
copy .env.docker .env
npm run docker:up
npm run db:push
```

En PowerShell, `copy` es el comando equivalente a copiar el archivo de variables. En Linux o macOS se puede usar:

```bash
cp .env.docker .env
```

Completá en `.env` las credenciales y URLs de los servicios externos antes de iniciar la aplicación. El archivo `.env` no debe versionarse.

### Desarrollo

```bash
npm run dev:full
```

La aplicación queda disponible en:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Configuración

El backend carga las variables desde `.env`. Las variables obligatorias para iniciar el servidor son:

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
| `GOOGLE_GEMINI_API_KEY` | Chat y embeddings de Gemini |
| `QDRANT_URL` | Búsqueda semántica del chat |
| `QDRANT_API_KEY` | Autenticación contra Qdrant, si corresponde |
| `N8N_FEEDBACK_WEBHOOK_URL` | Generación de retroalimentación |
| `N8N_COURSE_ANALYSIS_WEBHOOK_URL` | Análisis de cursos |
| `N8N_SCENARIO_WEBHOOK_URL` | Generación de escenarios del agente malvado |
| `PIPER_TTS_API_URL` o `PIPER_TTS_BASE_URL` | Síntesis de voz del chat |

La configuración avanzada de Qdrant acepta también `QDRANT_PORT`, `QDRANT_HTTPS`, `QDRANT_COLLECTION_SECURITY`, `QDRANT_COLLECTION_CONTEXT`, `RAG_TOP_K` y `RAG_SCORE_THRESHOLD`.

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev:full` | Inicia frontend y backend en desarrollo |
| `npm run dev` | Inicia solamente Vite |
| `npm run dev:server` | Inicia solamente el backend con Nodemon |
| `npm run build` | Compila el frontend |
| `npm run build:server` | Compila el backend TypeScript |
| `npm run build:all` | Compila frontend y backend |
| `npm run lint` | Ejecuta ESLint |
| `npm test -- --run` | Ejecuta las pruebas unitarias |
| `npm run test:e2e` | Ejecuta las pruebas E2E con Playwright |
| `npm run coverage` | Genera el reporte de cobertura |
| `npm run docker:up` | Inicia PostgreSQL |
| `npm run docker:down` | Detiene PostgreSQL |
| `npm run docker:logs` | Muestra los logs de PostgreSQL |
| `npm run db:push` | Sincroniza el esquema Prisma con la base local |
| `npm run db:migrate` | Ejecuta migraciones de desarrollo |
| `npm run db:seed` | Carga datos iniciales |
| `npm run db:studio` | Abre Prisma Studio |

Antes de abrir un pull request, ejecutá como mínimo:

```bash
npm run lint
npm test -- --run
npm run build:all
semgrep scan --config auto .
```

## Arquitectura

El proyecto usa una aplicación React con Vite y un backend Express en TypeScript. El código está organizado por funcionalidades y separa dominio, casos de uso e infraestructura cuando corresponde.

```text
src/
├── client/
│   └── visual/             # Interfaz React, simulación 3D y features
└── server/
    ├── auth/               # Registro, login, correo y progreso
    ├── groups/             # Grupos, cursos y matrículas
    ├── chat/               # Chat, memoria conversacional, Gemini y Qdrant
    ├── feedback/           # Retroalimentación generada por n8n
    ├── course-analysis/    # Análisis de cursos generado por n8n
    └── agent-malvado/      # Generación y sanitización de escenarios
```

Persistencia:

- PostgreSQL almacena usuarios, cursos, grupos, progreso y análisis.
- Prisma gestiona el esquema y las migraciones en `prisma/`.
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

Las pruebas unitarias están en `tests/` y cubren casos de uso, sistemas ECS, autenticación, grupos, progreso y correo. Las pruebas E2E están en `tests/e2e/` y usan Playwright.

```bash
# Unitarias
npm test -- --run

# E2E
npx playwright install --with-deps chromium
npm run test:e2e
```

Las pruebas E2E que necesitan backend y base de datos deben ejecutarse con los servicios locales configurados y PostgreSQL activo.

## Base de datos local

El servicio PostgreSQL se define en `docker-compose.yml` y usa el volumen `postgres_data`. Para recrear la base desde cero:

```bash
npm run docker:reset
npm run db:push
```

El comando `docker:reset` elimina el volumen y, por lo tanto, borra los datos locales.

## Producción

Para compilar el proyecto completo:

```bash
npm ci
npm run build:all
```

El backend compilado se inicia con:

```bash
npm start
```

En producción, configurá las variables de entorno mediante el proveedor de hosting. No incluyas secretos, claves de API, contraseñas ni archivos `.env` en el repositorio.

## Documentación adicional

- [`DEVELOPMENT.md`](DEVELOPMENT.md): flujo breve de desarrollo local.
- [`prisma/schema.prisma`](prisma/schema.prisma): modelo de datos.
- [`docker-compose.yml`](docker-compose.yml): servicio PostgreSQL local.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): validaciones automáticas de pull requests.
