# Revisión del sistema

- Fecha: **13 de octubre de 2026**.
- Base de código: `cc0c9cb`; versión declarada `5.0.0`.
- Entorno de validación: Windows, Node.js `v24.21.0`, npm `12.2.0`, dependencias presentes en el workspace.
- Resultado: documentación contrastada con código y hallazgos pendientes. No se modificó lógica de aplicación ni se aplicaron correcciones de seguridad o migraciones.

## Alcance y método

Se revisaron estructura, manifiestos, entrypoints, routers, middleware, casos de uso de identidad/grupos/progreso/feedback/análisis, repositorios de persistencia e integración, esquema/migraciones/seed, configuración HTTP, providers y rutas de React, núcleo/controladores/sistemas de simulación, catálogo y generador, exportador RAG, pruebas y CI.

Se contrastaron afirmaciones documentales con productores y consumidores de contratos. La revisión se centra en fronteras entre módulos, reglas funcionales, integridad y operación. No es una inspección línea por línea de cada asset, estilo o modelo 3D, ni un pentest de una instancia desplegada.

Se ejecutaron checks estáticos, unitarias, build y E2E existentes. No se inició una API conectada a servicios reales, no se enviaron correos, no se llamaron webhooks/LLM/Qdrant/Piper reales, no se ejecutaron seed/migraciones ni scripts de concurrencia. Las carreras señaladas se deducen de consultas separadas y ausencia de restricciones; no se presentan como incidentes reproducidos contra una base.

## Validación ejecutada

| Comando | Resultado | Qué demuestra |
|---|---|---|
| `npm run lint --workspaces` | Ambos workspaces pasan | Reglas ESLint actuales |
| `npm run typecheck --workspaces` | Ambos pasan | Coherencia estática con cliente Prisma disponible |
| `npm run test --workspaces` | Frontend: 84 tests en 9 archivos; backend: 45 en 5; **129 pasan** | Comportamientos cubiertos por suites y mocks |
| `npm run build --workspaces` | Ambos pasan | Bundle frontend, compilación backend y copia de Prisma |
| `npm run test:e2e --workspace @cybersim/frontend -- --workers=2` | **12 pasan** en Chromium, incluido smoke 3D | Formularios, rutas, navegación, panel docente y canvas con datos simulados |

Los primeros intentos de unitarias y build en sandbox fallaron con `EPERM` al resolver archivos antes de completar checks. Se repitieron fuera de ese sandbox con autorización de ejecución y pasaron. Se clasifican como limitación de entorno, no fallos funcionales.

Build Vite emitió advertencia de chunk grande: JavaScript principal **2.047,66 kB minificado / 596,68 kB gzip**, con 3205 módulos transformados. No se midieron tiempos de carga con equipos/redes de estudiantes. No se generó ni afirmó un porcentaje de cobertura global.

## Hallazgos

Prioridades propuestas: **P1** afecta acceso, recursos o integridad de atención alta; **P2** afecta confiabilidad/configuración/seguimiento; **P3** afecta mantenimiento o calidad de evidencia. No afirman explotación real ni asignan plazos.

| ID | Prioridad | Hallazgo | Evidencia |
|---|---|---|---|
| H-01 | P1 | Recursos educativos públicos aceptan IDs no autenticados | Routers y repositorios |
| H-02 | P1 | Generación/chat sin autenticación, cuotas ni aislamiento de sesión | API y memoria |
| H-03 | P1 | Confirmación de correo aplicada en UI, no en login/middleware | Casos de uso y guards |
| H-04 | P1 | Matrícula única no atómica ni restringida en BD | Riesgo deducido de código/esquema |
| H-05 | P2 | Registro puede dejar identidad sin perfil | Operaciones separadas |
| H-06 | P2 | Cadena de acciones puede no ser JSON válido | Serializador |
| H-07 | P2 | Guardado no verifica éxito HTTP ni lo confirma a UI | Controlador cliente |
| H-08 | P2 | Destrucción deja intervalo de tiempo total activo | Sistema y reset |
| H-09 | P2 | Generador falla con fallback `/api`; análisis usa otra variable | Paths y Vite |
| H-10 | P2 | Dependencias descritas como opcionales bloquean arranque | Construcción al importar |
| H-11 | P2 | Plantilla Qdrant contradice TLS y generador tiene destino implícito | Plantilla/adaptadores |
| H-12 | P2 | Generación de feedback no impone habilitación ni deduplicación | Casos de uso |
| H-13 | P2 | Análisis confía en ID y estructura externos al persistir | Adaptadores n8n/Prisma |
| H-14 | P2 | Política de contraseña y contrato de alta docente divergen | UI, hook y backend |
| H-15 | P2 | Firma global de errores incorrecta; fetch sin timeout | Composición/adaptadores |
| H-16 | P2 | Health no verifica todas las dependencias anunciadas | Controllers |
| H-17 | P2 | Retos generados comparten slug y no conservan definición | Builder y esquema |
| H-18 | P2 | Bundle frontend concentra una carga elevada | Resultado del build |
| H-19 | P3 | Suites no cubren API real; harness de grupos interpreta mal envelope | Tests y CI |
| H-20 | P3 | Export RAG y catálogo tienen varias fuentes de actualización | Rutas/listas explícitas |

