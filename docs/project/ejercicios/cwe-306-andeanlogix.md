# AndeanLogix — Proteger funciones críticas de logística

**Diseño documental propuesto, versión 2.0; no implementado ni validado con estudiantes.** Slug propuesto: `andeanlogix-funciones-criticas`; el ID numérico se asignará y comprobará contra el catálogo al implementar. Este caso desarrolla CWE-306 de la [propuesta original](fuentes/escenarios-companero.md), líneas 208–274, conservando su narrativa y finalidades. Las precisiones operativas y materiales de abajo son **decisiones de diseño añadidas**, no aprobaciones ni resultados empíricos atribuidos al compañero.

Se conserva el [marco](../marco-evaluacion-ciberseguridad.md): D1–D4, ayuda A0–A3, niveles ordinales 0–3/NE, función legítima y seguridad examinadas conjuntamente, revisión de soluciones alternativas y límites de inferencia. La [investigación específica](investigacion/306-andeanlogix.md) documenta alternativas, búsquedas originales, revisiones y comprobaciones.

## 1. Qué queremos observar

**Afirmación delimitada:** el estudiante reconoce qué funciones requieren identidad comprobada, distingue autenticación, autorización y exposición de red, y configura/verifica controles del servidor sin impedir la operación permitida. La actuación ocurre con código y configuraciones representados; no acredita implementar un sistema de identidad de producción ni descubrir vulnerabilidades en cualquier aplicación.

| Dimensión | Tarea y evidencia | Explicación rival que debemos contrastar |
|---|---|---|
| D1 Diagnosticar | Relacionar petición directa, ruta, sesión y cambio de estado con código/configuración | Deducir «no hay autenticación» únicamente porque no vio un login en el log |
| D2 Explicar y decidir | Explicar por qué login visible, rol y puerto son controles distintos; justificar el parche | Repetir «poner login» sin identificar dónde se verifica cada petición |
| D3 Intervenir | Entregar una revisión del guard común, política de mantenimiento y exposición que satisfaga propiedades | Corregir solo cancelar, apagar el panel o confiar en un rol enviado por el cliente |
| D4 Verificar y delimitar | Comparar respuestas **y estado de negocio** ante roles, métodos, redes y mantenimiento; conservar operación autorizada | Aceptar un mensaje 403 aunque la cancelación se hubiera aplicado antes |

La comunicación no técnica se practica mediante un informe breve. Se valora dentro de D2/D4 por exactitud, evidencia y límites, no como una quinta dimensión de estilo, gramática o extensión. No hay puntuación por velocidad, cantidad de clics o rapidez de escritura.

## 2. Consigna y contexto que recibe el estudiante

> Eres parte del equipo de desarrollo de AndeanLogix, una startup ecuatoriana de logística. La plataforma pública permite consultar envíos; el panel interno permite cancelarlos, reasignar rutas y restablecer credenciales de repartidores. Soporte encontró cancelaciones que ningún operador reconoce. Durante ese intervalo no aparece un inicio de sesión asociado. El equipo cree que el panel está protegido porque usa otra dirección y tiene una pantalla de login. Investiga el servicio dentro de la computadora simulada, demuestra de forma controlada qué permite realmente el servidor y corrige las funciones críticas sin impedir el trabajo del personal autorizado. Conserva evidencias y redacta un informe breve para gerencia.

Todo sucede dentro de oficina 3D → monitor → escritorio → aplicaciones del escenario. Los datos, sesiones y efectos son ficticios. No se realizan peticiones HTTP reales, no se prueban direcciones de Internet ni se modifica la autenticación de CyberSim. El estudiante es revisor autorizado del expediente; las identidades de prueba son personajes simulados, no cuentas reales ni credenciales obtenidas de otra persona.

**Recursos A0:** expediente, visor de código/configuración y glosario, política de roles siguiente, logs, inspector de petición y manual de las operaciones disponibles. Sin internet, colaboración o asistente externo durante esta administración; cambiar esos recursos exige registrar otra condición. El diagnóstico inicial se solicita antes de mostrar los parches disponibles. Los materiales iniciales no se ocultan; el diagnóstico se interpreta como análisis con esos recursos, no memoria sin documentación.

