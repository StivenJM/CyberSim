# Marco investigativo de evaluación de CyberSim

Objetivo: fundamentar un instrumento para «Qué tanto saben los estudiantes de ciberseguridad y cómo evaluarlos». Estado: investigación y documentación, sin implementación de ejercicios.
Base: `develop`; entrega documental única, sin publicación remota ni cambios de código. Verificación: trazabilidad bibliográfica, lectura estructural y enlaces locales; no aplica RED/GREEN a documentación pasiva.

## Specs

- **S1** — «tu principal enfoque siempre que hagas algo es aportar a esta duda de investigación "Qué tanto saben los estudiantes de ciberseguridad y cómo evaluarlos"». Formalizar población/contexto pendientes, constructos e inferencias antes de diseñar interfaces.
- **S2** — Alcance anterior «solo esas 4 están aprobadas» y «son todos menos CWE-319», sustituido expresamente por S9. Alcance vigente: los cinco casos de `workspace/Escenarios-cibersim.md`, CWE-321, CWE-89, CWE-434, CWE-306 y CWE-502; retirar los diseños documentales anteriores, sin eliminar ejercicios del software ni inventar validación del compañero.
- **S3** — «por lo menos itera 10 veces» y «al repetir el proceso tendrás que realizar nuevamente búsqueda de papers, artículos científicos, conferencias, etc. todo científico». Conservar diez ciclos secuenciales con pregunta crítica, consulta real, evidencia, decisión progresiva y límites.
- **S4** — «empieces definiendo bien lo que quiero de manera formal con C:\Users\stive\Documents\CyberSim\workspace\Investigación». Adaptar sus principios a una revisión documental; no confundirla con experimentos.
- **S5** — «un marco de trabajo y evaluación para ir trabajando y evaluando los futuros ejercicios» y «El marco lo puedes poner en la documentación y debe ser autocontenido». Entregar marco operacional, fichas de los cuatro casos, rúbricas, protocolo de validación, bibliografía y bitácora accesibles desde el índice.
- **S6** — «todo ese marco debe estar perfecto y plenamente justificado». Tratar esto como exigencia de rigor, no como autorización para garantizar perfección: distinguir respaldo, decisiones de diseño y validación pendiente con participantes.
- **S7** — «a que te refieres con esto? entonces qué soluciones propones, igual mente para esto aplica flujo de investigación completo descrito en C:\Users\stive\Documents\CyberSim\workspace\Investigación» y «y si realmente no se puede justificar entonces igual deja documentado todo el proceso que hiciste». Aclarar las dos afirmaciones anotadas, contrastar su justificación y alternativas, entregar soluciones concretas para los cuatro casos y registrar límites/resultados no concluyentes sin ejecutar estudios ni implementar código.

- **S8** — «entonces quiero que lo defina completamente, aquí también realiza la investigación completa y utiliza la investigación que ya hiciste, complementa con más investigación de papers, conferenciar, artículos científicos etc. El objetivo sigue siendo el mismo y esta vez también utiliza el marco que ya menos hecho como resultado quiero los ejercicios bien definidos». Entregar especificaciones v1 completas de los cuatro casos, con entorno, materiales, operaciones, soluciones, ayudas y corrección; ampliar investigación. Alcance: diseño/documentación, no implementación ni administración real.

- **S9** — «El marco se sigue manteniendo, lo que cambian son los ejercicios» y «Todavía no hagas ninguna implementación». Adoptar íntegramente los cinco casos del compañero, completar vacíos con investigación científica y el método local, conservar núcleo del marco, documentar escenarios compatibles y capacidades faltantes en rutas versionables de docs, y dejar tareas temporales en docs/workspace/tasks.md más copia canónica. La solicitud íntegra está en L11.

## Tasks

