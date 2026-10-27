# Plan de implementación futura — conjunto 2.0

> **Cierre documental 2.0:** integración revisada y cálculos de autoría comprobados. El siguiente trabajo es implementar/prototipar y validar según el plan, con autorización separada; esta entrega no implementa la aplicación ni acredita validez con estudiantes.

**Todas las tareas están pendientes.** Esta investigación no ejecuta aplicaciones, seed, migraciones ni publicación. Documento canónico versionable; copia temporal idéntica solicitada en `docs/workspace/tasks.md`, ignorada por la regla Git `workspace`. No depender del espejo para recuperar el trabajo.

## Entradas e invariantes

Leer `docs/project/ejercicios/README.md`, `docs/project/marco-evaluacion-ciberseguridad.md`, las cinco fichas y sus memos, `docs/architecture/escenarios-investigativos.md`, `docs/guides/escenarios.md` y `docs/guides/implementar-ejercicios-investigados.md`. Las rutas en este plan son relativas a la raíz, para que ambas copias se lean igual.

La fuente preservada es `docs/project/ejercicios/fuentes/escenarios-companero.md`. Los anteriores cuatro diseños están retirados. Mantener cinco casos, D1–D4, 0–3/NE, A0–A3 y la separación de pruebas elegidas/docentes; ninguna suma de flags equivale a conocimiento.

Orden: I01 → I02/I03 → I04–I08 → I09 → I10 → I11. I12 es validación de campo posterior, no requisito para iniciar un prototipo. Cada unidad de caso incluye dominio, UI, tests y documentación: no dividir autores por capas que deban cambiar juntas.

## I01 — Contratos y especificación técnica de datos

- [ ] Revisar tipos/registro de capacidades en `packages/scenario-contract/src/index.ts`, normalizador, builder y catálogo; definir extensiones cerradas por caso, nunca strings/eval libres.
- [ ] Añadir esquema de intento/evidencia con versiones de tarea/forma/fixtures/motor/verificador/rúbrica/ayudas y hash; actor seudonimizado, secuencia, operationId, revisión esperada, pruebas, diagnóstico sellado, segmentos, entrega, adjudicación e incidencias.
- [ ] Mantener separado progreso legado. Definir compatibilidad explícita de serialización y rechazo de versiones desconocidas; no interpretar intento viejo con rúbrica nueva.
- [ ] Tests: defaults anteriores intactos, entradas desconocidas rechazadas sin mutación, IDs únicos, contratos consumidor/productor coherentes. Planificar migración no destructiva si realmente hace falta; no ejecutarla como parte de autoría de manifiestos.
- Dependencias: ninguna. Superficies candidatas: paquete de contrato, normalizador/builder/frontend y DTOs de progreso/backend. Confirmar archivos exactos al implementar. Riesgo futuro: contratos/persistencia.

## I02 — Ciclo de intento y evidencia

- [ ] Implementar agregado descrito en arquitectura: crear→D1→revisiones/pruebas→entrega→D2→informe; pausado/incidencia/práctica distintos.
- [ ] Guardado y entrega idempotentes; conflicto de revisión no sobrescribe; fallo de persistencia impide confirmar. Ordenar comandos por intento, no confiar en llegada concurrente.
- [ ] Persistir ayuda antes de revelarla; reset crea revisión del mismo attemptId y conserva historial/exposición; reanudación no repite como autónomo lo ya asistido. Pruebas docentes en registro separado.
- [ ] Tests: duplicado, dos escrituras concurrentes, pérdida de respuesta después de persistir, reconexión antes/después de entrega, error a mitad de prueba, reset asistido, propiedad del intento en servidor.
- [ ] Minimizar datos y no enviar expediente a LLM/RAG; registrar responsable/retención antes del campo.
- Dependencia I01. Reutilizar controllers/repositorios de progreso solo donde su semántica sea compatible; no reemplazar terminado por dominio adquirido. Riesgo futuro: persistencia, autorización y concurrencia.

## I03 — Escritorio, banco de pruebas y accesibilidad

- [ ] Reutilizar oficina→transición→monitor→ventanas actuales; registrar nuevas vistas tipadas. Un monitor con aplicaciones del caso, no una experiencia web desconectada.
- [ ] Familiarización neutral, expediente/citas, diffs confiables, guardar, selector de fixture/actor, resultados, comparación, informe. Acceso directo por teclado al mismo contenido, foco y lector de pantalla.
- [ ] Mantener D1 anterior a menús y D2 posterior al cierre; originales A0 siempre disponibles. Feedback ordinario factual sin elección recomendada.
- [ ] Banco aislado por ejecución, versión/revisión visibles; timeout/crash produce incidencia, no bloqueo seguro. Otra solución entra a revisión sin ejecutar código arbitrario.
- [ ] Tests UI: mouse/teclado mismo estado, pausa, ayuda, error y entrega; ningún tiempo de locomoción incide en rúbrica.
- Dependencias I01/I02. Riesgo futuro: aislamiento y contratos compartidos.

## I04 — AndinaPay / CWE-321

