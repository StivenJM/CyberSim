# Investigación aplicada a BibliotecaViva

**Alcance:** cerrar el caso CWE-89 del compañero con el núcleo del marco, sin implementar el laboratorio. Resultado de diseño: [especificación propuesta2.0](../cwe-89-bibliotecaviva.md). Fuente preservado: [Escenarios del compañero](../fuentes/escenarios-companero.md), sección INJECTION. Investigación realizada el26-10-2026; no revisión sistemática exhaustiva, ensayo con estudiantes ni validación psicométrica.

## Pregunta y protocolo

No sabemos todavía si los materiales y operaciones descritos producen evidencia interpretable de diagnóstico, razonamiento, intervención y verificación. Antes de construir, necesitamos cerrar la semántica del buscador y discriminar corrección causal, rechazo indiscriminado, parametrización parcial y pérdida de aislamiento entre estudiantes.

Aplicación del método local: delimitar el conocimiento y el contexto; consultar originales; abrir alternativas; fijar pruebas positivas/adversariales; ejecutar únicamente un oráculo inocuo de datos ficticios; revisar resultados y límites; dejar implementación y validación humana para sus autorizaciones correspondientes. El plan de prueba se fijó antes de ejecutar: comparar concatenación y enlace completo, comprobar apellido legítimo con apóstrofo, dos puntos de entrada, identidad confiable, fecha/paginación y una escritura denegada sin cambio de estado. No se estimaría ninguna tasa humana o eficacia educativa.

Recursos A0 incluyen una consulta segura de comparación porque el compañero la proporciona. Por ello D1 observa aplicación con un ejemplo disponible, no producción independiente de toda pista. La fidelidad buscada es funcional: texto→consulta→motor→filas→respuesta; no familiaridad con una biblioteca particular.

## Revisiones progresivas realizadas

| Ciclo | Pregunta y consultas reales | Evidencia examinada y cambio de diseño | Refutador o límite |
|---|---|---|---|
| B89-I1 | ¿Basta tratar el campo como texto? `Halfond Orso AMNESIA analysis monitoring neutralizing SQL injection attacks 2005 paper pdf Georgia Tech`; `Su Wassermann essence command injection attacks web applications 2006 SQLCheck paper pdf` | B89-01/B89-02 sitúan el problema en la estructura interpretada. Se requieren código, consulta formada y evidencia, no una pregunta «qué es SQLi» ni un indicador verde | Un modelo de consultas o un ejemplo de ataque no acredita conocimiento estudiantil |
| B89-I2 | ¿Una lista de palabras, un ORM o un monitor serían mejores para este caso? `SQL injection prepared statements ORM empirical study 2024 2025 conference paper`; búsqueda SQLBlock/legacy | B89-03 conserva operaciones/tablas y función legítima; sus límites de cobertura desaconsejan usar solo un patrón aprendido. Se añaden consulta segura, constructor orm_raw, enlace parcial y regresión O'Reilly. Se prefiere reparación estructural revisable al detector opaco | La búsqueda reciente devolvió trabajos de LLM y preprints fuera del objetivo; no adoptar por fecha ni extrapolar sus resultados |
| B89-I3 | ¿Enlazar valores resuelve permisos y propietario? `site.owasp.org SQL Injection Prevention Cheat Sheet parameterized queries least privilege ORM`; `site.sqlite.org c3ref set_authorizer SQLite SQLITE_DENY read INSERT permission` | B89-04/B89-06 separan binding, autorización de filas y privilegios. Se explicita identidad de sesión frente a petición/constante y una sonda de escritura aislada | Un SELECT puede revelar datos aun con solo lectura. No inferir una escritura histórica a partir de una consulta que solo lee |
| B89-I4 | ¿Qué significa búsqueda correcta con porcentaje, fecha y varias páginas? `site.sqlite.org lang_expr LIKE ESCAPE parameters SQL expression`; `site.sqlite.org lang_datefunc valid date string input 2026`; consultas de identifiers/parameters | B89-05 precisa diferencias de LIKE y parámetros de valores. Se elige instr con subcadena literal, calendario validado en aplicación y orden/paginación explícitos. No se añade un orden SQL dinámico no requerido | El comportamiento SQLite no equivale a todos los dialectos; Unicode no se normaliza ni se promete case folding universal |
| B89-I5 | ¿Nuestros resultados esperados coinciden con un oráculo ejecutable? Ejecución local in-memory de la tabla/queries declaradas, sin sistemas externos | Se observó que title=`redes` también coincide con «100% redes»: la primera página es1001/1003, no1001/1007. Se corrigió esa expectativa antes de escribir la ficha. Title-only siguió vulnerable en author; fixed_S101 falló con el segundo principal | Es consistencia de datos/semántica creada por el autor; no dificultad, comprensión ni porcentaje de bloqueo real |