- **T8a** — S9, S1, S4 — AndinaPay/CWE-321 — ruta: escritura delegada, unidad independiente con investigación y ficha propia, paralela a T8b/T8c y superficies disjuntas — documentación completada — ficha/memo AndinaPay, vectores7/11 y coherencia submit_artifact/reset comprobadas; sin commit
- **T8b** — S9, S1, S4 — BibliotecaViva/CWE-89 — ruta: escritura delegada, unidad independiente con investigación y ficha propia, paralela a T8a/T8c y superficies disjuntas — documentación completada — ficha/memo BibliotecaViva, oráculo13del autor y3consultas seleccionadas del padre; sin commit
- **T8c** — S9, S1, S4 — AndeanLogix/CWE-306 — ruta: escritura delegada, unidad independiente con investigación y ficha propia, paralela a T8a/T8b y superficies disjuntas — documentación completada — ficha/memo AndeanLogix, matriz del autor y36transiciones seleccionadas del padre; sin commit
- **T8d** — S9, S1, S4 — TalentoAndino/CWE-434 — ruta: inline, lectura prepara escritura del padre — documentación completada — ficha/memo TalentoAndino, P0/P1 temporal precisado,20checks+12trazas; sin commit
- **T8e** — S9, S1, S4 — NubeAndina/CWE-502 — ruta: inline, lectura prepara escritura del padre — documentación completada — ficha/memo NubeAndina,7vectores+126transiciones cerradas; sin commit
- **T9** — S9, S5 — escenarios compatibles, capacidades faltantes y handoff completo versionable más espejo temporal `docs/workspace/tasks.md` — ruta: inline con mapa técnico delegado por superar presupuesto; padre comprobó la guía y la regla ignore — documentación completada — arquitectura/guía/ADR0025 propuesto, plan I01–I12 y espejo temporal idéntico; toda implementación pendiente; sin commit

- **T1** — S1, S2, S4 — lectura y formalización — ruta: exploración delegada, disparador: materiales locales y flujo evaluativo superan el presupuesto de evidencia; padre verifica un punto — completada — evidencia: pregunta, PI1–PI5, alcance y límites documentados — sin commit.
- **T2** — S1–S6 — diez iteraciones científicas y síntesis operacional — ruta: inline; revisiones secuenciales dependientes, sin unidades de escritura independientes — completada con doce ciclos y 31 registros de fuentes, acceso declarado — sin commit.
- **T3** — S5, S6 — documentación navegable y verificación de fuentes/enlaces/alcance — ruta: inline, documentación pasiva — completada: 64 enlaces locales, referencias F, doce ciclos, bloques y espacios verificados — sin commit.
- **T4** — S7, S1, S2, S4 — investigación de las dos afirmaciones y soluciones concretas — ruta: inline con mapa crítico delegado al superar el presupuesto de evidencia; escritura secuencial del padre — completada: diez contrastes R01–R10, once registros G y consignas/materiales propuestos por caso — sin commit.
- **T5** — S7, S5, S6 — corregir alcance de recomendaciones, documentar pruebas de escritorio y verificar navegación — ruta: inline, documentación pasiva — completada: marco1.1, ocho registros sintéticos/cuatro pares, 76 enlaces y estructura verificados — sin commit.

- **T6** — S9, S1–S6 — investigación crítica adicional y síntesis — ruta: padre inline y tres unidades independientes delegadas en paralelo — investigación documental completada —17revisiones locales y control de versiones de fuentes; sin evidencia humana ni optimalidad declarada; sin commit
- **T7** — S9, S5, S6 — integrar cinco especificaciones, retirar diseños anteriores y verificar trazabilidad — ruta: inline, documentación pasiva — integración documental comprobada —31archivos/245referencias/7anclas, source hash y núcleo marco conservados; tres contradicciones corregidas y recheck limitado resuelto; revisión nativa no disponible por permisos, sin PASS; sin commit

## Log

### L1 — Solicitud original, 2026-10-26

