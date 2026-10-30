# Escenarios investigados 2.0 — implementación técnica

Objetivo: implementar las tareas I01–I12 de `docs/workspace/tasks.md` (plan canónico:
`docs/project/ejercicios/plan-implementacion.md`) sobre el repositorio CyberSim, con tests y
documentación junto al código. Rama: `new-branch`. Runner: `pnpm -r run test` (vitest por paquete).

Estrategia de entrega: `ask-on-risk` (por defecto). Commits por unidad de trabajo revisable en la rama
actual, sin push, sin PR, sin seed, sin migraciones y sin publicación.

## Specs

S1. Orden de construcción obligatorio: I01 → I02/I03 → I04–I08 → I09 → I10 → I11. I12 es validación
de campo posterior con personas y no es requisito para el prototipo.

S2. Invariantes preservadas: cinco casos; D1–D4; niveles ordinales 0–3 y NE; A0–A3; separación entre
pruebas elegidas por el alumno y batería docente; ninguna suma de flags equivale a conocimiento.

S3. I01 — Contratos y especificación técnica de datos: tipos y registro de capacidades en
`packages/scenario-contract/src/index.ts`, normalizador, builder y catálogo; extensiones cerradas por
caso, nunca strings ni `eval` libres. Esquema de intento/evidencia con versiones de
tarea/forma/fixtures/motor/verificador/rúbrica/ayudas y hash; actor seudonimizado, secuencia,
`operationId`, revisión esperada, pruebas, diagnóstico sellado, segmentos, entrega, adjudicación e
incidencias. Progreso legado separado. Compatibilidad de serialización explícita y rechazo de
versiones desconocidas: no interpretar un intento viejo con una rúbrica nueva.

S4. I01 — Tests exigidos: los defaults anteriores quedan intactos; entradas desconocidas se rechazan
sin mutación; IDs únicos; contratos consumidor/productor coherentes. La migración no destructiva se
planifica, no se ejecuta como parte de la autoría de manifiestos.

S5. I02 — Ciclo de intento y evidencia: agregado crear→D1→revisiones/pruebas→entrega→D2→informe;
pausado/incidencia/práctica distintos. Guardado y entrega idempotentes; conflicto de revisión no
sobrescribe; fallo de persistencia impide confirmar. Orden por intento, no por llegada concurrente.
Persistir ayuda antes de revelarla; reset crea revisión del mismo `attemptId` y conserva
historial/exposición; reanudación no repite como autónomo lo ya asistido. Pruebas docentes en registro
separado. Minimizar datos: no se envía expediente a LLM/RAG.

S6. I02 — Tests exigidos: duplicado, dos escrituras concurrentes, pérdida de respuesta después de
persistir, reconexión antes/después de entrega, error a mitad de prueba, reset asistido, propiedad del
intento en servidor.

S7. I03 — Escritorio, banco de pruebas y accesibilidad: reutilizar oficina→transición→monitor→ventanas;
registrar vistas tipadas; un monitor con aplicaciones del caso. Acceso directo por teclado al mismo
contenido. D1 antes de menús, D2 tras el cierre, originales A0 siempre disponibles. Banco aislado por
ejecución; timeout/crash produce incidencia, no bloqueo seguro.

S8. I04–I08 — Un caso por tarea, cada uno con dominio, UI, tests y documentación juntos; el dominio
reproduce B/Q/C y las rutas válidas por propiedades, nunca por ID de parche ni secuencia de clics.

S9. I09 — Autoría de escenarios y sustitución de catálogo solo tras capacidades verificadas; retirada
visible sin destruir intentos históricos. Generar variantes B solo si se publicarán. Publicación y seed
siguen siendo operaciones que requieren autorización separada: esta entrega NO las ejecuta.

S10. I10 — Informe y rúbricas: perfil por dimensión/ayuda con evidencia citada; no promediar niveles
ordinales ni introducir 70/100; separar resultados automáticos de juicio humano; distinguir
NE/no_attempt/technical_error/requires_review.

S11. I11 — Verificación técnica y documentación: correr focales y suites observando resultados reales,
actualizar documentación de comportamiento implementado, versiones, comandos y brechas. Ningún flag
verde acredita validez educativa.

