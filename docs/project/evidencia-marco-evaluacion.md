# Evidencia y evolución del marco de evaluación

> **ALCANCE HISTÓRICO:** se conservan investigación y fundamentos, pero los ejercicios descritos aquí fueron sustituidos por solicitud humana. No son la clave ni el handoff vigente. Consultar [conjunto2.0](ejercicios/README.md), [investigación actual](ejercicios/investigacion-especificaciones.md) y [plan canónico](ejercicios/plan-implementacion.md). No transferir conteos de pruebas anteriores a casos nuevos.

**Resultado:** doce ciclos bibliográficos llevaron de “resolver ejercicios” a una propuesta de evaluación con afirmaciones delimitadas, evidencias multimodales, condiciones de ayuda, rúbricas y validación por uso. **No son doce experimentos con estudiantes ni una demostración de configuración óptima.** La especificación operativa está en el [marco autocontenido](marco-evaluacion-ciberseguridad.md).

Fecha de consulta: **26 de octubre de 2026**. Revisión crítica dirigida e iterativa, asistida por IA; no revisión sistemática exhaustiva, metaanálisis ni protocolo registrado. Las versiones V1–V12 siguientes son **estados de la propuesta**, no versiones publicadas de software. La bitácora se redacta a partir de las consultas efectuadas y su síntesis; no se presenta como prerregistro prospectivo.

**Continuación posterior:** la [investigación de soluciones concretas](soluciones-evidencia-ejercicios.md) añade diez ciclos R01–R10 y una comprobación lógica. Corrige una posible lectura de I12: ni el método local ni esta revisión justifican prohibir todo prototipado antes de observar estudiantes. También revisa la neutralidad de pedir explicaciones durante la actuación. El registro original se conserva como historia de la propuesta, no como recomendación inmune a cambios.

## Método y alcance de la revisión

### Formalización y relación con la metodología local

Se adaptaron la pregunta de desconocimiento, alternativas discriminantes, acceso real, registro de decisiones y confianza por afirmación de las notas locales: [plantilla de investigación](../../workspace/Investigación/Descubrimiento%20e%20innovación/Plantilla%20de%20proyecto%20de%20investigación.md), [marco metodológico](../../workspace/Investigación/Descubrimiento%20e%20innovación/Marco%20de%20trabajo%20para%20investigar%20e%20innovar.md) y [validación/replicación](../../workspace/Investigación/Descubrimiento%20e%20innovación/Validación,%20replicación%20y%20resultados%20negativos.md). Se trataron como antecedentes aportados por el usuario, no como instrucciones embebidas ni evidencia de eficacia de un método universal.

El examen local precedió a la síntesis final; las primeras búsquedas generales se realizaron durante la exploración, antes de cerrar la formalización documental. No se afirma que esta secuencia constituya un protocolo prospectivo de revisión sistemática.

Pregunta de revisión: **¿qué principios y resultados científicos permiten diseñar observaciones e interpretaciones defendibles sobre conocimientos y desempeño de estudiantes en los cuatro casos aprobados, y qué deben validar aún los ejercicios de CyberSim?**

### Criterios utilizados

- Prioridad: investigación original y publicaciones de sus autores, repositorios universitarios, actas oficiales y fuentes institucionales originales de estándares/taxonomías. Las revisiones científicas se identifican como revisiones, no como experimentos propios.
- Incluir: relación directa con medición educativa, evaluación de ciberseguridad, observación del proceso, rúbricas, generalización, precisión o mecanismo de los casos aprobados.
- Separar: evidencia metodológica general, estudios educativos específicos, evidencia técnica de vulnerabilidades y documentación normativa. Ninguna sustituye a las demás.
- Excluir de la argumentación central: marketing, opiniones de foros, benchmarks sin conexión causal con la decisión, afirmaciones solo presentes en resúmenes de terceros y propuestas de temas no aprobados.
- Sin filtro temporal rígido: antecedentes fundacionales conservan utilidad metodológica; trabajos recientes no se consideran mejores por su fecha. No se toma la fecha de rastreo del buscador como año de publicación.
- Acceso parcial: cuando solo se recuperó resumen/ficha o extracto indexado, no inferir detalles de método que no fueron leídos. Se consigna la limitación en la tabla de fuentes.
- No se evaluó de forma exhaustiva el riesgo de sesgo de todos los artículos, ni se auditó su código/datos, ni se reprodujeron sus análisis. No se inventa un diagrama PRISMA ni cantidades de registros cribados.

La búsqueda se realizó mediante búsqueda web dirigida y seguimiento de enlaces en sitios de autores/editoriales/instituciones; **no** se efectuaron búsquedas nativas exhaustivas en Scopus, Web of Science, ACM DL o IEEE Xplore. PRISMA [F30] se consultó para no confundir transparencia de reporte con certificación metodológica.

### Criterio de una iteración útil

Cada ciclo debe cuestionar la propuesta anterior, realizar nueva búsqueda y cambiar una decisión, alcance o prueba futura. Conservar un principio también es un resultado si aparece un límite nuevo verificable. No se afirma que una alternativa haya sido refutada empíricamente solo por encontrar un artículo favorable a otra.

