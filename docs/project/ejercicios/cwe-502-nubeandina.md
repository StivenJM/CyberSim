# NubeAndina — investigar una sesión que reconstruye comportamientos

**Conjunto 2.0, propuesta documental, no implementación ni validación humana.** Caso CWE-502 del [fuente del compañero](fuentes/escenarios-companero.md), líneas278–350. Conserva el [marco](../marco-evaluacion-ciberseguridad.md) y aplica el [contrato común](README.md). Slug: `nubeandina-sesiones-no-confiables`. Sustituye el importador de preferencias anterior; el activo ahora es la sesión de trabajo y su autoridad.

## 1. Qué se conserva y qué se completa

Se mantienen gestión de eventos, sesiones de trabajo con filtros/plantillas/preferencias, objeto serializado que viaja cliente–servidor, reconstrucción anterior a validar, falsa confianza en codificación opaca, reinicios/permisos/configuración anómalos, código/dependencias/logs, comprobación inocua, alternativas de formato simple/listas de clases/integridad/sesión en servidor, revisión de dependencias, reporte y cierre.

**Adiciones de diseño:** formato exacto `NubeSession/1`, identidades y reloj fijos, constructor pedagógico con efectos inertes, versiones de una dependencia ficticia, tres rutas de corrección admisibles, pruebas con MAC válido pero esquema no admitido, límites y publicación transaccional. No se atribuyen estas decisiones a una aprobación del compañero.

La inferencia buscada es comprender datos→selección de tipos→comportamientos y distinguir codificación, autenticidad, esquema y autoridad. No se mide construir gadgets reales, auditar Java ni operar una biblioteca de producción. La simulación nunca ejecuta clases arbitrarias: un intérprete cerrado representa los efectos del catálogo; analizar JSON básico **no los ejecuta por sí mismo**.

## 2. Consigna, política y escenario

> En NubeAndina los organizadores guardan sesiones de trabajo y las devuelven al servidor para retomarlas. El equipo confió en que el objeto estaba codificado. Hay registros de reinicios, cambios de permisos y un archivo de configuración modificado. Investiga el camino de los datos, demuestra el mecanismo con las pruebas inofensivas, corrige la confianza en el cliente y conserva la sesión legítima. Revisa la dependencia señalada sin dar por probado que su antigüedad causó el incidente. Explica qué hechos sustentan el diagnóstico y qué no se sabe.

Oficina de NubeAndina, monitor de `Estación de Análisis`, servidor lógico `Servidor de Aplicación` y paneles Portal de eventos, Sesión, Código y dependencias, Registros, Pruebas e Informe. Nuevas capacidades propuestas; no se presupone que la terminal actual ejecute un lenguaje o abra una shell real.

Política visible:

- Principal autenticado fijo `org-7`, rol servidor `organizer`; nunca se toma el rol del cliente como autoridad.
- Puede restaurar solamente su sesión vigente: filtros track en `security,design,infra`, pageSize entero1–50; template `basic,report`; theme `light,dark`.
- Extensiones: máximo dos notas pasivas de texto de hasta80 caracteres. No elegir tipos con efectos, aunque el objeto tenga codificación o MAC válido.
- Máximo JSON decodificado2048 bytes, profundidad estructural5 y entrada codificada4096 caracteres. Estos valores son límites pedagógicos declarados, no óptimos científicos.
- Expiración ISO UTC estricta; debe ser posterior a `2026-10-20T10:00:00Z`, reloj de prueba fijo. Todas las verificaciones preceden a la publicación de autoridad/estado.

Estado de negocio inicial de cada prueba: `principal=org-7; sessionOwner=org-7; role=organizer; filters={track:infra,pageSize:20}; template=basic; theme=light; restarts=0; config=clean`. principal representa identidad autenticada y no cambia desde el payload. La auditoría es un canal separado que puede registrar intentos rechazados sin cambiar ese estado.

## 3. Expediente y mecanismo inicial