- [ ] Distinguir submit_artifact (snapshot técnico persistido y batería docente separada) de submit_report (D2/D4 posterior sin editar el snapshot). Implementar ficha `cwe-321-andinapay.md` íntegra: tres revisiones del repositorio, búsqueda/diffs, materiales e inventario, AES-GCM real sobre los siete envelopes, respuesta y reporte.
- [ ] Releer vectores de la ficha: IV12, tag16, claves32 bytes, AAD con pipes sin barras; WebCrypto recibe ciphertext concatenado con tag. Verificar siete plaintexts, clave/tag/AAD incorrectos y R03 independiente. No generar cifrados arbitrarios con IV públicos repetidos.
- [ ] Recuperación staged, dos custodias admisibles, migración R01/R02, escritor R04 aislado, no tocar R03; preservar copia histórica. Handles de laboratorio no prometen bóveda real.
- [ ] Tests B1/B2, Q1–Q3 y C1–C5 de ficha; cambio de HEAD solo, migración incompleta, permisos excesivos y scanner de historia/cambio nuevo. Fallo de staging no publica parcialmente ni oculta estado.
- [ ] A2/A3 y rúbrica exactas; causalidad no inventa vía de fuga. Dos rutas válidas por propiedades, no ID.
- Dependencias I02/I03. Riesgo futuro: cripto, permisos, estado/commit. No actuar sobre repositorio real.

## I05 — BibliotecaViva / CWE-89

- [ ] Implementar ficha `cwe-89-bibliotecaviva.md`: esquema/siete préstamos, consulta segura A0, vulnerable/partial/raw/parametrizadas, error/actor/validación/permisos.
- [ ] Seleccionar y fijar distribución oficial SQLite/WASM/licencia/hash en Worker, sin persistencia/red/SQL libre. Inicializar DB limpia por test; inspeccionar consulta y bindings reales; usar authorizer de SQLite para modelo read_only, no simular GRANT nativo inexistente.
- [ ] Tests B/Q/C completos, ambas rutas named/positional, title y author como entradas adversas, fecha real/calendario, 80/81 caracteres, tipos y page1–4; autor O'Reilly, porcentajes/guion bajo literales, `redes`→1001/1003 en primera página.
- [ ] Principal S102 frente a fixed_S101/request; intento sin sesión y request_student ajeno. INSERT de sonda no muta DB con read_only; hashes antes/después; raw error no se confunde con sintaxis arreglada.
- [ ] Worker bloqueado/timeouts son incidencia; terminar Worker/recrear DB con resultados previos preservados.
- Dependencias I02/I03. Riesgo futuro: dependencia, ejecución acotada, identidad/contrato. No instalar servidor vulnerable.

## I06 — TalentoAndino / CWE-434

- [ ] Implementar ficha `cwe-434-talentoandino.md`: T01–T13 y LG01–LG03, V/L/N/S/D/P, políticas/código/logs, clasificar/quarantinar/migrar, informe.
- [ ] Analizador cerrado sobre catálogo inerte; la UI no puede declarar confiable profile/active/size. Los marcadores no son archivos PDF/JPEG reales ni evidencia de parser universal.
- [ ] Tests B1/B2, Q1–Q6 y C1: límites exactos/+1, firma/MIME engañosos, activo en PDF, campo incorrecto, truncado, extensión mixta, ruta original sin utilizar, doble nombre sin colisión, público/visitante, inventario legado.
- [ ] Intercalar T04: recibir→handle TA-PENDING-<seq>→admisión provisional P0/pending P1→recuperación por handler de propietario→análisis→rechazo final y revocación. Verificar secuencia temporal independiente del contador TA-0100 que solo avanza al aceptar. P0 puede pasar batería final y falla C incluso con S1/S2; P1 no publica antes del análisis. No sustituirlo por sleep.
- [ ] No exigir un proveedor de almacenamiento; S1/S2 válidos. Rechazo no deja objeto servible; cuarentena nunca entrega al visitante y migración conserva LG01.
- Dependencias I02/I03. Riesgo futuro: almacenamiento/entrega y publicación concurrente simulada.

## I07 — AndeanLogix / CWE-306

- [ ] Implementar ficha `cwe-306-andeanlogix.md`: tres operaciones y efectos exactos, seis estados de identidad, método/ruta/red/puerto/mantenimiento, tracking público.
- [ ] Identidad/rol provienen del registro confiable; texto del payload no da rol. Proteger cada acción, no solo login ni cancel; autorización por rol además de autenticación.
- [ ] Reproducir matriz completa de ficha con fechas fijas, B/Q/C, red pública/interna, puerto alternativo, maintenance on/off/bypass, GET405, POST401/403/200 y precondiciones. Verificar cambio preciso de estado/route/credentialRevision, no solo status HTTP.
- [ ] Rechazo no cambia negocio (auditoría puede crecer). Payload inválido, envío inexistente y operaciones repetidas tienen semántica explícita de ficha; comprobar snapshot antes/después.
- [ ] Otra política justificable se revisa por propiedades; cerrar red sin continuidad legítima falla B.
- Dependencias I02/I03. Riesgo futuro: autenticación/autorización y frontera de red; no probar endpoints reales.