S12. I12 — No ejecutable en esta entrega: exige población, ética, especialistas y muestra. Se entrega
como planificación documentada, no como trabajo de campo.

S13. Reglas de entrega: no tachar una tarea por escribir un manifiesto ni por leer el plan; no
inventar éxito; no ejecutar seed, migraciones, publicación, despliegue ni operaciones remotas.

S14. El caso AndinaPay se inicia desde el nodo del mapa y se resuelve dentro de la oficina 3D:
oficina → estación `AP-IR-01` → monitor → expediente del caso. `/ejercicios/cwe-321-andinapay`
deja de ser el único acceso y no se elimina como respaldo de desarrollo.

S15. El expediente ofrece las vistas del CWE-321: Expediente, Repositorio, Banco criptográfico,
Respuesta de claves, Comprobaciones e Informe. El diagnóstico D1 sellado habilita todas menos
Expediente, que permanece siempre disponible.

S16. El Repositorio muestra AP-H1, AP-H2 y AP-H3 con sus archivos, permite ver diferencias y
búsqueda literal; `KEY_HEX` aparece en AP-H1 y no en HEAD, y esa ausencia no se presenta como
remediación.

S17. El Banco criptográfico permite seleccionar uno de los siete envelopes y una clave candidata;
devuelve el plaintext exacto o `AUTHENTICATION_FAILED` sin texto parcial.

S18. Respuesta de claves permite preparar K2, elegir fuente restringida, recifrar R01/R02, publicar,
retirar/restaurar K1 como contraprueba y configurar prevención con alcance y política explícitos.
El éxito técnico es B && Q; C1 declara la exposición residual de la copia histórica.

S19. El Informe recoge los cinco campos; `submit_artifact` congela la entrega y `submit_report`
cierra el caso. Cuando el backend está disponible se registran diagnóstico, pruebas, revisión,
entrega y explicación en `/api/attempts`; al cerrar se guarda `/progreso` con `terminado: true` y
el slug `andinapay-clave-expuesta` para marcar el nodo y sumar ranking.

S20. El estado del banco se conserva en `localStorage` por estudiante y caso, con reinicio explícito.
No se requieren imágenes nuevas; cualquier asset opcional se lista al final de la entrega.

S21. La sección **Partida** es la guía de inicio: muestra las cuatro fases con objetivos
descriptivos (leer el aviso y localizar la clave en AP-H1, sellar D1, migrar R01/R02, verificar y
enviar el informe) y avanza cuando el estudiante confirma cada hito. No se añade un botón flotante
en la oficina ni se completa un objetivo por abrir una ventana.

S22. El ejercicio se resuelve desde el escritorio existente de **Dispositivos**: seis ventanas
propias del caso (Expediente, Repositorio, Banco, Respuesta, Comprobaciones, Informe) se suman a
las aplicaciones del escritorio, con el mismo gestor de ventanas y sin reutilizar la pantalla de
`/ejercicios`.

S23. La topología de **Redes** representa el caso con nombres legibles: `PC Analista`
(`AP-IR-01`), `Servidor de Datos` (`AP-DATA-01`), `Servidor de Claves` (`AP-KEYS-01`) y
`Router de la Oficina` (`AP-RTR-01`), con las redes `LAB` e `Internet`.

S24. El reloj y el panel de eventos guían la narrativa: avisos a t=5, 20, 40 y 60 que pausan el
reloj, explican el siguiente paso y registran hitos del estudiante. Los eventos no fallan la
partida por no ejecutar una acción en un segundo exacto; el caso es de investigación.

S25. El acceso al caso sigue el patrón de los escenarios antiguos: clic en `AP-IR-01` → menú
**Configurar** → monitor → escritorio. La cámara enfoca la estación al entrar, sin botón nuevo.

S26. El intento y el progreso se conservan: diagnóstico, pruebas, revisiones, entrega y explicación
en `/api/attempts`; `/progreso` con `terminado: true` al enviar el informe. La suite de integración
de los trece recorridos existentes debe seguir verde.

