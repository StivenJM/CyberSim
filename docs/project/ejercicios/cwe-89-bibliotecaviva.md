# BibliotecaViva — investigar y corregir las consultas de préstamos

**Especificación propuesta 2.0, no implementada ni validada con estudiantes.** Caso CWE-89 derivado de la [propuesta del compañero](fuentes/escenarios-companero.md), sección «INJECTION». Se aplica el núcleo del [marco de evaluación](../marco-evaluacion-ciberseguridad.md): D1–D4, A0–A3 y niveles ordinales 0–3/NE. El [registro de investigación de este caso](investigacion/89-bibliotecaviva.md) distingue respaldo científico, decisiones de autoría y comprobaciones realmente realizadas.

## 1. Qué se conserva y qué se concreta

Se conserva BibliotecaViva, plataforma universitaria de préstamos de libros y recursos digitales. El módulo se habilitó esta semana; el lunes la bibliotecaria jefe recibió el incidente de un estudiante de primer semestre. Se mantienen su formulario de título/autor/fecha, la creencia de que «texto» y longitud bastan, consultas concatenadas, código/esquema/logs accesibles, una consulta segura de comparación, errores de base de datos visibles, permisos excesivos, conservación de búsquedas legítimas, informe y cierre gamificado. Todo ocurre dentro de la computadora de la oficina 3D con datos ficticios.

Se concretan aquí materiales, identidades, semántica SQL, acciones, parches, pruebas, ayudas y rúbrica; son **decisiones de diseño añadidas**, no decisiones ya aprobadas por el compañero. La existencia de una consulta segura como recurso A0 impide describir la tarea como recuerdo sin ejemplos ni documentación.

**Ambigüedad que no se convierte en una conclusión inventada:** que existan préstamos disputados no demuestra que la consulta SELECT observada los haya insertado. El incidente tiene una exposición demostrable y un reporte de registros no reconocidos cuya procedencia no está establecida. «Nadie rompió una contraseña ni accedió al servidor» se conserva como afirmación del expediente, no como prueba forense de que jamás hubo intrusión. La respuesta correcta conserva esa incertidumbre.

## 2. Situación y consigna entregada

> Eres parte del equipo de BibliotecaViva. Una estudiante accedió a préstamos de otras personas desde el buscador; además, la bibliotecaria reportó un préstamo que su titular no reconoce. Investiga el recorrido de los filtros, demuestra de forma controlada la alteración de la consulta y corrige el flujo. Mantén las búsquedas legítimas, evita revelar detalles internos y revisa los permisos de la cuenta de la aplicación. Entrega evidencias y un informe breve que separe lo comprobado de lo que aún no sabemos.

La persona evaluada actúa como revisor autorizado del laboratorio; puede consultar el expediente completo. Los actores S101/S102 de las peticiones son identidades ficticias del sistema estudiado, no cuentas del estudiante en CyberSim.

### Política funcional y de acceso visible

- Un estudiante autenticado ve exclusivamente sus préstamos. La identidad se obtiene del contexto de sesión confiable; un campo `request_student` no tiene autoridad para reemplazarla.
- Título y autor son búsquedas de **subcadena literal**, sin distinguir mayúsculas ASCII, sin eliminar tildes, sin recortar espacios ni convertir apóstrofos. `%` y `_` se buscan literalmente; no son comodines de esta interfaz.
- Los tres filtros se combinan mediante AND. Una cadena vacía no restringe ese filtro. Fecha es una fecha exacta `YYYY-MM-DD` gregoriana válida o cadena vacía; no se acepta una fecha imposible.
- Máximo 80 puntos de código Unicode por campo. La paginación admite enteros 1–4, dos filas por página, orden numérico ascendente de `loan_id`; una página sin coincidencias devuelve lista vacía.
- La API pública devuelve `loan_id,title,author,loan_date`; no nombres ni otros datos de la tabla users. El inspector autorizado ve adicionalmente `student_id` y el conjunto completo de candidatos para analizar la exposición. La interfaz pública no usa ese inspector.
- La función de historial necesita lectura de loans y books, no escritura ni acceso a users. Una sesión ausente se rechaza antes de consultar. Un error interno se comunica con mensaje genérico e identificador de correlación; su detalle queda en el registro autorizado.

