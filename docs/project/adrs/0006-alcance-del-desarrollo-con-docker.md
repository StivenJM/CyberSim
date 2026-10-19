# ADR 0006: Alcance del entorno de desarrollo con Docker

> Actualización de implementación, 18 de octubre de 2026: esta decisión se refleja en [Compose](../../../compose.yaml), [infra](../../../infra), [schema Prisma](../../../apps/backend/prisma/schema.prisma) y [módulo de integraciones](../../../apps/backend/src/integrations). Consultar [estado y límites](../estado-desarrollo-docker.md). Las referencias siguientes a trabajo futuro o pruebas no realizadas conservan el contexto de la revisión original, sin revocar la implementación autorizada después.

- Estado: **Aceptada; composición incorporada al repositorio, con aceptación externa pendiente**.
- Fecha de documentación: **16 de octubre de 2026**.
- Actualización: **18 de octubre de 2026**, se confirma reutilizar PostgreSQL existente, SQLite propio para n8n, origen común de Drive con OAuth del equipo y autorización individual, y retirada automática de conocimiento tras confirmación.
- Alcance: entorno de desarrollo de CyberSim; no producción ni contrato técnico completo.
- Aprobación: respuestas explícitas del usuario en esta conversación, recogidas en el [registro detallado](../decisiones-desarrollo-docker.md). D04 se confirmó el 18 de octubre; D06 también fue aceptada y se desarrolla en el ADR 0007.

## Contexto

Se busca inicializar la infraestructura de desarrollo con un comando Docker, trabajar desde Windows 11 con 16 GB de RAM sin GPU dedicada y editar las fuentes locales con actualización de los procesos en contenedores. El usuario solicitó evaluación y preguntas antes de implementar.

La intención inicial de ejecución integral local sin internet después de las descargas cambió: el usuario eligió OpenAI para la IA, mantener Google Drive para conocimiento y conservar Piper local para voz. El [informe técnico](../../architecture/evaluacion-desarrollo-local-docker.md) distingue el código actual de la propuesta y conserva los riesgos comprobados o anticipados.

## Decisión

Se aceptan exclusivamente las siguientes elecciones de alcance:

- Concentrar el trabajo en desarrollo, con inicialización sencilla mediante Docker y edición de fuentes desde Windows. El objetivo de memoria de Docker/WSL es 8 GB; está pendiente de medición.
- Mantener n8n como responsable de sus procesos, sin trasladarlos por omisión al backend.
- Persistir el estado de n8n en SQLite dentro de un volumen propio, con clave de cifrado estable, separado del destino de reset Prisma de CyberSim (D15).
- Usar la API de OpenAI para la IA conservando el enfoque de generación actual, sin preparar modelos locales de chat. Los modelos y parámetros exactos siguen abiertos.
- Mantener Google Drive como origen de documentos y la actualización de Qdrant desde n8n independiente del reinicio de la aplicación.
- Utilizar un origen común de desarrollo con gestión central del conocimiento, en lugar de carpetas independientes por desarrollador (D16). Cada instancia mantiene sus índices locales.
- Usar un cliente OAuth del equipo y autorización individual de cada desarrollador para leer el corpus común en Mi unidad personal (D17). No exigir un proyecto Cloud por desarrollador ni compartir tokens personales del propietario; conservar las autorizaciones en el n8n local persistido.
- Retirar automáticamente de búsquedas el conocimiento de un documento tras confirmar su baja o pérdida de acceso, sin interpretar fallos transitorios como borrado masivo (D18).
- Mantener Piper local como excepción expresa para la síntesis de voz.
- Conservar el correo mediante el SMTP externo existente; descartar la captura local con Mailpit (D25). Credenciales privadas del servidor y enlaces dirigidos al frontend del desarrollador; quedan provisión y verificación del servicio.
- Reutilizar el volumen PostgreSQL existente `cybersim_postgres_data`. Ante fallos se informa el error; el usuario acepta un reset manual de desarrollo si lo necesita, sin incorporarlo al arranque automático.
- Usar un `.env` privado en la raíz, excluido de Git, con secretos solo para consumidores del servidor.
- Distribuir un corpus mínimo común versionado para no exigir los documentos privados del usuario durante la primera preparación. Para documentos adicionales, admitir TXT/Markdown; no incluir PDF/OCR.
- Exigir preparación completa antes de anunciar disponibilidad y los objetivos iniciales de tiempos/concurrencia de D09, todavía sin medir.
- Incluir los bloqueos funcionales concretos de URLs, análisis, formato de audio y validación de respuestas, con la lista final de correcciones por cerrar.
- Exigir recuperación sana y contexto suficiente para que el tutor genere su respuesta; distinguir indisponibilidad técnica de una búsqueda sin contexto pertinente (D19).
- Conservar el texto generado y avisar si falla la voz después de la preparación, sin repetir el modelo ni ampliar el plazo global. Piper sigue siendo obligatorio en la preparación inicial (D20).
- Mantener cada generación de escenarios independiente, sin historial de peticiones anteriores ni sesión Redis global. Conserva recuperación del catálogo y validación del resultado; la memoria del tutor se define aparte (D21).
- Mantener el historial del tutor temporal y avisar cuando se pierda contexto; no incorporar persistencia de conversaciones por esta etapa (D22).
- Coordinar IA interactiva e indexación mediante un turno global, priorizando al usuario al terminar la unidad de fondo en curso y con como máximo una petición interactiva esperando (D23).
- Tras una preparación completa, permitir usar el último índice válido si Drive no puede sincronizar, mostrando el estado pendiente; siguen aplicando la retirada confirmada D18 y la recuperación sana D19 (D24).
- Evitar dependencias funcionales exclusivas de desarrollo: el estado necesario para la aplicación debe tener creación/mantenimiento estables y un contrato compatible entre entornos (criterio D26). Esto no amplía el trabajo a desplegar producción; la [opción técnica de persistencia](0008-persistencia-funcional-compartida-entre-entornos.md) continúa como propuesta.