S27. La ventana **Expediente** explica el caso en lenguaje llano antes de pedir datos: quién eres,
qué ocurrió, qué debes demostrar, cinco pasos de inicio y un lector de materiales. El aviso se lee
con su contenido real, no solo como nombre de archivo. D1 se presenta como cinco preguntas guiadas
con ejemplos y evidencias agrupadas. El primer objetivo se confirma con un botón explícito después
de leer el aviso y AP-H1; no se completa al abrir la ventana.

S28. El fragmento `SYN-001 / tok_demo_A` pertenece al plaintext de R01 y solo se descubre al abrir
`incident/notice.txt`. No es una credencial real: es una prueba de acceso del aviso y un oráculo
para contrastar la clave candidata. Las notificaciones temporizadas solo anuncian el aviso o piden
revisar materiales; no revelan la clave, los registros ni el resultado de las comprobaciones.

S29. Los nombres visibles de los dispositivos son legibles; los identificadores técnicos
`AP-IR-01`, `AP-DATA-01`, `AP-KEYS-01` y `AP-RTR-01` quedan solo como identidad del modelo en la
ficha. Los dos servidores usan el modelo procedural `serverrack` y la vista de un solo entorno
muestra los controles de acercar/alejar para poder ver la sala completa.

S30. Las notificaciones del caso llegan cada 5 segundos: t=5, 10, 15, 20, 25 y 30. Cada una pausa
el reloj y propone el siguiente paso. No se espera a t=20 para el segundo aviso.

S31. Mientras una notificación mantiene el reloj pausado, **Reanudar** permanece deshabilitado hasta
que el estudiante completa el paso propuesto. El motivo se muestra en el tooltip y en el
`aria-label` del botón. Al reanudar, el caso escribe `Bien: ...` con el hito completado. Así el
siguiente aviso no llega antes de tiempo y la secuencia aviso → tarea → reanudar → feedback se
mantiene coordinada. El listener vive en el layout del juego (`GameProvidersLayout`) para funcionar
en Oficina, Partida, Redes y Dispositivos, incluso con el escritorio cerrado.

S32. La explicación del ejercicio (objetivo, cómo se juega, glosario y qué debe demostrar) vive en
**Partida**, antes de las fases. La ventana Expediente muestra solo el caso como realidad: aviso
recibido, materiales y diagnóstico D1, sin pasos didácticos ni explicaciones del ejercicio.

S33. El repositorio se presenta como un editor tipo IDE: barra de título, explorador de archivos por
carpeta, historial de versiones seleccionable (H3, H2, H1) con fecha y etiqueta, pestaña del archivo
abierto, panel de código con números de línea, barra de estado y paneles de búsqueda y comparación.
El historial funciona como un `git log`: al seleccionar una revisión se muestra el contenido de esa
revisión. En la ventana Expediente, al seleccionar `Versión H1 (histórica)` aparece el botón
**Adjuntar Versión H1 al expediente**; el mismo botón existe en el repositorio. Cualquiera de los dos
completa la fase 1; no hay botón didáctico en Expediente.

## Tasks