## 3. Escenario y materiales exactos

### 3.1 Superficie y activos

La oficina contiene una `Estación de Análisis` y una representación de `Servidor de Aplicación`. En el monitor se abren cuatro aplicaciones: **Expediente**, **Código y configuración**, **Pruebas de petición** e **Informe**. El visor integra pestañas para portal público y panel interno. Son capacidades de dominio **por implementar**; el escritorio integrado existente no demuestra que ya estén disponibles.

La topología lógica distingue `Red Pública` y `Red Operaciones`. `andeanlogix.lab.invalid:8080` representa seguimiento público y `:9090` panel administrativo. Son etiquetas de simulación, sin resolución DNS ni sockets. El login del panel funciona: elegir una identidad válida crea su sesión de laboratorio. Aun así, el inspector permite una petición directa sin pasar por esa pantalla para contrastar la protección del servidor. No hay consola del sistema operativo ni código arbitrario ejecutable.

### 3.2 Estado de negocio de cada prueba

Cada prueba empieza en una copia limpia de este estado; nunca hereda una cancelación de la prueba anterior:

```json
{"shipments":[{"id":"SH-301","status":"in_transit","route":"R1","driver":"DR-7"},{"id":"SH-302","status":"pending","route":"R2","driver":"DR-8"}],"drivers":[{"id":"DR-7","credentialRevision":7},{"id":"DR-8","credentialRevision":2}]}
```

Catálogo de rutas permitidas: `R1`, `R2`, `R3`. Los documentos históricos adicionales `incident-shipments.json` y `incident-access.log` son de solo lectura y no forman parte del estado mutable: registran `SH-299` y `SH-300` como cancelados. No se proporcionan nombres, direcciones, contraseñas ni datos personales reales.

### 3.3 Identidades y sesiones de prueba

| Selector de actor | Sesión presentada | Registro confiable del servidor |
|---|---|---|
| anonymous | ausente | Sin identidad |
| expired | `S-OLD` | Expirada antes del instante de la prueba |
| tampered | `S-CLIENT-FORGED` | No figura en el registro; rechazo, aunque el texto afirme un rol |
| customer | `S-CUSTOMER` | Válida, sujeto `c1`, rol customer |
| dispatcher | `S-DISPATCH` | Válida, sujeto `d1`, rol dispatcher |
| support | `S-SUPPORT` | Válida, sujeto `s1`, rol support |

Las cadenas son identificadores públicos de fixtures, no tokens de autenticación ni claves válidas fuera del modelo. Una sesión válida se obtiene del registro del servidor; el cuerpo, URL y `X-Role` de la petición **no pueden otorgarle permisos**. El instante fijo de prueba es `2026-03-02T09:00:00Z`: las tres sesiones válidas caducan a `2026-03-02T17:00:00Z` y S-OLD caducó a `2026-03-02T08:00:00Z`. No avanzan con el reloj del estudiante ni al pausar. Al seleccionar expired/tampered no se simula un acceso válido a otra cuenta.

### 3.4 Funciones y política suministrada

| Función de prueba | Método y destino | Payload válido fijo | Rol permitido y efecto exacto |
|---|---|---|---|
| cancel | POST `/admin/shipments/SH-301/cancel` | `{"reason":"Prueba autorizada"}` | dispatcher: SH-301.status pasa de in_transit a cancelled; demás campos intactos |
| reassign | POST `/admin/shipments/SH-302/route` | `{"route":"R3"}` | dispatcher: SH-302.route pasa de R2 a R3; demás campos intactos |
| reset | POST `/admin/drivers/DR-7/credentials/reset` | `{"reason":"Prueba autorizada"}` | support: credentialRevision de DR-7 pasa de 7 a 8; respuesta resetQueued=true, sin contraseña |
| tracking | GET `/tracking/SH-301` en 8080 | Sin cuerpo | Cualquier actor: SH-301 e in_transit de la copia inicial; ninguna mutación ni información administrativa |

| Estado de sesión/rol | cancel POST | reassign POST | reset POST |
|---|---|---|---|
| anonymous, expired o tampered | 401 | 401 | 401 |
| customer válido | 403 | 403 | 403 |
| dispatcher válido | 200 y efecto cancel | 200 y efecto reassign | 403 |
| support válido | 403 | 403 | 200 y efecto reset |