### H-01: autorización de recursos educativos

[`server.ts`](../../apps/backend/src/server.ts) monta progreso, grupos, feedback y análisis sin middleware de identidad. [`authMiddleware`](../../apps/backend/src/auth/infrastructure/middlewares/authMiddleware.ts) solo se utiliza en dos rutas de [`AuthController`](../../apps/backend/src/auth/infrastructure/controllers/AuthController.ts).

[`GroupsController`](../../apps/backend/src/groups/infrastructure/controller/GroupsController.ts) permite consultar perfiles/correos, crear/editar/borrar cursos, regenerar códigos y modificar matrículas sin JWT. Expulsión compara el dueño con `id_profesor` del body, controlado por el solicitante. Edición pasa `req.body` al repositorio sin whitelist en runtime. [`ProgresoController`](../../apps/backend/src/auth/infrastructure/controllers/ProgresoController.ts) acepta ID, resultado y acciones de cualquier estudiante.

Impacto: lectura o modificación cruzada de datos y alteración de ranking/seguimiento. Propuesta: identidad por área, ownership/relaciones, campos permitidos y tests de acceso cruzado. [ADR propuesto 0005](../project/adrs/0005-autorizacion-en-servidor.md).

### H-02: generación y sesiones sin control de cuenta

[`ChatController`](../../apps/backend/src/chat/infrastructure/controllers/ChatController.ts), feedback, análisis y generador permiten solicitudes sin identidad. El sessionId lo suministra el cliente; borrar sesión no verifica propietario y estadísticas son públicas. [`ConversationMemoryManager`](../../apps/backend/src/chat/infrastructure/services/ConversationMemoryManager.ts) limita mensajes por sesión, pero no cantidad de sesiones.

Impacto: consumo externo no atribuido/controlado y posibilidad de afectar sesiones por ID. Propuesta: sesión por cuenta, protección y cuotas. No se midieron abuso real ni costos.

### H-03: confirmación solamente en navegación

[`LoginUseCase`](../../apps/backend/src/auth/application/useCases/LoginUseCase.ts) emite JWT y devuelve el flag sin rechazar cuentas no confirmadas. Middleware verifica firma/expiración, no estado de cuenta. [`ProtectedRoute`](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/components/ProtectedRoute.tsx) lee una marca modificable de localStorage.

Impacto: la confirmación esperada por UI no protege llamadas directas. Propuesta: verificarla en servidor para funciones que la requieren, con respuesta y recorrido de reenvío consistentes.

### H-04 y H-05: atomicidad

[`JoinGroupsUseCase`](../../apps/backend/src/groups/application/JoinGroupsUseCase.ts) consulta matrícula y luego inserta. [`schema.prisma`](../../apps/backend/prisma/schema.prisma) no tiene unicidad de estudiante ni del par curso/estudiante. Solicitudes simultáneas pueden superar la misma consulta. La restricción adecuada depende de si el producto mantiene un grupo por estudiante.

Registro de [estudiante](../../apps/backend/src/auth/application/useCases/RegisterEstudianteUseCase.ts) y [profesor](../../apps/backend/src/auth/application/useCases/RegisterProfesorUseCase.ts) crea identidad y perfil por separado. Fallar el segundo paso deja identidad sin rol y puede impedir reintentar alta con el correo.