El envío directo usa el mismo contrato tipado: title/author/date deben ser cadenas, no listas, objetos ni null; page debe ser un número entero, no cadena ni booleano. Una clave ausente toma el valor por defecto; una clave desconocida se rechaza sin consultar DB. Las sesiones válidas de prueba son únicamente S101/S102/S103 y proceden del selector confiable del banco; no se infieren de los filtros. `request_student` es una cadena opcional del banco destinada al contraste de autorización, no un campo público de búsqueda. `typed` rechaza la entrada incompatible antes de DB; `client_only` conserva esta frontera de tipos del adaptador pero omite las validaciones de fecha y longitud para hacer observable su insuficiencia. Una página fuera de 1–4 se rechaza siempre por estar fuera del dominio del simulador, sin mérito de corrección para el parche.

Estas reglas son el contrato local de medición; no se afirma que todas las bibliotecas deban elegir esos tamaños, filtros o paginación.

## 3. Escenario y materiales completos

Slug propuesto `bibliotecaviva-consultas-seguras`; revisión de diseño `2.0`; presentación `office-3d`. No se reserva un ID numérico de catálogo sin comprobar unicidad al implementar. Espacio lógico: oficina TI de BibliotecaViva, Estación de Análisis y Servidor de Aplicación; base de datos como recurso lógico del servidor. No se presupone que exista hoy un nuevo tipo de dispositivo o una terminal SQL/Git general.

Aplicaciones propuestas dentro del escritorio del monitor: **Portal BibliotecaViva**, **Expediente de Desarrollo** y **Banco de Pruebas e Informe**. Reutilizan la superficie del escritorio existente; son capacidades nuevas que requieren implementación y pruebas. No se abre una aplicación vulnerable en un servidor de Internet.

### 3.1 Esquema y datos de la forma A

```sql
CREATE TABLE users(student_id TEXT PRIMARY KEY, display_name TEXT);
CREATE TABLE books(book_id INTEGER PRIMARY KEY, title TEXT, author TEXT);
CREATE TABLE loans(loan_id INTEGER PRIMARY KEY,
  student_id TEXT, book_id INTEGER, loan_date TEXT);
```

| student_id | display_name |
|---|---|
| S101 | Ana Demo |
| S102 | Bruno Demo |
| S103 | Cora Demo |

| book_id | title | author |
|---|---|---|
| 10 | Redes practicas | Luz Vega |
| 11 | SQL sin atajos | Marta O'Reilly |
| 12 | 100% redes | Equipo_A |
| 13 | Redes avanzadas | Luz Vega |

| loan_id | student_id | book_id | loan_date |
|---|---|---|---|
| 1001 | S101 | 10 | 2026-10-20 |
| 1002 | S101 | 11 | 2026-10-21 |
| 1003 | S101 | 12 | 2026-10-22 |
| 1004 | S102 | 10 | 2026-10-20 |
| 1005 | S102 | 13 | 2026-10-21 |
| 1006 | S103 | 11 | 2026-10-23 |
| 1007 | S101 | 13 | 2026-10-23 |

### 3.2 Expediente disponible como A0

| ID de artefacto | Contenido exacto relevante |
|---|---|
| BV-REQ | Política anterior; nota del equipo «solo texto, máximo 80 caracteres» |
| BV-CODE-H | Fuente de historial: fragmentos de consulta y ensamblado definidos en §4 |
| BV-CODE-SAFE | Consulta de catálogo ya corregida: `SELECT book_id,title,author FROM books WHERE book_id=:book_id`, con enlace separado de book_id |
| BV-SCHEMA | Esquema y filas de §3.1; un informe de integridad indica que 1006 está disputado, no lo atribuye a una petición |
| BV-CONFIG | Constructor concat, identidad de sesión, validación solo del cliente, errores raw y cuenta read_write |
| BV-LOG-17 | `09:10:00; request=BV-017; principal=S101; endpoint=history; title=<entrada BV08>; page=2; candidates=1001..1007; returned=1003,1004` |
| BV-LOG-18 | `09:12:00; request=BV-018; principal=S101; author=O'Reilly; query_error; public_detail=near "Reilly": syntax error` |
| BV-REPORT | `09:15:00; biblioteca; titular S103 no reconoce préstamo1006; origen de escritura no establecido; no evento INSERT correlacionado disponible` |

La cronología pertenece al día narrativo de la forma A; no es un reloj que reste puntos. El expediente mantiene el código, las consultas emitidas, parámetros separados cuando existen y correlaciones de petición. Una coincidencia temporal no sustituye a una relación causal demostrada.