> Quiero primero definir un marco de trabajo para ya agregar la realización de ejercicios en este proyecto, como puedes ver actualmente y también revisando en la documentación, tenemos varios ejercicios que puede resolver el estudiante, sin embargo ahora mismo esos ejercicios que están ahí se los eliminarán en un futuro, en su lugar se pondrán los ejercicios que están definidos en el excel C:\Users\stive\Documents\CyberSim\workspace\informe-ataques-competencias.xlsx
>
> La cuestión es que como tal la investigación realmente no es el sistema de software sino que la investigación realmente se centra en "Qué tanto saben los estudiantes de ciberseguridad y cómo evaluarlos", entonces en base a eso como recurso instrumental ha surgido esta aplicación CyberSim. Por lo tanto primero que nada tu principal enfoque siempre que hagas algo es aportar a esta duda de investigación "Qué tanto saben los estudiantes de ciberseguridad y cómo evaluarlos"
>
> Como puedes ver en la imagen, tenemos 4 areas amarillas que son justamente las que se piensa implementar, solo esas 4 están aprobadas y son las temáticas que se deben convertir en ejercicios.
>
> Para darte contexto un compañero estuvo investigando cuales son todos los ataques más comunes en los últimos años y estuvo haciendo casi todo el estado del arte solo para obtener esos 8 elementos de "Security Risk", luego estuvo buscando las temáticas principales y como resultado solo filtró las tres más importantes de cada uno, y por eso ves que hay 3 casos específicos por cada riesgo de seguridad. La idea es que en el paper cuando se escriba se diga que se compararon las tres y solo se tomó una que es la más adecuada, eso ya lo justificará mi compañero, a mí solo me dijo por ahora que de acuerdo a su investigación las amarillas ya se deben implementar (como te dije es solo un caso específico por riesgo de seguridad, y justamente mi compañero ya ha elegido en 4 riesgos la opción decisiva que es la que está en amarillo, para las demás falta todavía pero hasta eso podemos hacer un marco coherente que igual se base en investigación).
>
> Como ya sabes que ejercicios vamos a hacer, como tal tu trabajo ahora mismo es solo hacer investigación  profunda y tienes que ir iterando una y otra vez hasta encontrar la mejor configuración, tienes que ir cuestionando cada cosa y revisando debilidades o potenciales mejoras a cada rato, por lo menos itera 10 veces, es decir si ya encontraste la mejor opción de acuerdo a la investigación, no termines ahí, sino que eso es una iteración y en lugar de terminar y considerarlo hecho quiero que revises y veas donde podría haber una posible mejora o algún hecho de creatividad y de acuerdo a algo potencial que veas quiero que vuelvas a repetir el proceso haciendo preguntas que mejoren como tal lo que tengas en ese momento, y al repetir el proceso tendrás que realizar nuevamente búsqueda de papers, artículos científicos, conferencias, etc. todo científico para que vayas supliendo esas mejoras; no quiero decir que vayas cambiando drásticamente en cada iteración, sino que la mejora debe ser progresiva y con espíritu de investigación, es más si lo ves necesario puedes ir descartando en el proceso cosas que supuestamente ya las creías establecidas, eso porque como te digo las iteraciones deben ser progresivamente mejor que las versiones anteriores. De hecho para el proceso investigativo sería bueno que empieces definiendo bien lo que quiero de manera formal con C:\Users\stive\Documents\CyberSim\workspace\Investigación
>
> justamente es investigación que yo hice de cómo hacer una investigación.
>
> La cuestión es que a mí solo me interesa resolver esto "Qué tanto saben los estudiantes de ciberseguridad y cómo evaluarlos", y luego lo que llegues a investigar lo quiero orientar a los ejercicios de Cybersim con sus entornos y demás cosas.
>
> De hecho como tal también yo te pido como un marco de trabajo y evaluación para ir trabajando y evaluando los futuros ejercicios que vayamos a poner, todo ese marco debe estar perfecto y plenamente justificado con la investigación que realices ahora. El marco lo puedes poner en la documentación y debe ser autocontenido.

### L2 — Aclaraciones humanas

- «son todos menos CWE-319».
- «Mira veo que estás trabajando con el modelo de pensamiento bajo, ahora mismo lo moví al modelo de pesamiento alto para que realmente hagas todo el trabajo pesado de investigación de forma correcta y profunda».

### L3 — Evidencia local

- Excel leído como ZIP/XML por explorador: `Hoja4!C9,C14,C17,C23`; los colores coinciden con los cuatro casos confirmados. `C3` también amarillo, pero excluido por L2.
- `Competencias` es antecedente de cobertura; no operacionaliza medición. `Ataques!C6:C7` repite un DOI para dos títulos; no usar como evidencia sin resolver.
- Se verificó por lectura del padre `ProgresoController.ts:105–156`: identidad de revisión/hash y serialización de acciones; no prueba dominio cognitivo.
- Método local: preguntas discriminantes, alternativas, acceso real, confianza por afirmación, distinción propuesta/validación. Su plantilla no es un instrumento validado.
- No se ejecutaron servicios ni pruebas con estudiantes. No se modificó el Excel.

### L4 — Criterio de entrega