Propuesta: transacciones y restricciones coherentes, con concurrencia y rollback probados sobre PostgreSQL de prueba. No se hicieron esas pruebas reales en esta revisión.

### H-06 y H-07: confiabilidad del intento

[`ProgresoController` cliente](../../apps/frontend/src/ecs/controllers/ProgresoController.ts) construye JSON interno por interpolación. `JSON.stringify(undefined)` interpolado produce texto `undefined`; opcionales ausentes y comillas en acción/objeto pueden invalidarlo. La API lo almacena como texto sin parsear.

POST comprueba content-type, pero no `response.ok`, no consume el envelope para comunicar resultado y no implementa retry/idempotencia. Un 400/500 JSON puede pasar silenciosamente. Obtener sesión ocurre antes del try, por lo que un perfil local ausente/mal formado puede lanzar fuera del manejo previsto.

Propuesta: serializar un objeto con JSON.stringify, validar acciones en servidor, confirmar guardado y diseñar reintentos sin contar duplicados.

### H-08: intervalo sin liberar

[`SistemaTiempo`](../../apps/frontend/src/ecs/systems/SistemaTiempo.ts) crea `intervalo` e `intervaloTiempoTotal`. `destruir()` solo limpia el primero. Cierres y reset de [`EscenarioController`](../../apps/frontend/src/ecs/controllers/EscenarioController.ts) llaman a ese método.

Impacto: el reloj total conserva referencias y actividad tras finalizar/reiniciar. Propuesta: liberar ambos y cubrir finalizar, reset y cambio de escenario con timers controlados.

### H-09 a H-11: configuración y rutas

[`ScenarioBuilderApiService`](../../apps/frontend/src/visual/features/agent-malvado/infrastructure/services/ScenarioBuilderApiService.ts) elimina `/api` de la base. Si esta es `/api`, llama `/api/agent-malvado/generate`, y el [proxy Vite](../../apps/frontend/vite.config.ts) lo convierte en `/agent-malvado/generate`, que Express no monta. La guía usa base absoluta para evitarlo.

[`useGenerateCourseAnalysis`](../../apps/frontend/src/visual/features/course-analysis/hooks/useGenerateCourseAnalysis.ts) usa `VITE_API_URL` con localhost de respaldo; el resto usa `VITE_BACKEND_URL`. Un build remoto puede consultar el equipo del usuario aunque esté configurada la base central.

Routers crean servicios al importar: feedback exige webhook, chat exige clave OpenAI, Qdrant y ambas URLs Piper; SMTP también exige configuración. Se corrigió la documentación de opcionalidad, no la composición.

La [plantilla backend](../../apps/backend/.env.example) combina URL Qdrant HTTPS y bandera false; el [adaptador](../../apps/backend/src/chat/infrastructure/services/QdrantService.ts) reconstruye HTTP según la bandera. El [controller generador](../../apps/backend/src/agent-malvado/infrastructure/controllers/ScenarioBuilderController.ts) tiene URL externa fija de respaldo.

Propuesta: centralizar URLs, validar entorno por módulo y hacer explícitos destinos/servicios habilitados. Las guías ya explican el estado actual.

### H-12 y H-13: generación persistida

[`GenerateFeedbackUseCase`](../../apps/backend/src/feedback/application/useCases/GenerateFeedbackUseCase.ts) cuenta, genera y guarda sin consultar `debeHabilitar`. La restricción del [estado](../../apps/backend/src/feedback/infrastructure/repositories/PrismaFeedbackPersistenceRepository.ts) solo controla UI; se puede generar sin intentos nuevos.

[`N8nCourseAnalysisRepository`](../../apps/backend/src/course-analysis/infrastructure/repositories/N8nCourseAnalysisRepository.ts) comprueba dos objetos sin esquema completo. El [repo Prisma](../../apps/backend/src/course-analysis/infrastructure/repositories/PrismaCourseAnalysisRepository.ts) guarda `analysis.id_curso`, sin verificar coincidencia con solicitud, y parsea textos JSON al recuperar. El [adaptador feedback](../../apps/backend/src/feedback/infrastructure/repositories/N8nFeedbackRepository.ts) tampoco valida cuatro textos en runtime.

Propuesta: validar DTOs, identidad/curso, habilitación y deduplicación/costos antes de persistir.

### H-14: acceso divergente