## 4. Semántica del buscador y parches admisibles

El formato de referencia es SQLite y sus funciones `lower`/`instr`. Se eligió `instr` para no convertir `%`/`_` en comodines sin advertirlo. No se usa una función SQL de fecha como validador: la validación de aplicación comprueba formato y calendario antes de emitir la consulta. El oráculo de autoría se ejecutó con SQLite 3.53.1; la versión final del adaptador debe quedar fijada y repetir los tests, no deducirse de que una biblioteca es «moderna».

La implementación propuesta es un adaptador de base de datos **en memoria, dentro de un Worker**, con tablas ficticias y consultas de un catálogo confiable. El editor permite seleccionar/parchear constructores y ver su código, no ejecutar JavaScript arbitrario. Los campos de búsqueda siguen admitiendo texto libre bajo el contrato; no se sustituye el comportamiento SQL por detectar dos cadenas de ataque conocidas. Se propone la distribución oficial SQLite/WASM, encapsulada sin persistencia OPFS ni extensiones de host: es una capacidad/dependencia futura, no un componente instalado comprobado. Seleccionar, fijar y revisar la distribución concreta y repetir estas pruebas es tarea técnica de implementación; no usar una conexión a la base de datos de CyberSim.

### Consulta de referencia segura

```sql
SELECT l.loan_id,l.student_id,b.title,b.author,l.loan_date
FROM loans l JOIN books b ON b.book_id=l.book_id
WHERE l.student_id=:actor
  AND instr(lower(b.title),lower(:title)) > 0
  AND instr(lower(b.author),lower(:author)) > 0
  AND (:date = '' OR l.loan_date=:date)
```

Los valores actor/title/author/date se enlazan por una API de parámetros después de definir el texto SQL. La identidad actor procede del contexto confiable. La aplicación ordena el resultado por loan_id y recorta dos filas desde `(page-1)*2` **en ambos estados**, incluso si una entrada vuelve inoperante parte del SQL vulnerable. Este orden/paginación posterior se fija para reproducir el caso, no se recomienda como optimización de grandes conjuntos reales.

### Constructor vulnerable y comparación

El mismo SELECT/JOIN fijo antepone `WHERE l.student_id = '<actor>'`. Añade:

```text
 AND instr(lower(b.title),lower('<title>')) > 0
 AND instr(lower(b.author),lower('<author>')) > 0
 AND ('<date>' = '' OR l.loan_date='<date>')
```

En ese constructor las marcas `<...>` son sustitución textual **sin enlace ni escape**, no parámetros. El actor de sesión por sí solo no salva una cláusula cuyo resto puede convertirse en sintaxis. El inspector muestra el texto construido completo. La consulta segura de catálogo permanece separada e inmutable como recurso de comparación.

| Control de parche | Valores y mecanismo |
|---|---|
| `constructor` | `concat`: interpolación anterior; `title_only`: title se enlaza, author/date siguen interpolados; `named`: todos los valores separados mediante nombres; `positional`: mismos valores con placeholders posicionales; `orm_raw`: reproduce la interpolación en un método raw ficticio de un ORM, sin magia por su nombre |
| `actor_source` | `session`: contexto confiable; `request`: request_student si existe o contexto si falta; `fixed_S101`: hardcode de S101 aunque cambie la sesión; `none`: omite la condición de propietario. Contexto sin sesión siempre se rechaza antes, con cualquier valor |
| `validation` | `client_only`: el formulario limita longitud, pero el envío directo del banco no valida fecha/longitud en servidor; `typed`: tipos/longitud/calendario/page exigidos antes del acceso a DB; nunca eliminar apóstrofos o rechazar `%`/`_` como solución |
| `error_policy` | `raw`: devuelve el detalle interno; `public_id`: devuelve solo query_error, correlación y «Consulta no disponible»; conserva detalle en inspector autorizado |
| `db_role` | `read_write`: cuenta simulada puede leer datos y realizar la sonda de escritura; `history_readonly`: solo lectura de loans/books, escrituras y users denegados; `disabled`: toda consulta denegada, sin resolver la función legítima |

`db_role` representa la política de acceso de la cuenta de BibliotecaViva **en el adaptador**. SQLite no proporciona aquí usuarios/GRANT de un servidor SQL; su enforcement se instrumenta mediante autorización de operaciones/tablas y pruebas de denegación. No enseñar ni documentar un GRANT que el motor no implementa.