La política de actualización de workflows se acepta en el ADR 0007. D16 acepta el origen común y D17 OAuth de equipo con autorización individual. Faltan provisión, permisos, estado del cliente OAuth y tratamiento de expiración; no se han configurado credenciales. No quedan elegidos modelos/dimensiones, servicio HTTP/voz de Piper ni restantes parámetros de operación. No se autoriza su implementación por el mero registro de estas decisiones.

## Consecuencias

La infraestructura puede ser local sin que todas las integraciones lo sean. Los recorridos que usan OpenAI, Drive y SMTP externo necesitan conexión y credenciales; la primera configuración de Google debe resolverse expresamente. La clave OpenAI no concede acceso a Drive. Conservar SMTP externo no autoriza enviar correos de prueba en cada arranque ni decide compartir credenciales personales.

Piper necesita preparar su voz y servicio locales. n8n necesita persistencia y distribución reproducible de los workflows: los exports en `workspace/n8n`, ignorados por Git, no bastan para un clon nuevo.

La reutilización de datos y la política de workflows ya están elegidas mediante D04 y D06. Queda comprobar el almacenamiento antes de su uso y fijar los mecanismos operativos. Los límites de recursos y espera se verificarán durante la futura implementación; no son garantías acreditadas por este ADR.

## Alternativas

Se retiró la propuesta de IA de chat local con Ollama y generación por composición desde catálogo. No se adopta el traslado de workflows al backend, la sustitución de Google Drive por vigilancia periódica de una carpeta local ni la sustitución de Piper por voz de OpenAI. El usuario eligió otras opciones, detalladas en el registro.

Para D04 se descartó sustituir el almacenamiento existente por uno nuevo como opción de transición; se eligió reutilizarlo. Para D06, tras la [investigación del 18 de octubre](../../architecture/investigacion-versionado-workflows-n8n.md), el usuario aceptó «JSON en Git y actualización explícita», como registra el [ADR 0007](0007-versionado-explicito-de-workflows.md).

## Evidencia de la investigación original

La aprobación de alcance proviene de las respuestas del usuario, no de la presencia de estos servicios en código o exports. El [registro de continuidad](../decisiones-desarrollo-docker.md) conserva las elecciones, cambios de alcance y preguntas sin resolver.

La revisión técnica fue estática, complementada con consulta de documentación oficial y existencia de recursos Docker. No se ejecutó el futuro stack, no se consumió API para probarlo y no se modificaron bases de datos. Para retomar, seguir el punto de reanudación del registro y completar la definición antes de implementar.
