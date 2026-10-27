# Investigación de TalentoAndino

Unidad T8d, S9 y núcleo del marco. Caso fuente preservado en [snapshot](../fuentes/escenarios-companero.md). Producto: [especificación completa](../cwe-434-talentoandino.md). No se implementó motor, parser, carga HTTP, malware ni estudio humano.

## Pregunta y alternativas antes de las pruebas

No estaba definido qué archivos, reglas y evidencias harían distinguible reconocer una etiqueta de comprender la frontera cliente–servidor–almacenamiento–uso. Se contrastan validación por nombre/MIME/firma frente a política de contenido representada; arreglo de cargas nuevas frente a contención del inventario; comprobar resultado final frente a observar un pendiente accesible. La alternativa menos compleja sigue siendo una batería base: el contraste solo se mantiene si aporta una diferencia lógica pertinente, no por producir más telemetría.

La prueba factible es de escritorio sobre catálogo inerte. Antes de ejecutarla se fijan entradas T01–T13, estados LG01–LG03, política y B/Q/C. Si no aparecen contraejemplos a los controles insuficientes, se revisará la semántica o el test; no se invocará dificultad/validez estudiantil inexistente.

## Ciclos progresivos de investigación

| Ciclo | Pregunta y consulta real | Evidencia y cambio acumulativo | Límite |
|---|---|---|---|
| TA-I1 | ¿Aceptar y ejecutar describen lo mismo? `Uradar Discovering Unrestricted File Upload Vulnerabilities via Adaptive Dynamic Testing 2024 paper pdf`; búsqueda UFuzzer RAID2021 | TA-R1/TA-R2 distinguen admisión y uso posterior. Se incorporan petición directa, recuperación y evidencia del marcador; no se atribuye toda ralentización a cargas | Mecanismos PHP de los artículos no validan este simulador ni su rúbrica |
| TA-I2 | ¿Un archivo estructuralmente válido o renombrado puede seguir siendo peligroso? `Bringing UFUs Back FUEL 2024 file upload valid images metadata path traversal`; lectura §3.2 FUEL | TA-R3 añade T04/T05, nombre interno para T08 e inventario existente. Se retira la idea de una firma o parser infalible | El analizador del caso conoce solo fixtures; no prometer inspección completa de PDF/JPEG |
| TA-I3 | ¿Una corrección final oculta exposición temporal? `"FUEL" file upload filename traversal "race" 2024 Neef Oudeh`; `"file upload" "quarantine" "race condition" scientific paper`; revisión URadar §V | S14 de FUEL y límites de URadar motivan recibir→pending→recuperar antes de resolver. Se separa Q de batería final y C de intercalación, sin equiparar un retardo de reloj con protección | No se ejecutó una carrera real ni se mide resistencia concurrente |

La interfaz con fragmentos expone una demanda de aplicación con documentación, no programación libre ni recuerdo sin ayudas. D1 se solicita antes del menú; el recurso de código inicial del compañero permanece visible y su potencial de orientar la respuesta se declara. El feedback inmediato solo informa hechos observados; enseñar un procedimiento se etiqueta A3.

## Originales y acceso efectivamente obtenido

| ID | Referencia y acceso | Uso y límite |
|---|---|---|
| TA-R1 | Lee, T. et al. (2020), *FUSE: Finding File Upload Bugs via Penetration Testing*, NDSS, DOI 10.14722/ndss.2020.23126. [Original de actas](https://www.ndss-symposium.org/ndss-paper/fuse-finding-file-upload-bugs-via-penetration-testing/). Resumen original y antecedentes consultados | Diferenciar admisión/ejecución; no extrapolar resultados del detector a aprendizaje |
| TA-R2 | Chen, Y. et al. (2024), *URadar*, IEEE TIFS19,1251–1266, DOI10.1109/TIFS.2023.3335885. [PDF institucional](https://nesa.zju.edu.cn/download/URadar_Discovering_Unrestricted_File_Upload_Vulnerabilities_via_Adaptive_Dynamic_Testing.pdf). Texto disponible; abstract y §V Limitations examinados | Interacción entre restricciones y comprobaciones; señala dificultades de contención temporal/lógica. Publicación en línea2023, volumen2024, no confundir con fecha del depósito |
| TA-R3 | Neef, S. y Oudeh, M. (2024), *Bringing UFUs Back into the Air With FUEL*. [PDF de autores arXiv v1](https://arxiv.org/pdf/2405.16619), §3.2 escenarios S9–S14 y discusión; pasajes leídos. [Registro publicado DIMVA2024](https://link.springer.com/chapter/10.1007/978-3-031-64171-8_11), pp207–226, DOI10.1007/978-3-031-64171-8_11, metadatos/resumen comprobados | La copia leída advierte no incorporar revisión/correcciones posteriores; no afirmar identidad textual con la versión publicada. Benchmark de scanners, no medición educativa |
| TA-R4 | OWASP, [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), Filename Safety/Storage/Upload Limits. Guía original consultada | Recomendaciones técnicas complementarias, no estudio empírico ni justificación de límites numéricos del caso |

Acceso fallido: HTML arXiv2405.16619v1 devolvió UnexpectedStatusCode; el PDF original fue recuperado. UFuzzer se localizó en registro institucional y DBLP, con resumen original; no se extrajeron resultados nuevos ni se contó como una validación adicional. La búsqueda de cuarentena encontró también notas comerciales: se excluyeron como soporte científico central.

Control al reanudar,26-10-2026: se verificaron ficha arXiv y registro editorial DIMVA. Se releyó S14 en el PDF: observa acceso antes de que termine análisis posterior, no prescribe una máquina de estados para CyberSim. La admisión provisional P0, el handle temporal y la prueba con handler privado son operacionalización local de ese rival. No se ejecutó el laboratorio FUEL ni una carrera real.

## Decisiones y confianza acotada

- Alta para la distinción lógica entre dato declarado, contenido y uso en el modelo; no una tasa de prevalencia.
- Propuesta defendible: muestras benignas/adversas por campo y variantes de nombre/estructura para observar decisiones. Su capacidad de discriminar estudiantes es desconocida.
- Límites5/2MiB, catálogo, nombres y orden de interfaz son decisiones explícitas del diseño, no valores óptimos publicados.
- No se justifica afirmar que subir un archivo siempre lo ejecuta, que falta de alertas excluye intrusión, que borrar todo sea contención suficiente o que aprobar Q descarte una ventana temporal.
- Persisten incertidumbres humanas: comprensión, barreras, dificultad y acuerdo de rúbricas. No bloquean construir un prototipo para obtener evidencia; sí limitan usos de sus puntuaciones.

## Comprobaciones

En esta unidad se realiza revisión documental de política/fixtures/verificadores. Los resultados de una traducción de escritorio, si se ejecuta, se añadirán en la [verificación del conjunto](../verificacion-especificaciones.md), separados de los casos históricos del conjunto1.0. No se presentará una batería diseñada como ejecución ya observada de CyberSim.