La decisión no es «lo antiguo es mejor» ni «el enlace es una prueba de validez educativa»: se usa un mecanismo estructural respaldado, se incluye investigación posterior y documentación técnica actual, y se reserva la observación educativa para el pilotaje. No se encontró en este alcance un experimento que valide BibliotecaViva como instrumento de medición.

## Fuentes y acceso real

TC-S: original completo disponible, examinadas las secciones indicadas; no se afirma lectura exhaustiva de cada página. R: resumen original. Las siguientes descripciones son acotadas; sus números de resultados no se convierten en eficacia del ejercicio.

| ID | Original y acceso | Uso y límite |
|---|---|---|
| B89-01 | Su, Z. y Wassermann, G.2006. *The Essence of Command Injection Attacks in Web Applications*. POPL,372–382. [PDF de autores](https://web.cs.ucdavis.edu/~su/publications/popl06.pdf), DOI10.1145/1111320.1111070. TC-S: introducción, formulación y ejemplo O'Brian | Estructura de consulta y daño de prohibir un apóstrofo legítimo. Su garantía formal depende de definición/modelo; no certificar este laboratorio ni todos los sanitizadores |
| B89-02 | Halfond, W.G.J. y Orso, A.2006. *Preventing SQL Injection Attacks Using AMNESIA*. [Original de autores ICSE demo](https://sites.cc.gatech.edu/people/home/orso/papers/halfond.orso.ICSEDEMO06.pdf). TC-S: técnica, límites y remisión a evaluación anterior | Contrastar consultas con comportamiento esperado y registrar evidencia. Es una demostración de herramienta y remite a estudios previos; no contar como réplica independiente de ASE2005 |
| B89-03 | Jahanshahi, R., Doupé, A. y Egele, M.2020. *You shall not pass: Mitigating SQL Injection Attacks on Legacy Web Applications*. ASIA CCS,445–457. [Original](https://seclab.bu.edu/papers/asiaccs20-sqlblock.pdf), DOI10.1145/3320269.3384760. TC-S: §4.3–5 y §6–7 | Relacionar operaciones/tablas con funcionalidad y revisar falsos positivos por cobertura incompleta. No adoptar un plugin PHP/MySQL ni sus cifras como corte de conocimientos |
| B89-04 | OWASP. [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet). Guía técnica actual, secciones Prepared Statements, Allow-list y Least Privilege; consulta26-10-2026 | Enlace de valores, identificadores controlados y privilegios separados. No es paper empírico ni validación pedagógica |
| B89-05 | SQLite. [SQL Language Expressions](https://sqlite.org/lang_expr.html). Documentación oficial, Parameters y operadores de cadena; consulta26-10-2026 | Precisar placeholders, semántica de búsqueda y alcance de comparaciones. La elección de instr/paginación es del diseño, no un estándar educativo |
| B89-06 | SQLite. [Compile-Time Authorization Callbacks](https://www.sqlite.org/c3ref/set_authorizer.html) y [API C en WASM](https://www.sqlite.org/wasm/doc/tip/api-c-style.md). Documentación oficial examinada; consulta26-10-2026 | Denegar operaciones en preparación mediante autorizer; no describir SQLite como si tuviera GRANT por usuario. El adaptador debe mantener su frontera de seguridad; ninguna distribución WASM se instaló para este trabajo |
| B89-07 | SQLite. [Date And Time Functions](https://www.sqlite.org/lang_datefunc.html). Documentación oficial examinada; consulta26-10-2026 | Motiva no confundir almacenamiento textual/formato con validación gregoriana de la interfaz; no se usan funciones nuevas como requisito de versión |

La página personal AMNESIA de USC devolvió timeout400 en un intento: no se presenta como lectura completa. Se recuperó el original ICSE de Georgia Tech. La búsqueda2024/2025 encontró materiales sobre Text-to-SQL/LLM y preprints genéricos que no respondían a la tarea sin IA; no se usaron sus cifras ni se los sumó como respaldo favorable. La búsqueda `"SQLBlock" "retraction" correction` no devolvió una corrección pertinente en ese alcance; no encontrarla no certifica ausencia de correcciones. No se descargó ni ejecutó SQLBlock/AMNESIA ni se atacó sitio alguno.

## Oráculo y resultados observados

Herramienta: Python del runtime de trabajo provisto, módulo sqlite3, SQLite3.53.1; `sqlite3.version` informó2.6.0 y emitió aviso de deprecación de ese atributo. Base `:memory:` con las tres tablas y siete préstamos publicados; no archivo de base de datos, red, shell SQL ni acceso al backend de CyberSim. Las operaciones fueron consultas sobre datos sintéticos de autoría.

El primer comando de autoría terminó antes de ejecutarse por paréntesis extra en un print. Se corrigió y volvió a ejecutar: ese intento fallido no produjo resultados ni se cuenta como prueba pasada. La ejecución corregida observó:

| Entrada | Concatenación | Enlace completo |
|---|---|---|
| redes | candidatos1001/1003/1007; página1=1001/1003 | iguales |
| O'Reilly en autor | error de sintaxis cerca de Reilly |1002 |
| % en título |1003 |1003 |
| Equipo_ en autor |1003 |1003 |
| zzz | vacío | vacío |
| fecha2026-10-21 |1002 |1002 |
| fecha2026-02-30 | vacío, consulta emitida | validation_error, sin DB |
| contraste en título, página2 |1003/1004; candidatos1001–1007 | vacío |
| contraste en autor, página2 |1003/1004; candidatos1001–1007 | vacío |
| filtros vacíos, página2 |1003/1007 |1003/1007 |
| request_student=S102 con sesiónS101 |1001/1002 |1001/1002 |
| sin principal | unauthenticated sin DB | igual |
| principalS102 |1004/1005 |1004/1005 |

Dos contrastes negativos adicionales: el constructor title_only devuelve1003/1004 ante el ataque en author; una consulta correctamente enlazada pero con fixed_S101 devuelve1001/1002 al actorS102. Se verificó `SQLITE_DENY` para INSERT1900 con authorizer; la tabla loans conservó su hash SHA256 `ef1f462665f8247b0dd94a17032576e69865d004744d8cce4a2d06ab4c93ee73` sobre JSON de tuplas ordenadas serializado por el módulo json de Python con opciones por defecto. Ese hash es una huella de esta representación de autoría, no un contrato de serialización portable del producto.

La consulta posicional, el adaptador WASM/Worker, la validación BV13, el fallo simulado BV14, las sondas completas BV15/BV16 y la consulta segura de catálogo quedan como requisitos de aceptación definidos; no se afirma haber ejecutado esa implementación. No se enumeraron exhaustivamente todas las combinaciones de parches ni se calcularon tasas de detección sobre ataques reales.

## Decisiones aceptadas para la propuesta y sus rivales

| Decisión | Evidencia y utilidad | Alternativa descartada o límite |
|---|---|---|
| Usar consultas de plantillas confiables con valores enlazados | Hace observable separación código/dato, soporta apóstrofos legítimos y conserva filtros | Una lista de caracteres o la etiqueta ORM no establecen esa separación |
| Mantener campo libre con semántica SQL de referencia | Permite razonar y comprobar más allá de memorizar un payload concreto | Un mapa de dos respuestas fijas subrepresentaría el comportamiento del formulario; no añadir servidor real para lograrlo |
| Identidad de sesión y privilegio específico | Evita confundir binding con permiso; expone impacto sin afirmar escrituras históricas | No presentar el autorizer como sustituto de control por propietario ni que read-only elimine exposición |
| Feedback inmediato de hechos y ayudas explícitas | Respeta la fuente y conserva procedencia de evidencia | Un tutor que dice la reparación sin etiquetarla altera la condición, aunque lo llame feedback |
| Diagnóstico con ejemplo seguro disponible | Fiel al material del compañero y coherente con A0 | No inferir generación de una técnica desde cero ni ausencia de aprendizaje durante la tarea |
| Código revisable/parches estructurados | Controla alcance del laboratorio y produce artefactos verificables | No permite inferir programación autónoma general de un backend |

## Qué no está justificado y cómo revisarlo

- No hay evidencia de que la fila1006 haya sido insertada mediante la búsqueda: investigar auditoría de escritura separada, no completar una historia por plausibilidad.
- No se ha demostrado que la versión2.0 mida comprensión, que sus formas tengan igual dificultad o que estas dimensiones sean factores independientes. Se requieren revisión de contenido, respuesta real, acuerdo de corrección y análisis de límites para la población efectiva.
- No se declara una tecnología óptima universal: la elección de SQLite aislado favorece reproducibilidad del contrato; debe verificarse seguridad/coste en la implementación. Si no se puede preservar texto libre de forma segura, cambiar la inferencia y versionar el alcance en lugar de fingir un motor completo.
- No hay pesos/corte universal, tasa humana de éxito, tiempo de resolución ni efecto de aprendizaje estimados. Las comparaciones del propio oráculo no sustituyen datos externos.

La siguiente etapa es implementar los controles/paneles y tests del contrato, no iniciar un estudio o una publicación remota por esta documentación. Los datos, versiones, ayudas y errores deben conservarse para que un futuro estudio pueda observar lo que realmente se administró.