Todos los GET a funciones administrativas son 405 sin mutación, incluso si la identidad es válida. La autorización de estas tres funciones es por rol y clase de recurso del laboratorio; no pretende modelar una política multiempresa completa. Una función crítica no deja de serlo porque el botón esté oculto o la URL sea poco conocida.

### 3.5 Archivos de código y configuración iniciales

`routes-before.txt`, recurso de lectura, muestra estas decisiones, no código para ejecutar en el anfitrión:

```text
cancel:   validar payload; cancelar; responder
reassign: interfaz oculta el botón sin sesión; servidor valida payload; reasignar; responder
reset:    servidor exige sesión válida; valida payload; aumenta credentialRevision; responde
config:   si maintenance=true y allowUnauthenticatedMaintenance=true, omitir guards
```

`ui-login.txt` muestra que el login crea una sesión válida de laboratorio y que la interfaz usa ese estado para mostrar botones. `sessions.json` contiene las seis condiciones anteriores. `admin-policy.json` contiene la matriz de roles. `network.conf` empieza con 8080 público y 9090 accesible desde ambas redes. `maintenance.conf` empieza con `maintenance=false` y `allowUnauthenticatedMaintenance=true`: una excepción peligrosa puede activarse aunque el modo no esté activo al abrir el caso.

`incident-access.log` conserva las líneas de autoría:

```text
2026-03-02T08:10:00Z request=h1 network=public method=POST action=cancel shipment=SH-299 session=absent response=200 state=cancelled
2026-03-02T08:11:00Z request=h2 network=public method=POST action=cancel shipment=SH-300 session=absent response=200 state=cancelled
2026-03-02T08:12:00Z request=h3 network=ops event=login subject=d1 result=success
```

La ausencia de otro login no prueba por sí sola el control que falta, la identidad de un atacante ni la integridad de todos los registros históricos. El expediente aporta una pista; la reproducción controlada, el flujo de código y el cambio de estado permiten sostener la conclusión sobre este modelo. No se atribuye automáticamente cada cancelación real o un vector externo a ese log ficticio.

## 4. Operaciones y parches representados

El estudiante puede inspeccionar, citar artefactos, guardar un diagnóstico, comparar revisiones, seleccionar un parche estructurado, configurar exposición/mantenimiento, ejecutar peticiones, leer el estado antes/después y redactar el informe. No escribe middleware libre ni ejecuta librerías. Los parches corresponden a transformaciones de código confiables del futuro motor; sus nombres no equivalen a un veredicto de seguridad.

Configuración inicial: `guard=ui_only`, `maintenanceBypass=true`, `adminIngress=public_and_ops`, `adminService=true`, `publicTracking=true`.

| Campo | Valores y mecanismo exacto |
|---|---|
| guard | ui_only: cancel/reassign no comprueban sesión en servidor; reset exige sesión, sin comprobar rol. cancel_only: añade sesión y política de rol solo a cancel; reassign/reset conservan tratamiento inicial. session_only: todas las funciones exigen sesión válida, pero admiten cualquier rol válido. request_roles: todas exigen sesión, pero usan X-Role si se aporta y, si no, el rol registrado. server_roles: todas exigen sesión válida y usan exclusivamente su rol del registro para comprobar la matriz |
| maintenanceBypass | true: con la condición de prueba maintenance=true se omiten guards de cualquiera de las funciones; false: mantenimiento no cambia autenticación ni autorización |
| adminIngress | public_and_ops: 9090 alcanzable desde ambas redes. ops_only: alcanzable solo desde Operaciones. closed: inaccesible desde cualquiera, también para el operador legítimo |
| adminService | true: panel activo; false: unavailable sin ejecutar la petición |
| publicTracking | true: 8080 responde al seguimiento público; false: unavailable |

El recurso de comparación muestra la transformación `server_roles`: para **cada petición** se resuelve sesión en registro confiable, se exige vigencia, se obtiene rol de ese registro y se comprueba permiso de la acción antes del acceso a datos/mutación. No basta con que el estudiante seleccione una casilla llamada «login». `cancel_only` demuestra por qué parchar un único endpoint no protege las demás funciones.

