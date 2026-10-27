# Investigación de AndinaPay/CWE-321

Estado: conjunto 2.0 propuesto, investigación y diseño; **sin implementación ni participantes**. Fecha de consulta: 2026-10-26. Especificación resultante: [AndinaPay](../cwe-321-andinapay.md); procedencia: [snapshot del compañero](../fuentes/escenarios-companero.md), sección CWE-321. Se conserva la intención del fuente y se identifican ampliaciones de autoría; no se atribuye al compañero la validación de los nuevos criterios.

## Formalización y protocolo local

Pregunta: ¿qué evidencia acotada permite distinguir reconocer una clave histórica, explicar su impacto, recuperar custodia/datos y verificar continuidad, de simplemente acertar una opción o cambiar un nombre de clave?

No conocemos la dificultad, discriminación, equidad ni interpretación de estas tareas en la población objetivo. La contribución actual es una especificación verificable y un plan de observación D1–D4, no una estimación de cuánto saben estudiantes reales. Población institucional, muestra, responsables y uso académico permanecen pendientes.

Método adaptado de `workspace/Investigación/Descubrimiento e innovación/Marco de trabajo para investigar e innovar.md` (etapas 1–7), `Plantilla de proyecto de investigación.md` (pregunta, alternativas, prueba mínima y registro de iteraciones) y `Registro de afirmaciones y confianza.md`. Son metodología local propuesta, no un paquete validado. Se documentan búsquedas, acceso real, cambio de decisión y refutadores. Los ciclos siguientes ocurrieron en orden: primero se examinó historia/causalidad, luego el vacío de recuperación y finalmente las barreras/herramientas. No son tres experimentos humanos.

Alternativas iniciales: H1, basta hallar un literal; H2, exigir relación entre artefactos y transformación comprobable; H3, una herramienta real de gestión es necesaria para autenticidad. La prueba mínima documental compara sus predicciones con originales y con casos negativos públicos, sin acceso a secretos actuales. Cambiaríamos una decisión si el supuesto no explica un contraejemplo o añade una destreza no requerida.

## Ciclo AP-I1: del literal encontrado a evidencia causal

**Pregunta y expectativa previa:** ¿hallar una cadena en HEAD demuestra CWE-321 y permite inferir exposición? H1 predice que borrar esa cadena resuelve el caso; H2 predice que el historial y uso siguen importando y que una cadena candidata necesita relación con ciphertext.

**Búsquedas realizadas:** `Meli McNiece Reaves How Bad Can It Git Characterizing Secret Leakage Public GitHub NDSS 2019 original`; `site.ndss-symposium.org "How Bad Can It Git"`; `site.usenix.org "Pushed by Accident"`. Se abrió el PDF de NDSS y el original USENIX, no solo resultados de buscador.