## I08 — NubeAndina / CWE-502

- [ ] Implementar ficha `cwe-502-nubeandina.md`: JSON tipado NubeSession/1 de juguete, S01–S08, orden DFS vulnerable, efectos inertes y dependencia ficticia; no librería vulnerable nativa.
- [ ] Releer bytes/hash/MAC del documento; Base64 estricto y contexto exacto; S03–S05 poseen MAC válidos deliberadamente. S08 inválido; dueño/expiración/esquema independientes de MAC.
- [ ] Tres rutas válidas N3/N4/N6; handle no acepta blob y verifica propiedad/vigencia; N2 falla hijo; N1 valida demasiado tarde; N5 cambia versión pero deja entrada insegura.
- [ ] Tests B1/B2,Q1–Q6,C1, límites de wire4096/bytes2048/profundidad5/extensiones2/texto80; desconocidos y malformed documentados. No aceptar un resultado por nombre de parche.
- [ ] Fault anunciado en S02 después del primer campo: eager deja cambio parcial, staged no. Error real del entorno no cuenta como esa falla simulada.
- [ ] Ningún callback/shell/reinicio real; comparar principal/rol/filtros/plantilla/theme/sessionOwner/restarts/config, y estado separado de auditoría.
- Dependencias I02/I03. Riesgo futuro: integridad, interpretación/commit y estado.

## I09 — Autoría de escenarios y sustitución de catálogo

- [ ] Solo tras capacidades verificadas, crear cinco definiciones con slugs/topología de arquitectura, IDs únicos y defaults reales; enlazar artefactos/versiones al registro.
- [ ] Validar normalización y expectativas de eventos/fases; no forzar todas las soluciones a una secuencia de clics.
- [ ] Retirar de oferta los ejercicios sustituidos sin destruir intentos históricos ni reescribir resultados con versión2.0. Registrar revisión y política de compatibilidad.
- [ ] Generar variantes B desde recetas solo si se publicarán; comprobar todos sus vectores. Hasta entonces deshabilitadas, no fingir forma equivalente.
- Dependencias I04–I08. Riesgo futuro: catálogo/contrato y datos históricos. Publicación/seed siguen siendo operaciones que requieren autorización.

## I10 — Informe y rúbricas

- [ ] Producir perfil por dimensión/ayuda con evidencia citada, B/Q/C y límites. No promediar niveles ordinales ni introducir 70/100.
- [ ] Separar resultados automáticos y juicio humano; descriptores/anclas literales de ficha, NE/no_attempt/technical_error/requires_review diferenciados.
- [ ] D4 solo atribuye pruebas elegidas al alumno; soluciones/docente solo tras cierre o A2/A3. Reporte conserva texto original y adjudicación, no corrige historia.
- [ ] Tests de desacuerdo, ausencia de evidencia, ayuda temprana/tardía, exposición previa y revisión humana alternativa.
- Dependencias I02/I04–I08. Riesgo futuro: interpretación y contratos de reporte.

## I11 — Verificación técnica y documentación

- [ ] Correr focales y suites descritas en la guía; observar resultados reales, no reutilizar cálculos exploratorios como tests frontend/backend.
- [ ] Verificar integración oficina/monitor, almacenamiento de intento, reanudación, acceso cruzado denegado y reset; adversarios no tienen salida del modelo.
- [ ] Revisión independiente de seguridad/persistencia/concurrencia/dependencias que efectivamente se hayan tocado; controles nativos conforme a instrucciones vigentes.
- [ ] Actualizar documentación de comportamiento implementado, versiones, comandos y brechas. Ningún flag verde acredita validez educativa.
- Dependencias I09/I10. No publicar con fallos, incompatibilidad o evidencia perdida.

## I12 — Validación de investigación con personas (posterior)

- [ ] Delimitar población/uso/ética, especialistas y muestra defendible según propósito; no inventar tamaño universal.
- [ ] Revisión de contenido y entrevistas de interpretación/proceso de respuesta, incluyendo lenguaje/UI y posibles pistas A0.
- [ ] Entrenar evaluadores con respuestas reales anonimizadas; doble corrección/adjudicación y acuerdo con incertidumbre; revisar rúbrica cuando falle.
- [ ] Pilotar carga/orden y alternativas, hipótesis de equivalencia de formas, generalización y consecuencias conforme V0–V5 del marco.
- [ ] Informar distribuciones/perfiles con condiciones y faltantes. No concluir mejora causal ni porcentaje global de saber.
- Dependencias: prototipo mínimo de I04–I08 e institución; no exige laboratorio completo para primeras observaciones.

## Regla de entrega para el futuro agente

Entregar implementación y evidencia por tarea, cambios de diseño aceptados, tests fallidos/pendientes y límites. No tachar una tarea por escribir un manifiesto ni por leer este plan. Resolver restricciones técnicas con revisión del documento, no inventando éxito. El actual archivo es investigación/handoff, no autorización de despliegue, remotos o eliminación de datos.