| ID | Specs | Ruta | Estado |
|---|---|---|---|
| T1 | S3, S4 | inline | hecho — commit `0860454`; 18 tests del contrato + 3 de frontend verdes |
| T2 | S5, S6 | inline | hecho — paquete `@cybersim/attempt-ledger`, 13 tests verdes |
| T3 | S7 | inline | parcial — apartado `/ejercicios` con catálogo, detalle y verificación accesible; faltan escritorios por caso |
| T4 | S8 (CWE-321) | inline | hecho — AES-256-GCM real; 11 tests |
| T5 | S8 (CWE-89) | inline | hecho — SQLite real en pruebas; 13 tests |
| T6 | S8 (CWE-434) | inline | hecho — 13 tests |
| T7 | S8 (CWE-306) | inline | hecho — batería de 144 + 12; 11 tests |
| T8 | S8 (CWE-502) | inline | hecho — HMAC real y S01–S08; 10 tests |
| T9 | S9 | pendiente | publicación/seed requieren autorización separada |
| T10 | S10 | inline | hecho — informe por dimensión sin promedio, 8 tests |
| T11 | S11 | parcial | suites completas verdes; documentación de comportamiento actualizada |
| T12 | S12, S13 | documentación | pendiente |
| T13 | S14 | inline | hecho — mapa → oficina → AP-IR-01 → monitor; botón y menú "Abrir expediente del caso" |
| T14 | S15, S16 | inline | hecho — Expediente con D1 completo y Repositorio con AP-H1/H2/H3, diff y búsqueda literal |
| T15 | S17 | inline | hecho — siete envelopes, clave candidata y rechazo sin texto parcial |
| T16 | S18 | inline | hecho — K2, custodia, migración, retiro/restauración y prevención explícita |
| T17 | S19 | inline | hecho — B/Q/C, artefacto, informe, intento y progreso del mapa |
| T18 | S20 | inline | hecho — localStorage por estudiante, reinicio y verificación final |
| T19 | S21 | inline | hecho — fases y objetivos de AndinaPay en Partida; avance por hitos |
| T20 | S22 | inline | hecho — seis ventanas del caso dentro del escritorio de Dispositivos |
| T21 | S23 | inline | hecho — AP-IR-01, AP-DATA-01, AP-KEYS-01 y AP-RTR-01 con LAB/Internet |
| T22 | S24 | inline | hecho — avisos temporizados y logs de hitos con pausa del reloj |
| T23 | S25 | inline | hecho — sin botón flotante; menú Configurar y foco de cámara |
| T24 | S26 | inline | hecho — intento/progreso conservados; integración 13/13 y unitarias verdes |
| T25 | S27 | inline | hecho — intro narrativa, lector de materiales, D1 guiado y primer objetivo explícito |
| T26 | S29 | inline | hecho — nombres legibles, servidores con modelo `serverrack` y controles de zoom |
| T27 | S30, S31 | inline | hecho — avisos cada 5 s y feedback `Bien`/`Aún no` al reanudar |
| T28 | S32, S33 | inline | hecho — explicación movida a Partida, Expediente realista y repositorio tipo IDE |
| T29 | S31, S33 | inline | hecho — botón de adjuntar H1 en Expediente y Reanudar bloqueado hasta completar el paso |

## Log

L1 (solicitud literal del usuario):
> Quiero que hagas estas tareas que salieron de la planificación de una investigación, ahí mismo ya se cuenta el objetivo de lo que se quiere
>
> docs\workspace\tasks.md

L2. Estado inicial observado: rama `new-branch` con documentación de investigación sin versionar
(`docs/project/ejercicios/`, `docs/architecture/escenarios-investigativos.md`,
`docs/guides/implementar-ejercicios-investigados.md`, ADR 0025). El plan declara todas las tareas
pendientes y la entrega documental no implementó la aplicación.

L3. Alcance decidido: I12 se documenta como planificación (requiere personas e institución) y la
publicación/seed de I09 queda fuera por no estar autorizada. El resto se implementa en orden.

L4. T1: registro cerrado de los cinco casos con operaciones, controles, verificadores, fixtures y
segmentos tomados literalmente de cada ficha; sobre `attempt` con versiones, hash, diagnóstico sellado,
pruebas, ayudas, entrega, adjudicación e incidencias. `defineScenario` añade la capacidad del caso y el
catálogo rechaza `caseId` duplicado. Evidencia: 18 tests del contrato, 3 de frontend, typecheck y lint
verdes.

L5. T2: agregado de intento en un paquete nuevo `@cybersim/attempt-ledger` con puerto de persistencia
compare-and-swap y adaptador en memoria. Cubre duplicado, escritura concurrente, respuesta perdida,
reconexión antes/después de entrega, error a mitad de prueba, reset asistido y propiedad del intento.
Mutación de control sobre la idempotencia produjo 2 fallos y se revirtió: los tests muerden. Brecha
declarada: adaptador Prisma y endpoint HTTP pendientes por la regla de no ejecutar migraciones.

L6. Verificación independiente sobre `d984268..4f20a36`: S3 y S6 PASS; S4 y S5 FAIL por dos blockers.
B2: `AttemptService.create` insertaba sin validar, dejando intentos inutilizables con caso o versión
inválidos. B1: la batería docente y las pruebas del alumno compartían espacio de `testId`, así que una
prueba legítima llamada `B1` volvía la entrega imposible. Corrección en un solo lote: validación en
creación, unicidad por `source`, `expectedRevision` aplicado al diagnóstico sellado, `run-test` limitado
a verificadores y fixtures del registro cerrado, y comprobación de versiones del intérprete
(`version-mismatch`). Añadidos 8 tests de regresión (`attemptGuards.test.ts`).