- La revisión es crítica e iterativa, no sistemática exhaustiva ni metaanálisis. Diez ciclos bibliográficos no equivalen a diez experimentos.
- Se conserva el registro de consultas y las decisiones que cambian cada versión. No se afirma que el marco sea perfecto o esté empíricamente validado.

### L5 — Entrega y comprobaciones observadas

- Se crearon `docs/project/marco-evaluacion-ciberseguridad.md` y `docs/project/evidencia-marco-evaluacion.md`; se enlazaron desde `docs/README.md` y `docs/project/README.md`.
- `docs/project/vision-y-alcance.md` incorpora la finalidad investigativa confirmada por el usuario y separa evaluación del estudiante de calidad del software.
- El marco contiene modelo D1–D4, ayudas A0–A3, niveles ordinales 0–3/NE, cuatro fichas propuestas, evidencias futuras, validación V0–V5 y comparación propuesta C1–C3 de coste/utilidad de la evidencia. Nada de ello se declara validado localmente.
- La bitácora distingue doce estados de propuesta, no experimentos; 31 registros bibliográficos incluyen normas y dos obras agrupadas, no “31 estudios empíricos independientes”. Se declaran accesos parciales y errores de recuperación.
- Verificación PowerShell: 64 enlaces locales existentes en cinco documentos; doce encabezados I01–I12; 31 IDs de fuente y ningún ID referenciado sin definición; bloques Markdown balanceados.
- `git diff --check`: código de salida 0 para cambios rastreados. Readback adicional de los tres archivos nuevos: sin espacios finales ni caracteres de sustitución de codificación.
- Sin tests funcionales: excepción justificada por documentación pasiva; no se alteró software ni se ejecutaron servicios/benchmarks/estudios. No se publicaron ni confirmaron commits.
- Límites pendientes, no tareas documentales incompletas: revisión académica, población/usos/ética y V1–V4 antes de afirmar validez o administrar una evaluación formal.

### L6 — Continuación solicitada, 2026-10-26

> a que te refieres con esto? entonces qué soluciones propones, igual mente para esto aplica flujo de investigación completo descrito en C:\Users\stive\Documents\CyberSim\workspace\Investigación
>
> y si realmente no se puede justificar entonces igual deja documentado todo el proceso que hiciste

Selecciones anotadas por el usuario: «El siguiente paso es revisar las fichas académicamente y observar cómo las interpretan estudiantes antes de construir los laboratorios completos.» y «Completar un escenario no demuestra, por sí solo, comprensión. El siguiente paso es revisar las fichas académicamente y observar cómo las interpretan estudiantes antes de construir los laboratorios completos.»

### L7 — Pregunta y protocolo de la continuación

- Pregunta: ¿qué evidencia adicional al resultado final permite interpretar el conocimiento mostrado en los cuatro ejercicios, y qué trabajo puede justificarse ahora sin convertir el pilotaje humano en una barrera para cualquier prototipo?
- Alternativas de medición: finalización sola; finalización más decisiones y comprobaciones; añadir explicación/variante según la afirmación. Comparar información, barreras y coste, sin asumir que más datos siempre mejoran la evaluación.
- Alternativas de desarrollo: validar todo antes de prototipar; prototipo mínimo y validación iterativos; construcción completa antes de examinar la medición. Buscar evidencia que pueda cambiar la recomendación, no solo confirmarla.
- Prueba factible ahora: contraste documental de afirmaciones y casos sintéticos adversariales sobre el modelo de evidencia, con resultados lógicos reproducibles en una tabla. No confundir esta comprobación con datos de estudiantes o acuerdo de expertos reales.
- Análisis previsto: buscar dos actuaciones con igual éxito final y evidencia distinta; buscar respuestas correctas sin explicación verbal extensa; revisar si una solución impide la función legítima; separar lo demostrado por la prueba de escritorio de lo no identificado sobre personas.
- No se simularán participantes como si fueran datos ni se estimarán tasas, pesos o validez local. La posible corrección de «antes de construir» depende de distinguir prototipo, laboratorio completo y uso calificatorio.
- Se conserva la búsqueda previa como exploratoria. Esta continuación deja explícito el diseño de prueba antes de generar y examinar los nuevos casos sintéticos; el protocolo no se presenta como registro externo.

### L8 — Resultado de la continuación

