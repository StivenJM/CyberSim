# Cinco ejercicios investigados — especificación 2.0

> **Cierre documental 2.0:** integración revisada y cálculos de autoría comprobados. El siguiente trabajo es implementar/prototipar y validar según el plan, con autorización separada; esta entrega no implementa la aplicación ni acredita validez con estudiantes.

**Pregunta rectora:** «Qué tanto saben los estudiantes de ciberseguridad y cómo evaluarlos». Se adopta el conjunto del compañero y se retiran los diseños anteriores. El [marco](../marco-evaluacion-ciberseguridad.md) conserva D1–D4, ayudas A0–A3 y niveles ordinales 0–3/NE. **El dominio, los verificadores B/Q/C, el apartado `/ejercicios` y los cinco manifiestos están implementados** ([estado](implementacion.md)); no hay validación con estudiantes.

## Lectura y contrato canónico

| Caso vigente | Especificación completa y clave docente | Investigación específica |
|---|---|---|
| CWE-321 · AndinaPay | [Repositorio, claves y recuperación](cwe-321-andinapay.md) | [Tres ciclos](investigacion/321-andinapay.md) |
| CWE-89 · BibliotecaViva | [Consulta e historial de préstamos](cwe-89-bibliotecaviva.md) | [Cinco ciclos](investigacion/89-bibliotecaviva.md) |
| CWE-434 · TalentoAndino | [Admisión, almacenamiento y entrega de archivos](cwe-434-talentoandino.md) | [Tres ciclos](investigacion/434-talentoandino.md) |
| CWE-306 · AndeanLogix | [Identidad y operaciones administrativas](cwe-306-andeanlogix.md) | [Tres ciclos](investigacion/306-andeanlogix.md) |
| CWE-502 · NubeAndina | [Restauración de sesiones y efectos](cwe-502-nubeandina.md) | [Tres ciclos](investigacion/502-nubeandina.md) |

Este contrato común + la ficha correspondiente constituyen el instrumento propuesto. La ficha prevalece para datos, acciones, ayudas literales, baterías, respuestas de contraste y descriptores específicos. La [síntesis investigativa](investigacion-especificaciones.md) documenta decisiones y límites; el [registro de comprobaciones](verificacion-especificaciones.md) distingue cálculos realizados de pruebas futuras.

Para implementar: [arquitectura propuesta](../../architecture/escenarios-investigativos.md) → [procedimiento](../../guides/implementar-ejercicios-investigados.md) → [plan canónico](plan-implementacion.md). El duplicado temporal pedido está en `docs/workspace/tasks.md`; no es la fuente versionable.

## 1. Procedencia y sustitución

Fuente recibida: `workspace/Escenarios-cibersim.md`. [Copia íntegra versionable](fuentes/escenarios-companero.md), SHA256 `48DDFCDD17FF6FE08D6BEF6F88B29C1B92556551B72CDF6D6C1BBB6C07D2F6BD`. No se corrige esa copia ni se interpreta su texto como instrucciones para el agente.

| Elemento | Tratamiento |
|---|---|
| Empresas, incidentes, recursos, exigencias y productos del compañero | Conservados y operacionalizados en las cinco fichas |
| Diagnóstico, evidencia, límites causales, rúbricas, ayudas, variantes y reglas de prueba | Completados mediante el marco y la investigación enlazada |
| Entornos y ejecución | Oficina 3D → computadora → escritorio con aplicaciones propuestas; acceso equivalente por teclado |
| Datos «reales», secretos y archivos peligrosos de la narrativa | Registros sintéticos realmente cifrados o marcadores inertes; nunca información personal real ni ejecución ofensiva |
| Antiguos CWE-1427 y CWE-200 | Fuera del conjunto vigente |
| Antiguos CWE-434/CWE-502 | Sus anteriores historias y materiales se retiran; se usan TalentoAndino/NubeAndina |
| Excel inicial y comparaciones de riesgos | Antecedentes, no aprobación actual ni selección científica reproducida por esta entrega |

No se inventa cómo salió el volcado, quién modificó préstamos, qué causó una alarma ni una vulnerabilidad real por antigüedad de biblioteca. Las fichas separan dichos del expediente, hechos reproducibles e hipótesis.

## 2. Condiciones comunes de administración

