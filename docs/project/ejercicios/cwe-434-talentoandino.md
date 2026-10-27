# TalentoAndino — investigar y rediseñar la carga de hojas de vida

**Conjunto 2.0, diseño documental propuesto, no implementación ni validación con estudiantes.** Caso vigente CWE-434 del [fuente del compañero](fuentes/escenarios-companero.md), líneas 131–204. Aplicar el [marco conservado](../marco-evaluacion-ciberseguridad.md) y el [contrato común vigente](README.md). Slug propuesto: `talentoandino-cargas-seguras`. Este diseño sustituye al portal de becas del conjunto anterior; no lo amplía.

## 1. Procedencia y alcance de la adaptación

Se mantienen bolsa de empleo, postulantes/reclutadores, hoja de vida y fotografía, restricción PDF/JPG en interfaz, servidor que no valida, nombres originales, directorio público, permisos amplios, registros, archivos sospechosos inofensivos, páginas inesperadas/ralentización, investigación de diseño, contención, verificación, informe y cierre gamificado. No se atribuye al compañero la aprobación de los límites, fixtures o rúbricas añadidos aquí.

**Adiciones de diseño:** política por campo, tamaños, inventario exacto, secuencia de almacenamiento/publicación, dos arquitecturas de contención, cuarentena conservando evidencia, pruebas de borde y de acceso mientras el análisis está pendiente. Las observaciones de páginas y consumo anómalo no prueban por sí solas que todos los incidentes tengan la misma causa.

**Inferencia delimitada:** diagnosticar la frontera cliente/servidor y almacenamiento/uso, configurar controles representados y comprobar sus efectos. No acredita programar un parser, auditar un antivirus, operar un servidor real ni detectar todos los archivos maliciosos. El análisis de contenido del ejercicio usa un catálogo de material inerte con atributos declarados; no es un clasificador real de PDF/JPEG.

## 2. Consigna y política funcional entregadas

> Trabajas en TalentoAndino. La carga de hojas de vida se diseñó para guardar lo que envía cada postulante. Reclutamiento ha observado páginas que nadie diseñó, archivos extraños y ralentización nocturna. Desde la computadora simulada, investiga qué evidencias relacionan estos hechos con las cargas, explica el fallo y modifica el diseño para conservar postulaciones legítimas sin admitir ni servir contenido no autorizado. Aísla lo sospechoso sin perder evidencia y entrega un informe breve que distinga lo comprobado de lo desconocido.

Política añadida y visible desde el expediente:

- Campo `cv`: PDF completo y pasivo, extensión `.pdf` sin distinguir mayúsculas, máximo **5 MiB = 5242880 bytes**.
- Campo `photo`: JPEG completo y pasivo, extensión `.jpg` o `.jpeg` sin distinguir mayúsculas, máximo **2 MiB = 2097152 bytes**. No PNG, SVG, HTML, archivos comprimidos ni documentos cifrados en esta versión.
- El nombre del usuario puede mostrarse como texto escapado, nunca decidir la ruta de almacenamiento. Se generan nombres internos únicos y no se sobrescribe otro expediente.
- La recuperación debe estar mediada: propietario de la postulación o reclutador asignado. Los archivos pendientes, rechazados y en cuarentena no se descargan como aprobados.
- Los archivos preexistentes legítimos deben seguir disponibles mediante el mecanismo de entrega admitido. No se exige conservar la URL pública insegura.

Los tamaños y formatos son decisiones del caso para hacer comprobable el contrato, no límites óptimos derivados de un paper ni exigencias universales. No se puntúa recordar esos números: están disponibles como recurso A0.

## 3. Escenario y expediente inicial

Una oficina TalentoAndino con `Estación de Análisis` y representación del `Servidor de Aplicación`, dentro del perfil `office-3d`. En el monitor se abren Portal, Archivos, Código y configuración, Registros, Pruebas e Informe. Son aplicaciones/capacidades propuestas; las cuatro aplicaciones actuales de CyberSim no realizan estos procesos.

Materiales completos para autoría:

| ID | Material y contenido relevante |
|---|---|
| TA-REQ-0 | Requisito original: «que el candidato suba lo que quiera y el sistema lo guarde»; no contempla tratamiento de entradas no confiables |
| TA-UI-0 | Dos campos, `cv` y `photo`; ambos muestran «Solo PDF o JPG». El cliente filtra extensión; una petición directa puede omitirlo |
| TA-CODE-0 | Flujo inicial: recibir petición → copiar contenido a `/public/uploads/` usando `originalName` → devolver URL pública. No hay validación de servidor, límites o cuarentena |
| TA-CONF-0 | Carpeta servida directamente; intérprete representado habilitado; nombre original conservado; publicación anterior al análisis |
| TA-LOG-0 | `2026-10-20T09:10:00Z receive=T03; 09:10:01 stored=/public/uploads/cv.php; 09:10:03 direct_get=T03; effect=UNEXPECTED_PAGE` |
| TA-LOG-1 | `2026-10-20T02:00:00Z resource_alarm=HIGH; request_correlation=unknown`. No contiene prueba del origen de esa carga ni de acceso a otras máquinas |
| TA-INV-0 | Inventario LG01–LG03 de la tabla siguiente y sus relaciones con solicitudes; las marcas temporales no atribuyen por sí solas autoría |

El estudiante puede investigar los materiales en cualquier orden dentro de la fase; no se exige leer primero una lista fija ni acertar el diagnóstico para avanzar.

### Catálogo de cargas sintéticas

Cada fila representa un archivo de laboratorio, no un payload ejecutable. `profile` y `active` son atributos del analizador pedagógico para esos fixtures, no declaraciones confiables enviadas por el cliente. `size` representa longitud observada por el receptor, no el encabezado de tamaño que declare el usuario. Los contenidos son marcadores inertes `TA:<ID>`; el simulador no los pasa al navegador, sistema de archivos anfitrión o intérprete real.

| ID | Campo y nombre original | MIME declarado | Perfil observado | Tamaño bytes | Actividad | Resultado del contrato |
|---|---|---|---|---:|---|---|
| T01 | cv / `cv_ana.pdf` | application/pdf | PDF completo | 256000 | no | Admitir |
| T02 | photo / `foto.jpg` | image/jpeg | JPEG completo | 128000 | no | Admitir |
| T03 | cv / `cv.php` | application/x-php | SCRIPT | 512 | sí | Rechazar |
| T04 | cv / `cv.pdf` | application/pdf | SCRIPT con firma aparente PDF | 1024 | sí | Rechazar |
| T05 | cv / `anexo.pdf` | application/pdf | PDF completo con componente activo | 400000 | sí | Rechazar |
| T06 | cv / `grande.pdf` | application/pdf | PDF completo | 5242881 | no | Rechazar por límite |
| T07 | photo / `grande.jpg` | image/jpeg | JPEG completo | 2097153 | no | Rechazar por límite |
| T08 | cv / `../indice.pdf` | application/pdf | PDF completo | 300000 | no | Admitir con nombre interno, sin usar esa ruta |
| T09 | photo / `foto.JpG` | image/jpeg | JPEG completo | 128000 | no | Admitir |
| T10 | cv / `foto.jpg` | image/jpeg | JPEG completo | 128000 | no | Rechazar por campo incorrecto |
| T11 | cv / `cortado.pdf` | application/pdf | estructura incompleta | 1000 | no | Rechazar |
| T12 | cv / `limite.pdf` | application/pdf | PDF completo | 5242880 | no | Admitir |
| T13 | photo / `limite.jpg` | image/jpeg | JPEG completo | 2097152 | no | Admitir |

MIME, extensión y firma son observables diferentes. T04/T05 impiden equiparar firma/formato con ausencia de actividad. T08 comprueba el diseño de rutas sin ejecutar traversal real; la estrategia elegida no necesita considerar seguro el nombre de origen.

### Inventario preexistente

| ID | Archivo y estado inicial | Clasificación prevista |
|---|---|---|
| LG01 | `curriculum.pdf`, candidato-1, PDF completo pasivo, 220000 bytes, URL pública, sin marcador | Legítimo; migrar a entrega controlada conservando relación con la postulación |
| LG02 | `pagina.php`, origen no atribuido, SCRIPT activo, 700 bytes, público | Sospechoso; cuarentena, conservar evidencia, bloquear recuperación |
| LG03 | `foto.jpg`, candidato-2, firma JPEG pero perfil SCRIPT activo, 900 bytes, público | Sospechoso; cuarentena y no considerar el nombre prueba de legitimidad |