L7. Solicitud del usuario: terminar los cinco ejercicios, probados, y crear un apartado dedicado solo a
ellos. Implementado `packages/exercises` con un modelo y un verificador por caso: AndinaPay descifra los
siete envelopes AES-GCM con WebCrypto; BibliotecaViva ejecuta SQLite real con `node:sqlite`; TalentoAndino
reproduce el catálogo inerte y la cuarentena; AndeanLogix evalúa 144 peticiones contra un oráculo escrito
desde la ficha; NubeAndina reproduce bytes, SHA-256 y HMAC de S01–S08. 58 tests del paquete más 3 del
apartado. Apartado `/ejercicios` y `/ejercicios/:caseId` con navegación por teclado; el banco SQL declara
su dependencia del Worker en vez de simularse.

L8. I10: `buildAttemptReport` entrega perfil por dimensión con evidencia citada, sin total ni promedio;
separa pruebas del alumno y batería docente, conserva desacuerdos y texto literal, y clasifica la ayuda
como previa o posterior a la entrega. 8 tests más en `attempt-ledger`.

L9. Verificación independiente de los cinco modelos: S10 PASS; S8 FAIL por cuatro blockers. B1: la
política `raw` de errores pasaba Q sin comprobar el detalle filtrado. B2: TalentoAndino aceptaba
almacenamiento público S0 con entrega D1. B3: la frontera de tipos de BibliotecaViva lanzaba una
excepción con `title:{}` y aceptaba `null`, listas y claves desconocidas. B4: páginas fuera de 1–4 se
aceptaban con `client_only`. Corrección: validación de frontera siempre activa, comprobación
`Q89-error`, Q6 exige S1/S2, `not_supported`/red desconocida en AndeanLogix y esquema estricto con
vigencia ISO en NubeAndina. 5 tests de regresión nuevos.

L10. Recheck limitado a los cuatro blockers: PASS en los cuatro, con 14/14 casos de frontera sin tocar
la base y S0 fallando Q6 mientras S1/S2 pasan. Suite completa: contract 19, ledger 30, exercises 63,
backend 55 (+6 skipped), frontend 100; typecheck 5/5; lint y format limpios; build de frontend y backend
correcto.

L11 (solicitud literal del usuario):
> Listo entonces eso es lo que tiene que estar listo, según el flujo que ya se ha establecido y que en la documentación incluso se indica el posible escenario, entonces ahora mismo quiero que ese escenario esté completamente listo, es más cuando termines si necesitas alguna imagen que sea absolutamente necesaria para este nuevo escenario entonces dejalo al final como pendiente para poder generarlo, deja la lista de los elementos que necesites. La cuestión es que yo quiero este ejercicio listo y funcional y no solo en /ejercicios/cwe-321-andinapay como está ahora ya que lo que está ahí no me sirve lo que realmente me sirve es que pueda ser el ejercicio real que seguiría el estudiante.

L12. Estado inicial observado: el nodo del mapa carga el escenario semilla 101 y navega a `/`; la
oficina 3D solo contiene `AP-IR-01`, sin eventos, ataques, acciones ni objetivos. El metadato
`exercise` solo se valida en `catalog.ts` y ninguna vista 3D lo consume. El workspace real vive en
`/ejercicios/cwe-321-andinapay`, es independiente del ECS y no persiste el intento ni marca el mapa.
T3 queda por tanto parcial en su parte de escritorios por caso.