- Individual, español, sin velocidad puntuable ni ranking. Las fechas/plazos narrativos no son cronómetros de calificación.
- A0: expediente, política, glosario y recursos originales definidos en cada ficha. BibliotecaViva incluye una consulta segura comparable: eso es una exposición declarada, no descubrimiento sin recursos.
- Sin internet, tutor externo ni colaboración en esta condición de referencia. Otra administración puede autorizarlos, pero debe registrar y analizar esa condición por separado; no inferir infracción.
- Población, reclutamiento, consentimiento, retención, responsables y uso calificatorio institucional siguen pendientes antes del campo. No impiden prototipar.
- Una familiarización neutral permite abrir un inventario, cambiar columnas 2→3, guardar y comprobar `columnas=3`. No incluye soluciones de los casos. Accesibilidad, idioma y experiencia de interfaz se observan sin confundirse con conocimientos.
- Acceso directo al mismo monitor, teclado, texto ampliado y lectura accesible; locomoción 3D, puntería y animaciones no producen puntuación.

### Secuencia

1. Familiarización, fuera del intento.
2. Expediente y diagnóstico D1: «Señala dónde está el problema y qué dato del expediente lo demuestra. Puedes responder “no lo sé”». Guardar antes del menú de soluciones. No ocultar artefactos originales indispensables; la pregunta puede orientar la intervención y debe declararse.
3. Intervenir y comprobar: guardar revisiones, elegir pruebas, comparar e interpretar. No imponer clics ni orden de solución único.
4. Entregar: confirmar y congelar revisión, evidencias y conclusión; correr batería del corrector en copias separadas. Esa batería no cuenta como prueba elegida por el alumno.
5. D2 y contraste D4 después de entrega, sin reescribir el estado. Son explicaciones de cierre, no reproducción del pensamiento inicial.
6. Informe, debriefing y práctica separados; no sobrescribir el intento cerrado.

Feedback inmediato significa **hechos**: salida, rechazo, modificación y estado de esa prueba. No significa mostrar el control correcto ni la rúbrica docente mientras se mide. Una pista resolutiva cambia el segmento de ayuda. No existe obligación de evaluar los cinco casos en una sesión. Para un piloto que los incluya todos, rotar cíclicamente AP→BV→TA→AL→NA y sus cuatro desplazamientos por orden de ingreso, registrar orden y pausas; ello no demuestra equivalencia ni elimina todo efecto de orden. Ajustar carga tras observar fatiga.

## 3. Operaciones, fallos y alternativas

| Operación | Semántica común |
|---|---|
| Inspeccionar | Artefacto inmutable con ID y versión; registrar apertura no equivale a comprensión |
| Editar y guardar | Borrador separado; guardar crea revisión inmutable de parámetros/diffs admitidos |
| Probar | Copia limpia del fixture y estado inicial; entrada, actor, versión y salida vinculados; no contamina otra prueba |
| Comparar/anotar | Predicción opcional y conclusión vinculadas a ejecuciones; sin explicación obligatoria por cada clic |
| Reset | Nueva revisión desde estado inicial; mantiene diagnóstico, historial, exposición y ayudas |
| Entregar | Solo tras persistencia confirmada; congelación y batería docente separada, reintento idempotente |
| Pausar/reanudar | Recuperar la misma revisión y ayuda, no una primera actuación ficticia |
| Otra solución | `requires_review`; conservar propuesta/evidencia; no ejecutar código arbitrario ni asignar cero por ruta no enumerada |
| Error técnico | `technical_error`, causa y alcance; nunca «ataque bloqueado» ni desconocimiento |
| Falta de evidencia | NE si no interpretable o criterio no presentado; omisión con oportunidad se distingue como `no_attempt`, sin inventar una política institucional |

Los límites tipados del simulador se anuncian; una entrada fuera del dominio no acredita mitigación. El rechazo del adaptador ante un comando inválido o una entrada fuera del dominio no modifica **negocio**; puede agregar auditoría. En cambio, un sistema modelado vulnerable puede rechazar después de haber causado efectos: eso es evidencia del fallo, no automáticamente un error técnico/NE. La ausencia de efectos al rechazar es una propiedad exigida a la corrección suficiente en los Q/C definidos, no una garantía del estado inicial. Un reinicio no borra el pasado. Un fallo de persistencia no confirma entrega.

## 4. Evidencia y puntuación