| Material | Contenido exacto o regla de construcción |
|---|---|
| NA-CODE-0 | `decodeBase64 → parseData → rebuildTypes → applySession → validate`; cliente y role del objeto pueden decidir estado antes de la comprobación |
| NA-LOG-0 | `2026-10-20T09:20:00Z receive=S04; decode=ok; root=WorkspaceSession; rebuild child=RestoreHook; restarts=1; role=admin; config=dirty; response=rejected_after_restore` |
| NA-LOG-1 | `09:25:00 receive=S07; encoded_size=abnormal; response=parse_or_size_problem`. No identifica acceso remoto real ni un vector ajeno al flujo mostrado |
| NA-DEP-0 | `nubesession-lab=1.4.0`, última revisión ficticia2024-09-01; funciones de reconstrucción disponibles. Catálogo local1.5.0, revisión2026-10-01, conserva API de confianza y recomienda DTO; cambiar versión no elimina una entrada insegura de la aplicación |
| NA-ADV-0 | Catálogo de avisos de laboratorio: no hay CVE real atribuido a ese paquete ficticio. «Sin avisos encontrados» no prueba ausencia de una ruta peligrosa; examinar API usada y alcance |
| NA-README-0 | Texto del equipo: «está codificado y no se entiende a simple vista». Es una afirmación a contrastar, no una propiedad de autenticidad |

El intérprete vulnerable recorre raíz e hijos en profundidad, de izquierda a derecha. `WorkspaceSession` copia owner a sessionOwner y, si existen, filtros, plantilla, tema y role al restaurador; un role ausente no cambia el anterior. `PassiveNote` es dato sin efecto; `RestoreHook` representa tres efectos: incrementar restarts, asignar role=admin en el estado de sesión y marcar config=dirty. No reinicia procesos, cambia permisos reales ni escribe en archivos anfitriones. Después se aplica la política funcional completa, incluyendo tamaño/esquema/dueño/vigencia. La validación posterior devuelve `rejected_after_restore` si falla y no borra efectos ya realizados. Para S07 la razón específica es tamaño; no hay error de sintaxis del JSON construido.

La lista segura recursiva admite solo WorkspaceSession/PassiveNote y el esquema de la política; en DTO ni siquiera hay fábrica de clases, solo copia de campos de datos admitidos. Etiquetas desconocidas o campos adicionales se rechazan sin evaluación de código.

## 4. Documentos y autenticadores reproducibles

Todos son datos inventados de autoría. Se conserva el orden de claves mostrado. `payload = Base64 estándar con padding(UTF8(JSON compacto))`, sin salto de línea ni BOM. El contexto autenticado es el literal `NA1|session|org-7|` seguido de payload. HMAC-SHA256 sobre esos bytes UTF8; clave pública de pruebas: 32 bytes `a1` repetidos, hex `a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1`. **No usar esta clave ni estos vectores públicos para proteger datos reales.** MAC es autenticador simétrico, no firma pública ni cifrado.

**S01**

```json
{"type":"WorkspaceSession","owner":"org-7","expiresAt":"2026-10-20T11:00:00Z","filters":{"track":"security","pageSize":20},"template":"basic","preferences":{"theme":"dark"},"extensions":[]}
```

**S02**

```json
{"type":"WorkspaceSession","owner":"org-7","expiresAt":"2026-10-20T11:00:00Z","filters":{"track":"design","pageSize":10},"template":"report","preferences":{"theme":"dark"},"extensions":[]}
```

**S03**

```json
{"type":"RestoreHook","owner":"org-7","effects":["restart","role_admin","config_dirty"]}
```

**S04**

```json
{"type":"WorkspaceSession","owner":"org-7","expiresAt":"2026-10-20T11:00:00Z","filters":{"track":"security","pageSize":20},"template":"basic","preferences":{"theme":"dark"},"extensions":[{"type":"RestoreHook","effects":["restart","role_admin","config_dirty"]}]}
```

**S05**