L13. AndinaPay completo en el flujo del mapa. Se añadió `repository.ts` con AP-H1/H2/H3, artefactos
A0, diff y búsqueda literal; el workspace cubre Expediente, Repositorio, Banco, Respuesta,
Comprobaciones e Informe; la oficina enfoca AP-IR-01, expone "Abrir expediente del caso" y el monitor
monta el workspace. El intento registra diagnóstico, diez pruebas, revisiones, entrega y explicación;
el cierre guarda `/progreso` sin revisión/hash para evitar el desajuste con el catálogo y marca el nodo
con 1.000 pts. Verificación observada: suite de integración `ejercicios.spec.ts` 13/13; frontend 105
tests; exercises 88 tests; typecheck y biome limpios. Prueba manual del flujo completo: mapa → oficina
→ monitor → D1 → migración → B/Q/C → artefacto → informe → nodo "Completado" y ranking 1.000. El
intento quedó `delivered` con 10 pruebas, 6 revisiones y 1 explicación. Si el backend tarda en
arrancar, el alta del intento reintenta una vez y el caso sigue operativo en modo local.

L14 (corrección literal del usuario):
> De hecho mira algo que estás haciendo mal es que tienes un botón llamado expediente del caso. Realmente no es que sea necesites un nuevo botón porque todo eso podía ser explicado tranquilamente dentro de la sección de partida en el que tú no has puesto nada. En la sección de dispositivos en la segunda imagen, también tú has puesto directamente ese html que no quiero que pongas porque no es como un escenario real sino que estás dando detalles innecesarios y además no se siente como si fuera real como te digo, realmente en dispositivos debería ser como es con los ejercicios que ya habían antes, así que por favor, si vas a reutilizar el escenario que sea el mismo. Luego también en la parte de redes veo que está un poco incoherente con lo que se necesitaría mostrar en realidad, así que también haz un trabajo ahí. Recuerda, debe ser como un escenario real. Veo que incluso nunca se empieza el ejercicio porque con los ejercicios antiguos por lo menos había un marco de tiempo que coordinaba todo, pero aquí es raro porque no se sabe ni por donde empezar ya que nunca usas la sección de eventos marcado en la última imagen que realmente usan todos los escenarios antiguos. Entonces dicho esto parece que necesitas un cambio integral, con la base en lo que se ha definido en la documentación para este ejercicio. Pero no copies pantallas de lo que está en /ejercicios porque eso realmente está muy raro y posiblemente en el futuro le quite.

L15. Cambio integral aplicado. Se eliminó el botón flotante y el workspace de `/ejercicios` dejó de
inyectarse en el monitor: el escritorio de **Dispositivos** ahora suma seis ventanas del caso
(Expediente, Repositorio, Banco, Respuesta, Comprobaciones e Informe) al gestor de ventanas que ya
usan los escenarios antiguos. **Partida** muestra las cuatro fases con objetivos y avanza al abrir
el expediente, sellar D1, publicar la recuperación y enviar el informe. **Redes** muestra
`AP-IR-01`, `AP-DATA-01`, `AP-KEYS-01` y `AP-RTR-01` sobre `LAB`/`Internet`. El reloj se guía por
avisos a t=5, 20, 40 y 60 que pausan y escriben en el panel de eventos; los hitos también dejan log.
La suite de integración de ejercicios volvió a 13/13; las unitarias siguen verdes. La prueba del
recorrido completo mapa → oficina → monitor → ventanas se hizo manualmente porque el helper de clic
3D y el doble clic del escritorio resultaron frágiles en el runner de integración; el flujo visual
observado fue: ventanas abiertas, D1 visible, objetivo de Fase 1 completado y Fase 2 en Partida.

L16 (corrección literal del usuario):
> No se entiende nada no es nada lógico, no sé de qué mismo se trata la práctica

L17. Se corrigió la capa didáctica del Expediente. La ventana abre con un relato en lenguaje llano
(analista de AndinaPay, aviso anónimo, fragmento SYN-001/tok_demo_A, volcado cifrado, objetivo de
comprobar la clave histórica, migrar y explicar límites), cinco pasos de inicio y un lector de
materiales que muestra el contenido real del aviso, los logs, el inventario y AP-H1/H2/H3. D1 se
presenta como cinco preguntas con ejemplos y evidencias agrupadas (repositorio, datos/logs, aviso y
custodia, envelopes). El primer objetivo ya no se completa al abrir la ventana: el estudiante pulsa
"He leído el aviso y localizado la clave en AP-H1", se registra una sola vez y Partida avanza a
Fase 2. Verificación manual observada: intro visible, aviso y AP-H1 legibles, botón habilitado,
log único "Objetivo completado: Leer el aviso y localizar la clave histórica en AP-H1" y Partida
en Fase 2 con "Sellar el diagnóstico provisional con dos evidencias". Typecheck y biome limpios;
las suites de integración existentes siguen en 13/13.