- Se creó `docs/project/soluciones-evidencia-ejercicios.md`: significado de las dos frases, adaptación de las ocho etapas locales, preguntas/alternativas, soluciones por CWE, protocolo y resultados lógicos, diez búsquedas iterativas adicionales, once registros G y afirmaciones no justificadas.
- Se actualizó `marco-evaluacion-ciberseguridad.md` a propuesta1.1: no se prohíbe prototipar antes de validación; se distingue el orden de la explicación dirigida por su posible reactividad. Se conserva la historia de doce iteraciones iniciales en `evidencia-marco-evaluacion.md` y se enlaza la continuación.
- La comparación determinista realmente ejecutada sobre U1/U2, D1/D2, P1/P2 y L1/L2 observó igual finalización y distintas condiciones/propiedades previstas. Son casos construidos, no datos estudiantiles. No se estimó validez, precisión, discriminación ni frecuencia humana; en U1/U2 cambian ayuda y explicación simultáneamente, sin aislamiento causal.
- El explorador solo leyó fuentes; `skill_resolution: paths-injected`. El padre comprobó el original de Virzi et al.1996 y sus límites, además de consultar directamente ETS2018, ETS2022, comparabilidad de formatos y Fox2011. Sin revisión académica externa real.
- No se justificó un orden universal óptimo, ahorro cuantificado, equivalencia automática entre modalidades, pesos/cortes universales ni sustitución de personas por IA/casos sintéticos. Se documentó expresamente esa falta de respaldo en vez de prometer una solución perfecta.
- Comprobación PowerShell sobre seis documentos: 76 enlaces locales existentes, bloques balanceados, sin caracteres de sustitución ni espacios finales; conteo del suplemento: diez ciclos R, once fuentes G, ocho filas sintéticas. `git diff --check` con salida 0. Readback del cierre del marco y suplemento realizado.
- No se implementó ni eliminó un ejercicio, no se reclutaron estudiantes, no se ejecutaron pruebas de ataque/LLM y no se hicieron commits. Las pruebas humanas se diseñaron, no se presentaron como completadas.

### L9 — Solicitud de definición completa, 2026-10-26

> entonces quiero que lo defina completamente, aquí también realiza la investigación completa y utiliza la investigación que ya hiciste, complementa con más investigación de papers, conferenciar, artículos científicos etc. El objetivo sigue siendo el mismo y esta vez también utiliza el marco que ya menos hecho como resultado quiero los ejercicios bien definidos


- Protocolo previo: contrastar opciones de fidelidad, generación/reconocimiento, causalidad de cada CWE, seguridad y utilidad, alternativas correctas, condiciones de ayuda y límites del informe. Cada revisión debe modificar o confirmar con razón una decisión concreta. Comprobación factible: consistencia de tablas y enumeración de configuraciones sobre reglas declaradas; no se estima dificultad, validez o eficacia con casos fabricados.
- Se utilizará simulación funcional explícita para la versión de decisiones y razonamiento; no se afirmará operación de herramientas reales. La elección se contrastará con evidencia y se distinguirá de una decisión futura de construir laboratorios ejecutables.

### L10 — Entrega de especificaciones completas y evidencia observada

- S8 cubierta mediante docs/project/ejercicios/README.md y cuatro casos completos: portal documental, importador de preferencias, clasificador asistido y asistente de soporte. S1–S7 conservan sus límites. Contrato común con experiencia, estados, recursos/ayudas, evidencias, corrección, roles y formas A/B; claves y materiales exactos por caso.
- Se creó investigacion-especificaciones.md con doce revisiones C01–C12 y ocho registros H nuevos, reutilizando F/G. El mapa crítico delegado fue read-only; skill_resolution=paths-injected; padre contrastó originales y redactó. No hubo panel académico ni participantes.
- Elección v1: simulaciones funcionales deterministas. E1427 reproduce salidas sintéticas de autor, no un LLM real; admite retirar descripción innecesaria o retirar LLM de la decisión bajo una política de clasificación explícita. No se deja esa elección pendiente como una ficha genérica.
- Enumeración temporal realmente ejecutada: E434: 40/320, E502: 32/192, E1427: 48/336, E200: 32/256 configuraciones/ejecuciones de reglas. Total: 152/1104. B y Q en 28 configuraciones; contraste también en 19; cero discrepancias con fórmulas reducidas. Se cuentan configuraciones equivalentes por parámetros sin efecto, no estrategias independientes. No se estimó validez/dificultad ni se probó un motor implementado.
- Readback y revisión cruzada corrigieron el alcance de D-C, separaron función B200 de exposición Q200 y aclararon que el manual de valores se abre después de D1 para no revelar las opciones antes del diagnóstico. El revisor de E200 no se confunde con las identidades receptoras simuladas.
- Marco actualizado a propuesta 1.2, sección 8 enlaza las especificaciones canónicas en lugar de mantener fichas/contrastes antiguos contradictorios. Índices actualizados; soluciones previas conservadas como antecedente, no una clave alternativa vigente.
- Verificación final: trece documentos, 119 enlaces locales y cuatro anclas existentes; Markdown/codificación/espacios correctos; doce ciclos C y ocho registros H. git diff --check salida 0. PowerShell 7.6.5; versión de V8 de herramientas no expuesta.
- No se implementó software, ejecutaron servicios/ataques/LLM, modificó el Excel, eliminaron ejercicios ni crearon commits. RED/GREEN funcional no aplica a estas especificaciones pasivas. Pendiente como validación de investigación, no como falta de diseño: revisión de contenido, observación de respuestas, puntuación y límites empíricos según V1–V4.