Inicial: `concat/session/client_only/raw/read_write`. Para positional, los parámetros son actor, title, author, date, date en ese orden. Sin filtro actor se omite su placeholder y valor; no se desplaza el enlace de los demás. Un ORM correctamente parametrizado que cumpla los mismos invariantes es alternativa revisable; el nombre ORM sin inspección de su API no demuestra enlace seguro.

**Frontera de seguridad del laboratorio:** la búsqueda ejecuta una sola sentencia SELECT; deshabilitar acceso a archivos, red, extensiones, ATTACH, PRAGMA y DDL, y denegar funciones distintas de lower/instr en las consultas de estudiante. Los límites iniciales propuestos son 4096 bytes de SQL generado, ocho filas de salida, 20000 pasos de VM por consulta, 64 MiB de memoria del motor y watchdog de 2 segundos en Worker; son guardas técnicas ajustables con evidencia, no tiempos ni puntuaciones educativas. Alcanzarlos produce `technical_error`, no «ataque impedido» puntuable. Verificar que la distribución elegida permite imponerlos; no simular el enforcement con un indicador visual. La sonda de escritura es una operación confiable concreta sobre una copia desechable, nunca texto SQL libre ni escritura sobre el conjunto principal. No se evalúa evadir esa frontera.

## 5. Acciones y transiciones observables

1. Abrir expediente y fuente; guardar D1 solicitado: «Localiza el punto donde un dato del filtro puede cambiar una consulta y cita un artefacto». Las tarjetas de parche aún no se muestran, pero el ejemplo seguro de catálogo sí, porque forma parte del fuente del compañero.
2. Abrir los controles, modificar un borrador y guardar una revisión. El guardado es atómico; un valor de control no soportado se rechaza sin cambiar la revisión anterior. No se obtiene D3 por abrir el editor.
3. Elegir petición normal/directa, identidad simulada y revisión; ejecutar el buscador. El feedback inmediato muestra consulta/parámetros/IDs/status y cambios de estado, no una respuesta explicativa automática ni nota de conocimiento. Aprender de pruebas es parte de esta condición A0 con recursos.
4. Comparar ejecuciones y anotar qué predijo/observó. No exigir orden de inspección de artefactos ni contar clics como habilidad. Se puede volver a investigar dentro de la fase, sin borrar lo anterior.
5. Ejecutar sonda de permisos o fallo controlado; son pruebas separadas, con resultado en su copia. Reiniciar restaura datos/configuración iniciales como nueva revisión y conserva diagnóstico, ayudas e historial.
6. Entregar y congelar revisión, selección de pruebas y conclusión. El corrector ejecuta batería propia sin atribuirla al estudiante como pruebas elegidas. Después se recoge D2 y el informe, sin reetiquetarlos como pensamiento basal intacto.

Fases de autoría: expediente/diagnóstico, intervención, verificación e informe; IDs de fase propuestos 1–4, solo primera actual. Cerrar una fase por entregar su artefacto no implica respuesta correcta: también admite «no lo sé». Conclusión narrativa «incidente contenido» exige B/Q y el contraste; si falla, cierre «pendiente de corrección» con informe del fallo, no bloqueo indefinido hasta enseñar la solución. El evento que completa el escenario y su verificador son capacidades futuras; no se afirma que los nombres propuestos ya estén en el registro cerrado.

Una pausa conserva condiciones; abandono antes de una fase produce NE/not_presented para esa evidencia. Omisión confirmada con oportunidad válida produce 0/no_attempt según el marco. Error de motor, pérdida de artefacto o límite técnico produce NE con causa y posibilidad de reintento equivalente; no sustituirlo por query_error de dominio.

Los paneles, controles, tablas y resultados deben ser operables por teclado, tener etiquetas y orden de foco coherentes, y presentar status y diferencias textuales sin depender solo de color o posición 3D. La alternativa accesible del escritorio conserva los mismos datos, revisiones y oportunidades; la asistencia de navegación es A1, no una pista sobre qué parche resolverá el caso.

## 6. Batería de pruebas y resultados esperados

Valores por defecto: principal S101, title/author/date vacíos, page1, sin request_student. Entrada de contraste en BV08/BV09: `')) > 0 OR 1=1 --`, de 17 caracteres y usada **solo en este conjunto ficticio**. No se pide construir una carga contra un sistema real.