Guardar una configuración crea una revisión con los cinco parámetros completos; un valor no enumerado devuelve `configuration_error` y deja intacta la revisión previa. El inspector solo despacha las operaciones y blancos de prueba declarados: una operación fuera del catálogo devuelve `not_supported`, sin red ni mutación. Los nombres de encabezado se comparan sin distinguir mayúsculas; el valor de rol del ataque debe ser el literal dispatcher o support de la batería. Ningún texto se evalúa como JavaScript.

### 4.1 Orden normativo de una petición administrativa

1. Comprobar servicio y alcance de red. Servicio apagado produce unavailable; ingreso bloqueado, connection_blocked. Ninguno implica que se haya comprobado una identidad.
2. Comprobar método. Solo POST puede llegar a los tres handlers; GET devuelve 405, sin mutación.
3. Aplicar el guard de la revisión y la condición de mantenimiento seleccionada. En el parche correcto no existe excepción: sesión ausente/expirada/no registrada → 401; sesión válida sin permiso → 403.
4. Validar el payload y después existencia/precondición del recurso. reason debe ser texto de 1 a 120 puntos de código Unicode después de quitar espacios iniciales/finales; route debe ser R1/R2/R3; no se admiten claves extra. Campo/formato no admitido → 422. Recurso inexistente → 404. Cancelar un envío ya cancelado o reasignar a la misma ruta → 409, sin volver a mutar.
5. Si todo se admite, realizar únicamente el efecto de la tabla y responder 200. Una sesión de support no puede cancelar porque también sea «personal interno».
6. Registrar revisión, prueba, red, método, identidad comprobada o no, decisión, regla aplicada, estado de negocio antes/después y secuencia de auditoría. Un rechazo conserva exactamente shipments y drivers; puede añadir auditoría del rechazo. La comparación de integridad del estado excluye ese registro de observación, no excluye los recursos de negocio afectados.

El estado se reinicia por prueba, no por actor: también se evita que dos operaciones del **mismo actor** cambien la referencia de comparación. Restablecer el caso o cargar otra revisión conserva la bitácora y las ayudas del intento. Un fallo del motor devuelve technical_error, nunca un 401/403 que se puntúe como defensa. Una entrega sin persistencia confirmada no se considera cerrada.

## 5. Pruebas y propiedades del verificador

**B306, función legítima:** dispatcher puede cancelar SH-301 y reasignar SH-302 desde Operaciones; support puede aumentar la revisión de DR-7 desde Operaciones; seguimiento público responde desde ambas redes. Cada efecto coincide con la tabla y no modifica otros recursos.

**Q306, contrato de protección:** se cumplen las decisiones de la matriz con maintenance=false **y true**, los métodos no autorizados no mutan, los encabezados de rol no amplían permisos y las peticiones inválidas no cambian negocio. Los accesos que no llegan al handler por restricción de red se registran como bloqueados de red, no como autenticación correcta; Operaciones debe seguir permitiendo probar realmente los guards.

**C306, reducción adicional de exposición:** adminIngress=ops_only, con servicio administrativo y seguimiento activos. Las operaciones administrativas desde la red pública se bloquean antes del handler; las permitidas desde Operaciones y el seguimiento público continúan. B∧Q significa corrección del conjunto base, no seguridad universal. El cierre narrativo de **remediación integral** requiere también C; si falta, el informe declara exposición residual, no inventa que la segmentación reemplaza autenticación.

### 5.1 Batería reproducible definida

| Grupo | Construcción y salida requerida |
|---|---|
| M306 | Producto de 6 actores × 3 acciones × 2 métodos GET/POST × 2 redes × 2 condiciones maintenance=false/true: 144 peticiones. Cuerpo válido según acción. Desde Operaciones: aplicar tabla de sesión/rol en POST y 405 en GET. Desde Pública: connection_blocked si ops_only; si public_and_ops, mismo resultado que Operaciones. closed no satisface los accesos requeridos de Operaciones |
| F306 | customer válido envía X-Role=dispatcher para cancel/reassign y X-Role=support para reset, desde Operaciones y POST, con ambos modos de mantenimiento: 6 peticiones. Resultado 403 y negocio idéntico |
| P306 | Cuatro POST desde Operaciones, modo normal y actor autorizado: cancel con reason vacío → 422; reassign con route=R9 → 422; reset con clave extra role → 422; cancel dirigido a SH-NOT-FOUND con reason válido → 404. Sin mutación en las cuatro |
| U306 | anonymous consulta tracking desde ambas redes: 2 peticiones, 200, SH-301 in_transit y sin mutación |

