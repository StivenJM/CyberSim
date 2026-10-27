# AndinaPay: una clave expuesta no se corrige cambiando el algoritmo

**Especificación del conjunto 2.0, propuesta definida, no implementada ni validada con estudiantes.** Slug propuesto: `andinapay-clave-expuesta`; no se reserva un ID numérico del catálogo. Objetivo: obtener evidencia D1–D4 sobre diagnóstico, explicación, intervención y verificación de una clave criptográfica histórica expuesta. No medir competencia profesional integral ni porcentaje de conocimientos de ciberseguridad.

Entradas canónicas: [fuente íntegra del compañero](fuentes/escenarios-companero.md), sección CWE-321, líneas 1–54; [marco común](../marco-evaluacion-ciberseguridad.md); [investigación y comprobaciones de autoría](investigacion/321-andinapay.md). Las precisiones, fixtures, operaciones, ayudas y criterios siguientes son **decisiones de diseño añadidas**, no una aprobación adicional atribuida al compañero.

## 1. Narrativa conservada y precisiones necesarias

AndinaPay sigue siendo la fintech quiteña de doce personas del planteamiento original: datos de documento y token de tarjeta cifrados, aviso de volcado legible, revisión apresurada para una demo y repositorio con historial. El estudiante actúa como analista de respuesta y dispone de una jornada narrativa para explicar el descifrado, delimitar exposición y contener el incidente. El fuente se conserva sin reescritura en su snapshot; esta ficha operacionaliza sus ambigüedades:

- «Registros reales» significa registros **realmente cifrados de un dataset enteramente sintético**, nunca cédulas, tarjetas, personas ni secretos reales. Los documentos `SYN-001` y tokens `tok_demo_A` no son credenciales utilizables.
- El aviso inicial trae un fragmento legible y un volcado cifrado adjunto; no afirmar que un mismo archivo es simultáneamente texto plano y cifrado. La prueba local comprobará si la clave histórica explica ese fragmento.
- Ausencia de alertas o de accesos anómalos en los logs disponibles no demuestra ausencia de intrusión. El vector de adquisición del volcado y quién utilizó la clave siguen **no determinados**.
- Un algoritmo robusto no compensa una clave conocida. El ejercicio no pretende romper AES ni reconstruir un ataque real contra producción.
- Se conserva la relación investigación → hallazgo → prueba → intervención, pero el acceso al historial, inventario y logs es libre. No exigir una secuencia única de clics.
- «Una jornada» no introduce cronómetro penalizador. Se registran duración y pausas como condiciones, no como puntos de conocimiento.

### Consigna visible al estudiante

> Investiga el aviso recibido por AndinaPay usando únicamente los materiales de esta computadora simulada. Conserva un expediente de evidencias. Explica qué puede demostrarse sobre el texto legible y los registros afectados, y qué sigue sin saberse. Antes de abrir el panel de intervención, entrega un diagnóstico provisional y una predicción comprobable. Después configura una respuesta al incidente, comprueba que los datos legítimos siguen disponibles y redacta un informe para gerencia. No utilices sistemas externos ni datos personales reales. Puedes consultar los artefactos en cualquier orden y pedir ayuda; se registrará cuándo y qué contenido recibiste.

La consigna no nombra el archivo ni la clave que resuelven el caso. Título y CWE son metadatos docentes: en administración diagnóstica, mostrar al alumno «AndinaPay — expediente de datos» hasta el cierre para no entregar la causa como pista.

## 2. Afirmaciones, evidencia y explicaciones rivales

Población candidata: estudiantes con fundamentos de cifrado simétrico, repositorios e integridad; población institucional y uso académico definitivos siguen pendientes. Una familiarización neutral enseña abrir paneles y seleccionar versiones usando un ejemplo sin secretos.