| Prueba | Cambio frente a valores por defecto | Estado inicial observado en oráculo | Estado de referencia corregido |
|---|---|---|---|
| BV01 | title=`redes` | ok,1001/1003 | ok,1001/1003; candidatos1001/1003/1007 |
| BV02 | author=`O'Reilly` | query_error | ok,1002 |
| BV03 | title=`%` | ok,1003 | ok,1003 |
| BV04 | author=`Equipo_` | ok,1003 | ok,1003 |
| BV05 | title=`zzz` | ok,vacío | ok,vacío |
| BV06 | date=`2026-10-21` | ok,1002 | ok,1002 |
| BV07 | date=`2026-02-30` | ok,vacío | validation_error, sin consultar DB |
| BV08 | title=contraste, page2 | ok,1003/1004; candidatos1001–1007 | ok,vacío; sin cambio de estructura por entrada |
| BV09 | author=contraste, page2 | ok,1003/1004; candidatos1001–1007 | ok,vacío |
| BV10 | page2 | ok,1003/1007 | ok,1003/1007 |
| BV11 | request_student=S102 | ok,1001/1002 | igual; identidad solicitada ignorada |
| BV12 | principal ausente | unauthenticated, sin DB | igual |
| BV13 | envío directo, title=`a` repetida 81 veces | consulta sin coincidencias en contrato inicial | validation_error, sin DB |
| BV14 | fallo DB controlado antes de obtener filas | raw: detalle ficticio `SQLITE_IOERR; loans; /lab/bv.db` | query_error; BV-E14; «Consulta no disponible»; detalle solo autorizado |
| BV15 | sonda confiable INSERT1900 sobre copia | read_write: escritura permitida solo en copia | history_readonly: permission_denied, estado de copia sin cambio |
| BV16 | sonda de permiso SELECT users | read_write: permiso amplio | history_readonly: permission_denied |
| BV-C | principal=S102, filtros vacíos | ok,1004/1005 | ok,1004/1005; ningún préstamoS101 |

BV01–BV12 y BV-C se ejecutaron en el oráculo para los dos constructores inicial/named de autoría. Se ejecutó también una escritura denegada por autorizer y comprobación de hash; BV13/BV14/BV16 y el comportamiento completo del Worker son **criterios definidos, no ejecución observada de una aplicación**. La prueba BV15 de permiso read_write en copia aún requiere su aceptación en implementación; no se finge que ocurrió en la consulta pública.

En toda consulta y en todo rechazo, el conjunto principal loans conserva su estado; ninguna búsqueda inserta registros. La sonda de escritura usa `INSERT INTO loans VALUES(1900,'S101',10,'2026-10-24')` en copia, con confirmación/rollback o descarte de copia. Se compara snapshot antes/después. El reporte de 1006 no se «resuelve» inventando un vínculo con ese INSERT de prueba.

### 6.1 Predicados y soluciones

- **B89:** búsquedas legítimas BV01–BV06/BV10 conservan exactamente filas/campos/orden/paginación requeridos; la consulta segura de catálogo conserva su resultado para book_id11. No se obtiene B con cuenta disabled o rechazando todos los filtros.
- **Q89:** los filtros no cambian la estructura de la consulta de historial; sus valores se enlazan separadamente en todos los puntos; BV08/BV09 no exponen filas ajenas; BV07/BV13 se rechazan antes de DB; BV11/BV12 cumplen identidad; BV14 no expone detalle al actor público; BV15/BV16 deniegan privilegios innecesarios; búsquedas/rechazos no mutan datos. Q describe este conjunto y estos invariantes, no ausencia universal de SQLi.
- **C89:** repetir la función con principal S102 devuelve1004/1005 y mantiene B/Q pertinente para ese principal. Detecta el parche que hardcodea S101. Es contraste intratarea, no transferencia lejana validada.

Ruta completa de referencia: enlace named o positional de **todos** los valores, actor_source=session, validation=typed, error_policy=public_id, db_role=history_readonly. Dos mecanismos de enlace aceptados; no exigir exactamente una secuencia de clics. Una solución fuera de tarjetas se conserva con evidencia y `requires_review`, no 0 automático ni ejecución de código arbitrario.