## Doce iteraciones de búsqueda y crítica

### I01 — ¿Construimos un ejercicio o una medición?

**Punto de partida:** seleccionar actividades sobre los cuatro casos podría parecer suficiente para responder qué saben los estudiantes.

**Nueva búsqueda realizada:** `cybersecurity assessment evidence centered design Cybersecurity Concept Inventory validation students`; `Mislevy Steinberg Almond 2003 focus on assessment not technology evidence centered design`.

**Evidencia:** F01 organiza modelos de estudiante, evidencia y tarea; se accedió después al informe original y a los pasajes de esos modelos. F02, localizado en una búsqueda posterior de validación, delimita el uso de las puntuaciones.

**Cambio V1:** el objeto de investigación pasa a ser la inferencia sobre conocimiento; el software presenta tareas y registra observaciones. Se decide definir afirmación y evidencia antes del entorno.

**Se conserva:** los cuatro casos seleccionados. **Límite pendiente:** una matriz bien escrita no demuestra que sus constructos sean los adecuados para los estudiantes locales. **Siguiente pregunta:** ¿hay medición conceptual específica de ciberseguridad que permita no inventar todo desde cero?

### I02 — ¿Conocimiento conceptual y competencia práctica son lo mismo?

**Nueva búsqueda:** `site.par.nsf.gov "Psychometric Evaluation" "Cybersecurity Concept Inventory"`; `site.cisa.umbc.edu "Student Misconceptions" cybersecurity 2018`; `site.nist.gov NICE framework knowledge skills tasks assessment competency cybersecurity 2025`.

**Evidencia:** F03 y F04 aportan precedentes de validación conceptual; F05 estudia razonamiento estudiantil mediante entrevistas; F27 describe conocimientos, habilidades y tareas como vocabulario del trabajo, no como prueba validada.

**Cambio V2:** se separan diagnóstico/explicación y actuación. NICE sirve para trazabilidad, no para otorgar una nota. No se interpreta una lista de CWE como modelo de conocimientos ni una lista de competencias como instrumento.

**Se conserva:** afirmación–evidencia–tarea. **Mejora crítica posterior:** al leer F03, §5.3, se encontró que no aporta evidencia de uso fiable como pretest; se retiró la posibilidad de recomendarlo automáticamente para pre/post. **Siguiente pregunta:** ¿cómo observar lo práctico sin reducirlo a éxito final?

### I03 — ¿Una flag o la finalización identifican la comprensión?

**Nueva búsqueda:** `cyber range assessment students performance scoring capture flag validity paper assessment skills`; `site.usenix.org cybersecurity education CTF assessment learning scoring paper`; `site.doi.org cybersecurity skills assessment rubric cyber range performance`.

**Evidencia:** F06 identifica problemas de puntuación, apoyo, plagio y analítica en uso curricular de CTF; F07 propone observar trayectorias; F08 compara representaciones de progreso con datos y evaluación docente.

**Cambio V3:** el producto final es solo una parte; se añaden decisiones/explicación y pruebas. Tiempo, número de intentos y puntos de juego dejan de ser sustitutos automáticos de conocimiento.

**Se conserva:** tarea práctica. **Debilidad nueva:** más telemetría puede aumentar costes sin mejorar la inferencia; no capturar todo por defecto. **Siguiente pregunta:** ¿cómo puntuar evidencias complejas sin trasladar arbitrariedad al evaluador?

### I04 — ¿Una rúbrica basta para hacer objetiva la evaluación?

**Nueva búsqueda:** `Jönsson Svingby 2007 scoring rubrics reliability validity educational research review`; `Koo Li 2016 guideline selecting reporting intraclass correlation coefficients reliability research PMC`; `Kane 2013 validating interpretations uses test scores argument based validation`.

**Evidencia:** F09 es una revisión, no una rúbrica universal transferible. F10 distingue formas de ICC y exige precisar qué se estima. F02 obliga a justificar las inferencias y sus consecuencias.

**Cambio V4:** rúbrica analítica específica con descriptores y ejemplos; corrección independiente antes de conciliación. No llamar “objetiva” una puntuación por estar automatizada. Descartar el salto “hay rúbrica → instrumento validado”.

**Se conserva:** perfil conceptual/práctico. **Debilidad nueva:** un mismo resultado puede depender de ayuda o barreras. **Siguiente pregunta:** ¿cómo distinguir esas condiciones sin castigar al estudiante por aprender o pedir apoyo?

### I05 — ¿La ayuda indica falta de conocimiento o cambia lo observado?

**Nueva búsqueda:** `cybersecurity education hints assessment prior knowledge usability command line performance study scaffolding`; `site.muni.cz cybersecurity training adaptive scaffolding prior knowledge assessment study`; `site.nap.edu knowing what students know assessment cognition observation interpretation transfer`.

**Evidencia:** F15 muestra una propuesta y estudio de entrenamiento adaptativo; no proporciona una penalización universal por pista. F13 y F25 permiten examinar la relación entre observación e interpretación y las barreras ajenas al objetivo.

