# Soluciones para evaluar los cuatro ejercicios sin confundir éxito y conocimiento

> **ALCANCE HISTÓRICO:** se conservan investigación y fundamentos, pero los ejercicios descritos aquí fueron sustituidos por solicitud humana. No son la clave ni el handoff vigente. Consultar [conjunto2.0](ejercicios/README.md), [investigación actual](ejercicios/investigacion-especificaciones.md) y [plan canónico](ejercicios/plan-implementacion.md). No transferir conteos de pruebas anteriores a casos nuevos.

**Estado de este antecedente:** sus consignas y materiales preliminares se desarrollaron en las [especificaciones completas v1.0](ejercicios/README.md). Para administrar o implementar esa versión, usar la clave y reglas de ese paquete. Este documento conserva la investigación sobre las dos afirmaciones y su prueba lógica; no es una clave alternativa vigente.

**Decisión propuesta:** conservar la resolución práctica, pero registrar también qué propiedad comprobó el estudiante, con qué ayuda y qué relación causal puede justificar. Crear el prototipo mínimo que permita estudiar esa evidencia; **no exigir validación completa antes de cualquier prototipo**. Este documento concreta y corrige el [marco de evaluación](marco-evaluacion-ciberseguridad.md).

Fecha: **26 de octubre de 2026**. Alcance: investigación y diseño documental para CWE-434, CWE-502, CWE-1427 y CWE-200; CWE-319 sigue excluido. No se implementó software, no se consultó a participantes ni se realizaron revisiones académicas reales. Los ejemplos son materiales sintéticos de autoría, no respuestas estudiantiles.

## 1. Qué significaban las dos afirmaciones

### «Completar un escenario no demuestra, por sí solo, comprensión»

**Formulación más precisa:** completar aporta evidencia de haber alcanzado el criterio de éxito del escenario en unas condiciones. Cuánto permite inferir sobre conocimientos depende de qué exigía la tarea, cómo se verificó y qué ayudas se recibieron. No significa que terminar carezca de valor ni que necesitemos leer la mente del estudiante.

Ejemplo: dos personas pueden dejar la misma política de carga configurada; una la construyó y explica por qué funciona, otra reprodujo una solución revelada. El resultado técnico puede ser idéntico, pero no respalda la misma inferencia sobre resolución autónoma. Esto no permite concluir que la segunda persona no sabe: **solo que ese registro no lo distingue**.

También puede ocurrir lo inverso: una persona toma decisiones correctas y explica la causa mediante un diagrama breve, pero escribe poco o tiene dificultades con la interfaz. No corresponde reducir su conocimiento a su fluidez verbal o sus clics.

La solución no es reemplazar “terminó” por “escribió una explicación” como nueva garantía. Es diseñar un pequeño conjunto de observaciones pertinentes y limitar la conclusión a lo que sustentan. Los antecedentes CTF de G02/G09 y la comparación de formatos G04 apoyan examinar esas condiciones; no prueban que nuestra combinación sea óptima.

### «Revisar con estudiantes antes de construir los laboratorios completos»

“Revisar académicamente” significa comprobar contenido, objetivos, claves y puntuación con personas competentes en ciberseguridad y evaluación; no exigir que primero se publique un artículo. “Observar cómo lo interpretan” significa comprobar qué entienden los estudiantes por la consigna, qué información usan y si la tarea evoca lo previsto.

**Corrección de alcance:** no existe aquí respaldo para una regla universal “no construir hasta validar”. Un prototipo puede ser necesario para investigar. Recomendar revisar antes de una construcción costosa es una estrategia de gestión de incertidumbre/retrabajo, **no una conclusión experimental universal sobre el mejor orden de desarrollo**.

G01 documenta precisamente un prototipo de evaluación utilizado para pruebas posteriores; G07 estudia posibilidades y límites de prototipos con distinta fidelidad. La evidencia con personas debe corresponder a las interpretaciones que se quieran sostener, pero no prohíbe producir materiales, revisar lógica o construir un prototipo de investigación antes de obtenerla.

## 2. Aplicación del flujo investigativo local

Se aplican las ocho etapas de las notas del usuario. El proceso **no se declara empíricamente completado** donde faltan personas, datos o implementación. Las notas se usan como método aportado, no como instrucciones ocultas ni como evidencia de que un flujo completo sea universalmente eficaz.

| Etapa local | Aplicación en esta continuación | Evidencia o estado |
|---|---|---|
| Delimitar | Precisar qué aporta finalización y qué orden de desarrollo es defendible | Preguntas P1–P3 y usos excluidos |
| Mapear antecedentes | Buscar originales, objeciones y límites de transferencia | Registro G y búsquedas R01–R10 |
| Abrir alternativas | Comparar evidencia final, estructurada y ampliada; contrastar órdenes de prototipado | Alternativas A/B y decisiones condicionadas |
| Diseñar prueba | Especificar contrastes de escritorio antes de generar casos | Protocolo en L7 del registro de trabajo; reglas §5 |
| Obtener evidencia | Ejecutar comprobación lógica de ocho registros sintéticos; contrastar fuentes | Tabla y resultados de §5; no datos de personas |
| Revisar | Corregir prohibición aparente de prototipar y neutralidad supuesta de explicar | Cambios §6 y en el marco 1.1 |
| Validar proporcionalmente | Comprobar consistencia documental y definir pruebas humanas necesarias | Verificación lógica acotada realizada; validez local pendiente |
| Implementar, si corresponde | No autorizado por esta solicitud de investigación | No ejecutada; no se presenta como resultado negativo |