**Verificador independiente del nombre de tarjeta:** recibe la revisión y sus artefactos efectivos `{sql, parámetros, principal, respuesta, estado}`, no aprueba por `constructor=named`. Reejecuta las peticiones en una base limpia con las filas de §3.1, compara resultados/campos/estado y examina que el texto de la plantilla autorizada no varíe al cambiar valores mientras éstos aparecen separados como parámetros. El constructor del parche no produce su propio veredicto. Añadir prueba negativa en la implementación: una tarjeta llamada named que realmente concatena debe fallar; una implementación distinta con propiedades válidas pasa a revisión humana. Las pruebas de actor, errores y permisos usan sus propios resultados, no la etiqueta del control.

Contraejemplos: title_only deja BV09 vulnerable; orm_raw sigue concatenando; limitar longitud no impide BV08; borrar apóstrofos destruye BV02; enlazar valores pero tomar el propietario de request_student falla BV11; cuenta de solo lectura no impide exposición por SELECT; ocultar errores no separa datos y código; fixed_S101 puede pasar el núcleo bajo S101 y falla BV-C. La implementación no se acepta solo por pasar el núcleo: debe pasar la batería completa incluido C.

## 7. Evidencias y rúbrica específica

| Objetivo | Afirmación y tarea | Evidencia | Rival y contraste |
|---|---|---|---|
| D1 | Localizar dato→consulta usando fuente/logs | Señala construcción concatenada y BV-LOG-17 | Recuerda una etiqueta «SQLi» sin trazar flujo; contrastar consulta segura/BV02 |
| D2 | Explicar mecanismo, corrección y alcance | Causa ligada a consulta y valores; distingue código/dato, autenticación y permiso | Repite «usar ORM»; pedir explicar orm_raw, identidad falsa y escritura no demostrada |
| D3 | Entregar parche con propiedades observables | Revisión congelada, consulta/parámetros y resultados B/Q/C | Sigue receta sin conservar función; BV02/10/C diferencian bloqueo o hardcode |
| D4 | Verificar y delimitar | Pruebas elegidas, interpretación, incertidumbre del informe | Ve indicador verde o cuenta pruebas del corrector como propias; contraste otro campo/actor |

| Dimensión | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| D1 | No localiza la mezcla o culpa al texto como si debiera prohibirse todo | Identifica consulta/filtro sospechoso sin recorrer flujo | Cita BV-CODE-H y BV-LOG-17 para localizar interpolación y alteración | Además diferencia ejemplo seguro y separa exposición comprobada de préstamo1006 no atribuido |
| D2 | Sostiene que longitud, ORM raw o lectura sola solucionan SQLi | Reconoce parte del mecanismo con una contradicción esencial | Explica SQL fijo y valores separados; identidad confiable y límites de permisos/errores | Además razona otro filtro/principal y distingue dato disputado, exposición y escritura no demostrada |
| D3 | No interviene pertinentemente o solo desactiva el servicio/cuenta | Mejora algún control, B o Q incompletos | B y Q en el núcleo de S101, con evidencia factual conservada | B/Q y C; respeta consulta segura y no muta el conjunto principal |
| D4 | No hay comprobaciones interpretables | Solo adversarial o solo legítima, o mira únicamente respuesta final | Elige y explica una legítima y otra adversarial pertinentes en revisión entregada, inspeccionando consulta/parámetros | Añade BV09 y BV-C, comprueba permisos/errores y declara alcance/faltantes sin atribuirse pruebas automáticas |

NE y omisiones siguen el marco. D3 no concede automáticamente D2; una configuración correcta con explicación contradictoria produce un perfil mixto. D2 y D4 no premian longitud, ortografía, número de clics o rapidez. Los descriptores son propuestos, no factores ni cortes calibrados.

**Anclas breves para correctores:** 0 «Solo se acepta texto, así que no puede modificar la consulta»; 1 «Hay que limpiar el filtro»; 2 «El título se incorpora a una cadena que el motor interpreta como sintaxis; el valor debe viajar separado y el propietario venir de sesión»; 3 añade «Enlazar título no arregla author, un SELECT con pocos privilegios aún puede revelar filas ajenas, y no tenemos evidencia de qué insertó1006». Son ejemplos de contenido, no frases obligatorias. Conservar puntuaciones humanas previas a la conciliación y las ayudas; no delegar calificación definitiva a un LLM sin validación.

### Informe e interpretación