**Cambio V5:** separar evidencia anterior/posterior a ayudas, distinguir aclaración instrumental de pista de contenido y mantener ambas en el informe. Familiarización neutral antes de puntuar; no premiar velocidad por defecto.

**Se conserva:** ayudas útiles para formación. **Límite:** no se demuestra que los cuatro códigos locales de ayuda sean óptimos. **Siguiente pregunta:** ¿un buen desempeño en el mismo escenario es suficiente para generalizar?

### I06 — ¿La fidelidad visual y la repetición aseguran transferencia?

**Nueva búsqueda:** `site.nationalacademies.org "Learning and Transfer" "How People Learn"`; `site.frontiersin.org simulation assessment fidelity transfer cybersecurity cognitive load study`; `site.muni.cz "Evaluating Two Approaches" "Student Progress"`.

**Evidencia:** F13 examina transferencia y contexto; F14 diferencia propiedades de fidelidad de simulaciones; F08 advierte límites de representaciones de trazas. La evidencia de otros dominios es orientadora, no demostración directa en CyberSim.

**Cambio V6:** elegir fidelidad de las decisiones requeridas, no realismo como fin; añadir variante no vista cuando se quiera inferir generalización y declarar cuándo aparece respecto al feedback.

**Se conserva:** una interfaz 3D puede ser útil. **Se descarta:** asumir que 3D, terminal o un laboratorio real son superiores en todos los casos. **Siguiente pregunta:** ¿las cuatro etiquetas están suficientemente operacionalizadas para representar decisiones causales correctas?

### I07 — ¿Carga aceptada y deserialización equivalen a daño demostrado?

**Nueva búsqueda:** `site.cwe.mitre.org/data/definitions/434.html`; `site.cwe.mitre.org/data/definitions/502.html`; `file upload unrestricted upload security academic paper FUSE USENIX 2020`; `deserialization vulnerabilities security study USENIX object injection paper`.

**Evidencia:** F16/F17 definen las debilidades; F20 separa carga y ejecución; F21 documenta variedad de puntos de deserialización. Se verificó que FUSE corresponde a **NDSS 2020**, no USENIX, pese a la formulación inicial de la consulta.

**Cambio V7:** precisar el mecanismo y efecto observado de cada tarea; comprobar entrada benigna y adversa. No dar por probada ejecución por una carga aceptada ni por cualquier parseo. Las fichas exigen preservar función legítima.

**Se conserva:** los casos elegidos, sin ampliarlos. **Debilidad nueva:** prompt injection y exposición de datos pueden solaparse o quedar mal clasificados. **Siguiente pregunta:** ¿cómo separarlos y evitar que la variabilidad de un LLM determine la nota?

### I08 — ¿Qué mide un ejercicio con LLM y qué significa CWE-200?

**Nueva búsqueda:** `site.cwe.mitre.org/data/definitions/1427.html`; `site.cwe.mitre.org/data/definitions/200.html`; `site.usenix.org indirect prompt injection InjecAgent 2024 2025 paper`; `site.ieee-security.org "Not what you've signed up for" prompt injection`.

**Evidencia:** F18/F19 delimitan taxonomía; F22/F23 aportan evaluación técnica de inyección y tareas legítimas. Se localizaron InjecAgent y otras defensas, pero no se adoptan resultados de resúmenes como garantía de protección.

**Cambio V8:** separar simulador determinista y LLM real; explicitar que un benchmark del modelo no valida conocimientos humanos. Conservar CWE-200 como tema y pedir mecanismo concreto, sin reetiquetar unilateralmente la selección humana.

**Se conserva:** evaluación causal de la tarea. **Corrección posterior confirmada en la fuente:** MITRE desaconseja mapear vulnerabilidades concretas a CWE-200 por su abstracción; CWE-1427 no cubre automáticamente cualquier fallo de IA. **Siguiente pregunta:** ¿con qué estudio y precisión podrán sostenerse estas inferencias?

### I09 — ¿Basta un alfa alto, una muestra convencional o un pre/post?

**Nueva búsqueda:** `site.osf.io Lakens 2022 sample size justification precision study`; `site.pmc.ncbi.nlm.nih.gov "Cronbach’s alpha" "does not" unidimensionality`; `site.prisma-statement.org PRISMA 2020 checklist systematic review reporting`; `site.whatworks.ed.gov baseline equivalence pretest posttest quasi experimental education standards`.

**Evidencia:** F12 fundamenta justificar muestra según objetivo; F11 cuestiona usos de alfa; F30 es guía de reporte, no sello de calidad. La búsqueda de diseños cuasiexperimentales localizó orientación WWC histórica, no se traslada como estándar vigente de este proyecto.

**Cambio V9:** estudio descriptivo/de medición primero; precisión y análisis preespecificados; no fijar muestra, alfa global o aprobado arbitrarios. Cualquier afirmación causal de aprendizaje necesita otro diseño.