[`AuthPage`](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/pages/AuthPage.tsx) admite seis caracteres, registro exige ocho y [`CambiarContraseniaUseCase`](../../apps/backend/src/auth/application/useCases/CambiarContraseniaUseCase.ts) permite seis. UI visible solo registra estudiantes.

El [hook](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/hooks/useAuth.ts) define alta docente con `nombre_completo`, mientras backend requiere cuatro nombres/apellidos. Su tipo AuthResponse.user no representa exactamente el perfil real. No se reproduce un formulario docente fallido porque no existe ese recorrido visible.

Propuesta: política y contratos consistentes, y procedimiento de incorporación docente antes de un nuevo formulario.

### H-15 y H-16: errores y salud

Manejador global de [`server.ts`](../../apps/backend/src/server.ts) tiene tres parámetros; Express identifica middleware de error con cuatro. No actúa como captura global. Los catches usan envelopes diversos y algunos omiten respuesta si lo lanzado no es Error.

OpenAI/n8n/Piper usan fetch sin timeout explícito. Salud básica no consulta DB/SMTP; chat prueba Qdrant pero anuncia GPT/TTS como verdaderos; análisis solo comprueba URL. Un 200 no garantiza servicio operativo.

Propuesta: middleware reconocido, clasificación/redacción, deadlines y comprobaciones diferenciadas de proceso/dependencias.

### H-17 y H-18: seguimiento y carga

El [builder dinámico](../../apps/frontend/src/visual/features/agent-malvado/presentation/hooks/useScenarioBuilder.ts) fuerza `ai-generated-scenario` y no persiste definición. [`useLeaderboard`](../../apps/frontend/src/visual/features/escenarios-simulados/hooks/useLeaderboard.ts) agrupa por slug y primer éxito: generaciones distintas comparten resultado/puntaje. Ver [ADR 0003](../project/adrs/0003-persistencia-de-intentos.md).

Build concentra aproximadamente 2 MB minificados en JavaScript principal; la [entrada](../../apps/frontend/src/visual/main.tsx) importa pantallas estáticamente. Propuesta: identidad/versión de retos si se requiere trazabilidad; medir carga y evaluar carga diferida de pantallas/3D. No se cuantificó impacto en estudiantes.

### H-19 y H-20: validación y mantenimiento

[Helpers E2E](../../apps/frontend/tests/e2e/helpers/auth.ts) siembran sesión/interceptan API; no prueban middleware, persistencia o integraciones reales. No hay suites específicas de chat/feedback/análisis/generador entre unitarias revisadas. CI permite fallar smoke 3D y continúa tras conflictos de merge temporal.

[Script concurrente de grupos](../../tests/concurrencia/test-concurrencia-grupos.mjs) interpreta GET cursos como array, pero API devuelve envelope. Puede dejar matrícula previa y conteos incompletos. Corregir antes de usarlo como evidencia.

[Exportador](../../apps/frontend/scripts/export-rag-knowledge.ts) escribe junto al script, distinto de JSON raíz preexistentes. Catálogo, metadatos de ambas apps y lista de exportación necesitan actualización manual. Propuesta: pruebas dirigidas de fronteras, harness correcto y destino/catálogo canónicos.

## Discrepancias documentales corregidas

- Estructura antigua `src/client`/`src/server` sustituida por workspaces actuales.
- Variables exigidas al importar routers y ambas URLs Piper documentadas.
- Alcance simulado de E2E aclarado; sus suites actuales no necesitan base real.
- Salida efectiva de exportador e ingestión externa identificadas.
- Salud del proceso, configuración y pruebas de proveedores diferenciadas.
- Arquitectura reubicada y guías, proyecto y ADRs incorporados con estados explícitos.
- Entradas del repositorio enlazan páginas canónicas, sin procedimientos duplicados.

## Acciones propuestas

Priorizar H-01 a H-04 antes de ampliar exposición con actividad real. Continuar con registro/progreso, limpieza de partida, configuración y validación de generación. Cada corrección necesita evidencia específica; repetir checks generales cuando el cambio lo justifique.

Impacto y decisiones de producto pendientes: [riesgos](../project/riesgos-y-pendientes.md). Plan propuesto de acceso: [ADR 0005](../project/adrs/0005-autorizacion-en-servidor.md). Las propuestas no quedan implementadas por este informe.