L18 (pregunta literal del usuario):
> AndinaPay es una fintech ficticia. Un aviso anónimo trae un fragmento legible (SYN-001 / tok_demo_A) y un volcado cifrado.
> para empezar por qué trae el fragmento legible SYN-001? eso que es? y luego por qué la notificación le avisa de eso directamente

L19. Aclaración y corrección. `SYN-001` es el identificador sintético del documento de R01 y
`tok_demo_A` su token de tarjeta; juntos son el plaintext exacto de R01, no una credencial real. El
aviso los incluye como prueba de acceso y como oráculo para contrastar una clave candidata. Estaba
mal que la notificación de t=5 repitiera el fragmento: ahora solo dice que llegó un aviso anónimo y
que hay un expediente nuevo en AP-IR-01. El fragmento se descubre al abrir `incident/notice.txt` en
la ventana Expediente; el lector explica qué son esos valores. Los avisos de t=20, 40 y 60 también
se neutralizaron para guiar sin revelar la clave, los registros ni el resultado de las pruebas.
Verificación manual: la notificación de t=5 ya no contiene SYN-001; el aviso conserva el fragmento
y el lector lo explica. Typecheck y biome limpios.

L20 (corrección literal del usuario):
> Yo no veo esos dos servidores en la oficina

L21 (corrección literal del usuario):
> además veo que les pones nombres raros como AP-IR-01, pon nombres sencillos por ejemplo si solo es una computadora entonces "PC Empleado", o cosas así

L22. Se corrigió la representación de los servidores y los nombres visibles. `TipoDispositivo.SERVER`
no tenía modelo 3D y no se renderizaba; ahora usa `procedural:serverrack`, los dos servidores se
colocan en el piso (`Mueble.LIBRE`) a los lados del analista y la vista de un solo entorno muestra
los controles Acercar/Alejar para ver la sala. Los nombres visibles pasan a `PC Analista`,
`Servidor de Datos`, `Servidor de Claves` y `Router de la Oficina`; los IDs `AP-IR-01`,
`AP-DATA-01`, `AP-KEYS-01` y `AP-RTR-01` quedan solo como identidad técnica en la ficha. El evento
de t=5 y la fase 1 usan "PC del analista". La integración de ejercicios vuelve a 13/13; typecheck y
biome limpios.

L23 (corrección literal del usuario):
> Mira como funciona normalmente el flujo es que me aparece una notificación, entonces el tiempo se para, luego yo hago lo que me dijo que haga y ahí cuando yo termino pongo en resume el tiempo parado para que vuelva a continuar. Cuando le pongo resume entonces me dirá si está bien lo que hice o si está mal, tal como se hacía en los primeros ejercicios. Pero como está este ejercicio numero 6 después del resume no me dice nada de si hice bien la tarea o si no lo hice bien y directamente pone otra alerta en el segundo 20. Es decir no estoy recibiendo retroalimentación por un lado, por otro lado siento que es demasiado esperar 20 segundos, sería mejor si fuera de 5 en 5, es decir el primero a los 5 segundos, el segundo a los 10 segundos, y así ...

L24. Se implementó el feedback al reanudar y la cadencia de 5 segundos. Los avisos del seed quedaron
en t=5, 10, 15, 20, 25 y 30. `AndinaPayFeedbackListener`, montado en `VistaOficina`, escucha
`TIEMPO_REANUDADO`, lee el estado persistido y el flag de fase 1, y escribe en Logs `Bien: ...` o
`Aún no: ...` sin pausar ni destruir la partida. El siguiente aviso llega 5 segundos después. El
feedback se probó con el escritorio cerrado: al reanudar sin hacer la tarea aparece "Aún no: abre el
aviso y la versión H1..."; tras abrir el expediente y confirmar, al reanudar aparece "Bien:
localizaste la clave histórica...". También se verificó la alerta de t=10 cinco segundos después del
primer resume. Typecheck y biome limpios.