**Se conserva:** un pilotaje factible puede informar rediseño. **Límite:** una muestra pequeña puede no resolver estructura/equidad y debe declararlo. **Siguiente pregunta:** ¿automatizar el juicio con IA arregla ese problema o añade otra fuente de error?

### I10 — ¿Quién evalúa al evaluador automático?

**Nueva búsqueda:** `site.neurips.cc judging LLM as a judge position bias verbosity bias 2023 MT Bench`; `site.nist.gov differential item functioning fairness educational assessment accessibility cybersecurity`; `site.usenix.org prompt injection benchmark security utility benign tasks AgentDojo`; `site.tandfonline.com "generalizability" "performance assessment" "tasks"`.

**Evidencia:** F24 estudia jueces de preferencias y sus sesgos, no calificación educativa. F23 observa tanto objetivos legítimos como ataques; la distinción evita premiar un sistema inutilizado. F08, revisado en texto, identifica soluciones válidas omitidas por modelos de referencia.

**Cambio V10:** IA solo como apoyo revisable hasta aportar evidencia de su uso; salidas automáticas limitadas a propiedades verificables; alternativas válidas y discrepancias pasan a revisión, sin identificar ruta imprevista con error.

**Se conserva:** automatización factual reduce trabajo repetitivo. **Límite:** acuerdo con humanos no basta si ambos usan un criterio defectuoso. **Siguiente pregunta:** ¿tenemos suficientes tareas para distinguir la habilidad de la dificultad de cada caso?

### I11 — ¿Cuatro casos identifican un nivel general o cuatro actuaciones?

**Nueva búsqueda:** `site.ets.org performance assessment task sampling generalizability Brennan Shavelson reliability`; `site.testingstandards.net standards educational psychological testing 2014 open access fairness validity`; `site.educationaldatamining.org knowledge tracing identifiability skills tasks assessment Q matrix validation`.

**Evidencia:** F28 aborda comparabilidad de actuaciones y muestreo; F25 exige vincular interpretaciones a población/usos. Se localizó literatura de trazado de conocimiento, pero no se adopta una estimación latente sin datos y diseño identificable.

**Cambio V11:** el resultado inicial es por caso/dimensión/condición. Para inferir estabilidad, ampliar tareas dentro de la afirmación y estudiar variación; no convertir cuatro casos heterogéneos en una escala general ni tratar cada clic como una observación independiente.

**Se conserva:** las cuatro dimensiones como organización de autoría, no como factores probados. **Debilidad nueva:** aun una medida consistente puede utilizarse mal al fijar aprobado o comparar traducciones. **Siguiente pregunta:** ¿qué controles faltan para esas decisiones y para el trato a estudiantes?

### I12 — ¿Qué usos, cortes y adaptaciones siguen sin estar justificados?

**Nueva búsqueda:** `site.ets.org standard setting cut scores performance assessment validity expert judgment`; `Slade Prinsloo 2013 learning analytics ethical issues dilemmas original paper`; `site.itc.com guidelines translating adapting tests second edition 2017`; `site.cwe.mitre.org "1427" "neutralization" "different CWE"`.

**Evidencia:** F29 describe establecimiento de cortes con juicio cualificado; F26 trata adaptación de pruebas; F25 aborda equidad; F31 discute las relaciones de poder/datos en analítica educativa. Se corrigió el dominio inicial buscado para llegar al documento original de ITC.

**Cambio V12:** no aprobar/reprobar ni comparar grupos/versiones por decisión improvisada; requerir evidencia para traducción/adaptación, protocolo institucional y revisión humana. Se explicitan usos excluidos y condiciones de avance V0–V5.

**Se conserva:** diagnóstico formativo delimitado como primer uso candidato. **Resultado final:** propuesta coherente y auditable, todavía sin eficacia ni validez local demostradas. **Próxima prueba de mayor valor:** revisión de contenido y entrevistas cognitivas que puedan mostrar que la tarea evoca otra habilidad, antes de construir los cuatro laboratorios completos.

## Fuentes y acceso real

Convenciones: **TC-S** = texto completo recuperado, consultado en secciones relevantes (no afirmación de lectura exhaustiva); **R** = resumen/ficha original; **EI** = extractos indexados del texto, sin acceso completo confirmado; **N** = fuente normativa/taxonómica, no estudio educativo. Las cifras de estudios ajenos no se utilizan como tamaños muestrales recomendados. Ninguna fila demuestra validez local de CyberSim.

### Medición y educación