### L11 — Sustitución solicitada por el usuario

> Mira de acuerdo a los ejercicios que hicimos descártalos por favor, quiero que veas estos ejercicios C:\Users\stive\Documents\CyberSim\workspace\Escenarios-cibersim.md
>
> esos ejercicios son unos que planteó un compañero y revisó, además que de cierta manera el está más con este tipo de trabajo así que vamos a quitar los que hicimos antes y mejor usa estos, remplazados en la documentación, lo que si se mantiene es el marco, quiero que pases estos ejercicios por el marco que diseñamos docs\project\marco-evaluacion-ciberseguridad.md para que tengan coherencia entre ellos. El marco se sigue manteniendo, lo que cambian son los ejercicios, además que agregues las cosas que todavía no se han definido en los ejercicios, deben haber algunas cosas que exija el marco y que lo que hizo mi compañero realmente no esté contemplado, entonces tienes que investigar en las referencias y ver cual es la mejor opción para esos detalles que no se han contemplado.
>
> Finalmente, también tratando de ya traer esto a una base quiero que también para los ejercicios definas los escenarios que pueden si no están definidos, recuerda que el sistema ya está preparado para nuevos escenarios de hecho en las guias de docs/ incluso está la documentación de como agregar los nuevos escenarios.
>
> Todavía no hagas ninguna implementación, tu trabajo principal es investigativo sin perder nada de detalle tienes que dejar todo plenamente documentado, la documetnación deberá estar en docs/ que justamente tiene que versionarse, pero a parte de manera temporal tienes que dejar las tareas para que otro agente haga la implementación de acuerdo a tu amplia investigación y eso será en docs\workspace\tasks.md
>
> la idea es que el otro agente en un futuro pueda ver estas tareas más toda tu investigación plenamente documentada en docs y pueda realizar correctamente toda la implementación. Pero tu tarea como tal es la investigación constrastando papers científicos, artículos y conferencias con evidencia científica real. De hecho es importante que todo lo hagas con el ciclo de investigación que ya está definido en C:\Users\stive\Documents\CyberSim\workspace\Investigación
>
> La idea es encontrar soluciones de vanguardia y que realmente solucionen el problema de investigación, siguiendo el marco que ya hemos planteado. Pero también viendo que de cierta manera veas como se hacen los escenarios y se sigan las mismas ideas de escenarios que ya hay ahora, obviamente no serán los mismos escenarios ya que cada ejercicio tiene sus detalles pero como tal hay la estructura que te envié al principio.

### L12 — Protocolo y decisiones de arranque de la sustitución