La batería tiene **156 entradas por configuración**. Para M306, las respuestas 200 se comparan con el efecto exacto, no solo con el código HTTP. No se necesita someter al estudiante a 156 clics: puede elegir casos individuales o una batería por categoría; el corrector ejecuta el conjunto completo sobre una copia de la revisión entregada. Las pruebas automáticas del corrector no cuentan como selección o interpretación del estudiante en D4.

Pruebas complementarias normativas, **no incluidas en la enumeración de 156 entradas**: reason de 120 puntos de código válido frente a 121/solo espacios inválidos; un campo obligatorio ausente; repetición de cancel sobre copia ya cancelada →409; reassign a la ruta actual →409; configuración no enumerada/operación no soportada conservan el estado. Para estos dos contrastes409, el fixture declara expresamente la precondición inicial distinta; no contamina otra prueba. La futura implementación debe comprobarlos junto con el conjunto base.

Ejemplos discriminantes que deben ser visibles como hechos:

| Prueba | Estado inicial representado | Con guard correcto, sin bypass y ops_only |
|---|---|---|
| anonymous cancel desde Operaciones | 200 y SH-301 cancelled; el login se omitió | 401; SH-301 sigue in_transit |
| customer cancel desde Operaciones | 200 y cancelación aunque no tiene permiso | 403; estado intacto |
| dispatcher reset desde Operaciones | 200 con sesión válida, aunque su función no lo autoriza | 403; revisión DR-7 sigue 7 |
| support reset desde Operaciones | 200 y revisión 8 | 200 y revisión 8; no se devuelve una contraseña |
| dispatcher reassign desde Pública | 200 y ruta R3 | connection_blocked; desde Operaciones sigue 200 |
| anonymous reset con mantenimiento | 200 por excepción de mantenimiento | 401 incluso con maintenance=true |
| dispatcher GET cancel desde Operaciones | 405 y estado intacto | 405 y estado intacto |

### 5.2 Rutas admisibles y contraejemplos

En las opciones representadas, `server_roles + maintenanceBypass=false + adminService=true + publicTracking=true` satisface B/Q con ingreso público u Operaciones. `adminIngress=ops_only` añade C y es la remediación integral propuesta. No exigir ordenar primero red y después guard o viceversa; se puntúan propiedades de la revisión final y evidencias, no el recorrido del autor.

Un middleware común, guard por ruta o una arquitectura equivalente fuera de estas tarjetas puede ser válida si demuestra la misma política, orden y pruebas; conservar descripción/evidencias y pasar a `requires_review`. No ejecutar código arbitrario ni asignar 0 solo por no reconocer la ruta. No afirmar que la tarjeta modela todas las variantes de un framework real.

Contraejemplos: ocultar URL/botón deja el acceso directo; session_only permite funciones a customer; cancel_only deja rutas expuestas; request_roles eleva permiso con X-Role; corregir guards y conservar bypass falla al activar mantenimiento; cerrar todo bloquea al personal; bloquear solo Pública no evita un actor sin permiso dentro de Operaciones. Cambiar un mensaje a 403 después de mutar tampoco satisface Q.

## 6. Sesión, ayudas y retroalimentación