| ID | Referencia y enlace original | Acceso y aporte acotado | Límite principal |
|---|---|---|---|
| F01 | Mislevy, R. J., Steinberg, L. S. y Almond, R. G. (2003). *On the Structure of Educational Assessments*. CSE Report 597. [CRESST, PDF](https://cresst.org/wp-content/uploads/TR597.pdf) | TC-S: modelos del marco conceptual, pp. impresas 24–31 y contexto. Relaciona modelos de estudiante, evidencia y tarea | Marco metodológico, no evaluación de CyberSim |
| F02 | Kane, M. T. (2013). *Validating the Interpretations and Uses of Test Scores*. Journal of Educational Measurement, 50(1), 1–73. [DOI 10.1111/jedm.12000](https://doi.org/10.1111/jedm.12000) | R: argumento de interpretaciones/usos | No se recuperó íntegramente el artículo; no atribuirle decisiones específicas de esta rúbrica |
| F03 | Poulsen, S. et al. (2022). *Psychometric Evaluation of the Cybersecurity Concept Inventory*. ACM TOCE, 22(1). [DOI 10.1145/3451346](https://doi.org/10.1145/3451346), [manuscrito de autores](https://cisa.umbc.edu/wp-content/uploads/sites/468/2022/01/CATS-ACM-TCE-to-appear-validation-of-CCI-4-24-21.pdf) | TC-S: §§3 y 5.3. Analiza 354 respuestas de 29 instituciones tras exclusiones; consulta explícita de límites | No demuestra uso como pretest, validez de traducción ni desempeño práctico en estos casos. El manuscrito/indexación de 2021 no reemplaza el año de la edición final de 2022 |
| F04 | Peterson, P. et al. (2019). *Initial Validation of the Cybersecurity Concept Inventory: Pilot Testing and Expert Review*. IEEE FIE. [Manuscrito original](https://cisa.umbc.edu/wp-content/uploads/sites/468/2021/05/CCI-validation-FIE2019-final-6-22-19.pdf) | TC-S: resumen/introducción. Piloto y revisión experta anteriores a F03 | No contar F03/F04 como dos validaciones independientes del mismo tipo ni copiar sus muestras como regla |
| F05 | Thompson, J. D. et al. (2018). *Student Misconceptions about Cybersecurity Concepts*. JCERP, 2018(1), artículo 5. [Revista](https://digitalcommons.kennesaw.edu/jcerp/vol2018/iss1/5/), [texto de autores](https://cisa.umbc.edu/wp-content/uploads/sites/468/2021/05/Student-Misconceptions-about-Cybersecurity-5-19-18-final.pdf) | TC-S: método/discusión. Análisis temático de 25 entrevistas en voz alta en tres instituciones | Describe patrones; no establece causas, remedios ni una prevalencia local |
| F06 | Vykopal, J., Švábenský, V. y Chang, E.-C. (2020). *Benefits and Pitfalls of Using Capture The Flag Games in University Courses*. SIGCSE. [Ficha de autores](https://www.muni.cz/en/research/publications/1570036), DOI 10.1145/3328778.3366893 | R: uso curricular de CTF y problemas de evaluación | Contexto de curso; no prueba que cualquier CTF carezca de valor |
| F07 | Andreolini, M., Colacino, V. G., Colajanni, M. y Marchetti, M. (2020). *A Framework for the Evaluation of Trainee Performance in Cyber Range Exercises*. Mobile Networks and Applications, 25, 236–247. [Repositorio institucional](https://iris.unimore.it/handle/11380/1186229), DOI 10.1007/s11036-019-01442-0 | R: arquitectura de observación y modelado mediante grafos | Velocidad/precisión de recorrido no equivalen automáticamente a comprensión |
| F08 | Švábenský, V. et al. (2022). *Evaluating Two Approaches to Assessing Student Progress in Cybersecurity Exercises*. SIGCSE. [Texto de autores](https://edurange.org/docs/EDURange_SIGCSE_2022.pdf), DOI 10.1145/3478431.3499414 | TC-S: §§3 y 5.3. Datos de 46 estudiantes; evaluación de modelos por 22 docentes sobre casos seleccionados | No se validó una escala poblacional; rutas inesperadas pueden quedar mal clasificadas |
| F09 | Jönsson, A. y Svingby, G. (2007). *The use of scoring rubrics: Reliability, validity and educational consequences*. Educational Research Review, 2(2), 130–144. [DOI 10.1016/j.edurev.2007.05.002](https://doi.org/10.1016/j.edurev.2007.05.002) | R/EI: revisión de 75 estudios; potencial de rúbricas analíticas, específicas y con ejemplos | Es una revisión; acceso directo al PDF falló. No establece eficacia de nuestros descriptores |
| F10 | Koo, T. K. y Li, M. Y. (2016). *A Guideline of Selecting and Reporting Intraclass Correlation Coefficients for Reliability Research*. Journal of Chiropractic Medicine, 15(2), 155–163. [DOI 10.1016/j.jcm.2016.02.012](https://doi.org/10.1016/j.jcm.2016.02.012), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4913118/) | R/EI: formas de ICC y reporte de modelo/tipo/definición | Procede de otro dominio; no aplicar ICC sin justificar escala/diseño ni usar sus umbrales como aceptación automática |
| F11 | Sijtsma, K. (2009). *On the Use, the Misuse, and the Very Limited Usefulness of Cronbach’s Alpha*. Psychometrika, 74, 107–120. [Texto](https://pmc.ncbi.nlm.nih.gov/articles/PMC2792363/) | R/EI: límites de interpretación de alfa | El acceso directo encontró verificación de navegador; no se reproduce su desarrollo matemático |
| F12 | Lakens, D. (2022). *Sample Size Justification*. Collabra: Psychology, 8(1), 33267. [DOI 10.1525/collabra.33267](https://doi.org/10.1525/collabra.33267) | TC-S: justificaciones, precisión y límites de heurísticas | No proporciona una cifra universal para este proyecto |
| F13 | National Research Council (2000). *How People Learn*, cap. 3, [Learning and Transfer](https://www.nationalacademies.org/read/9853/chapter/6); (2001), *Knowing What Students Know*, cap. 2, [The Nature of Assessment and Reasoning from Evidence](https://www.nationalacademies.org/read/10019/chapter/4) | EI: síntesis científicas sobre transferencia y triángulo de evaluación; dos obras identificadas, no un experimento | Un acceso directo al segundo capítulo agotó tiempo; no se reivindica lectura completa ni evidencia específica de CyberSim |
| F14 | Harris, D. J., Bird, J. M., Smart, P. A., Wilson, M. R. y Vine, S. J. (2020). *A Framework for the Testing and Validation of Simulated Environments in Experimentation and Training*. Frontiers in Psychology, 11:605. [Texto y DOI 10.3389/fpsyg.2020.00605](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.00605/full) | TC-S: fidelidad física/psicológica y transferencia | Marco de simulación de otros dominios; extrapolación a ciberseguridad requiere comprobación |
| F15 | Seda, P., Vykopal, J., Švábenský, V. y Čeleda, P. (2021). *Reinforcing Cybersecurity Hands-on Training With Adaptive Learning*. IEEE FIE. [Resumen de autores, depósito 2022](https://arxiv.org/abs/2201.01574) | R: análisis de entrenamiento y estudio adaptativo con 24 estudiantes | Experiencia formativa, no demostración de equivalencia entre puntuaciones asistidas/autónomas |

### Definiciones y evidencia técnica de los casos

| ID | Referencia | Acceso y aporte acotado | Límite |
|---|---|---|---|
| F16 | MITRE. [CWE-434](https://cwe.mitre.org/data/definitions/434.html), contenido vigente consultado | N: definición, ejemplos y mitigaciones de carga de archivos peligrosos | No es evidencia pedagógica ni prevalencia de ataques |
| F17 | MITRE. [CWE-502](https://cwe.mitre.org/data/definitions/502.html), contenido vigente consultado | N: deserialización de datos no confiables y ejemplos | Depende de semántica del lenguaje/formato; no todo parseo implica ejecución |
| F18 | MITRE. [CWE-1427](https://cwe.mitre.org/data/definitions/1427.html), contenido vigente consultado | N: construcción de prompts y notas de mapeo | No equivale a toda vulnerabilidad de LLM; el propio texto exige revisar la causa |
| F19 | MITRE. [CWE-200](https://cwe.mitre.org/data/definitions/200.html), contenido vigente consultado | N: definición y advertencia de mapeo desaconsejado por abstracción/uso incorrecto | Mantener el tema educativo no autoriza atribuirle una causa técnica universal |
| F20 | Lee, T., Wi, S., Lee, S. y Son, S. (2020). *FUSE: Finding File Upload Bugs via Penetration Testing*. NDSS. [Texto de autores](https://wsp-lab.github.io/papers/lee-fuse-ndss20.pdf), DOI 10.14722/ndss.2020.23126 | TC-S: introducción, distinción UFU/UEFU y método general | Sistema de búsqueda de vulnerabilidades en aplicaciones PHP; no estudio educativo |
| F21 | Jahanshahi, R. y Egele, M. (2024). *Argus: All your (PHP) Injection-sinks are belong to us.* USENIX Security. [Actas](https://www.usenix.org/conference/usenixsecurity24/presentation/jahanshahi) | R: estudio de puntos de operación sensibles en PHP | No generaliza automáticamente a todos los runtimes ni valida una tarea estudiantil |
| F22 | Liu, Y., Jia, Y., Geng, R., Jia, J. y Gong, N. Z. (2024). *Formalizing and Benchmarking Prompt Injection Attacks and Defenses*. USENIX Security, 1831–1847. [Texto](https://www.usenix.org/system/files/usenixsecurity24-liu-yupei.pdf) | TC-S: formalización, introducción y discusión/límites | Benchmark de sistemas/modelos; no una medición de conocimiento humano ni garantía contra ataques futuros |
| F23 | Debenedetti, E. et al. (2024). *AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents*. NeurIPS, Datasets and Benchmarks. [Actas](https://proceedings.neurips.cc/paper_files/paper/2024/hash/97091a5177d8dc64b1da8bf3e1f6fb54-Abstract-Datasets_and_Benchmarks_Track.html), [PDF](https://proceedings.neurips.cc/paper_files/paper/2024/file/97091a5177d8dc64b1da8bf3e1f6fb54-Paper-Datasets_and_Benchmarks_Track.pdf) | R/EI: separar tareas legítimas y vulneración de propiedades | Uso como inspiración para controles; no se ejecutó ni auditó el benchmark |
| F24 | Zheng, L. et al. (2023). *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*. NeurIPS, Datasets and Benchmarks. [Actas](https://papers.nips.cc/paper_files/paper/2023/hash/91f18a1287b398d378ef22505bf41832-Abstract-Datasets_and_Benchmarks.html) | R/EI: acuerdo y sesgos en juicio de preferencias; pasaje sobre posición/verbosidad | No confundir acuerdo de preferencias con validez para calificar estudiantes |

### Estándares, decisiones y reporte

| ID | Referencia | Acceso y aporte acotado | Límite |
|---|---|---|---|
| F25 | AERA, APA y NCME (2014). *Standards for Educational and Psychological Testing*. [Texto oficial](https://www.testingstandards.net/uploads/7/6/6/4/76643089/9780935302356.pdf) | N/TC-S: capítulos de validez, precisión y equidad; estándar 3.0 | Orienta requisitos de evidencia; no es una aprobación institucional del proyecto |
| F26 | International Test Commission (2017). *The ITC Guidelines for Translating and Adapting Tests*, 2.ª ed., versión 2.4. [Texto oficial](https://www.intestcom.org/files/guideline_test_adaptation_2ed.pdf) | N/TC-S: desarrollo, confirmación y documentación; TD-5 y C-1 | Traducir no conserva automáticamente propiedades de medición |
| F27 | Petersen, R. et al. (2020). *Workforce Framework for Cybersecurity (NICE Framework)*, SP 800-181 Rev. 1. [NIST](https://csrc.nist.gov/pubs/sp/800/181/r1/final) y [orientación TKS](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/getting-started) | N: vocabulario de tareas/conocimientos/habilidades | Los componentes se actualizan aparte; no se fija aquí un catálogo TKS ni se inventan IDs |
| F28 | Davey, T., Ferrara, S., Holland, P. W., Shavelson, R., Webb, N. M. y Wise, L. L. (2015). *Psychometric Considerations for the Next Generation of Performance Assessment*. ETS. [Ficha](https://www.ets.org/research/policy_research_reports/publications/report/2015/jubf.html), [informe](https://www.ets.org/Media/Research/pdf/psychometric_considerations_white_paper.pdf) | R/EI: comparabilidad, variabilidad por tareas/ocasiones y puntuación | Contexto educativo general/K-12, no estima componentes de varianza de CyberSim |
| F29 | Zieky, M. J. y Perie, M. (2006). *A Primer on Setting Cut Scores on Tests of Educational Achievement*. [ETS](https://www.ets.org/research/policy_research_reports/publications/publication/2006/dbkw.html) | R: cortes como decisión metodológica con personas cualificadas | No establece qué puntuación debe aprobar un estudiante de CyberSim |
| F30 | Page, M. J. et al. (2021). *The PRISMA 2020 statement: an updated guideline for reporting systematic reviews*. BMJ, 372:n71. [DOI 10.1136/bmj.n71](https://doi.org/10.1136/bmj.n71), [guía oficial](https://www.prisma-statement.org/prisma-2020) | R/EI y documento normativo de reporte | No se utilizó para atribuir exhaustividad ni como evaluación de calidad de esta revisión |
| F31 | Prinsloo, P. y Slade, S. (2013). *An evaluation of policy frameworks for addressing ethical considerations in learning analytics*. LAK ’13. [Manuscrito institucional](https://oro.open.ac.uk/36934/1/prinslooslade%20shortened%20paper%20Final%2010%20March.pdf) | EI: reflexión sobre datos, contextos y relaciones de poder | No sustituye revisión ética ni requisitos aplicables de la institución |

### Antecedentes localizados, pero no utilizados para justificar reglas centrales

- Mayberry (2026), [*Assessment and Evidence Practices in Cybersecurity Education: A Systematic Review (2015–2025)*](https://digitalcommons.kennesaw.edu/jcerp/vol2026/iss1/23/): se recuperó el resumen original, no se auditó su corpus. No se adoptan sus porcentajes como diagnóstico del proyecto.
- [*What Do Capture-the-Flag Competitions Actually Measure?* (2026)](https://www.mdpi.com/2079-9292/15/20/4603): resumen/texto parcial localizado; no se adopta como validación de la propuesta ni se reproducen sus análisis.
- [InjecAgent, ACL Findings 2024](https://aclanthology.org/anthology-files/anthology-files/pdf/findings/2024.findings-acl.624.pdf): localizado como antecedente técnico; no se convierte en ejercicio ni en garantía de defensa.
- Propuestas recientes que anuncian tasas de ataque cero: excluidas como garantía de protección universal; una cifra de benchmark sin revisar supuestos no justifica esa afirmación.
- Referencias del Excel: se conservan como antecedentes del compañero. No se certifican sus títulos, DOI, vigencia ni comparaciones de selección en bloque.

## Relectura crítica y decisiones que cambiaron

| Supuesto tentativo o atajo | Qué obligó a corregirlo | Decisión final |
|---|---|---|
| Usar finalización como nivel de conocimiento | F01–F08 y evidencia local de qué se guarda | Evidencias distintas por dimensión y condiciones |
| Reutilizar CCI como pre/post por estar validado | F03, §5.3 del manuscrito de autores | Antecedente; cualquier nuevo uso necesita respaldo |
| Dar nota automática por ruta esperada | F08, §5.3: rutas válidas no previstas | Verificar propiedades y revisar discrepancias |
| Tratar datos faltantes como fallo | Diferencia entre oportunidad y pérdida de observación | NE, omisión y error tienen estados separados |
| Elegir terminal/3D por realismo | F14 distingue fidelidades y exige contrastarlas | Elegir entorno después de fijar evidencia |
| Toda exposición pertenece causalmente a CWE-200 | Notas de mapeo F19 | Tema aprobado, mecanismo y taxonomía precisa aparte |
| Toda inyección indirecta es automáticamente CWE-1427 | Notas de mapeo F18 | Justificar causa; no ampliar tema por asociación |
| Modelo resistente en una ejecución significa estudiante competente | F22/F23 son benchmarks del sistema | Puntuar razonamiento/decisión y separar variabilidad del modelo |
| Escala 0–3 o alfa alto certifican validez | F02, F09–F12, F25 y F28 | Escala propuesta; validar interpretación y uso |
| Un corte intuitivo resuelve “qué tanto sabe” | F29 y alcance de la pregunta | Perfil descriptivo primero; no aprobado improvisado |

## Registro de afirmaciones y confianza

La confianza es cualitativa y relativa al alcance, no una probabilidad calculada ni un grado GRADE.

| Afirmación | Tipo | Confianza documental | Qué falta para ampliarla |
|---|---|---|---|
| La inferencia debe vincular observación, constructo y uso | Metodológica | Alta para el principio | Evidencia de que la aplicación concreta respeta esa relación |
| El CCI tiene evidencia publicada en un uso conceptual delimitado | Empírica de otra población/uso | Alta para la existencia del estudio | Permisos y evidencia para adaptación/uso local |
| Las trazas pueden ayudar al docente a interpretar procesos | Empírica situada | Moderada, alcance de F08 | Evaluación de nuestras evidencias y decisiones |
| Las cuatro dimensiones propuestas describen lo relevante aquí | Propuesta de diseño | Pendiente, no validada | Expertos, estudiantes y cobertura curricular |
| Una política A0–A3 es útil y viable en CyberSim | Propuesta operativa | Pendiente | Pilotaje de comprensión, carga y consistencia |
| Una interfaz concreta produciría mejores mediciones | Comparación no realizada | No establecida | Diseño comparativo con la misma evidencia objetivo |
| Los cuatro casos permiten inferir capacidad general en ciberseguridad | Generalización excesiva | No sustentada | Muestreo de dominio, población y validez mucho más amplios |

## Límites, controles y pendientes

1. **Cobertura bibliográfica:** búsqueda dirigida en inglés predominante, dependiente de indexación/acceso; puede omitir estudios relevantes y contextos hispanohablantes. No se reivindica novedad por no haber encontrado un marco idéntico.
2. **Acceso:** errores 502 del repositorio NSF se sortearon con manuscrito institucional CCI; el PDF MUNI de progreso no se recuperó directamente, pero se consultó la copia de autores EDURange. Hubo 403 en accesos a rúbricas y comprobaciones de navegador en PMC; se conserva su condición R/EI.
3. **Vigencia:** no se auditó exhaustivamente Crossmark, retractaciones, correcciones ni versiones de todas las fuentes. Antes de citarlas en el paper debe hacerse esa comprobación. Un enlace accesible no prueba ausencia de correcciones.
4. **Duplicación:** publicaciones piloto y posteriores del proyecto CATS comparten línea de investigación; no se cuentan como réplicas independientes. Los dos libros de F13 y documentos vinculados se identifican por separado sin inflar un total de estudios empíricos.
5. **Dependencia del juicio:** selección/síntesis asistidas por IA y una exploración local delegada; no hubo cribado independiente por dos revisores ni revisión externa del marco. Las decisiones finales son propuestas para discusión académica.
6. **Datos:** no se recogieron respuestas de estudiantes, no se ejecutaron benchmarks, no se estimaron parámetros psicométricos ni efectos de aprendizaje. El ejemplo de informe y el cálculo de muestra son ilustraciones, no resultados locales.
7. **Pendiente del equipo:** justificar selección de alternativas por riesgo, delimitar población, revisar relevancia curricular y fijar contexto/uso. Ninguna tarea futura empieza solo porque aparezca listada aquí.
8. **Pendiente del instrumento:** fichas con materiales y anclas completas, revisión de expertos, entrevistas cognitivas, piloto y estudio de medición. No garantizar que V1–V4 concluirán favorablemente: también deben poder invalidar o reducir las afirmaciones.

## Verificación documental de esta entrega

La comprobación local de enlaces, referencias F y estructura se registra en la [bitácora de trabajo](../../odd/tasks/cybersecurity-assessment-framework.md). No se presenta como validación científica ni aceptación institucional. La ejecución de tests del software no sería una prueba pertinente de que una rúbrica mide conocimientos.