La cuarentena registra ID, metadatos, clasificación y relación con el log; no borra el archivo ni afirma una cadena de custodia forense real. La exportación del expediente conserva exactamente los marcadores del catálogo y la procedencia de cada copia. Una prueba futura con bytes reales deberá definir hashes de esos bytes, no usar este catálogo como si los hubiera medido.

## 4. Operaciones y cambios disponibles

El editor presenta fragmentos de código/configuración de un catálogo confiable. Seleccionar un fragmento cambia reglas del motor de dominio; **no ejecuta JavaScript/PHP aportado por el estudiante**. La evidencia incluye el diff y su semántica, no solamente un ID de parche.

| Grupo | Estado inicial y opciones con semántica |
|---|---|
| Validación V | V0: cliente solamente, servidor admite todo. V1: servidor comprueba extensión y MIME declarados contra lista global PDF/JPEG. V2: servidor comprueba campo, extensión normalizada, perfil completo y ausencia de actividad según analizador; no confía en MIME como prueba |
| Tamaño L | L0: sin límite. L1: límites del contrato medidos en recepción, antes de aceptación definitiva |
| Nombre N | N0: originalName decide ruta. N1: ID interno `TA-0100`, `TA-0101`… más extensión del perfil validado; contador avanza al aceptar, no se reutiliza un ID existente |
| Alojamiento S | S0: público con intérprete. S1: privado fuera de la ruta servida. S2: carpeta segregada con ejecución deshabilitada y acceso HTTP directo denegado. S1/S2 son alternativas de contención, no nombres obligatorios de proveedores |
| Entrega D | D0: URL directa. D1: handler que solo entrega registros admitidos a propietario o reclutador asignado; devuelve documento como adjunto, nunca interpreta el marcador |
| Publicación P | P0: registra provisionalmente el objeto como admitted antes de terminar el análisis, por lo que el handler D1 permite al propietario recuperarlo; revoca esa admisión si falla. P1: mantiene pending no descargable y solo publica un ID admitted tras validar; rechazo nunca publica. El contraste afecta también almacenamiento privado, no presupone una URL pública |
| Inventario I | Inspeccionar, clasificar, cuarentenar LG02/LG03 o migrar LG01. Cada acción conserva procedencia y registra el cambio; no hay borrado irreversible |

La restricción de clientes y cuentas del handler es simulada sobre identidades del fixture: `candidato-1` propietario de las postulaciones de prueba T01–T13 y de LG01, `reclutador-1` asignado a sus postulaciones y `visitante` sin permiso. No modifica la autenticación de CyberSim.

Secuencia propuesta del motor:

1. Recibir fixture y observar su tamaño representado; registrar petición/revisión y crear `TA-PENDING-<seq>` con propietario, cuerpo inerte y procedencia. La secuencia temporal empieza en 1 por copia de prueba y avanza en cada recepción; no es el contador de nombres finales.
2. Antes de analizar, P1 deja ese registro en `pending`, no descargable; P0 lo marca provisionalmente `admitted` y expone su handle al handler D1. Así el dueño puede recuperarlo incluso con S1/S2. No basta llamar «privado» al almacenamiento si la entrega confía en esa admisión anticipada.
3. Permitir el punto de intercalación de TA-C1: recuperar ese handle antes de resolver el análisis. D1 con actor permitido devuelve el marcador solo si el estado es admitted; `pending` da rechazo sin cuerpo. Es un paso lógico controlado, no una carrera dependiente de tiempos reales.
4. Aplicar límite si L1 y analizar según V. Si ambos pasan, crear el registro definitivo, asignar N/ubicación y retirar el handle temporal. N1 empieza en `TA-0100` y avanza solo al aceptar, evitando IDs existentes; el handle temporal nunca se usa como ruta ni permite eludir ese nombre. D0 permite lectura directa únicamente en S0; S1/S2 deniegan origen directo, aunque un D1 autorizado sí entregue el registro admitido.
5. Si falla tamaño/tipo, marcar `rejected_size`/`rejected_type`, revocar el handle y no crear registro definitivo. La copia transitoriamente recibida por P0 no se recupera retroactivamente. Un `analysis_error` real invalida la comprobación afectada y retira de entrega el pendiente; no se presenta como ataque rechazado con éxito.
6. Recuperar un objeto definitivo por la ruta configurada o registrar `UNEXPECTED_PAGE` si S0/D0 invoca el intérprete representado sobre un activo. D1 siempre entrega adjunto inerte, nunca interpreta. Nunca ejecutar contenido real.