```json
{"type":"WorkspaceSession","owner":"org-8","expiresAt":"2026-10-20T11:00:00Z","filters":{"track":"security","pageSize":20},"template":"basic","preferences":{"theme":"dark"},"extensions":[],"role":"admin"}
```

**S06**

```json
{"type":"WorkspaceSession","owner":"org-7","expiresAt":"2026-10-20T09:00:00Z","filters":{"track":"security","pageSize":20},"template":"basic","preferences":{"theme":"dark"},"extensions":[]}
```

**S07:** copia exacta de S01 agregando al final, después de extensions, `note` igual a2500 caracteres ASCII `X`. Esa receta define sus bytes; no se incluye aquí un bloque redundante de miles de caracteres. Incumple tamaño y esquema; debe fallar primero por tamaño, antes de reconstrucción.

| ID | Bytes UTF8 | SHA256 del JSON | HMAC SHA256 esperado |
|---|---:|---|---|
| S01 | 189 | `88fb6894936a3923d7f6527cb6cc75c183b41d18f4ac90d4fe071e3a71c74633` | `c787db8e34f7a6c9e64d57be1b6573242ec8082315dff8f0cf16229001a5482c` |
| S02 | 188 | `e8dc1e1ab9b6ee382dfa22d0ba95cd4d7ff618cd00620af7c4813e77473f5211` | `9f8b96185ab511f0d9c1d997a966a8af84ad84b1cbe73e56568960cf91f3cde6` |
| S03 | 88 | `bde8a3870e4d514f520f04147afb7045a375667255a16ef45f74c09063208be5` | `7a5c2024179989bf6b5ee5814d6f10768127336ddfb6350c1628212e9da5b432` |
| S04 | 261 | `3b320235b6192835e05a453517cc8a9eb9d833d62db630a091dac6e1b6fb7cf5` | `ebbc0df281f52fadf7193b7a5e71d05bf27e7a2e016e73ce06f67f60f5373107` |
| S05 | 204 | `1b7f722813d74b4342f870e82027637165846d91ec3cebfdb96f349e84701723` | `c6f72c9d7eac9312944fe8b361e8c5bfc63141aa1d0c7b3f7ca837f9f0860234` |
| S06 | 189 | `23901c02928f646e0b85aefc6a769eb194c05999cf47cd838991f60d4a096902` | `fecfbdfabe8e0cfd15c30b52c11bf2a08646c4158e255d7fb763a9f85761b6f3` |
| S07 | 2699 | `948f4e3bfaf29db33e03c0fd6b6b4822cb84c9ddb8a618948fcfa4219bab8bfa` | `b0cd02355212e548376aa108f2222e59fc901c5234e59f778ed9a13c6adb445c` |

**S08:** payload de S01 con el primer byte del MAC cambiado mediante XOR1; tag esperado de la prueba adversarial `c687db8e34f7a6c9e64d57be1b6573242ec8082315dff8f0cf16229001a5482c`. Debe rechazarse como integridad inválida. S03/S04/S05 tienen MAC matemáticamente válido deliberadamente: comprobar integridad no vuelve admisible cualquier tipo o autoridad de un productor. Representan un productor/clave de laboratorio comprometido o mal uso, no una supuesta falsificación de HMAC.

En el transporte de objetos, la petición de prueba contiene `payload` y `tag`; el flujo inicial ignora tag. Una variante histórica sin tag se trata como no autenticada, no se inventa un tag de forma silenciosa. En una corrección firmada el cliente emisor se actualiza para emitir el mismo formato documentado. No dar por existente una compatibilidad de protocolos que no se haya implementado.

### Alternativa de sesiones del servidor

La misma batería lógica usa un protocolo diferente declarado, no convierte un ataque en una petición válida:

| Caso | Handle enviado | Contenido del almacén confiable o motivo |
|---|---|---|
| S01 | `SID-7-A` | owner org-7, vigencia11:00Z, datos de S01 |
| S02 | `SID-7-B` | owner org-7, vigencia11:00Z, datos de S02 |
| S03/S04 | `BLOB-S03` / `BLOB-S04` | No son handles válidos; rechazar sin reconstrucción |
| S05 | `SID-8-A` | Existe, owner org-8; principal org-7 no puede usarlo |
| S06 | `SID-7-OLD` | owner org-7, vigencia09:00Z; expirado |
| S07 | cadena de2500 X | Formato/longitud no admitidos |
| S08 | `SID-7-A ` con espacio final | No normalizar ni corregir silenciosamente; handle inválido |

Formato admitido de handle `SID-[78]-[A-Z]+`, máximo32 caracteres; solo las cuatro entradas anteriores existen. En todos los casos se verifica propiedad y vigencia en el servidor. Un handle opaco no sustituye autorización y no demuestra impredecibilidad criptográfica: los IDs del fixture son públicos para investigar.

## 5. Cambios disponibles y transiciones

El revisor aplica diffs de un catálogo confiable al código visible y registra su efecto semántico; no evalúa código libre ni deserializa objetos reales del alumno. Puede proponer otra solución para revisión humana.

| Diff | Flujo producido |
|---|---|
| N0 | Decodificar, reconstruir todo, aplicar, validar al final; estado inicial |
| N1 | Añadir comprobación MAC después de reconstruir y aplicar; no retrocede callbacks |
| N2 | Verificar MAC y tipo raíz antes, luego reconstruir hijos sin lista recursiva; S04 conserva ruta peligrosa |
| N3 | Verificar MAC, límites, datos básicos, esquema, dueño y vigencia; construir DTO sin fábrica de clases; copiar solo campos permitidos |
| N4 | Reemplazar el transporte por handle, resolver desde almacén del servidor con dueño/vigencia; no aceptar blob de sesión externo |
| N5 | Cambiar únicamente nubesession-lab1.4.0→1.5.0 dejando NA-CODE-0; la entrada insegura sigue alcanzable |
| N6 | Verificar MAC, límites y todos los tipos/esquema antes de reconstruir; lista recursiva WorkspaceSession/PassiveNote, sin tipos activos y con autoridad del servidor |

N3/N4/N6 son rutas admisibles por propiedades. N6 solo es suficiente en el catálogo cerrado de tipos inertes definido: no acredita que cualquier lista de clases reales sea segura. No exigir JSON o una marca concreta si otra arquitectura cumple los mismos límites.

Fragmento de publicación independiente: `commit=eager` aplica campos permitidos sucesivamente al estado después de validaciones; `commit=staged` construye una copia y publica todo al terminar, descartando la copia si falla. En funcionamiento normal pueden producir el mismo resultado; el contraste define una diferencia observable. Estado inicial commit=eager.

Secuencia segura firmada: límite de wire→verificación de MAC sobre payload sin reinterpretarlo→decodificación estricta→límite de bytes/profundidad→parseo de datos sin callbacks→esquema/dueño/vigencia→DTO o tipos seguros→publicación. Un parseo básico acotado anterior a MAC que no tenga efectos puede ser una alternativa válida: no penalizar por nombre de función; verificar que **ningún comportamiento/autoridad se publique antes de validar**. El orden prohibido es autenticar después de efectos inseguros, no cualquier lectura de datos anterior.

En N4: validar handle→resolver→comprobar dueño/vigencia→copiar datos confiables sujetos al mismo contrato funcional→publicar. Si el almacén no responde, error técnico, no sesión anónima ni reconstrucción de un blob como fallback.

Operaciones disponibles: abrir documentos/base64/JSON, trazar flujo, comparar logs y dependencias, ensayar S01–S08, aplicar/guardar diff, seleccionar commit, proponer política de dependencia, enviar reporte. No se necesita construir cargas fuera del catálogo ni instalar versiones reales.

## 6. Fases, pruebas y criterios