1. Familiarización neutral y expediente inicial. D1 solicitado: «¿Qué función parece no comprobar identidad o permiso y qué evidencia lo apoya? Distingue observación e hipótesis». No mostrar aún el menú de parches; se admite «no lo sé».
2. Investigación libre dentro de los artefactos y pruebas; guardar revisiones. El resultado inmediato muestra status, regla, estado antes/después y eventos. No dice «selecciona server_roles» ni revela la rúbrica resuelta. Probar enseña sobre el sistema; A0 aquí significa sin ayuda individual de contenido, no actuación sin información nueva.
3. Intervención y comprobaciones. Solicitar ayuda congela el segmento anterior; conservar texto, momento y revisión. Reiniciar no elimina la exposición ni crea autonomía nueva.
4. Entrega congelada y explicación D2: «¿Por qué la pantalla de login no protegía cada función? ¿Qué diferencia hay entre sesión válida, rol autorizado y red permitida? ¿Qué cambia en mantenimiento?». D4: «Cita una prueba de rechazo sin mutación y una de operación legítima; ¿qué no puedes concluir?».
5. Informe y cierre. Mostrar perfil por dimensión/ayuda y hechos B/Q/C. Abrir entonces clave y práctica, sin sobrescribir el intento. El cierre de éxito integral informa que el personal autorizado recupera operaciones y se redujo exposición; el cierre parcial nombra qué propiedad sigue fallando sin culpabilizar al estudiante.

**A1 común:** ayuda de navegación/accesibilidad sin decidir controles, conforme al marco. No penalizarla como una pista conceptual por defecto.

**A2 literal:** «Compara el control de la pantalla con lo que ejecuta cada ruta al recibir una petición directa. Revisa identidad, permiso y estado antes y después; prueba también una función que deba seguir disponible».

**A3 literal:** «Haz que las tres funciones validen una sesión vigente en el servidor y obtengan su rol del registro confiable antes de mutar. Conserva esa verificación en mantenimiento. Prueba un usuario sin permiso desde Operaciones y los roles legítimos; después limita 9090 a Operaciones sin cerrar 8080 ni impedir al personal trabajar». Lo producido después es ejecución guiada, no solución independiente.

Pausar conserva el intento; abandonar antes de presentar una fase la deja NE/not_presented. Con oportunidad válida, «no lo sé» u omisión confirmada se registra 0/no_attempt solo en esa dimensión. Fallos o pérdida técnica de evidencia producen NE con causa. No usar un cronómetro como nota: el incidente tiene tiempo narrativo, no umbral empírico de rapidez.

## 7. Rúbrica de evidencia y anclas

| Dimensión | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| D1 | No localiza un control relevante o afirma que conocer otra URL prueba un ataque | Identifica un acceso extraño o login insuficiente sin vincular ruta y consecuencia | Vincula una petición directa y código/configuración con falta de identidad/permiso antes de la mutación | Además distingue omisión de autenticación, defecto de roles y excepción de mantenimiento, sin deducir identidad atacante del log |
| D2 | Atribuye seguridad al secreto de URL, existencia del login o puerto distinto | Reconoce uno de los controles, pero mezcla identidad, permiso y alcance de red o conserva contradicción esencial | Explica autenticación por petición, autorización por acción y por qué el servidor debe decidir antes de mutar | Además explica bypass de mantenimiento y limitación de segmentación; diferencia evidencia del modelo de garantías de producción |
| D3 | Solo conserva el estado inseguro o apaga todo sin preservar función | Aplica control pertinente pero B o Q fallan | B y Q verdaderos en la revisión entregada | B/Q/C verdaderos, remediación integral de este conjunto |
| D4 | No aporta una prueba interpretable o usa un mensaje como única prueba | Solo prueba rechazo, solo un rol o no inspecciona estado | Vincula al menos un rechazo sin mutación y una operación legítima de la revisión entregada; interpretación correcta | Añade discriminación entre roles, modo mantenimiento y red; delimita cobertura y explica evidencia faltante |

NE se aplica con las reglas de la sección anterior y no vale cero. D3 se basa en el estado y pruebas del corrector; no asignar D1/D2 automáticamente a partir de ese resultado. Las dimensiones no son factores independientes validados, y sus evidencias pueden compartir la misma causa; no sumarlas en un porcentaje global de conocimiento.

Anclas docentes — ejemplos de contenido, no redacción exigida:

- D1=2: «La petición sin sesión alcanza cancel y cambia SH-301, y routes-before no comprueba sesión en ese handler». D1=1 si solo dice «falta login»; D1=3 añade diferencia con reset y evidencia de mantenimiento, sin identificar al autor del incidente.
- D2=0: «Ahora nadie sabe el puerto y está protegido». D2=1: «Hay que autenticar», sin explicar la función del rol. D2=2: «Una sesión identifica a support, pero solo el servidor comprueba que reset está permitido; el botón no verifica una petición directa». D2=3 añade mantenimiento y que un actor interno también puede carecer de permiso.
- D3=1: parche cancel_only o session_only; D3=2: ambas configuraciones B/Q descritas; D3=3: esa política más ingreso ops_only sin destruir seguimiento. D3=0 para apagar ambos servicios como única medida.
- D4=1: «Recibí 403» sin observar el estado. D4=2 cita el envío intacto tras rechazo y la revisión de credencial aumentada en una petición autorizada. D4=3 compara mantenimiento/red y declara que no probó CSRF, robo real de sesión, concurrencia o todas las rutas de un sistema real.

## 8. Informe de incidente y variante

El formulario de cierre pide: **observación**, IDs de pruebas/artefactos; **impacto confirmado** en envíos/credenciales del modelo, separado de sospechas; **causa** y controles omitidos; **corrección** aplicada y propiedades B/Q/C; **comprobación** positiva/negativa; **riesgo residual y prevención**. Una recomendación pertinente es integrar la matriz de autorización a la revisión de cambios y probar excepciones de mantenimiento. No se exige afirmar que se descubrió quién canceló los envíos o que se garantizó la seguridad completa de la startup.

**Variante B cerrada:** empresa y reglas sin cambios; SH-301/SH-302 → SH-401/SH-402, DR-7/DR-8 → DR-17/DR-18, R1/R2/R3 → R4/R5/R6; credentialRevision 7/2 → 11/4; la operación reset aumenta 11→12. Las sesiones pasan a `S2-CUSTOMER`, `S2-DISPATCH`, `S2-SUPPORT`, `S2-OLD`, `S2-CLIENT-FORGED`; ausencia sigue ausente. Sustituir referencias en datos, política, peticiones, logs y clave, preservando roles, decisiones y estructura. Fechas de historia, reloj fijo y caducidades pasan de2026-03-02 a2026-03-03 con las mismas horas, orden e intervalos. No se presume igual dificultad ni se llama pretest validado a ninguna forma. Tras conocer A, B es desempeño con exposición previa; no una medición basal independiente.

## 9. Condiciones de implementación futura y evidencia disponible

El escritorio y la integración con el monitor pueden reutilizarse. Se requieren nuevas capacidades confiables para visor de código/estado, registro de sesiones ficticias, guard evaluable, petición controlada, comparación de negocio y expediente de evidencias. No introducir valores libres de evento ni simular una capacidad inexistente cambiando únicamente el manifiesto; seguir la [guía de escenarios](../../guides/escenarios.md). Fases propuestas: expediente/diagnóstico → intervención → verificación/informe; el recorrido de investigación dentro de fase es libre.

La comprobación de escritorio de autoría enumeró 120 configuraciones y una batería de 156 entradas por configuración. Observó dos configuraciones B/Q y una B/Q/C, con cero cambios de negocio en respuestas rechazadas de esa traducción. Los conteos incluyen pruebas sintéticas y opciones del modelo; no son resultados de estudiantes, un pentest ni test de la aplicación implementada. El [registro de investigación](investigacion/306-andeanlogix.md) conserva procedimiento, límites y fuentes. No hay RED/GREEN funcional de CyberSim en esta entrega documental.

Los antecedentes científicos justifican separar política esperada, comparación de identidades, estados y efectos, no la eficacia educativa de esta versión: [Rennhard et al. 2022](https://link.springer.com/article/10.1007/s42979-022-01271-1), [A2CT, ICISSP2025](https://digitalcollection.zhaw.ch/server/api/core/bitstreams/1c48b773-c827-497b-9196-7945ffa3685c/content) y [ACtests, preprint2025](https://arxiv.org/html/2505.12770v1). CWE-306 sigue siendo el foco; autorización por rol y exposición son condiciones relacionadas del caso, no sinónimos de autenticación. No se asignan identificadores NICE inventados ni un rol profesional completo.
