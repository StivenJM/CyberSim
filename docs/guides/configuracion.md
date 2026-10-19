# Configuración del entorno

> Para el entorno Docker integrado usar [la guía actual de desarrollo](desarrollo-local.md) y [su arquitectura](../architecture/desarrollo-docker.md). Esta referencia conserva procedimientos y hallazgos anteriores; las variables por workspace, puertos publicados o bloqueos de arranque descritos aquí no sustituyen la configuración raíz y el diagnóstico actuales.

El backend carga `.env` mediante `dotenv/config` desde su directorio de trabajo. Los comandos de workspace usan `apps/backend`. El frontend usa variables Vite desde `apps/frontend`; las variables `VITE_*` se incrustan en el JavaScript público durante build y nunca deben contener secretos.

## Backend: requisitos de arranque

| Variable | Uso | Comportamiento actual |
|---|---|---|
| `DATABASE_URL` | PrismaPg en ejecución y seed | Necesaria para acceso PostgreSQL; no tiene validador de presencia central |
| `JWT_SECRET` | Firma y verificación JWT | Falta → error al importar AuthController |
| `FRONTEND_URL` | Enlaces de correo y CORS en producción | Falta → error al importar AuthController |
| `FROM_EMAIL` | Remitente | Falta → error al importar AuthController |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Transporte de correo | Falta cualquiera → error al importar AuthController |
| `N8N_FEEDBACK_WEBHOOK_URL` | Feedback individual | Falta → error al importar FeedbackController |
| `OPENAI_API_KEY` | Embeddings y respuestas | Falta → error al construir GPTService |
| `QDRANT_URL` | Host de conocimiento | Falta → error al construir QdrantService |
| `PIPER_TTS_API_URL` | Endpoint POST de síntesis | Falta → error al construir PiperTTSService |
| `PIPER_TTS_BASE_URL` | Base para descargar audio | Falta → error al construir PiperTTSService |

La API monta todos los routers al arrancar. Aunque el usuario no vaya a usar chat o feedback, hoy estas variables se validan al importar sus dependencias. **Piper necesita ambas URLs**, no una alternativa entre ellas.

## Backend: opciones y valores por defecto

| Variable | Valor de respaldo del código | Uso |
|---|---|---|
| `PORT` | `3000` | Puerto HTTP; se convierte a número |
| `NODE_ENV` | Sin valor; log muestra `development` | CORS de producción, logs Prisma y detalles de error |
| `DIRECT_URL` | `DATABASE_URL` | Conexión de CLI Prisma para migraciones |
| `SMTP_PORT` | `587` | Puerto SMTP |
| `SMTP_SECURE` | `false` salvo cadena exacta `true` | Opción secure de Nodemailer |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Base del transporte HTTP del LLM |
| `OPENAI_MODEL` | `gpt-4o-mini` | Modelo configurado para respuestas |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Modelo configurado para vectores |
| `QDRANT_API_KEY` | Cadena vacía | Credencial si la instancia lo requiere |
| `QDRANT_COLLECTION_SECURITY` | `ciberseguridad` | Colección de conceptos |
| `QDRANT_COLLECTION_CONTEXT` | `ContextoCiberSeguridad` | Colección contextual |
| `QDRANT_PORT` | `6333` | Puerto REST configurado explícitamente |
| `QDRANT_HTTPS` | `true` salvo cadena exacta `false` | Protocolo reconstruido por el adaptador |
| `RAG_TOP_K` | `20` | Máximo de resultados por búsqueda |
| `RAG_SCORE_THRESHOLD` | `0.7` | Umbral de similitud |
| `CHAT_MEMORY_MAX_MESSAGES` | `20` | Máximo de mensajes recientes por sesión |
| `N8N_COURSE_ANALYSIS_WEBHOOK_URL` | Sin URL | Sin variable, análisis devuelve 503; no impide arranque |
| `N8N_SCENARIO_WEBHOOK_URL` | URL externa fija en controller | Configurar explícitamente el webhook de este entorno |

Estos defaults son los del código revisado, no promesas de disponibilidad de modelos o servicios. Usar enteros positivos para puertos/top K/memoria y un umbral compatible con la colección; la configuración no valida centralmente todos los valores numéricos.

### Particularidades de Qdrant

El adaptador elimina protocolo y `/dashboard` de la URL y reconstruye protocolo con `QDRANT_HTTPS`. Una URL escrita con HTTPS no basta si la bandera dice `false`. La plantilla backend contiene precisamente esa combinación contradictoria.

Ejemplo local de configuración, si existe una instancia Qdrant HTTP:

```dotenv
QDRANT_URL=http://localhost
QDRANT_PORT=6333
QDRANT_HTTPS=false
```

Para un host externo TLS, ajustar host, puerto REST y `QDRANT_HTTPS=true` según ese servicio. Compose no levanta Qdrant. Verificar también que las colecciones y dimensiones coincidan con los embeddings del backend.

## Frontend y proxy

| Variable | Consumidor | Recomendación de configuración |
|---|---|---|
| `VITE_BACKEND_URL` | Configuración central, ECS, auth, grupos, feedback y chat | URL absoluta de Express, sin `/api` añadido, p. ej. `http://localhost:3000` |
| `VITE_API_URL` | `useGenerateCourseAnalysis` | Misma URL de Express para análisis |
| `BACKEND_URL` | Archivo de configuración Vite en modos distintos de development | Destino de proxy de preview; no configura por sí solo el cliente publicado |

La plantilla frontend declara solo `VITE_BACKEND_URL`; añadir `VITE_API_URL` cuando se prepara otro entorno. En development el proxy apunta siempre a `http://localhost:3000`, aunque `BACKEND_URL` tenga otro valor.

Sin `VITE_BACKEND_URL`, auth y progreso usan `/api` y Vite elimina ese prefijo; chat termina llamando `/api/api/chat`, que sí llega a `/api/chat`. El generador usa `replace('/api', '')` y termina en un path incorrecto tras el proxy. La configuración local propuesta evita esa combinación, pero el adaptador sigue requiriendo corrección para soportar todas las bases.

Un servidor estático de producción no hereda proxies de Vite. Configurar las dos URLs públicas antes de `npm run build`, o definir un reverse proxy que respete los paths reales y verificar cada módulo. Usar bases sin slash final para evitar dobles separadores en los adaptadores.

## Variables de plantillas sin consumidor actual

`BACKEND_URL` y `VITE_BACKEND_URL` dentro de `apps/backend/.env` no configuran Express ni el frontend: Vite lee el entorno de su propio workspace. El único consumidor de `BACKEND_URL` encontrado es `vite.config.ts`. No asumir que un archivo backend configura las dos apps.

## Gestión de valores

Conservar secretos en entorno privado. Las plantillas permiten conocer nombres y formatos; no usar valores de prueba como credenciales de producción. Cambiar una variable `VITE_*` requiere reiniciar dev o reconstruir el bundle publicado. Cambiar el modelo de embeddings exige regenerar el conocimiento vectorial compatible.

Fuentes: [AuthController](../../apps/backend/src/auth/infrastructure/controllers/AuthController.ts), [GPT](../../apps/backend/src/chat/infrastructure/services/GPTService.ts), [Qdrant](../../apps/backend/src/chat/infrastructure/services/QdrantService.ts), [Piper](../../apps/backend/src/chat/infrastructure/services/PiperTTSService.ts), [memoria](../../apps/backend/src/chat/infrastructure/services/ConversationMemoryManager.ts), [Vite](../../apps/frontend/vite.config.ts) y [plantilla backend](../../apps/backend/.env.example).