**Evidencia:** [AP-R1, Meli et al.](https://www.ndss-symposium.org/wp-content/uploads/2019/02/ndss2019_04B-3_Meli_paper.pdf), §§III–V y V-E, estudia exposición persistente y detección conservadora. [AP-R2, Krause et al.](https://www.usenix.org/system/files/usenixsecurity23-krause.pdf), §§4.4 y 5.3, distingue quitar secretos de código, limpiar historial y renovar/revocar; describe incertidumbre al estimar consecuencias. No son evaluaciones educativas de AndinaPay.

**Revisión:** se descarta H1 como criterio suficiente. HEAD ya no contiene literal, pero el historial y una copia de datos sí permiten comprobar la relación. Se agrega R03 cifrado con una clave independiente y un ID público no secreto. No se exige identificar el vector de extracción del volcado: no está observado. La falta de alertas no demuestra ausencia de intrusión.

**Qué se conserva:** repositorio histórico, hallazgo y PoC controlada del compañero. **Próxima pregunta:** ¿cómo cerrar recuperación sin premiar una rotación cosmética ni pérdida de datos? **Resultado:** propuesta causal más discriminante, no validada con población. Recursos: búsqueda documental y lectura de pasajes; no se registró tiempo cronometrado ni coste monetario.

## Ciclo AP-I2: de “rotar” a custodiar, migrar y reconocer copias residuales

**Pregunta:** ¿cambiar KEY_ID basta? Alternativa A: reemplazar clave para escrituras; B: migrar ciphertext, verificar lectura y retirar clave operativa; C: introducir cifrado actualizable avanzado. A dejaría R01/R02 antiguos recuperables con K1 o inaccesibles si se retira antes de migrar. B predice una copia actual distinta sin eliminar la exposición de copias históricas. C añade complejidad no exigida al alumno.

**Nuevas búsquedas:** `QUICKeR Quicker Updates Involving Continuous Key Rotation 2024 paper pdf key leakage ciphertext compromised old keys`; `secret leakage rotation GitHub empirical study 2024 2025 papers cryptographic keys remediation`; consulta original NIST SP 800-57 Parte 1 Rev.5.

**Evidencia:** [AP-R3, Lim et al., PoPETs 2024](https://petsymposium.org/popets/2024/popets-2024-0005.pdf), introducción pp.58–59, separa rotación y actualización del ciphertext y estudia costes/interacción con accesos. [AP-N1, NIST](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf), §§5.5 y 9.5.4, trata recuperación, inventario y sustitución tras compromiso. NIST es recomendación normativa, no paper experimental ni prueba de la rúbrica.

**Revisión:** se selecciona B para el modelo pequeño: staging de dos filas, readback, publicación conjunta, retiro del uso operativo y preservación de evidencia. Se rechaza adoptar QUICKeR como infraestructura: demostraría otra competencia y no hay necesidad de concurrencia distribuida en esta tarea. Se incorpora el contraste obligatorio “copia vieja + clave vieja aún descifra”: no se premia prometer borrado retroactivo de conocimiento adversario.

**Prueba discriminante de autoría:** generación real de envelopes AES-GCM públicos, roundtrip y claves incorrectas. Confirma hechos criptográficos del fixture, no la orquestación de una recuperación implementada. **Qué se conserva:** remediación integral. **Próxima pregunta:** ¿la elección de herramienta o el escáner puede reemplazar la comprensión y añadir barreras? **Resultado:** configuración de diseño revisada, límites operativos explícitos. Sin estimación de eficacia causal o rendimiento de producción.

## Ciclo AP-I3: de herramienta “segura” a mecanismo observable y prevención revisable

**Pregunta:** ¿usar un gestor real y activar escáner hacen el ejercicio más válido? Alternativas: gestor comercial obligatorio; abstracción explícita con custodia/uso verificables; casilla “seguro” sin mecanismo. Predicción: la primera puede introducir barreras de herramienta; la tercera permite acierto sin demostrar el proceso. La segunda requiere pruebas de acceso, escritor y datos, no solo nombres.

**Nuevas búsquedas:** `"It Should Be Easy but" "Secret Management" paper`; `site.usenix.org secret scanning warnings false positives developers Rahman 2022`; búsquedas sobre claves hard-coded y detección actuales. Se abrieron PDF de autores CCS25, artículo original de Rahman y referencias oficiales MITRE/OWASP.

**Evidencia:** [AP-R4, Neil et al., CCS 2025](https://bradreaves.net/publication/nmw%2B25/nmw%2B25.pdf), §3 y resultados, observa barreras de documentación/interfaz en tareas de gestión con 21 usuarios nuevos. [AP-R5, Rahman et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC8928718/), resultados y recomendaciones, documenta motivos de bypass y revisión secundaria. No justifican una cifra local de dificultad ni que todo gestor sea inusable.

**Revisión:** no instalar ni evaluar Vault/Infisical. Dos custodias controladas (servicio restringido o archivo runtime restringido) son admisibles bajo iguales propiedades locales, con costes/límites explícitos. Prevención incluye cambio con secreto detectable, ID público benigno y revisión de excepciones: no una tasa de detección universal. Ayudas de interfaz son separadas de pistas causales A2 y procedimiento A3. Explicación/diagnóstico se recoge antes de presentar controles resolutivos; no se exige acertar para continuar.

**Qué se conserva:** feedback gradual y prevención del compañero. **Lo descartado:** “gestor = seguro”, “escáner = cero filtraciones” y “menos tiempo = más conocimiento”. **Próxima prueba:** revisión experta de causalidad y proceso de respuesta con población objetivo cuando exista autorización; no reclutar ahora. **Resultado:** diseño delimitado más observable, sin optimalidad ni validez empírica demostrada.

## Fuentes originales, versiones, acceso y transferencia

Cada registro distingue qué apoya de lo que no demuestra. La recuperación de una publicación no constituye auditoría exhaustiva de correcciones o retractaciones; no se verificaron todas las citas hacia delante ni se reprodujeron datasets de terceros.

| ID | Referencia original y acceso real | Pasaje / aporte acotado | Límite |
|---|---|---|---|
| AP-R1 | Meli, McNiece y Reaves (NDSS2019), [DOI 10.14722/ndss.2019.23418](https://doi.org/10.14722/ndss.2019.23418), [PDF completo](https://www.ndss-symposium.org/wp-content/uploads/2019/02/ndss2019_04B-3_Meli_paper.pdf) | §§III–V, V-E: medición de exposición y persistencia en repositorios públicos | Plataformas/formatos y ventana históricos; no prevalencia actual ni prueba del caso local |
| AP-R2 | Krause et al. (USENIX Security2023), [publicación](https://www.usenix.org/conference/usenixsecurity23/presentation/krause), [PDF completo](https://www.usenix.org/system/files/usenixsecurity23-krause.pdf), pp.2527–2544 | §§3,4.4,5.3: encuesta/entrevistas, estrategias y dificultades de remediación | Autoinforme/muestra seleccionada; API keys y otros secretos no equivalen en todo a claves de cifrado |
| AP-R3 | Lim et al. (PoPETs2024(1),58–73), [DOI 10.56553/popets-2024-0005](https://doi.org/10.56553/popets-2024-0005), [PDF completo](https://petsymposium.org/popets/2024/popets-2024-0005.pdf) | Introducción y diseño/evaluación: actualización de claves y ciphertext, costes de coordinación | Sistema avanzado no implementado/adoptado; no demuestra que rotación borre copias ya exfiltradas |
| AP-R4 | Neil et al. (CCS2025,2519–2533), [DOI 10.1145/3719027.3765065](https://doi.org/10.1145/3719027.3765065), [PDF de autores completo](https://bradreaves.net/publication/nmw%2B25/nmw%2B25.pdf) | §3 y resultados: observación de gestión de secretos y barreras de herramienta | Estudio cualitativo con 21 estudiantes máster CS, tareas de herramientas específicas; no efecto universal ni datos de CyberSim |
| AP-R5 | Rahman et al. (Empirical Software Engineering2022,27:59), [DOI 10.1007/s10664-021-10109-y](https://doi.org/10.1007/s10664-021-10109-y), [texto completo](https://pmc.ncbi.nlm.nih.gov/articles/PMC8928718/) | Resultados y recomendaciones: por qué se omiten alertas y revisión secundaria | Un caso industrial; no estimar precisión de nuestro escáner ni afirmar tasa actual |
| AP-N1 | Barker, NIST SP800-57pt1r5 (2020), [PDF completo](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf) | §§5.5,9.5.4: inventario/recuperación/compromiso | Norma/recomendación, no ensayo educativo; sin fijar criptoperiodo local universal |
| AP-N2 | MITRE [CWE-321](https://cwe.mitre.org/data/definitions/321.html), entrada web consultada 2026-10-26 | Definición y relación causal de clave hard-coded | Taxonomía, no evidencia de que esta tarea mida comprensión |
| AP-N3 | NIST [SP800-38D](https://csrc.nist.gov/pubs/sp/800/38/d/final), ficha final 2007 y avisos de revisión consultados | Identifica GCM/GMAC y especificación de referencia del fixture | No se afirma revisión normativa exhaustiva ni elección óptima de plataforma |
| AP-N4 | OWASP [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), web viva consultada 2026-10-26 | Custodia y ciclo de vida como guía complementaria | Guía profesional, no paper ni experimento |

El preprint extendido [arXiv:2509.09036](https://arxiv.org/abs/2509.09036) corresponde a AP-R4; se verificó identidad con publicación CCS25 y se usó su PDF de autores, no se contó como otro estudio independiente. La página de autor muestra una fecha de ficha de noviembre2025 y el PDF identifica CCS de octubre2025: se cita año y proceedings sin inventar una fecha única de aparición.

## Exclusiones, fallos de acceso y ausencia de justificación

- La primera URL `dev.ndss-symposium.org/...Meli_paper.pdf` devolvió 502 al abrirse; se recuperó el PDF completo desde `www.ndss-symposium.org`. No se fingió acceso al enlace fallido.
- Informes comerciales GitGuardian/GitHub aparecieron en búsqueda; no se usaron como prueba científica ni para declarar prevalencia actual de CWE-321.
- Trabajos sobre side-channels, criptografía poscuántica y asignación jerárquica de claves no responden al mecanismo del caso; excluidos del diseño.
- No se justificó que una herramienta real sea indispensable, que toda clave antigua sea revocable frente a quien la copió, que limpiar HEAD cierre un incidente, ni que los cinco estudios validen nuestra rúbrica.
- No se ejecutaron scripts de repositorios externos, se consultaron secretos reales, se usaron credenciales de servicios ni se accedió al supuesto foro del relato.

## Comprobaciones realmente ejecutadas y límites

En herramientas de autoría, PowerShell 7.6.5/.NET `AesGcm`, sin escribir código de aplicación, se generaron los siete envelopes de la [ficha](../cwe-321-andinapay.md#5-fixtures-criptográficos-públicos-y-reproducibles). Claves, plaintexts, IV, AAD, ciphertext y tags están publicados allí. Las entradas de texto se codificaron UTF-8 sin BOM/salto. Se verificó roundtrip exacto de R01/K1, R02/K1, R03/KI, R04/K1 y R01/K2, R02/K2, R04/K2. Negativos observados: R01 con K2 en vez de K1; R01 con primer byte del tag alterado; R03 con K1; las tres filas K2 con K1. Todos rechazaron autenticación. Se desechó cualquier buffer de salida cuando falló autenticación. La cuarta fila K1 se añadió al advertir en readback que B2 inicial también necesitaba un oráculo; se aisló su efecto para que no cambie el conjunto que se migra.

La generación usó números públicos de laboratorio, no aleatoriedad productiva ni datos personales. IV distintos para cada fila bajo la misma clave. Los valores fijos sirven para reproducir material estático, no cifrar mensajes de producción. AAD de tablas Markdown usa escape visual `\|`: los bytes originales contienen solo `|`.

Estas pruebas **no ejecutaron** un gestor de claves, migrador, permisos, escáner, reset, aplicación web ni WebCrypto. Los B/Q/C de la ficha son criterios futuros, no checks de software ya aprobados. No se ha medido latencia ni acuerdo entre correctores; tampoco se ha contrastado dificultad de variante isomórfica. No corresponde RED/GREEN de aplicación a esta documentación pasiva.

Próxima prueba que podría cambiar la propuesta: verificar interoperabilidad de envelopes con el runtime elegido y todas las transiciones rechazadas; luego comprobar con revisión de contenido y estudiantes autorizados si el diagnóstico diferencia mecanismo de reconocimiento. Si las claves públicas o las opciones de intervención revelan la respuesta antes del diagnóstico, reducir exposición y revisar las inferencias, no declarar “validado” por seguir un protocolo.