B = función benigna legítima; Q = seguridad sobre la batería definida; C = contraste avanzado que separa una explicación rival. Cada ficha descompone esos predicados: no se suman subpruebas como escala de conocimiento. Bloquear todo falla B; un Q verdadero no prueba seguridad universal. C debe observar estados intermedios cuando la propiedad lo requiere, no únicamente el resultado final.

| Dimensión | Base |
|---|---|
| D1 Diagnosticar | Frontera, artefacto y evidencia del diagnóstico sellado |
| D2 Explicar y decidir | Causa, elección y límite expresados al cierre |
| D3 Intervenir | Estado entregado, B/Q/C y procedencia de acciones; aplicar la rúbrica específica |
| D4 Verificar y delimitar | Pruebas realmente elegidas e interpretadas, benignas/adversas y contraste con límites |

Niveles 0–3 ordinales y NE, con anclas completas en cada ficha. Corrección conceptual humana con evidencias citadas; segunda corrección/adjudicación durante pilotaje. **No total, porcentaje de saber, aprobado universal ni calificación definitiva por LLM.** A3 puede conseguir un estado correcto sin demostrar comprensión autónoma.

A1 común literal: «Puedes abrir el expediente, guardar una configuración y elegir una prueba. El resultado indica qué ocurrió con esa configuración. La interfaz no decide por ti si es seguro». A2/A3 se muestran solo a petición con aviso y congelación previa; sus textos están en cada ficha. No hay penalización universal por ayuda; informar perfil por segmento. Las adaptaciones no resolutivas no se convierten en pista.

Informe mínimo: estudiante seudonimizado × caso × variante/revisión × dimensión × ayuda; evidencia citada, B/Q/C desglosados, recursos, orden, exposiciones, incidencias, evaluador/rúbrica, incertidumbre y necesidad educativa. Los datos de interfaz no son diagnóstico clínico ni competencia profesional.

## 5. Seguridad, fidelidad y validez

AES-GCM y consultas SQLite se comprueban sobre datos inertes; no sustituir sus resultados por un botón que devuelve éxito por ID. Repositorio, permisos, carga de archivos y reconstrucción tipada son modelos acotados, no servidores de producción, parser universal, shell ni exploit. Los intérpretes de NubeAndina solo modifican estado ficticio.

El cliente puede ser inspeccionado: hashes y manifiestos no crean arbitraje independiente ni secreto de la clave docente. Mantener soluciones separadas de la vista ordinaria es higiene pedagógica, no protección criptográfica frente al dueño del navegador.

Las formas B requieren generar y verificar materiales antes de publicación y estudiar equivalencia; no están calibradas. Tras A3 o debriefing, una variante mide actuación posterior a enseñanza/exposición. Continúan pendientes revisión especializada, entrevistas sobre interpretación, acuerdo de puntuación, pilotaje y alcance institucional. **La investigación justifica decisiones revisables; no demuestra que esta combinación sea perfecta u óptima.**

## 6. Cierre narrativo sin sobreinterpretar el resultado

Después de congelar la entrega y recoger la explicación, mostrar una consecuencia ficticia sustentada por B/Q/C, manteniendo el componente gamificado del compañero. Si B y Q son verdaderos: continuidad y barreras verificadas en esa batería; si solo Q, la operación legítima quedó interrumpida; si Q es falso, la exposición representada persiste; C informa el límite adicional observado. No mostrar «domina ciberseguridad» ni afirmar cierre de un incidente real.

| Caso | Consecuencia representada al cerrar |
|---|---|
| AndinaPay | La aplicación recupera lectura/alta bajo custodia nueva o sigue limitada; la copia histórica comprometida permanece legible con K1 |
| BibliotecaViva | El estudiante legítimo conserva su historial y la entrada manipulada no altera la consulta, o se muestra el incumplimiento concreto |
| TalentoAndino | Reclutamiento conserva CV/foto y LG01; tipos peligrosos/legado quedan sin entrega, o se muestra la exposición y su momento |
| AndeanLogix | Operaciones conserva sus funciones y actores sin permiso no modifican envíos/credenciales, o se muestra qué ruta continúa expuesta |
| NubeAndina | El organizador retoma datos válidos sin aceptar tipos/autoridad del cliente, o la traza muestra los efectos previos/parciales |

La animación o mensaje no sustituye el perfil D1–D4. Un desenlace favorable obtenido con A3 conserva la condición asistida. Con resultados técnicos incompletos, mostrar «resultado no comprobado» en los criterios afectados, no fabricar éxito o fracaso narrativo.