L25 (corrección literal del usuario):
> Mira lo que le has puesto en expediente realmente eso no iría en una situación de verdad, eso está mal, deberías poner lo que te marqué, es decir la explicación del ejercicio en la parte donde dice partida al inicio antes de iniciar las fases porque ahí es donde se pone, en la parte del escenario real en cambio se debe poner como si fuera la realidad.
> Veo que abajo como que intentas poner editor de texto con historial de versiones, la cosa es que no parece como si fuera uno, quiero que más o menos te inspires en como son los que existen actualmente por ejemplo vscode para el editor y por ahí acomodarle algo de las versiones de esta manera sería más sencillo entender para el estudiante

L26. La explicación didáctica salió de Expediente y vive en Partida (`VistaFasesPartida`), encima de
las fases, con objetivo, cómo se juega, glosario y qué debe demostrar. Expediente quedó como caso
real: cabecera de aviso recibido, materiales A0, lector y formulario D1, sin pistas de juego. El
repositorio se rehízo como editor tipo IDE: ventana con barra de título, explorador por carpetas,
historial H3/H2/H1 con fecha y etiqueta, pestaña con la revisión, números de línea, barra de estado,
búsqueda literal con resultados clicables y comparación de revisiones. Adjuntar H1 al expediente
completa la fase 1, reemplazando el botón didáctico anterior. Verificado en el contenedor: objetivo
completado y feedback `Bien: localizaste la clave histórica...` al reanudar; 105 tests de frontend,
typecheck y biome limpios.

L27 (corrección literal del usuario):
> no entiendo qué es lo que hay que hacer porque sí abrí el expediente, pero aún así me aparecen esos mensajes entonces al final está muy extraño

L28. El feedback de reanudar seguía diciendo "pulsa el botón de confirmación", un botón que ya no
existe, y no distinguía entre abrir el expediente y adjuntar H1. Ahora el mensaje depende del estado:
si el aviso ya se abrió pero falta H1, pide abrir Repositorio y pulsar «Adjuntar Versión H1
(histórica) al expediente»; si falta el aviso, pide abrir el expediente; si H1 ya está registrada,
pasa a Banco criptográfico y D1. Además, citar la versión H1 desde los materiales del expediente
también completa la fase 1, para que el camino más natural no requiera cambiar de ventana. El objetivo
de la fase 1 y el aviso de t=10 ahora dicen explícitamente que hay que adjuntar H1.

L29 (corrección literal del usuario):
> pero si ni siquiera hay el botón de "adjuntar versión H1" como dice la indicación que hay, además no debería hacer resume si todavía no hay el paso terminado porque ahí se descoordinan los pasos

L30. Se corrigieron las dos causas. (1) El botón **Adjuntar Versión H1 al expediente** ahora aparece en
la propia ventana Expediente al seleccionar la versión H1; también sigue en Repositorio. La indicación
ya no manda a un botón inexistente. (2) Mientras el reloj está pausado por una notificación, el botón
**Reanudar** se deshabilita hasta completar el paso de esa notificación; muestra el motivo en el
tooltip y en el `aria-label` (`Reanudar bloqueado: Adjunta la versión H1 al expediente`). El bloqueo
se aplica en `EscenarioController` con `bloquearReanudacion`/`desbloquearReanudacion`, lo refleja
`useECSTime` y lo pinta el Sidebar; `AndinaPayFeedbackListener` calcula el paso pendiente según el
tiempo y el estado persistido, y se montó en `GameProvidersLayout` para cubrir Oficina, Partida,
Redes y Dispositivos. Al completar el hito, el bridge `onStepDone` libera el botón y al reanudar
aparece `Bien: ...`; ya no se puede adelantar el siguiente aviso. Verificación manual: a t=5 el botón
queda bloqueado con «Abre el expediente y lee el aviso»; al abrir Expediente se habilita y el log dice
«Bien: leíste el aviso»; a t=10 vuelve a bloquearse con «Adjunta la versión H1 al expediente»; al
adjuntarla se habilita y el log dice «Bien: la versión H1 quedó registrada...». 105 tests de
frontend, typecheck y biome limpios. La suite de integración no se pudo ejecutar en esta sesión
(`pnpm test:integration` devolvió `Shell.NotFoundError`); queda pendiente de reintento.