Base local: [marco de investigación](../../workspace/Investigación/Descubrimiento%20e%20innovación/Marco%20de%20trabajo%20para%20investigar%20e%20innovar.md), [plantilla](../../workspace/Investigación/Descubrimiento%20e%20innovación/Plantilla%20de%20proyecto%20de%20investigación.md), [pruebas discriminantes](../../workspace/Investigación/Descubrimiento%20e%20innovación/Hipótesis,%20predicciones%20y%20pruebas%20discriminantes.md) y [registro de confianza](../../workspace/Investigación/Descubrimiento%20e%20innovación/Registro%20de%20afirmaciones%20y%20confianza.md). La adaptación no obliga a reproducir su organización de bóveda en la documentación del proyecto.

### Preguntas y posibles cambios de decisión

- **P1:** ¿qué información pierde una evaluación que solo conserva finalización? Si no pierde ninguna distinción pertinente al uso delimitado, no se justifica añadir evidencia por costumbre.
- **P2:** ¿añadir explicación revela conocimiento o añade enseñanza, carga y barreras? Si no mejora la interpretación o introduce una demanda ajena al objetivo, simplificar formato o cambiar el momento.
- **P3:** ¿qué incertidumbre exige interacción real y cuál puede resolverse con tarjetas o revisión lógica? Si el mecanismo depende de ejecución real, aumentar fidelidad; si solo depende de la consigna, no construir infraestructura innecesaria.

Contribución incluso con resultados desfavorables: mostrar que una evidencia no distingue lo pretendido, retirar una regla no justificada o precisar el alcance de un prototipo. No se exige que gane siempre la propuesta multimodal.

## 3. Solución operativa propuesta

### 3.1 Conjunto mínimo de evidencias

Para cada tarea, preparar lo siguiente, sin convertirlo todavía en un formulario rígido o una nota ponderada:

1. **Una decisión práctica observable:** el estudiante modifica, configura o selecciona una intervención y queda un artefacto/estado verificable.
2. **Pruebas de efecto:** comprobar la propiedad de seguridad y la funcionalidad legítima relevante, con entradas de control declaradas por la política del caso. No basta pulsar “ejecutar prueba”: debe conservarse qué se probó y cómo se interpretó.
3. **Una comprobación causal breve:** señalar la evidencia que justifica la medida y qué consecuencia cambiaría si se elimina. Puede ser frase, diagrama o relación estructurada, según el objetivo. Reconocer una explicación y construirla no son la misma evidencia; no declarar formatos equivalentes sin comprobarlo.
4. **Condiciones de producción:** ayuda, recursos, versión de la tarea y exposición anterior. No convertir una solicitud de ayuda en penalización automática.

La propuesta se parece a C2 del marco, pero **no se sabe aún si es suficiente ni su coste efectivo**. No se fija un número universal de preguntas ni porcentajes para combinar dimensiones. Cuando solo se necesita evaluar una habilidad procedimental muy acotada, una buena tarea práctica puede ser suficiente para esa inferencia más estrecha.

### 3.2 Momento de cada observación

**Para observar actuación inicial sin enseñanza añadida por preguntas dirigidas:**

`familiarización neutral → tarea práctica y pruebas → congelar registro inicial → variante, solo si interesa generalización previa al feedback → explicación estructurada de cierre → feedback y práctica`.

La explicación posterior no reconstruye de forma infalible el pensamiento anterior; se informa como **evidencia explicativa de cierre**. Si se quiere estudiar planificación causal **antes** de actuar, pedir una predicción al inicio es válido para ese objetivo, pero define otra condición: actuación precedida de una pregunta de planificación, no actuación espontánea intacta.

G03 distingue verbalización no dirigida y solicitudes de explicación; G08 muestra que provocar autoexplicaciones puede favorecer aprendizaje en una tarea específica. Por ello no se comparan tiempos de entrevistas verbalizadas con pruebas silenciosas como si fueran equivalentes. Un pretest conceptual también es exposición: su orden y contenido deben registrarse, sin asumir neutralidad por no dar feedback.

El pilotaje exploratorio puede usar preguntas abiertas y diálogo para descubrir problemas. Eso no lo convierte en la administración final estandarizada ni permite reutilizar sus puntuaciones como una medición basal idéntica.

### 3.3 Tres alternativas de medición, con condiciones de elección