Expediente y D1 solicitado antes de mostrar diffs; luego investigación, intervención y pruebas en orden libre dentro de fase; congelación de entrega y explicación final D2/D4, después práctica. Los logs de prueba informan pasos/efectos sin decir «elige N3» como ayuda oculta. Tiempo narrativo no se convierte en nota por rapidez.

| Prueba | Inicial N0 | Resultado requerido |
|---|---|---|
| NA-B1 S01 | Restaura datos, sin evidencia de integridad | filters security/20, template basic, theme dark; principal org-7 y rol organizer |
| NA-B2 S02 | Restaura datos | filters design/10, template report, theme dark; misma autoridad confiable |
| NA-Q1 S03 | Se invoca RestoreHook antes del rechazo | Rechazar sin hook, sin restarts, rol/config/negocio inicial intactos |
| NA-Q2 S04 | Raíz admitida, hijo con efectos | Rechazar recursivamente sin hook ni cambio de negocio |
| NA-Q3 S05 | Puede aceptar autoridad del cliente | Rechazar dueño/esquema, nunca rol admin, sin cambios |
| NA-Q4 S06 | Puede aceptar vigencia antigua | Rechazar expiración, sin cambios |
| NA-Q5 S07 | Entrada anómala llega al flujo | Rechazar por límites antes de reconstrucción, sin efectos |
| NA-Q6 S08 | Ignora autenticador inválido | Rechazar integridad/handle inválido, sin efectos |
| NA-C1 | No ocurre en prueba normal | Sobre S02 válido, forzar fallo después del primer campo preparado y antes de completar persistencia; conservar estado anterior y registrar error, sin publicación parcial |

B=B1/B2; Q=Q1–Q6 y cero callbacks/efectos prohibidos en toda la batería. C=C1. Con N3/N4/N6 se espera B/Q; staged además cumple C. No certificar por ID de diff: inspeccionar traza, esquema, autoridad, estado y todos los resultados. N1/N2/N5 y «solo Base64» no satisfacen Q. Rechazar todas las sesiones no satisface B.

Cada entrada empieza con copia limpia de estado y revisión entregada; el almacén de N4 se recrea con sus cuatro registros. La auditoría puede crecer al denegar. En una corrección suficiente, Q exige negocio intacto ante S03–S08; C exige además publicación atómica ante el fault anunciado. En N0/N1/N2/N5 puede haber rechazo posterior con efectos y con eager una publicación parcial: conservar esa evidencia, no borrarla ni etiquetarla NE por ser una vulnerabilidad simulada. Reset mantiene procedencia de exposición y ayudas; no reanuda como basal autónomo un intento ya visto. Fallo real de la herramienta se registra NE donde impide evidencia. NA-C1 es una inyección **simulada y anunciada** en la prueba, no un fallo real imputado al estudiante.

La revisión de dependencias debe indicar inventario/versiones/API usada, avisos consultados y su fecha/limitación, procedencia verificable, responsable, disparadores de revisión y pruebas/rollback antes de actualizar. No puntuar recitar una periodicidad universal, cambiar una versión sin observar efectos o inventar CVEs. Una librería reciente también puede ofrecer mecanismos peligrosos si se usan con datos no confiables.

## 7. Matriz ECD, rúbrica y ayudas

| Objetivo | Evidencia que lo provoca | Rival y contraste |
|---|---|---|
| D1 localizar frontera | NA-CODE-0/NA-LOG-0 y objeto decodificado | Reconoce la palabra Base64 sin seguir efectos; contrastar S04 y primer evento de hook |
| D2 distinguir propiedades | Explicar S04 con MAC válido, S08 inválido y N5 | Cree que firma, formato o actualización son una garantía total; exigir vínculo con tipo/dueño/orden |
| D3 corregir conservando función | Diff/commit y resultado B/Q/C con estado antes/después | Eligió tarjeta por etiqueta; verificador inspecciona propiedades, no nombre |
| D4 comprobar límites | Pruebas legítima/adversa, autoridad y efecto más allá del response | Confunde rechazo con ausencia de efecto; mirar callback/estado y fallo parcial |

