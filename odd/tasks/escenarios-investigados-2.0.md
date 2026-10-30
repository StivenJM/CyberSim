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

S23. La topología de **Redes** representa el caso: `AP-IR-01` (analista), `AP-DATA-01` (registros),
`AP-KEYS-01` (custodia) y `AP-RTR-01` (router LAB/Internet), con las redes `LAB` e `Internet`.

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