| Alternativa | Ventaja | Riesgo/coste | Decisión provisional |
|---|---|---|---|
| A1. Resultado técnico final bien verificado | Menos registro y corrección; pertinente para logro técnico delimitado | No identifica ayuda, explicación ni otras propiedades que el verificador no observa | Conservar como componente; no usar para afirmaciones más amplias sin respaldo |
| A2. Resultado + pruebas + explicación breve + condiciones | Hace visibles contradicciones importantes para estos casos | Exige autoría y corrección; puede añadir barreras o reactividad | Recomendada como punto de partida, no ganadora demostrada |
| A3. A2 + trazas completas, entrevista extensa y variantes múltiples | Puede investigar procesos e incertidumbres específicas | Mayor coste, privacidad, dependencia de evaluadores y fatiga | Añadir solo ante una pregunta que A2 no resuelva |

La comparación futura A1/A2/A3 debe usar evidencia pertinente independiente y coste real; no validar A2 porque coincide mejor con una rúbrica diseñada para premiar precisamente sus componentes.

## 4. Materiales concretos propuestos por caso

Se mantienen los escenarios candidatos del marco, sin declarar seleccionada una tecnología o un subtipo definitivo. Las consignas son borradores de investigación en español, coherentes con la documentación existente; las futuras cadenas de interfaz seguirán las convenciones del producto. Las entradas adversas son sintéticas y no ejecutan ataques.

### CWE-434 — ¿La política controla el archivo o solo su apariencia?

- **Consigna candidata:** “El portal debe aceptar los documentos permitidos por su política y evitar el procesamiento peligroso de los demás. Examina las evidencias, ajusta el control y comprueba el resultado”. La política y los tipos permitidos deben estar explícitos antes de evaluar.
- **Material mínimo:** esquema cliente–servidor–almacenamiento/procesamiento; dos solicitudes sintéticas con metadatos y contenido descritos; resultado del servidor; configuración modificable o tarjetas de alternativas.
- **Evidencia práctica:** estado del control efectivo y comportamiento ante una carga legítima y otra de tipo peligroso. No inferir protección general a partir de dos ejemplos.
- **Comprobación causal de cierre:** “¿Qué observación muestra dónde se hace cumplir la política? ¿Cambiar el nombre o el tipo declarado por el cliente cambia la propiedad peligrosa en este caso?”. No exige una explicación larga.
- **Indicador engañoso que debe evitarse:** que la aplicación diga “archivo rechazado” porque el botón del navegador bloqueó el envío, sin examinar el control servidor relevante.
- **Contraste candidato:** una solicitud cambia solo metadatos, manteniendo la propiedad que la política exige rechazar. Debe estar dentro del objetivo declarado, no introducir un ataque adicional oculto.
- **Qué puede investigarse con tarjetas:** lectura de evidencias y decisión sobre la frontera. **Qué requiere prototipo funcional:** si puede operar herramientas y verificar realmente el procesamiento.