Campos del informe: qué ocurrió; solicitudes y artefactos citados; filas expuestas demostradas; causa; revisión entregada; resultados de pruebas; riesgo residual; qué no está demostrado; recomendación preventiva. Para gerencia, bastan frases claras: «El buscador permitió que un filtro alterara la consulta; observamos un préstamo de otra persona. Cambiamos la forma de construir consultas y limitamos permisos. El origen del préstamo disputado requiere investigación adicional». La comunicación es evidencia de D2/D4, no una quinta nota de redacción.

Ejemplo enteramente ficticio: D1=2,A0; D2=1,A0; D3=3,A3; D4=1,A3. El parche pasó la batería después de receta, pero no se puede concluir solución autónoma ni comprensión completa. Mostrar ambos segmentos en lugar de restar una penalización universal por ayuda.

## 8. Ayudas y cierre

**A1:** «Puedes abrir código, esquema y registros, guardar una revisión y elegir una prueba. El inspector muestra lo ocurrido con esa revisión; no decide por ti qué prueba demuestra cada propiedad».

**A2:** «Compara el punto donde se forma la consulta de historial con la consulta segura del catálogo. Prueba también un apellido con apóstrofo y revisa de dónde procede la identidad del estudiante. Un permiso de lectura y una entrada tratada como dato resuelven problemas distintos».

**A3:** «Mantén el historial operativo. Enlaza actor, título, autor y fecha como valores separados; toma actor de la sesión, no de la petición ni de una constante. Valida fecha y límites en servidor, comunica errores mediante correlación y deja la cuenta de historial con lectura de loans/books. Comprueba O'Reilly, los dos filtros alterados, el segundo estudiante y que las sondas de escritura y de users sean denegadas».

Pedir A2/A3 congela evidencia previa y abre segmento asistido antes de mostrar el texto. No borrar trazas anteriores ni llamar autónoma a la corrección guiada. Feedback de una prueba describe hechos; una recomendación resolutiva adicional debe clasificarse como ayuda aunque llegue automáticamente.

Cierre narrativo: si la batería completa se satisface, la bibliotecaria puede consultar historiales propios sin exposición en las pruebas; el reporte de1006 queda pendiente de esclarecimiento. Si no, se muestran función perdida o propiedad aún incumplida, sin inventar nuevas víctimas. Tras el informe se abre práctica con clave; no se reescribe el intento evaluado.

## 9. Forma B y condiciones de validación

Forma B definida por sustitución consistente: S101/S102/S103→S201/S202/S203; loan_id1001–1007→2001–2007; book_id10–13→20–23; Ana/Bruno/Cora Demo→Diana/Elio/Fabi Demo; «Redes practicas»→«Sistemas practicos», «100% redes»→«100% sistemas», «Redes avanzadas»→«Sistemas avanzados», «SQL sin atajos» se conserva; title=`redes`→`sistemas`; las fechas válidas se desplazan siete días, incluida la entrada de BV06, pero BV07 conserva la fecha imposible2026-02-30; apóstrofo, `%`, `_`, clave de campo y payload conservados. La estrategia de hardcode cambia su literalS101→S201 y su etiqueta local fixed_S101→fixed_S201. Sustituir todos los logs y resultados. BV-C usa S202 y debe devolver2004/2005. Los IDs son datos de forma, no IDs de catálogo de CyberSim.

La forma conserva relaciones lógicas; no se afirma misma dificultad ni que administrarla tras A mida conocimiento basal independiente. El orden entre casos/ayudas y la exposición al ejemplo seguro se registran. Población efectiva, ética, revisión de contenido, proceso de respuesta, corrección y generalización se estudian antes de sostener usos educativos; no se han ejecutado aquí.

## 10. Qué debe implementar después otro agente

Definir capacidad confiable para expediente/código y consultas de laboratorio; adaptador SQLite en memoria aislado con límites y permisos; versiones de parches y trazas; pruebas positivas/adversariales y de ausencia de mutación; ayudas segmentadas; informe/rúbrica; manifest de escenario y cierre narrativo. Reutilizar el registro/versionado y superficie del escritorio, no introducir strings de evento arbitrarios ni confundir una reserva de perfil con una app implementada. Seguir la [guía existente](../../guides/escenarios.md) y el plan canónico del conjunto.

La prueba de autoría no sustituye esos tests ni prueba seguridad de un producto. No se ha añadido dependencia, modificado una API ni ejecutado una base de datos real de CyberSim para redactar esta ficha.