| Dimensión | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| D1 | No identifica entrada externa o afirma que codificación da confianza | Señala objeto sospechoso sin punto de reconstrucción | Vincula entrada cliente, reconstrucción y efecto anterior a validar | Además distingue raíz/hijo, autoridad y qué anomalías no están atribuidas por evidencia |
| D2 | Todo JSON ejecuta, MAC cifra o una versión reciente garantiza seguridad | Conceptos pertinentes, con secuencia o propiedad esencial incompleta | Explica datos/tipos/efectos y distingue codificar/autenticar/validar, dueño y vigencia | Además razona MAC válido de tipo prohibido, N5 y alcance de publicación parcial sin extrapolar a gadgets reales |
| D3 | Sin control pertinente o solo niega todo | Barrera parcial con B o Q falsos | B y Q verdaderos | B/Q/C verdaderos |
| D4 | No hay comprobación interpretable | Solo respuesta final, sesión legítima o un objeto | Prueba legítima y adversa de revisión entregada, interpreta hook y estado | Además S04/S08/NA-C1 y política de dependencia basada en evidencia y límites |

Aplicar NE, omisión y contradicciones según marco; sin promedio global. Anclas D2: 0 «No se entiende, por tanto es seguro»; 1 «Le pondría firma»; 2 «Base64 es representación; comprobar después de rebuild no evita el hook. Verifico procedencia y esquema antes de publicar y no tomo el rol del cliente»; 3 añade «S04 tiene MAC válido y sigue siendo inadmisible; actualizar sin quitar la ruta no basta y un fallo en persistencia no debe dejar media sesión». No exigir esas palabras.

**A1:** «Puedes ver representación, traza y estado resultante y guardar la revisión que quieres comparar».

**A2:** «Ubica el primer paso que puede tener efectos, no solo el mensaje final. Compara un objeto raíz normal con otro que contiene un tipo anidado y revisa de dónde procede la autoridad».

**A3:** «Evita reconstruir tipos arbitrarios: puedes usar datos con esquema estricto, una lista completa de tipos inertes y validación previa, o una referencia a sesión guardada en servidor. Verifica integridad cuando el estado viaje al cliente, dueño y vigencia antes de publicar; no uses el rol enviado. Comprueba S01/S04/S08 y publicación staged ante NA-C1». Lo posterior es asistido y se conserva evidencia previa.

El informe para gerencia describe efectos demostrados en laboratorio, exposición potencial sin inventar alcance real, causa de confianza/orden, corrección elegida, dependencia examinada, prevención y lo no probado. Cierre narrativo muestra restauración de trabajo legítimo sin efectos inesperados o riesgo residual explícito, no una cadena de explotación externa inventada.

## 8. Variante y referencias

Forma B: NubeAndina→NubeCampus, org-7/org-8→organizador-A/organizador-B, SID-7/SID-8→SID-A/SID-B con gramática actualizada, filtros security/design/infra→seguridad/diseno/infraestructura, IDs S→R. Mantener estructuras, tamaños/límites relativos y tiempos; regenerar **todos** los Base64/MAC/hash con el contexto nuevo declarado antes de publicarla. No reutilizar tags de A ni declarar equivalencia educativa. La forma A es la instancia congelada de esta especificación; B es receta de autoría y sus fixtures deben verificarse antes de administrarse.

[FLASH, USENIX Security2025, §2–3](https://www.usenix.org/system/files/usenixsecurity25-zhang-yiheng.pdf) fundamenta observar rutas de reconstrucción y efectos; [Kreyßig/Bartel, EASE2024, §2 y§4](https://www.diva-portal.org/smash/get/diva2%3A1883988/FULLTEXT01.pdf) distingue entrada alcanzable y dependencias, incluidas versiones recientes. [OWASP Deserialization](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html) complementa restricciones previas; no es un ensayo de aprendizaje. La [investigación específica](investigacion/502-nubeandina.md) separa mecanismo, decisiones locales, comprobación y ausencia de validez empírica.