La batería base espera al final de cada petición, por lo que **no detecta por sí sola exposición transitoria** de P0. El contraste adicional se define precisamente para no ocultar esa limitación bajo un resultado final verde.

## 5. Fases y evidencias

| Fase conceptual | Actividad y cierre |
|---|---|
| Expediente | Recibir encargo, inspeccionar UI/requisitos/log inicial y guardar D1 solicitado antes del menú de fragmentos. Puede declarar no saber; no se exige acertar para continuar |
| Investigación y diseño | Rastrear cliente→receptor→carpeta→recuperación, clasificar inventario y documentar hipótesis con evidencias y rivales |
| Intervención | Guardar revisión con fragmentos, migración y cuarentena. Las pruebas no obligan un orden único de edición |
| Verificación e informe | Elegir pruebas, registrar conclusión, congelar entrega y responder explicación causal/contraste. Después mostrar debriefing y permitir práctica separada |

ECD: D1 se apoya en petición/log/código, no en acertar una extensión; D2 vincula frontera y consecuencia, no memoriza «validar»; D3 produce política e inventario observables; D4 combina rechazos y cargas/recuperaciones legítimas. Rival principal: aprendió qué tarjeta seleccionar sin comprender la frontera. Lo debilitan explicación vinculada a T04/T08 y contraste de pendiente, pero no lo eliminan estadísticamente sin estudiantes.

## 6. Batería base, contraste y soluciones

| Prueba | Configuración inicial | Resultado requerido en una solución base |
|---|---|---|
| TA-B1 T01/T02/T09/T12/T13 | Acepta sin política de servidor | Acepta y recupera por handler; tamaños exactos admitidos |
| TA-Q1 T03/T04/T05/T10/T11 | Acepta contenido no admitido; activos pueden mostrar marcador | Rechaza, sin registro admitted ni recuperación final |
| TA-Q2 T06/T07 | Acepta por falta de límites | Rechaza por tamaño, preservando límites exactos legítimos |
| TA-Q3 T08 | Usa nombre como ruta | Acepta PDF válido con ID interno, nunca escribe en ruta del usuario |
| TA-Q4 dos T01 consecutivos | Puede sobrescribir nombre original | Dos IDs internos distintos, ambos recuperables; contador y relación correctos |
| TA-Q5 LG02/LG03 | Públicos/activos | Cuarentena, no descarga; metadatos y relación con registros conservados |
| TA-B2 LG01 | Disponible públicamente | Sigue disponible al propietario/reclutador por handler, con relación preservada |
| TA-Q6 recuperación visitante | URL pública accesible | Denied en handler; ruta directa no entrega, sin alterar inventario |
| TA-C1 T04 intercalado | P0 permite consulta durante admisión provisional | Recibir→registro temporal→recuperar antes de analizar→resolver. Con P1: estado pending, sin cuerpo ni marcador y rechazo final; con P0: el propietario recibe `TA:T04` antes del rechazo, incluso con S1/S2 y D1 |

**B** = B1 y B2. **Q** = Q1–Q6. **C** = C1, además de B/Q. Cada prueba inicia copia limpia de los fixtures y la política entregada; la operación de migración/cuarentena entregada se reproduce antes de la batería. Pruebas del estudiante y del corrector se distinguen.

Soluciones suficientes base: V2/L1/N1/D1 y S1 o S2, con inventario corregido. P1 añade el contraste. V0/V1, cambiar solo interfaz, firma, renombrado, alojamiento o permisos no cubre el contrato completo; apagar carga o cuarentenar todos los documentos sin conservar LG01 destruye B. No exigir simultáneamente S1 y S2. Una alternativa fuera de tarjetas que cumpla propiedades pasa a revisión humana, no a cero por no parecerse al autor.

Reset crea una revisión nueva desde fixtures iniciales dentro del mismo attemptId; conserva diagnóstico, ayudas, historial y exposición, sin abrir un segmento autónomo. Solo iniciar explícitamente otra administración o práctica crea otro attemptId vinculado al anterior y a su exposición. Una prueba que falla por herramienta devuelve technical_error y no prueba Q. Entradas fuera del catálogo se registran como unsupported; no se equiparan a malware. Abandono sin fase presentada produce NE en esa oportunidad, no desconocimiento global.

