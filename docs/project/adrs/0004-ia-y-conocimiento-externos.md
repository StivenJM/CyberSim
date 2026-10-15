# ADR 0004: Tutor con RAG y generación mediante servicios externos

- Estado: **Observada en implementación (retrospectiva)**.
- Fecha de documentación: 2026-10-13.
- Base revisada: `cc0c9cb`.
- Alcance: tutor, conocimiento, audio, feedback, análisis y escenarios.
- Aprobación histórica: no consta.

## Contexto

La aplicación ofrece explicación conversacional, apoyo al seguimiento y variación de desafíos. El repositorio contiene adaptadores, pero no workflows n8n, corpus vectorial desplegado ni instalación de voz.

## Decisión observada

El backend coordina OpenAI para respuestas/embeddings, Qdrant para conocimiento y Piper para audio. Conserva historia reciente de chat en memoria del proceso por sessionId. Delega feedback, análisis y generación de escenarios a webhooks n8n. Exporta conocimiento desde el catálogo sin cargarlo automáticamente al proveedor vectorial.

## Consecuencias

Servicios pueden evolucionar por adaptadores y contratos. Qdrant comparte conocimiento educativo; no almacena conversaciones en estos flujos. La operación depende de credenciales, ingestión y disponibilidad externa. Cambiar embeddings exige reindexación coherente.

Reinicios borran conversaciones y réplicas no comparten memoria. Qdrant sin resultados permite responder sin recuperación; voz caída permite texto; errores de embedding/generación sí fallan. Algunos servicios se construyen al importar, por lo que variables de integración bloquean el arranque general.

Los endpoints no imponen autenticación ni cuotas actualmente. Las respuestas y escenarios externos necesitan verificación adicional antes de usarse como evidencia educativa.

## Alternativas de comparación

Memoria persistente o compartida permitiría continuidad y escalado con una política de retención. Integrar generación directamente al backend daría control de validación/versiones, con más lógica propia. Modelos locales cambiarían operación y capacidad. No se presume que esas alternativas se discutieran históricamente.

## Evidencia y validación

[Chat nativo](../../../apps/backend/src/chat/infrastructure/repositories/NativeChatRepository.ts), [memoria](../../../apps/backend/src/chat/infrastructure/services/ConversationMemoryManager.ts), [webhook generador](../../../apps/backend/src/agent-malvado/infrastructure/repositories/N8nWebhookRepository.ts) y [exportador](../../../apps/frontend/scripts/export-rag-knowledge.ts). Las pruebas reportadas no llamaron proveedores reales; ver [integraciones](../../architecture/integraciones.md) y [revisión](../../architecture/revision-del-sistema.md).