- Pregunta: qué falta para convertir las cinco propuestas del compañero en tareas que eliciten D1–D4 y produzcan evidencias interpretables, manteniendo oficina3D→computadora→apps y sin implementar software.
- Alternativas a contrastar: resultado final frente a artefactos y pruebas; una ruta única frente a propiedades con alternativas; feedback de hechos frente a enseñanza no registrada; abstracciones controladas frente a ejecución innecesaria; mitigación aislada frente a preservación funcional y límites.
- Antes de comprobar: fijar fixtures, contratos, estados y criterios; después ejecutar solo transformaciones inocuas/pruebas de escritorio de autoría, nunca ataques reales ni un estudio humano ficticio. Registrar consultas, originales, acceso, decisiones revisadas y fallos. No afirmar optimalidad o validación educativa sin datos.
- Fuente inspeccionada: cinco casos; hash SHA256 `48DDFCDD17FF6FE08D6BEF6F88B29C1B92556551B72CDF6D6C1BBB6C07D2F6BD`. Conservar snapshot íntegro versionable, no editar el original ignorado.
- La regla local `.gitignore:3` (`workspace`) ignora también `docs/workspace/tasks.md`; el handoff temporal tendrá equivalente canónico en `docs/project/ejercicios/plan-implementacion.md`. No cambiar ignore global ni depender de una copia ignorada para requisitos duraderos.
- El marco D1–D4, A0–A3, 0–3/NE, límites de inferencia y validación se conserva; solo cambian alcance, aplicaciones y referencias operativas. La revisión del compañero es una procedencia declarada por el usuario, no datos de validación obtenidos aquí.
- T6/T7 se reabren para la nueva revisión; su evidencia v1 es histórica, no se aplica como prueba a cinco ejercicios nuevos. No se modifica el Word personal ya entregado; queda referido a los diseños retirados y no será entrada de la implementación.

### L13 — Pausa solicitada por el usuario, 2026-10-26

Solicitud literal: «deja el punto donde estás pendiente para avanzar en otro momento, registra lo que estás haciendo y lo que falta quiero que termines rápido».

**ESTADO: PAUSADO POR SOLICITUD HUMANA. No completar ni implementar automáticamente.**

Completado como borrador: cinco fichas y cinco memos científicos; 17 revisiones por unidad; fuente íntegra/hash; contrato común2.0; arquitectura propuesta; guía futura; plan canónico y espejo temporal idénticos; cuatro diseños viejos convertidos en stubs; marco actualizado solo en alcance y ejemplos; índices enlazados. Tabla D1–D4 y sección7 preservadas literalmente; sección7 SHA256 6b3cb93060cdc4c71274ff216e8383167141f9c056f48f45bade828102b80fcd. No implementación, dependencia, seed, migración, commit ni publicación.

Comprobaciones observadas: AP7 descifrados/11rechazos mediante Node leyendo Markdown; NA7vectores HMAC/S08 y126transiciones de abstracción cerrada,6BQ/3BQC; TA20checks seleccionados; AL36transiciones seleccionadas; BV3consultas en SQLite3.53.4. Los autores hicieron sus checks adicionales descritos en memos. Control documental preliminar:23archivos/109referencias relativas sin destinos ausentes, tablas y fences sin discrepancias; fuente idéntica SHA25648DDFCDD17FF6FE08D6BEF6F88B29C1B92556551B72CDF6D6C1BBB6C07D2F6BD; plan/espejo idénticos. No se probaron anchors ni toda consistencia semántica.

Pendientes de reanudación, en orden:
1. Corregir coherencia TalentoAndino: se precisó P0 como admisión provisional admitted que sirve vía handler aun con almacenamiento privado; la secuencia numerada aún analiza antes de publicar y TA-C1 dice pending. Alinear secuencia recibir→estado provisional→recuperar→analizar→admitir/revocar; definir handle temporal separado del ID final/counter. No cambiar el marco ni inventar carrera real.
2. Alinear slugs/topología de tabla docs/architecture/escenarios-investigativos.md con fichas canónicas: andinapay-clave-expuesta, bibliotecaviva-consultas-seguras, talentoandino-cargas-seguras, andeanlogix-funciones-criticas, nubeandina-sesiones-no-confiables. Tabla actualmente usa otros slugs propuestos y códigos de hosts añadidos: unificar como aliases explícitos o retirar divergencia; puestos salvo AP usan Estación de Análisis/Servidor de Aplicación.
3. Precisar FUEL como versión de autor/arXiv no corregida por revisión (la página arXiv lo advierte), comprobar IDs de ciclos AP/AL y trazabilidad de requisitos del compañero, incluido cierre narrativo gamificado. Valorar ADR propuesto solo si aporta claridad, no obligatorio para pausar.
4. Verificación final: anchors/enlaces de documentos históricos a secciones retiradas; consistencia transversal de ayudas, B/Q/C, variantes y errores; reenfocar instrucciones futuras con límites que todavía no se modelaron. Reejecutar calculos-autoria.md y control documental después de corregir. Actualizar verificacion-especificaciones.md con controles observados y límites.
5. Revisión nativa no disponible: assess pidió inventario explícito de untracked; preflight status falló antes de mutación con Acceso denegado, authority not_evaluated. No hay PASS ni revisión completada; no se debe inventar. No convertir esto en defecto de las fichas.
6. Actualizar estados T6/T7/T8a-e/T9 solo al comprobar cierre; actualmente las fichas están escritas pero integración/revisión pendiente. Sin commits. Mantener espejo Engram y docs/workspace/tasks.md idéntico al plan canónico.