Fundamento técnico: [CWE-434](https://cwe.mitre.org/data/definitions/434.html) y [FUSE, NDSS 2020](https://wsp-lab.github.io/papers/lee-fuse-ndss20.pdf). Son antecedentes del mecanismo, no validación de estas preguntas.

### CWE-502 — ¿El rechazo ocurrió antes o después del efecto peligroso?

- **Consigna candidata:** “El importador debe procesar preferencias válidas sin reconstruir objetos no permitidos ni producir efectos de la entrada no confiable. Identifica el paso relevante, modifica la estrategia y compruébala”. El formato/semántica se declaran; no se exige conocer una biblioteca no anunciada.
- **Material mínimo:** flujo de recepción, validación y reconstrucción; dos artefactos sintéticos; traza de efectos del modelo. Un marcador de efecto representa el riesgo; no se ejecuta código peligroso.
- **Evidencia práctica:** aceptación de importación legítima, rechazo del artefacto no permitido **y ausencia del efecto previo**. La frase “token rechazado” no basta si la operación con efectos ya ocurrió.
- **Comprobación causal de cierre:** “¿Por qué el orden importa en este flujo? Señala la evidencia que distingue rechazo seguro de rechazo tardío”.
- **Indicador engañoso:** premiar el mensaje final de autenticación fallida sin revisar la secuencia.
- **Contraste candidato:** mismo mensaje final y distinto orden/efecto. No enseñar que toda lectura de JSON reconstruye objetos ejecutables.
- **Límite del papel:** permite estudiar la decisión causal; no demuestra reparación de un deserializador real ni habilidad de explotación.

Base técnica: [CWE-502](https://cwe.mitre.org/data/definitions/502.html). La clave depende de la semántica declarada del caso; no se convierte una regla de orden en solución universal.

### CWE-1427 — ¿Se mantiene la tarea autorizada o simplemente se bloquea todo?

- **Consigna candidata:** “El asistente debe realizar la tarea autorizada sin permitir que las entradas no confiables cambien sus instrucciones o capacidades. Examina el flujo, aplica una medida y contrasta su comportamiento”. Deben explicitarse tarea y capacidades permitidas.
- **Material mínimo:** encargo, entrada legítima, entrada manipulada, construcción de prompt y traza de resultados/acciones. Se puede comenzar con respuestas fijadas del simulador.
- **Evidencia práctica:** control pertinente más resultado sobre la tarea legítima y la condición adversa. Rechazar todo no satisface ambas propiedades.
- **Comprobación causal de cierre:** “¿Qué contenido no debe tener autoridad y qué control limita su efecto? ¿Qué no puedes concluir con estas pruebas?”.
- **Indicador engañoso:** atribuir al estudiante conocimiento superior porque una ejecución concreta del modelo rechazó el ataque.
- **Contraste candidato:** paráfrasis de la entrada manteniendo frontera y objetivo. Cambios de modelo/configuración se registran; no se confunden con cambios del estudiante.
- **Límite del simulador:** estudiar lectura/decisión sobre inyección, no estimar robustez de un LLM real. La correspondencia con CWE-1427 requiere causa de construcción del prompt; no introducir otra categoría por asociación.

Base: [CWE-1427](https://cwe.mitre.org/data/definitions/1427.html) y [AgentDojo](https://proceedings.neurips.cc/paper_files/paper/2024/file/97091a5177d8dc64b1da8bf3e1f6fb54-Paper-Datasets_and_Benchmarks_Track.pdf). El benchmark motiva distinguir seguridad y utilidad; no valida conocimiento humano.

### CWE-200 — ¿Se ocultó en pantalla o dejó de exponerse en el canal?

- **Consigna candidata:** “El diagnóstico debe mostrar a cada actor solo la información autorizada y conservar lo necesario para su función. Identifica la exposición, modifica la respuesta y verifica ambas perspectivas”. La matriz actor–dato–finalidad debe ser explícita.
- **Material mínimo:** vista de pantalla, respuesta recibida por el cliente y política de información; datos y secretos exclusivamente sintéticos.
- **Evidencia práctica:** ausencia del dato sensible en el canal observado para el actor no autorizado y conservación de la información requerida para el autorizado.
- **Comprobación causal de cierre:** “¿Qué evidencia diferencia ocultación visual de eliminación de la exposición? ¿Qué otros canales no has comprobado?”.
- **Indicador engañoso:** una interfaz sin el secreto mientras el mismo dato permanece en la respuesta.
- **Contraste candidato:** dos respuestas con igual apariencia y distinto contenido transmitido. No inferir confidencialidad en todos los canales ni competencia legal en privacidad.
- **Límite de alcance:** es una propuesta concreta bajo el tema aprobado; CWE-200 no se presenta como causa universal. Su subtipo causal, y si el contexto final es un sistema de IA u otra aplicación, siguen sujetos a la especificación académica.

Base: [CWE-200](https://cwe.mitre.org/data/definitions/200.html). La propuesta no sustituye el trabajo del compañero sobre la selección de riesgos/casos.

## 5. Prueba de escritorio realmente realizada

### 5.1 Protocolo y predicciones

Se diseñó una comprobación lógica, no una simulación de la distribución de conocimientos. **Material:** ocho registros construidos intencionalmente, dos por caso. Campos: finalización `S`, función legítima `B`, propiedad de seguridad `Q`, evidencia causal `R` y ayuda `H`. Verdadero/falso describe el caso sintético, no una medición del motor actual.

**Antes de examinarlos se fijó:** buscar pares con `S` idéntico y al menos una diferencia pertinente en B/Q/R/H. Si existen dentro de los supuestos del caso, S no recupera por sí solo ese perfil. Si un campo adicional no aporta ninguna distinción pertinente, su mera presencia no justifica coste de captura.

Las etiquetas R se asignan por construcción a afirmaciones consistentes/contradictorias con los hechos del ejemplo; **no son etiquetas reales de comprensión**. El análisis no asigna niveles 0–3 ni pretende calibrar pesos.

### 5.2 Datos sintéticos y resultado

| ID | Caso | S: terminó | B: función legítima | Q: seguridad relevante | R: afirmación causal | H |
|---|---|---|---|---|---|---|
| U1 | CWE-434 | Sí | Sí | Sí | Compatible con la evidencia del caso | A0 |
| U2 | CWE-434 | Sí | Sí | Sí | Contradice la frontera cliente/servidor | A3 |
| D1 | CWE-502 | Sí | Sí | Sí | Compatible con secuencia/efectos | A0 |
| D2 | CWE-502 | Sí | Sí | No | Llama seguro al rechazo posterior al efecto | A0 |
| P1 | CWE-1427 | Sí | Sí | Sí | Compatible con el objetivo y control modelados | A0 |
| P2 | CWE-1427 | Sí | No | Sí | Compatible con el bloqueo, pero inutiliza el servicio | A0 |
| L1 | CWE-200 | Sí | Sí | Sí | Compatible con ausencia del dato en el canal | A0 |
| L2 | CWE-200 | Sí | Sí | No | Confunde ocultación visual con ausencia en respuesta | A0 |

Se ejecutó la comparación determinista de los cuatro pares sobre esos campos: **U1/U2, D1/D2, P1/P2 y L1/L2 tienen el mismo S y diferencias en el perfil adicional previsto**. La tabla permite repetir la comprobación sin software especial; no hubo ejecución de cargas, deserialización ni modelos.

La demostración es condicional: un indicador binario que permite esos estados no identifica sus diferencias. **No demuestra que esos comportamientos tengan una frecuencia concreta, que existan esos errores en CyberSim ni que A2 diagnostique correctamente a personas reales.** Al haberse construido los pares para provocar la distinción, no calcular sensibilidad, precisión o “porcentaje de mejora” con ellos: sería circular.

### 5.3 Qué se aprendió y qué no

- Se conserva el resultado técnico de U2 como logro asistido; no se etiqueta a su autor ficticio como incapaz.
- D2 y L2 obligan a definir mejor **qué verifica el éxito**, antes de interpretar una flag como competencia.
- P2 muestra por qué seguridad y función legítima deben diferenciarse en la tarea propuesta.
- U1/U2 cambia simultáneamente razón y ayuda: demuestra pérdida de información, pero **no permite aislar causalmente cuál de las dos la produce**. Una comparación humana posterior debe separar esas condiciones.
- Los casos no resuelven si una explicación verbal es necesaria para cada inferencia ni si los estudiantes darían esas respuestas. Eso permanece abierto.

### 5.4 Controles adversariales del diseño

| Contraejemplo | Regla de la propuesta que debe resistirlo | Estado de comprobación |
|---|---|---|
| Solución correcta con ruta distinta | Evaluar propiedades/artefacto, no coincidencia literal de clics | Coherencia documental revisada; verificador no implementado |
| Justificación breve o diagrama correcto | Puntuar relación causal pertinente, no longitud | Criterio definido; equivalencia de modalidades pendiente |
| Registro perdido por fallo técnico | NE/incidencia, no concluir desconocimiento | Regla revisada; sin fallo real reproducido |
| Una respuesta favorable del LLM | Separar observación del modelo y evidencia del estudiante | Regla definida; sin ensayo de modelo |
| Mucha explicación después de una pista | Conservar momento/ayuda; no reclasificar como basal autónomo | Regla definida; sin observación de participantes |

Esta revisión es ejecutada por el autor asistido por IA, no doble corrección por expertos. No atribuir acuerdo interevaluador al hecho de que una tabla tenga una clave.

## 6. Qué hacer si todavía no hay estudiantes disponibles

**Se puede avanzar:** completar fichas/materiales/contrastes, revisar lógica, pedir revisión experta cuando esté autorizada y preparar un prototipo de investigación. Elegir su fidelidad por la incertidumbre, no por una escalera obligatoria.

| Incertidumbre | Material inicial candidato | Lo que no puede probar |
|---|---|---|
| ¿La clave y las pruebas respetan la política? | Casos sintéticos + revisión de contenido | Estrategia espontánea, dificultad o equidad estudiantil |
| ¿La consigna se entiende como pretendemos? | Tarjetas/pantallas suficientemente completas para la interacción | Operación real, latencia y problemas de herramientas omitidas |
| ¿Se puede producir y registrar el efecto pertinente? | Prototipo funcional reducido de un flujo | Medición generalizable o funcionamiento a escala |
| ¿La complejidad global altera la actuación? | Integración más completa, cuando esa sea la variable de interés | Validez por el solo hecho de ejecutarse |

G06 aporta evidencia de utilidad de revisión experta en preguntas de encuesta; no autoriza equipararla a estudiantes ni trasladar su magnitud a CyberSim. G07 respalda estudiar algunos problemas con menor fidelidad, con límites por interacción omitida. **Si la pregunta necesita el sistema completo, es defendible construir más antes de probarla**; debe declararse el riesgo de retrabajo, no prohibirlo.

No se justificó que este proceso ahorre una cantidad concreta de tiempo/coste en CyberSim. Tampoco se justificó un tamaño universal de piloto, una secuencia única óptima, que la revisión por IA sustituya expertos o que datos sintéticos permitan afirmar cómo responderán estudiantes. Esas pretensiones se retiran o quedan expresamente pendientes.

## 7. Prueba humana mínima informativa, todavía no ejecutada

Cuando se autorice y se delimite población/uso, elegir **una incertidumbre**, no probar todo a la vez. Ejemplo: “¿la consigna CWE-200 permite distinguir canal transmitido y apariencia visual sin enseñar la distinción durante la medición inicial?”.

- **Material:** dos instancias con los mismos requisitos y evidencia suficiente; una puede revelar problema de consigna. No se presupone equivalencia de dificultad.
- **Procedimiento propuesto:** familiarización neutral, resolución sin feedback y registro; luego preguntas abiertas sobre interpretación. Registrar cualquier pregunta explicativa adicional como intervención del protocolo.
- **Observación:** qué entendió, qué dato eligió y qué prueba realizó; separar respuestas previas/posteriores a preguntas o ayuda.
- **Rivales:** desconocimiento, consigna ambigua, barrera de operación o pista superficial. Una respuesta aislada puede no distinguirlos.
- **Decisión prevista:** si el material no permite observar el canal relevante, corregir el material; si la consigna induce otra tarea, reescribirla; si el comportamiento es interpretable pero hay errores conceptuales, conservarlos como evidencia situada, no rediseñar para que todos acierten.
- **Comparación independiente posterior:** otra tarea que conserve el objetivo y no haya proporcionado la solución; la explicación posterior puede contaminar ese contraste si se administra antes. No usar como criterio externo el mismo dato que define la puntuación.
- **Muestra y precisión:** perfiles/prerrequisitos y recursos se justifican según la pregunta; un estudio exploratorio de proceso no estima prevalencia ni reemplaza el estudio de medición.
- **Permisos:** procedimiento ético, responsables y tratamiento de datos antes del campo. No se solicitan ni reclutan participantes en esta entrega.

No está establecido que esta prueba sea superior a todas las alternativas. Su valor propuesto es que podría **cambiar una decisión concreta** con materiales proporcionados a esa duda.

## 8. Diez ciclos adicionales de contraste documental

Los siguientes ciclos continúan los doce originales; **no los reemplazan ni se presentan como experimentos**. Consultas realizadas el 26 de octubre de 2026; síntesis redactada desde su ejecución. Las búsquedas de seguimiento y accesos se consignan en G. La versión previa funciona como hipótesis de trabajo, no como respuesta que deba preservarse a cualquier coste.

| Ciclo | Pregunta y consulta nueva efectuada | Evidencia y revisión progresiva | Límite / siguiente incertidumbre |
|---|---|---|---|
| R01 | ¿Es obligatorio validar antes de prototipar? `site.ets.org "evidence-centered" "prototype" assessment development` | G01 muestra un prototipo que sirve al desarrollo de evidencia. Se retira la prohibición universal aparente | Un ejemplo no prueba orden óptimo; examinar valor del resultado final |
| R02 | ¿Finalizar es inútil o insuficiente para ciertos usos? `site.muni.cz "Capture The Flag" "assessment" "plagiarism" scoring` | Antecedentes CTF del registro F06 y G02 permiten conservar éxito como evidencia situada, no despreciarlo | No identificar toda finalización con copia; ¿más explicación siempre mejora? |
| R03 | ¿La explicación observa sin intervenir? `Chi Bassok Lewis Reimann Glaser 1989 self explanations students learn examples primary paper pdf`; `Fox Ericsson Best 2011 think aloud reactivity meta analysis 94 studies verbal reports` | G03/G08 motivan separar fase inicial y explicación dirigida. Se corrige neutralidad supuesta | Resultados de otros dominios, no efecto medido aquí; examinar orden de contrastes |
| R04 | ¿La variante posterior sigue siendo una medida inicial? `site.nationalacademies.org transfer assessment "prompting" "spontaneously"`; `site.psych.wustl.edu Roediger Karpicke 2006 test enhanced learning pdf` | Se preserva la distinción de F13 entre transferencia espontánea y asistida. Las pruebas previas son exposición, no condición automáticamente neutra | El artículo de retención se localizó, pero acceso editorial falló; no cuantificar efecto en CyberSim |
| R05 | ¿Una explicación extensa puede medir lenguaje en vez del objetivo? `site.testingstandards.net "3.2" "verbal" "construct"`; `site.ets.org "constructed response" "language" "science" "assessment" fairness` | G04/G10 obligan a adaptar formato al constructo; se permiten comprobaciones causales breves sin afirmar equivalencia de modalidades | Reconocer una razón no es generarla; revisar ayuda y autoría |
| R06 | ¿Podemos reducir dependencia de respuesta copiable sin castigar ayuda? `"Preventing Cheating in Hands-on Lab Assignments" cybersecurity`; `"An Offline Capture The Flag" "Assessment" Chothia Novakovic` | G02/G09 aportan antecedentes de evidencias complementarias/personalización. Se registra ayuda/exposición y se proponen variantes, no vigilancia invasiva | No prometer prevención de copia ni tratar sospecha como prueba; definir éxito técnico |
| R07 | ¿Una defensa que inutiliza todo o rechaza tarde cuenta como éxito? `site.cwe.mitre.org/data/definitions/502 "before" "authenticate"`; `site.usenix.org "AgentDojo" "utility"` | F17/G11 precisan secuencia, seguridad y utilidad. Se añaden contrastes D1/D2 y P1/P2 de la prueba de escritorio | Fuentes técnicas no validan conocimiento humano; limitar corrección a hechos observados |
| R08 | ¿Todo dato adicional justifica coste de capturarlo? `site.ets.org "Best Practices for Constructed-Response Scoring" "2022"`; `"Exploring the Comparability of Multiple-Choice and Constructed-Response Versions"` | G04/G05 apoyan especificar formatos, ejemplos y corrección. A2 es candidata; A3 solo por una pregunta concreta | No hay comparación local de utilidad/coste; ¿pueden expertos sustituir la observación humana? |
| R09 | ¿La revisión experta o sintética puede reemplazar a estudiantes? `"A Comparison of Five Question Evaluation Methods" "Maitland" "Presser"`; `"expert" "novices" "Categorization and Representation of Physics Problems"` | G06 apoya utilidad experta sin equivalencia; mapa crítico del explorador devuelve límites de experto/novato. Se evita tanto despreciar expertos como simular estudiantes | Transferencia de encuesta/física limitada; elegir fidelidad según la duda |
| R10 | ¿Baja fidelidad siempre basta? `"Usability Problem Identification Using Both Low- and High-Fidelity Prototypes" "limitations"`; `"Designing a Prototype Tablet-Based" "trial"` | G01/G07 permiten prototipado iterativo, pero exigen preservar interacción relevante. Se admite prototipo funcional o integración completa cuando la pregunta lo necesita | No probar superioridad universal ni afirmar validez local; formular próxima prueba que cambie decisión |

### Incidencias y desviaciones

- Acceso directo Wiley al informe G01 falló; se recuperó el texto original desde ERIC. Acceso al PDF de Birmingham desde la ruta antigua falló; se usó la ficha de actas y extractos indexados, sin atribuir lectura íntegra.
- Se localizaron críticas a neutralidad de la verbalización y límites de formato; no se conservaron las recomendaciones iniciales como si fueran hechos inamovibles.
- El mapa de fuentes experto/prototipado fue delegado en modo solo lectura; el autor comprobó directamente G07. No equivale a revisión académica independiente ni a una consulta a expertos reales.
- No se registraron costes monetarios ni duración de cada consulta. Se conservan alcance, consultas y fallos; no inventar esas magnitudes para completar la plantilla.
- No se ejecutaron bases de datos bibliográficas exhaustivas, reproducciones de los artículos, validación de una muestra real ni auditoría exhaustiva de correcciones/retractaciones. Esta búsqueda no justifica una afirmación de exhaustividad o novedad.

## 9. Fuentes de la continuación y acceso

Fuentes G identifican este documento; no renumeran el [registro F](evidencia-marco-evaluacion.md#fuentes-y-acceso-real). **TC-S**: texto completo disponible, secciones consultadas; **R/EI**: resumen o extracto indexado. Las fuentes originales se enlazan incluso cuando el acceso fue parcial. Las normas no se cuentan como experimentos.

| ID | Referencia y acceso | Qué respalda / qué no |
|---|---|---|
| G01 | Chapelle, C. A. et al. (2018). *Designing a Prototype Tablet-Based Learning-Oriented Assessment for Middle School English Learners: An Evidence-Centered Design Approach*. ETS RR-18-46. [DOI 10.1002/ets2.12232](https://doi.org/10.1002/ets2.12232), [PDF original ERIC](https://files.eric.ed.gov/fulltext/EJ1202815.pdf). TC-S: desarrollo conceptual y planificación de pruebas | Antecedente de construir un prototipo para obtener evidencia; no demuestra orden óptimo de CyberSim |
| G02 | Chothia, T. y Novakovic, C. (2015). *An Offline Capture The Flag-Style Virtual Machine and an Assessment of Its Value for Cybersecurity Education*. [USENIX 3GSE](https://www.usenix.org/conference/3gse15/summit-program/presentation/chothia). R/EI: ficha original y pasajes indexados sobre respuestas/flags | Uso conjunto de evidencias y problemas de atribución; no prueba invalidez de todo CTF ni mide estos cuatro casos |
| G03 | Fox, M. C., Ericsson, K. A. y Best, R. (2011). *Do procedures for verbal reporting of thinking have to be reactive?* Psychological Bulletin, 137(2), 316–344. [Resumen original](https://pubmed.ncbi.nlm.nih.gov/21090887/), DOI 10.1037/a0021663. R | Metaanálisis de 94 estudios: diferencia entre verbalización no dirigida y explicación dirigida; no garantiza neutralidad de una tarea concreta |
| G04 | Herrmann-Abell, C. F., Hardcastle, J. y DeBoer, G. E. (2022). *Exploring the Comparability of Multiple-Choice and Constructed-Response Versions of Scenario-Based Assessment Tasks*. NARST. [Texto original](https://files.eric.ed.gov/fulltext/ED618997.pdf). TC-S: resumen, método y discusión | Comparación de formatos con asignación aleatoria en ciencias; demanda de escritura/razonamiento altera dificultad. No permite equiparar modalidades por decreto en CyberSim |
| G05 | McCaffrey, D. F. et al. (2022). *Best Practices for Constructed-Response Scoring*. ETS RR-22-17. [DOI 10.1002/ets2.12358](https://doi.org/10.1002/ets2.12358), [PDF](https://files.eric.ed.gov/fulltext/EJ1366756.pdf). TC-S: ejemplares, puntuación humana/automática y métricas | Orienta diseño y control de corrección; no demuestra fiabilidad de nuestra rúbrica ni impone una nota universal |
| G06 | Maitland, A. y Presser, S. (2020; publicación en línea 2019). *A Comparison of Five Question Evaluation Methods in Predicting the Validity of Respondent Answers to Factual Items*. [DOI 10.1002/9781119263685.ch4](https://onlinelibrary.wiley.com/doi/abs/10.1002/9781119263685.ch4). R: Summary | Estudio de 44 preguntas: revisión experta e entrevistas aportaron predicción útil; no equivalencia con simulaciones de ciberseguridad |
| G07 | Virzi, R. A., Sokolov, J. L. y Karis, D. (1996). *Usability Problem Identification Using Both Low- and High-Fidelity Prototypes*. CHI, 236–243. [Texto de actas](https://chi1996.acm.org/proceedings/papers/Virzi/RAVtext.html), DOI 10.1145/238386.238516. TC-S: abstract, discusión y límites | Dos experimentos de usabilidad respaldan utilidad de baja fidelidad en sus condiciones; no equivalencia psicométrica ni detección de todo problema |
| G08 | Chi, M. T. H., de Leeuw, N., Chiu, M.-H. y LaVancher, C. (1994). *Eliciting Self-Explanations Improves Understanding*. Cognitive Science, 18, 439–477. [Texto institucional](https://education.asu.edu/sites/g/files/litvpz656/files/lcl/chideleeuwchiulavancher_3.pdf), DOI 10.1207/s15516709cog1803_3. TC-S por explorador: pp. 439–441 y 474 | Estudio de aprendizaje sobre circulación en estudiantes escolares; pedir explicación puede ser intervención. No demuestra que toda explicación correcta revele toda la comprensión |
| G09 | Vykopal, J., Švábenský, V., Seda, P. y Čeleda, P. (2022). *Preventing Cheating in Hands-on Lab Assignments*. SIGCSE, 78–84. [Texto de autores](https://arxiv.org/abs/2201.01154), DOI 10.1145/3478431.3499420. R/EI: abstract y método indexado | Personalización de tareas en un caso de curso; no garantiza ausencia de copia, equivalencia de dificultad ni autoría autónoma |
| G10 | AERA, APA y NCME (2014). *Standards for Educational and Psychological Testing*, estándar 3.2. [Texto oficial](https://www.testingstandards.net/uploads/7/6/6/4/76643089/9780935302356.pdf). Fuente normativa; pasaje consultado | Demandas verbales/físicas alineadas con constructo; no una prueba de accesibilidad ya superada |
| G11 | Debenedetti, E. et al. (2024). *AgentDojo*. NeurIPS. [Texto original](https://proceedings.neurips.cc/paper_files/paper/2024/file/97091a5177d8dc64b1da8bf3e1f6fb54-Paper-Datasets_and_Benchmarks_Track.pdf). R/EI: definiciones de utilidad/ataque | Evalúa sistemas; motiva controles de función legítima, no inferencia directa sobre alumnos |

Otros originales localizados: Chi et al. (1989), DOI 10.1207/s15516709cog1302_1; Chi et al. (1981), DOI 10.1207/s15516709cog0502_2; Roediger y Karpicke (2006), DOI 10.1111/j.1467-9280.2006.01693.x. Acceso parcial/mixto; no se usan aquí para transferir tamaños de efecto, tasas o equivalencia a CyberSim. No se efectuó una revisión sistemática de sus réplicas.

## 10. Balance: justificado, propuesto y no demostrado

| Afirmación | Estado y motivo |
|---|---|
| Finalizar no tiene ningún valor para evaluar | **Rechazada como formulación general**: sí aporta evidencia del criterio alcanzado |
| El éxito final aislado siempre identifica comprensión/autonomía | **No justificada**; el contraejemplo lógico y antecedentes muestran distinciones que pueden perderse |
| Hay que validar con estudiantes antes de crear cualquier prototipo | **Retirada**: confunde el medio de investigación con su validación |
| Revisar temprano puede evitar construir sobre una interpretación equivocada | **Recomendación razonada**, no ahorro causal/cuantificado demostrado aquí |
| Las comprobaciones expertas/sintéticas reemplazan la interpretación real estudiantil | **No justificada**: no observan directamente esa respuesta; su utilidad preliminar sí tiene respaldo |
| Pedir explicación es una medida pasiva y neutral | **Retirada como garantía**: puede modificar actuación/aprendizaje; depende del protocolo |
| A2 es la mejor configuración para CyberSim | **Propuesta pendiente de contraste**; la revisión no determina óptimo, pesos ni umbrales |
| Se siguió todo el proceso empírico con participantes | **Falso**: se completó la investigación documental y la prueba lógica; las pruebas humanas están diseñadas, no ejecutadas |

**Siguiente acción recomendada, no ejecutada:** convertir estas fichas en materiales mínimos de investigación y revisar qué incertidumbre requiere personas o ejecución real. Se puede avanzar en diseño y prototipado sin proclamar validación. Cualquier implementación concreta o estudio de campo requerirá su autorización y alcance respectivos.