| Dimensión | Afirmación observable | Evidencia exigida | Rival y contraste |
|---|---|---|---|
| D1 | Localiza una clave histórica y la vincula al conjunto correcto | Citas de revisión/archivo/líneas, uso criptográfico e inventario de key IDs; diferencia R01/R02 de R03 | Marcar una cadena aleatoria: contrastar identificador público y clave independiente |
| D2 | Explica la recuperación sin atribuirla a debilidad algorítmica ni inventar vector de fuga | Relación clave–cifrado–texto, predicción de clave errónea y alcance; medida y límite | Repetir «hay una clave»: exigir qué prueba separa clave pertinente de coincidencia |
| D3 | Cambia el mecanismo de custodia/uso y migra datos sin perder función | Configuración aplicada, inventario antes/después y resultados verificables de lectura/escritura | Marcar «rotado» sin recifrar: probar copia actual con K1 y lectura legítima |
| D4 | Contrasta seguridad y continuidad, y reconoce exposición residual | Pruebas B/Q/C con resultados, errores esperados e informe acotado | Mensaje verde o bloqueo total: nueva operación legítima y copia histórica adversaria |

El éxito técnico se define por **B && Q**. No otorga automáticamente D1/D2/D4 ni autonomía. El contraste C informa límites; no exige lo imposible: borrar una clave de la aplicación no hace ilegible una copia histórica ya obtenida por un tercero.

## 3. Escenario compatible y aplicaciones propuestas

Oficina `AndinaPay`, zona `Operaciones`, computadora `AP-IR-01` del analista, servidor representado `AP-DATA-01` y servicio representado `AP-KEYS-01`. El estudiante entra desde oficina 3D → monitor → aplicaciones. Todo host/puerto es **identidad del modelo**, no dirección de red accesible. No hay terminal del sistema anfitrión, Git remoto, nube real ni instalación de herramientas.

| Panel propuesto | Función y restricciones |
|---|---|
| Expediente | Abre aviso, logs, manifiestos y copias inmutables; permite citar fragmentos e introducir diagnóstico |
| Repositorio | Tres revisiones lineales, árbol, diferencias y búsqueda literal sobre fixtures; no ejecuta código ni acepta comandos Git arbitrarios |
| Banco criptográfico | AES-256-GCM real sobre bytes públicos del laboratorio; selección explícita de registro, clave, IV y AAD; no fuerza bruta ni conexiones |
| Respuesta de claves | Operaciones controladas sobre inventario, referencias de aplicación, almacenamiento y migración; no editor ejecutable |
| Comprobaciones | Ejecuta casos B/Q/C contra estado del modelo; devuelve hechos y procedencia, no explicación de la solución |
| Informe | Captura causa, evidencia, alcance, respuesta y límites; corrección interpretativa revisable por humano |