Cambios concurrentes ajenos observados durante esta sesión: docs/guides/desarrollo-local.md y docs/guides/google-cloud-desde-cero.md. Preservarlos; no atribuirlos a esta investigación ni revertirlos. Los índices pudieron ser compartidos; releer antes de editar.

Entradas para retomar: docs/project/ejercicios/README.md, investigacion-especificaciones.md, verificacion-especificaciones.md, investigacion/calculos-autoria.md y plan-implementacion.md. Las tareas I01–I12 son futuras y todas siguen pendientes; no ejecutar con esta autorización investigativa.

### L14 — Reanudación solicitada por el usuario, 2026-10-26

Solicitud literal: «continúa con que que sigue faltando, recuerda mantener la misma calidad que has estado implicando desde el principio». Se revoca la pausa de L13; se retoman exclusivamente integración investigativa, documentación y verificaciones pendientes, sin implementación. Ruta inline para correcciones conocidas; un explorer read-only reutilizado comprime coherencia transversal/trazabilidad porque supera presupuesto de lectura inline, sin escritura ni nueva autoridad de publicación.

### L15 — Cierre de la reanudación, 2026-10-26

S9 y tareas documentales T6/T7/T8a–e/T9 completadas en el alcance investigativo. Sin implementación, dependencias, seed, migraciones, commits ni publicación. Las tareas futuras I01–I12 permanecen sin marcar; no son trabajo realizado.

Se corrigieron pendientes L13: orden/handle temporal TA, slugs/topología únicos, FUEL leído frente a registro publicado. Un mapa read-only selectivo detectó otras tres contradicciones (reset, entrega AP y rechazo NA), corregidas en una tanda y comprobadas en un recheck limitado que las declaró resueltas. ADR0025 explicita propuesta de separación entorno/modelo/hechos/rúbrica, no aceptación de implementación.

Controles finales observados:31Markdown,245referencias relativas/7anclas válidas, sin problemas de tablas/fences/UTF8 ni espacios finales fuera de snapshot;17IDs de revisión presentes. Fuente hash48DDFCDD17FF6FE08D6BEF6F88B29C1B92556551B72CDF6D6C1BBB6C07D2F6BD intacto; tabla D1–D4 y sección7 conservadas (hash sección7 registrado en L13); plan canónico y espejo temporal idénticos. Node rerun desde Markdown reproduce AP7/11,NA7+126,TA20,AL36,BV3;12trazas adicionales TA comprueban handles/revocación/contadores/actores. Estos cálculos no son tests de CyberSim ni validación de estudiantes.

git diff --check sin errores, avisos LF/CRLF únicamente; no cambios fuera de docs/ y odd/. Un falso positivo inicial del comprobador por trim de status quedó corregido usando formato git NUL. Revisiones nativas no completadas por fallo pre-mutation de permisos/inventario; no existe PASS ni recibo. Se conserva esa limitación sin nuevos reintentos. No aplicar ese fallo como calificación del alumno.

Entradas canónicas: docs/project/ejercicios/README.md; investigacion-especificaciones.md; verificacion-especificaciones.md; arquitectura escenarios-investigativos; guía implementar-ejercicios-investigados; plan-implementacion.md. docs/workspace/tasks.md es espejo temporal ignorado; la copia durable está fuera de workspace. Los diseños anteriores son stubs retirados y las evidencias antiguas están señalizadas como históricas.

Pendiente fuera de este encargo: implementar/probar runtime y variantes B antes de publicarlas, fijar distribución WASM, revisión institucional/ética/población, pilotaje/acuerdo/equivalencia/generalización según marco. No afirmar que el diseño está empíricamente validado ni que se encontró una configuración perfecta. Preservados cambios ajenos de GoogleCloud; su cierre no forma parte de esta investigación.