## 7. Rúbrica y ayudas

| Dimensión | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| D1 | No localiza frontera o cree que texto de interfaz protege servidor | Identifica una carga rara sin conectar petición/código/uso | Vincula TA-UI/TA-CODE y log con aceptación sin validación de servidor | Además distingue prueba de carga/efecto de afirmaciones no demostradas sobre ralentización y autoría |
| D2 | Trata nombre, firma o cambio de carpeta aislado como garantía | Enumera controles sin mecanismo o conserva contradicción esencial | Explica admisión, nombre/ruta, límite y recuperación, vinculados a fixtures | Además razona ventana pending y diferencia barrera técnica de certeza sobre todo parser real |
| D3 | Sin control pertinente o solo apagado | Barrera pertinente, pero B o Q falsos | B y Q verdaderos | B, Q y C verdaderos |
| D4 | No aporta prueba interpretable | Solo ataque, carga legítima o mensaje final | Pruebas legítimas y adversas de revisión entregada, con interpretación y límite | Además comprueba inventario previo, acceso y pendiente; no atribuye a la batería cobertura universal |

NE y omisiones conforme al marco; no inferir D1/D2 de D3 ni puntuar velocidad, extensión del texto o calidad gráfica. Anclas D2: 0 «La interfaz dice PDF»; 1 «Pondría antivirus» sin vínculo; 2 «El servidor admitió T03 y usó su nombre en carpeta servida; valido el perfil por campo antes de aceptar y entrego por ID controlado»; 3 añade «La retirada al final no impide ver pending en C1 y el recurso nocturno no tiene causalidad identificada».

**A1:** «Puedes abrir materiales, guardar una revisión y elegir qué prueba comparar; la interfaz no decide qué significado tiene el resultado».

**A2:** «Compara la petición directa con la restricción de pantalla y sigue el archivo hasta su recuperación. Comprueba también los archivos ya existentes y una carga que deba seguir funcionando».

**A3:** «Aplica política de servidor por campo y tamaño, genera nombres internos y combina almacenamiento no ejecutable/no expuesto con entrega mediada. Conserva LG01 y cuarentena LG02/LG03. Prueba T01/T02, T04, T06, T08 y una recuperación mientras T04 está pending». Registrar texto y momento; no reetiquetar lo posterior como autónomo.

El informe no técnico explica qué se comprobó, alcance de postulaciones afectadas según fixtures, qué causa está sustentada, qué impacto solo está reportado, medidas y prevención desde diseño. Comunicación es evidencia de D2/D4, no una quinta escala validada. Cierre narrativo por B/Q/C: recuperación normal con inventario aislado, corrección parcial con riesgo residual, o servicio inutilizado; no dramatización que invente una intrusión.

## 8. Variante y fundamento

Forma B: TalentoAndino→TalentoCampus, T→U y LG→LP en IDs, nombres personales de marcadores candidato-1/reclutador-1→candidato-A/reclutador-A, ficheros legítimos `cv_ana.pdf`→`cv_postulacion.pdf`, `foto.jpg`→`retrato.jpg`; conservar extensión engañosa de T03, perfil/actividad, tamaños y ruta relativa de T08. Actualizar logs y referencias consistentemente. Misma lógica declarada, no equivalencia educativa probada; no mezclar formas tras exposición como medidas independientes.

[FUSE, NDSS 2020](https://www.ndss-symposium.org/ndss-paper/fuse-finding-file-upload-bugs-via-penetration-testing/) distingue carga de ejecución; [FUEL, manuscrito 2024, §3.2](https://arxiv.org/pdf/2405.16619) motiva contrastes de metadatos, contenido e intercalación; [URadar, TIFS 2024, §V](https://nesa.zju.edu.cn/download/URadar_Discovering_Unrestricted_File_Upload_Vulnerabilities_via_Adaptive_Dynamic_Testing.pdf) mantiene límites ante lógica compleja/contención temporal. [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) complementa controles, no valida la medición. La [investigación específica](investigacion/434-talentoandino.md) registra búsquedas, revisiones y límites, sin trasladar tasas de scanners a estudiantes.
