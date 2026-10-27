# Investigación para sustituir los ejercicios — revisión 2.0

**Resultado:** cinco fichas derivadas del compañero, conservando el núcleo del marco y completando observables, estado, recursos, ayudas, rúbricas, escenarios y pruebas discriminantes. No se pretende haber hallado una configuración perfecta ni validado conocimientos de personas. Fecha de trabajo:26-10-2026.

## 1. Delimitación, método y procedencia

Problema: ¿qué observa cada tarea sobre diagnóstico, explicación, intervención y verificación, y qué rival impide interpretarlo como conocimiento? CyberSim es instrumento, no la contribución científica por sí mismo.

Se aplicó el ciclo de `workspace/Investigación`, particularmente «Marco de trabajo para investigar e innovar» e «Hipótesis, predicciones y pruebas discriminantes»: delimitar→examinar originales→formular rivales→predecir diferencia observable→comprobar cuando proceda→revisar→acotar inferencia. Estos pasos quedan explicitados aquí y en memos para no depender de documentos ignorados.

Fuente inicial preservada íntegramente [aquí](fuentes/escenarios-companero.md). Se adoptan sus cinco historias, no los anteriores cuatro ejercicios. Los anteriores resultados lógicos no son evidencia para este conjunto. Los registros F/G del marco conservan fundamento metodológico reutilizable, con sus advertencias de alcance histórico.

No revisión sistemática: sin protocolo exhaustivo de bases, búsqueda completa ni metaanálisis nuevo. Se priorizaron originales abiertos de conferencias/revistas, PDFs de autores/repositorios institucionales y documentación oficial para mecanismos. No tratar guías OWASP/NIST como ensayos de aprendizaje ni la versión arXiv como revisada por pares. Las tablas de cada memo registran consultas, secciones leídas, fallos de acceso y límites.

## 2. Iteraciones progresivas documentadas

Son **17 revisiones de diseño**, agrupadas por unidad, no 17 estudios, ni una cadena temporal global ficticia. Cada unidad hereda sus decisiones y busca un refutador nuevo; AP/BV/AL se trabajaron en paralelo.

| Ciclos | Progresión y revisión | Registro |
|---|---|---|
| AP-I1–I3, tres | Localizar literal/historia → alcance de copias y registros → custodia, rotación/recifrado y comprobación de continuidad; conservar incertidumbre de fuga | [AndinaPay](investigacion/321-andinapay.md) |
| B89-I1–I5, cinco | Texto≠dato seguro → rival listas/ORM → identidad/privilegios → semántica exacta de búsqueda → oráculo corrige expectativa redes/paginación | [BibliotecaViva](investigacion/89-bibliotecaviva.md) |
| A306-I1–I3, tres | Login≠guard → matriz de roles/efectos → red/mantenimiento y estado no mutado ante rechazo | [AndeanLogix](investigacion/306-andeanlogix.md) |
| TA-I1–I3, tres | Admisión≠ejecución → formato/actividad/nombre e inventario → exposición antes del resultado final | [TalentoAndino](investigacion/434-talentoandino.md) |
| NA-I1–I3, tres | Ruta de reconstrucción y efectos → MAC/esquema/autoridad → dependencia alcanzable y publicación parcial | [NubeAndina](investigacion/502-nubeandina.md) |

### Revisión de integración posterior

1. TA-P0 era ambiguo si almacenamiento privado/handler impedían servir todo pendiente. Se precisó que P0 **promueve provisionalmente admitted**, habilitando al dueño incluso con handler privado; así C observa una diferencia real y no atribuye a P1 una propiedad ya garantizada por otra barrera.
2. El contexto confiable de NA no cambia desde el payload: separar principal de sessionOwner. La reconstrucción vulnerable copia owner/role al estado de sesión, no autentica al cliente. S07 es JSON válido pero demasiado grande, no error de parser.
3. B89 usa SQLite sin GRANT nativo: cuenta/permisos pertenecen al adaptador authorizer; futuro WASM/Worker debe probarse por separado del oráculo Python.
4. A0 conserva la consulta segura proporcionada por el compañero, y feedback inmediato conserva hechos sin enseñar la corrección. No reclamar descubrimiento sin recursos.
5. La regla ignore impediría versionar el handoff pedido: plan canónico fuera de workspace y espejo temporal idéntico, sin modificar Gitignore.

6. Mapa transversal final identificó tres contradicciones: reset con otra identidad, entrega AP mezclada con explicación y rechazo general sin efectos pese a NA vulnerable. Se alineó reset como revisión del mismo intento; AP separa submit_artifact/submit_report; el rechazo del adaptador, del sistema vulnerable y de la corrección suficiente son categorías distintas. Son correcciones de coherencia, no nuevos estudios ni ciclos científicos inventados.

## 3. Argumento y evidencia por decisión