El escritorio actual puede alojar ventanas; estas aplicaciones, registros de evidencia y operaciones son **capacidades nuevas propuestas**, no funciones ya existentes. La [guía de escenarios](../../guides/escenarios.md#cuando-el-manifiesto-no-alcanza) exige código confiable, contrato cerrado y pruebas antes de utilizarlas desde manifiestos. Un perfil reservado no resuelve su ausencia.

### Matriz de permisos del modelo

| Actor | Repositorio/expediente | Claves | Datos y operaciones |
|---|---|---|---|
| Analista, dentro del laboratorio | Lee historial y evidencia; escribe diagnóstico/informe | Puede seleccionar K1 expuesta; propone acciones de recuperación; no obtiene bytes de K2/KI en UI ordinaria | Pruebas autorizadas y operaciones guiadas, no acceso a otras sesiones |
| `app-payments` | No modifica historial | Estado inicial: obtiene K1 mediante referencia; final: usa K2 por handle | Lee/escribe registros de la colección operativa; no exporta claves |
| `migration-worker` | Lee inventario aprobado | Durante recuperación: uso acotado de K1/K2 por handle; permiso temporal revocado al finalizar | Migra R01/R02 y verifica conservación; no toca R03 |
| `external-reader` | Posee copia histórica del repo y del volcado parcial | Conoce K1 pública del ejercicio; nunca acceso al servicio de K2/KI | Prueba offline de copia que ya posee; no controla la aplicación |

Son controles educativos del modelo. Como los fixtures de autoría contienen claves públicas y la simulación corre en cliente, **no constituyen una bóveda segura frente al alumno que inspeccione el bundle**. No prometer secreto de evaluador, resistencia a manipulación o arbitraje independiente del servidor.

## 4. Materiales y estado inicial exactos

Reloj narrativo: 2026-10-26, zona `America/Guayaquil`; no sincronizarlo con reloj real. Los IDs `AP-H1..H3` son revisiones sintéticas, no commits reales del repositorio CyberSim.

| Artefacto | Contenido inicial del fixture |
|---|---|
| `incident/notice.txt` | 08:30: aviso anónimo, fragmento exacto `SYN-001 / tok_demo_A`, adjunto `partial-v1.json`; origen no autenticado |
| `repo/AP-H1` | 2026-08-03 10:00, «demo encryption»; `src/crypto-config.ts` L1 `export const KEY_ID = 'legacy-demo';` L2 `export const KEY_HEX = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';` |
| `repo/AP-H2` | 2026-09-01 11:00; elimina literal de HEAD; L1 `export const KEY_ID = 'legacy-demo';` L2 `export const KEY_SOURCE = 'runtime-reference';`; no rota ni recifra |
| `repo/AP-H3` | 2026-10-24 16:00, HEAD; mantiene AP-H2; `src/crypto-flow.txt`: obtiene key por KEY_ID, AES-256-GCM, IV independiente por registro, tag 128 bits, AAD según ID/versión |
| `repo/AP-H3/public-config.txt` | `MERCHANT_PUBLIC_ID=merchant-demo-17`; identificador público, no clave de cifrado; no justifica rotación |
| `data/partial-v1.json` | Copias R01 y R02 cifradas con `legacy-demo`; detalle bit a bit en anexo |
| `data/current-index.csv` | `R01,legacy-demo,v1`; `R02,legacy-demo,v1`; `R03,archive-independent,v1` |
| `keys/inventory.csv` | `legacy-demo,active,app-payments:encrypt+decrypt,runtime-reference`; `archive-independent,active,app-payments:decrypt,restricted-reference`; K2 aún no activada; no etiqueta de “comprometida” que revele el diagnóstico |
| `logs/application.log` | 08:00 `READ R01 key=legacy-demo result=ok`; 08:01 `READ R02 key=legacy-demo result=ok`; 08:02 `READ R03 key=archive-independent result=ok` |
| `logs/monitoring.txt` | Ventana observada 08:00–08:30; cero alertas registradas; no incluye auditoría completa del repositorio, exportaciones ni foro |
| `recovery/policy.txt` | Conservar evidencia inmutable; leer registros operativos y registrar un nuevo cliente ficticio; retirar uso de clave comprometida tras migración; inventariar copias sin afirmar recuperación de copias ajenas |

Estado `S0`: HEAD sin literal, K1 todavía usada, R01/R02 legibles con K1, R03 con KI, aplicación disponible, prevención desactivada, snapshots históricos inmutables. Que la literal no esté en HEAD **es un distractor relevante**, no prueba de que se haya remediado.

## 5. Fixtures criptográficos públicos y reproducibles

**Solo laboratorio.** AES-256-GCM, tag separado de 16 bytes, IV de 12 bytes, claves y campos binarios en hexadecimal minúsculo sin prefijo. Texto y AAD UTF-8 sin BOM, sin salto final ni espacios adicionales. No usar estas claves, IV constantes ni un generador determinista en producción. La repetición del fixture en un reset es reproducción de un material público, no recomendación de reutilizar nonces para cifrados reales.

| Key ID | Clave de autoría pública |
|---|---|
| K1 / `legacy-demo` | `000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f` |
| K2 / `recovery-v2` | `202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f` |
| KI / `archive-independent` | `404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f` |

Los bytes K2/KI son materiales del autor/verificador; no aparecen en repositorio ficticio ni respuestas ordinarias al alumno. Esa separación limita pistas, no aporta secreto real en un cliente inspeccionable.

| Registro | Texto plano exacto |
|---|---|
| R01 | `{"id":"R01","document":"SYN-001","cardToken":"tok_demo_A"}` |
| R02 | `{"id":"R02","document":"SYN-002","cardToken":"tok_demo_B"}` |
| R03 | `{"id":"R03","document":"SYN-003","cardToken":"tok_demo_C"}` |
| R04, prueba de alta legítima antes/después | `{"id":"R04","document":"SYN-004","cardToken":"tok_demo_D"}` |

Formato de cada envelope: `{recordId,keyId,version,ivHex,aadUtf8,ciphertextHex,tagHex}`. No sustituir el tag por un hash ni aceptar plaintext si falla autenticación. AAD enlaza ID/versión del fixture; no es secreto. La tabla contiene valores ya calculados, no cifrados inventados.

| Envelope | IV hex | AAD UTF-8 | Ciphertext hex | Tag hex |
|---|---|---|---|---|
| R01/K1/v1 | `101112131415161718191a1b` | `AndinaPay\|R01\|v1` | `06dcf1726bf318e1fa442a312d1d0630a23d2b606fe06d93b4a0ac4a6e6465f97ccb346287c23a801553fc73b0ba677478e323168ee406b39e63` | `b8656985e78563eb40dfa3697e468f3c` |
| R02/K1/v1 | `1c1d1e1f2021222324252627` | `AndinaPay\|R02\|v1` | `391f3403122a017f9af8ee7beb6901a1d1718bc4cd799a38d2c07f0924e938af4dce12a5feff5fc0d3840367e02158f6cb5f66017267d3119a9f` | `af20a0411ff18a3d109ba6117b95228b` |
| R03/KI/v1 | `28292a2b2c2d2e2f30313233` | `AndinaPay\|R03\|v1` | `775142f3c8538cf696cc0cf60ec7decaa4f5f58940562b5f8971b4209e8d9c32ad7d3793920f1c58dc91c40bfdd77cd32dbd630d24a7f8fbb835` | `772defdd4efe4ed60b8ad71f6d09c360` |
| R04/K1/v1, probe aislado | `58595a5b5c5d5e5f60616263` | `AndinaPay\|R04\|v1` | `801beaef967efc70afddc0632ed935fcd5b3f7c1146cdb85cc6a2026fa778d0d7d3c8d28011d5f919b7f0e93ef34a3bf2a616c059acab48d9060` | `050ba5aed7d481cacd6b90e556af0edb` |
| R01/K2/v2 | `3435363738393a3b3c3d3e3f` | `AndinaPay\|R01\|v2` | `a891d61ce29a00896ae90c116675db2d24024322dced64645319127d4752fd75f0ebbbeecae39584ac856368ef6006ac11184babd36324d3e140` | `ffd6aef2f4e34a1e3e58ed04fa70af41` |
| R02/K2/v2 | `404142434445464748494a4b` | `AndinaPay\|R02\|v2` | `b976d4e5724ce75962007204a72e3e1166e3f8ed81629dfc3da7da2d50dafd20e6317c7f44b8f54926f253a6a7f2c780b5c78d55d0858fbf5c99` | `1ccbabdd245265d27fc5fafa1555759b` |
| R04/K2/v2 | `4c4d4e4f5051525354555657` | `AndinaPay\|R04\|v2` | `b6f522a52da5bd5f79ef6eddf296fc088c79457d6d0b82a43241318d748273dc73998518fc4549a94bbea4036ced7f0b9748b3edbac1a008d56c` | `dfeaea24ecb515b482584bf09805e4b2` |

En Markdown, `\|` escapa separadores de tabla: AAD contiene caracteres `|` reales, **no barras invertidas**. Cada operación nueva de producción requeriría nonce único bajo su clave; en el laboratorio solo se permiten las siete operaciones/fixtures declarados o replay de sus resultados, no cifrado arbitrario con estos IV. B2 se ejecuta en una copia efímera del estado y no añade R04 al inventario operativo publicado; repetirlo reproduce el mismo material, no genera nuevas escrituras con IV repetido.

Comprobación de autoría efectivamente ejecutada en PowerShell 7.6.5/.NET `AesGcm`: cifrado y roundtrip exacto de las siete filas; R01 con clave equivocada rechazado; R01 con primer byte del tag alterado rechazado; las tres filas K2 rechazadas por K1; R03 rechazado por K1. **No se ha ejecutado WebCrypto ni el flujo de una aplicación CyberSim**. La compatibilidad de representación WebCrypto (`ciphertext || tag`) deberá probarse en implementación, no asumirse de este cálculo.

## 6. Fases, operaciones y transiciones propuestas

### F0: familiarización neutral

Abrir archivo, elegir versión, citar una línea y leer un error con un expediente inocuo ajeno al caso. No exponer KEY_ID, ubicación o controles de AndinaPay. Adaptaciones de accesibilidad no resolutivas se registran aparte, sin elevar el nivel de ayuda.

### F1: investigación y diagnóstico provisional

Paneles Expediente/Repositorio/Banco disponibles; intervenciones ocultas hasta entregar diagnóstico o solicitar A2/A3. Se puede volver a todos los materiales. El diagnóstico solicita: afirmación, dos evidencias citadas, alternativa rival, prueba propuesta y alcance/no determinado. No exige respuesta correcta para avanzar: admitir error permite observar decisiones posteriores. Entregar sella `diagnostic-1`; futuras revisiones no lo sobrescriben.

Banco criptográfico: seleccionar un envelope y una clave candidata; verificar tag y AAD antes de entregar plaintext. Error genérico `AUTHENTICATION_FAILED` ante clave/tag/AAD incorrectos, sin texto parcial. Un envelope mal formado produce `INVALID_ENVELOPE` sin modificar datos. Citar únicamente el resultado no demuestra haber razonado su causa.

### F2: intervención controlada

| Operación semántica | Precondición / efecto concreto | Error y límite |
|---|---|---|
| `record_evidence` | Añade referencia inmutable a revisión/archivo/envelope/resultado | Referencia inexistente: `EVIDENCE_NOT_FOUND`; sin cambio |
| `submit_diagnosis` | Congela contenido y ayuda vigente; abre controles después de entrega | Vacío: `DIAGNOSIS_REQUIRED`; no exige clave correcta |
| `stage_key(recovery-v2)` | Activa handle K2 solo para migración, sin sustituir de inmediato lectura operativa | ID fuera de lista: `UNKNOWN_KEY`; no generar secretos reales |
| `set_key_source` | Elige `restricted-key-service` o `restricted-runtime-file`; misma política de uso, niega exportación a `external-reader` | Un archivo llamado `.env` sin permisos/custodia no satisface por su nombre |
| `rekey_records(R01,R02)` | Descifra copia staged con K1, cifra a K2 y valida que cada plaintext conservado coincide; R03 se preserva | Sin K2 staged: `KEY_NOT_READY`; fallo de autenticación conserva estado publicado |
| `commit_recovery` | Publica conjuntamente índice migrado, fuente restringida, escritor K2 y retiro K1 del servicio; solo si B de lectura staged pasa y ambas filas migradas | `MIGRATION_INCOMPLETE`/`READBACK_FAILED`; estado publicado inalterado; no borrar evidencia |
| `retire_key_early(K1)` | Contraprueba deliberada: deshabilita servicio de K1 antes de migrar; R01/R02 dejan de leerse | No declarar éxito: B falla; se permite restaurar servicio para recuperar con evidencia |
| `restore_key_for_recovery(K1)` | Restaura temporalmente uso por `app-payments` y `migration-worker` únicamente si la recuperación no está publicada; registra riesgo y transición | Tras publicación: `RECOVERY_ALREADY_COMMITTED`; no reactivar clave comprometida |
| `configure_prevention` | Activa escaneo de historial+diff y revisión documentada de excepciones, sin bypass silencioso | Solo escaneo de HEAD no cubre histórico; no prometer detección universal |
| `run_check` | Ejecuta comprobación declarada y registra inputs, estado y resultado | Check desconocido: `UNKNOWN_CHECK`; no efectos de dominio |
| `submit_artifact` | Congela revisión, evidencias y pruebas elegidas después de confirmarse persistencia; ejecuta batería docente en copias separadas, sin atribuirla al estudiante | No permite editar esa entrega; fallo de guardado/conflicto no confirma ni abre D2 |
| `submit_report` | Tras submit_artifact, cierra explicación D2, contraste D4 e informe, aunque declare límites o incompletitud | Sin entrega técnica previa: ARTIFACT_NOT_SUBMITTED. No altera controles/pruebas congelados; hechos y perfil humano se muestran por separado |

El servicio de claves y el archivo restringido son alternativas educativas equivalentes **solo respecto a las propiedades enumeradas**, no sustitutos universales. El segundo exige permisos y distribución de clave; el primero exige disponibilidad, administración y política. En ambos, la configuración explicita `writerKey=recovery-v2`, `app-payments=use-only`, `external-reader=deny`, `migration-worker=temporary-use`, `key-export=deny`; no basta elegir el nombre de una opción. No elegir una marca ni instalar un gestor real. Clave K1 «retirada» significa servicio no la usa ni la entrega; no revoca mágicamente la capacidad de quien ya conoce sus bytes.

Prevención del fixture: un candidato a cambio `src/demo-copy.ts` contiene la misma asignación `KEY_HEX` de AP-H1; otro, `public-config.txt`, contiene `MERCHANT_PUBLIC_ID=merchant-demo-17`. El detector propuesto reconoce asignaciones a `KEY`/`KEY_HEX` con literal hexadecimal de 64 caracteres y registra archivo/línea; no detecta toda forma de secreto. El alumno selecciona alcance (`head-only` o `history-and-new-diff`) y política de excepción (`silent-bypass` o `review-required`). La configuración exigida para prevención cubre histórico y nuevos cambios, alerta el primer candidato y mantiene el segundo como ID público, con motivo registrado para toda excepción. Un bypass no revisado no obtiene el ancla adicional D3=3.

Flujo de recuperación guiado sugerido: preservar evidencia → delimitar inventario → preparar K2/custodia → recifrar staged → comprobar lectura → publicar → retirar uso operativo K1 → comprobar copia actual y alta legítima → prevención. El mismo resultado mediante otra ruta demostrable es admisible. Si la ruta sale de las operaciones previstas: `requires_review`; conservar evidencia y no asignar cero automático.

### F3: pruebas y contraste

Toda prueba devuelve hecho, ID de fixture y estado: por ejemplo, «R01/v2: autenticación fallida con clave seleccionada». No devuelve «debes rotar la clave X». Repetir una prueba no crea evidencias independientes. Cada intervención crea una revisión de estado; pruebas previas quedan asociadas a su revisión, nunca se presentan como validación de la nueva.

| Check | Propiedad y resultado inicial S0 | Resultado después de recuperación completa |
|---|---|---|
| B1 | Aplicación autorizada lee R01/R02/R03 con plaintexts exactos: pasa | Pasa; R03 no cambia |
| B2 | Crear R04 usando escritor operativo y releerlo: usa K1 inicialmente; roundtrip pasa | Usa K2; roundtrip pasa; la fila K2 del anexo es oráculo del fixture posterior |
| Q1 | Copia actual R01/R02 con K1: descifra, por tanto seguridad falla | Autenticación rechazada en ambas, pasa propiedad de clave distinta |
| Q2 | Nueva fila usa clave no expuesta K2 y fuente restringida: falla | Pasa; no hay literal K2 en HEAD/logs del modelo |
| Q3 | `external-reader` no exporta claves del servicio en ningún estado; `app-payments` todavía puede usar K1, por tanto falla la propiedad de retiro | Exportación K2 por `external-reader`: `KEY_ACCESS_DENIED`; uso K1 por `app-payments`: `KEY_RETIRED`; sin modificación |
| C1 | Copia histórica R01/v1 + K1 revela SYN-001/tok_demo_A: pasa demostración | Sigue revelándolo; el informe debe reconocerlo, no declarar mitigación retroactiva |
| C2 | R03/v1 + K1: `AUTHENTICATION_FAILED` | Igual; no concluye que R03 esté libre de cualquier otro riesgo |
| C3 | R01 con clave incorrecta o tag alterado: `AUTHENTICATION_FAILED` | Igual; comprobación independiente de la interfaz |
| C4 | Propuesta de cambio con literal K1 en archivo de prueba | Escáner propuesto alerta y revisión no permite publicar sin retirar literal; no toca repo real |
| C5 | Identificador público `merchant-demo-17` | No se clasifica como clave; registrar decisión contextual, no basarse solo en entropía |

**B = B1 && B2. Q = Q1 && Q2 && Q3.** Q2/Q3 incluyen condiciones del modelo verificadas, no seguridad real del navegador. C4/C5 son casos de prevención adicionales: aplicar la política requiere decidir sobre alertas, no marcar un interruptor que garantice seguridad. Un estado que deja todo apagado puede satisfacer rechazo pero falla B. Ningún fallo de autenticación aislado prueba confidencialidad general.

### F4: informe y cierre

**Dos cierres distintos:** primero `submit_artifact` sella la revisión y pruebas elegidas, persiste el recibo y corre B/Q/C docentes en copia aislada. Después se habilitan las preguntas D2/contraste D4 y el informe; durante esa explicación no se editan controles ni la entrega. `submit_report` cierra únicamente ese material posterior. No atribuir el resultado docente a una prueba elegida por el alumno ni congelar un perfil definitivo antes del juicio de rúbrica.

Informe no técnico de cinco campos: qué ocurrió de acuerdo con materiales; qué datos se demostró recuperables; causa y corrección; continuidad verificada; límites y próximos pasos. Texto ancla posible: «La clave de una versión anterior permite leer dos registros del material recibido. Migramos la copia operativa y comprobamos nuevas operaciones. La copia antigua continúa legible para quien tenga esa clave; no sabemos cómo salió ni quién la utilizó. Recomendamos ampliar la revisión de copias y accesos y controlar futuras inclusiones de claves». No pedir acusaciones ni certeza no sustentada.

El informe final ocurre después de pruebas/feedback: es evidencia de explicación **en ese momento**, no una medición basal intacta. Se conserva diagnóstico previo y posterior separados.

## 7. Ayudas, reset y fallos

| Ayuda | Texto completo propuesto | Registro |
|---|---|---|
| A1 | «Para citar una evidencia, abre el artefacto y usa “Añadir referencia”. El selector de versión cambia lo visible sin modificarlo». | Interfaz; registrar si realmente no reveló solución |
| A2a | «Que una cadena ya no aparezca en la versión actual no implica que haya desaparecido de versiones anteriores. Comprueba qué material permitiría relacionar una clave con datos concretos». | Conceptual/localización, asistida desde este momento |
| A2b | «Cambiar la clave de nuevas escrituras y cambiar el cifrado de registros antiguos son operaciones distintas. Comprueba también si los usuarios autorizados conservan acceso». | Conceptual, no neutral |
| A3 | «Abre AP-H1, crypto-config.ts L2 y registra esa clave como candidata. Descifra R01/v1 y R02/v1 con sus IV y AAD; contrasta R03. En Respuesta, prepara recovery-v2, selecciona custodia restringida, recifra R01/R02 en staged y comprueba lectura. Publica la recuperación, confirma retiro de legacy-demo y ejecuta B1/B2/Q1/Q2/Q3/C1. Activa revisión de secretos en historial y nuevos cambios. Informa que la copia antigua sigue recuperable y que el vector de fuga no se conoce». | Procedimiento revelado; ejecución guiada, nunca A0 |

No restar un puntaje fijo por ayuda; reportar D1–D4 por condición y conservar el máximo apoyo recibido. Las ayudas están disponibles bajo solicitud explícita y se registran antes de mostrarlas. No convertir una validación técnica en A3 oculto.

Un reset restaura estado de dominio y fixtures como revisión nueva dentro del mismo `attemptId`, manteniendo diagnóstico, evidencias, ayudas y exposición. No cambia de segmento de ayuda por sí solo. Otra administración o práctica inicia otro `attemptId` explícito, vinculado al anterior; nunca se presenta como primera exposición.

## 8. Rúbrica analítica específica

Corregir con artefactos y citas, no por longitud. Niveles ordinales propuestos, sin promedio global ni corte de aprobado. En toda dimensión NE significa que no hubo evidencia interpretable por fallo/pérdida/criterio no presentado; registrar causa. Omisión con oportunidad válida: `no_attempt`, aplicar únicamente política preespecificada. Ayuda se informa aparte.

| Dimensión | 0, oportunidad válida pero contradice criterio | 1, pertinente incompleto | 2, elementos esenciales | 3, añade contraste predefinido |
|---|---|---|---|---|
| D1 | Atribuye el hallazgo al algoritmo sin evidencia o confunde ID público con clave | Encuentra literal histórica pero no la relaciona con uso/dataset | Cita AP-H1, configuración de uso e inventario y relaciona R01/R02 con K1 | Además distingue R03/KI y ausencia actual de literal de ausencia histórica |
| D2 | Afirma que borrar HEAD hace ilegibles copias ajenas o inventa intrusión específica | Explica que una clave expuesta permite lectura, sin separar disponibilidad de clave y acceso al volcado | Explica mecanismo clave+ciphertext, predice fallo con clave errónea y justifica respuesta | Además distingue copia histórica/operativa y declara vector de extracción no determinado |
| D3 | Apaga acceso legítimo o mantiene K1 en operación declarando solución | Externaliza la misma clave o solo cambia escritor; migración parcial | Custodia restringida, R01/R02 migrados, escritor K2, K1 retirada y B/Q satisfechos | Además configura prevención con revisión de excepciones y preserva evidencia e independiente R03 |
| D4 | Solo cita mensaje verde o declara que ninguna copia puede descifrarse | Prueba únicamente lectura legítima o rechazo, sin contraparte | Documenta B1/B2 y Q1–Q3 del mismo estado con interpretación correcta | Además C1/C2 y un negativo C3; distingue evidencia de recuperación de inferencias no demostradas |

Anclas para corrección: «Encontré KEY_HEX» sin uso/inventario = D1=1; «el servicio ya usa K2, pero R01 sigue en K1» = D3=1; «R01 actual falla con K1 y la aplicación lo lee con K2; R01 viejo aún se lee con K1» puede apoyar D4=3 si incluye los demás contrastes. Explicar bien sin aplicar no concede D3. Ruta alternativa válida o política no cubierta: `requires_review`, conservar puntuaciones iniciales y adjudicación humana. El informe no técnico alimenta D2/D4, no una quinta dimensión artificial.

## 9. Variante isomórfica y límites

Variante `AP-B`: cambiar nombres de empresa ficticia, rutas, fechas y registros; trasladar el literal a otra revisión histórica conservando distancia de tres revisiones, dos registros afectados y uno independiente, mismo algoritmo/tamaños, misma demanda de custodia y mismas propiedades B/Q/C. Generar claves/IV/fixtures nuevos de laboratorio y verificarlos antes de publicar; no reutilizar anexo A como si ya fuera B. Su equivalencia es **hipótesis de diseño no demostrada**, no calibración. Si se usa después de A3, informa logro posterior a enseñanza, no transferencia inicial autónoma.

Inferencias excluidas: exploit de producción, seguridad de una bóveda comercial, rotación distribuida concurrente, capacidad general de forense, ausencia total de intrusión, eliminación de todas las copias ajenas o eficacia de aprendizaje de CyberSim. Fuera de esta ficha: determinar responsables y población real, consentimiento/ética, muestra, acuerdo de evaluadores y accesibilidad empírica.

## 10. Criterios para implementación posterior

- Añadir capacidades cerradas de repositorio/expediente, banco criptográfico y recuperación; no fingirlas con campos libres ni ejecutar código del alumno.
- Serializar evidencia por intento, versión de tarea/rúbrica, actor, artefacto, estado, inputs/outputs de prueba, ayuda y diagnóstico sellado; las claves de laboratorio no son secretos reales, pero no enviarlas a proveedores de IA.
- Probar rechazo sin cambio de estado, replay sin duplicar evidencia, migración incompleta, recuperación fallida y reset con exposición previa. Resolver explícitamente cómo persistir staging antes de prometer reanudación.
- Comprobar todos los B/Q/C, incluida ruta alternativa de custodia y rechazo total que falla B; congelar versiones de verificadores. Ninguna prueba del software está ejecutada en esta entrega documental.
- Revisión de contenido, proceso de respuesta con estudiantes y pilotaje siguen pendientes conforme al marco. Los cálculos criptográficos de autoría no validan una rúbrica ni su dificultad.

El [registro investigativo](investigacion/321-andinapay.md) conserva tres ciclos, alternativas descartadas, acceso a originales y resultados negativos. Documentación pasiva: no corresponde RED/GREEN de aplicación. Esta ficha y sus fixtures son un contrato de diseño propuesto para una implementación futura, no evidencia de funciones ya incorporadas.