| Decisión local | Apoyo externo original | Lo que no autoriza inferir |
|---|---|---|
| Evidencia→tarea→rúbrica y perfil | Mislevy, Steinberg y Almond2003, [CSE597](https://cresst.org/wp-content/uploads/TR597.pdf); Kane2013, [validez de interpretaciones/usos](https://doi.org/10.1111/jedm.12000) | Que D1–D4 sean factores calibrados o medir todo el conocimiento |
| Rúbricas específicas y juicio humano | Jönsson/Svingby2007, [revisión](https://doi.org/10.1016/j.edurev.2007.05.002); fuentes F del marco | Acuerdo real entre nuestros evaluadores sin medirlo |
| Fuente/historia y claves comprometidas | Meli etal NDSS2019; Krause etal USENIX2023; Lim etal PoPETs2024; Neil etal CCS2025, originales enlazados en AP | Que frecuencia de secretos mida conocimiento o que rotación borre copias ajenas |
| Estructura de consulta y función legítima | Su/Wassermann POPL2006; Halfond/Orso ICSEdemo2006; SQLBlock ASIACCS2020, originales en BV | Seguridad universal del ORM, filtros o exactitud del simulador por citar papers |
| Archivo admitido, almacenado y servido | FUSE NDSS2020; URadar TIFS2024; FUEL DIMVA2024, pasajes consultados en preprint de autor, en TA | Parser universal, carrera real probada ni eficacia educativa |
| Identidades, funciones y efectos | Rennhard etal2022; A2CT ICISSP2025; preprint Xiang etal2025, en AL | Login suficiente, port seguro o model checking igual a producción |
| Tipos/entrada/camino y reconstrucción | Kreyßig/Bartel EASE2024; FLASH USENIX2025, en NA | Que JSON ejecute código nativamente o biblioteca vieja pruebe CVE |

Fuentes metodológicas se reutilizan de lectura previa; no se presentan como búsqueda nueva integral. Al reanudar se comprobaron los metadatos/resumen de [FUEL publicado, DIMVA2024](https://link.springer.com/chapter/10.1007/978-3-031-64171-8_11) y se distinguieron de la copia arXiv leída; no se afirma identidad de versiones. Se reabrió la [página oficial de FLASH](https://www.usenix.org/conference/usenixsecurity25/presentation/zhang-yiheng) para confirmar autoría/venue y la [versión FUEL arXiv](https://arxiv.org/abs/2405.16619), que advierte no haber incorporado revisión/correcciones de la versión publicada. La URL de catálogo CRESST «on-the-structure-of-educational-assessments» no fue accesible en ese control; se mantiene el PDF original ya utilizado, no se inventa recuperación de esa página.

## 4. Rivales y predicciones discriminantes

| Rival | Predicción que lo debilita en el diseño |
|---|---|
| Acierto por menú o nombre del parche | D1 sellado antes del menú; explicación con evidencia; verificación por efectos y dos rutas válidas donde corresponda |
| Bloquear todo equivale a asegurar | Falla B aunque no se observe ataque |
| Eliminar clave del último commit basta | Copia histórica sigue descifrable; operación nueva usa K2 y datos afectados se migran |
| Parametrizar un campo o fijar alumno basta | Ataque por author; principal S102 revela hardcode |
| Carpeta privada o extensión bastan | Perfil activo/firma engañosa, legado y consulta antes de resolver análisis |
| Pantalla login/puerto bastan | Petición directa, rol distinto, red interna y maintenance |
| MAC o actualización solos bastan | MAC válido con hijo activo; versión nueva conserva entrada insegura |
| Final limpio demuestra no haber efecto | TA-C1 o NA-C1 observa exposición/cambio antes de cierre |
| Terminó solo porque entendió | Informe separado de ayuda, exposición y pruebas elegidas; juicio conceptual no sale de terminado |

Estas son hipótesis de diseño y verificaciones de consistencia, **no evidencia de que alumnos reales distingan esas situaciones**. Resultados de cálculo y límites completos en [verificación](verificacion-especificaciones.md).

## 5. Brechas del compañero cerradas y aún abiertas

Cerradas documentalmente: estado/fixtures reproducibles; actor y autoridad; mecanismos/diffs/alternativas; fases/escenario; A0 y ayudas literales; B/Q/C; rúbrica completa con anclas; reportes, reset/errores, variante y plan de implementación. Narrativas no se convierten en certezas forenses.

Abiertas por requerir evidencia externa: población/uso/ética; comprensión efectiva de consignas, accesibilidad y tiempos; acuerdo entre jueces; equivalencia de formas; generalización/estabilidad; efectos educativos; validación del runtime que aún no existe. Tamaños de archivo, número de fixtures y forma de interfaz son elecciones locales razonadas, no óptimos empíricamente demostrados.

La solución de vanguardia no consiste en añadir IA o un exploit más complejo por novedad: se incorpora investigación reciente sobre mecanismos y se elige la representación mínima que permite refutar una interpretación equivocada sin ampliar riesgos. Si pilotaje contradice el diseño, revisar ficha/rúbrica con evidencia y conservar su versión anterior.

## 6. Participación de IA y trazabilidad

Autoría/síntesis asistida por IA; tres unidades documentales independientes con handoff y comprobación del padre, dos unidades y coherencia transversal trabajadas por el padre. Las revisiones no son tres investigadores humanos ni réplica independiente. No se dispone de costo monetario total, tiempo humano o consumo de tokens verificables; no inventarlos. Las fuentes y cálculos se pueden inspeccionar, pero errores de interpretación siguen siendo posibles.

No implementación en esta etapa. El [plan](plan-implementacion.md) conserva las tareas futuras con aceptación y dependencias, y el marco mantiene el protocolo de revisión/pilotaje antes de inferencias educativas.
