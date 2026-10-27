# Comprobaciones realizadas — especificaciones 2.0

Fecha26-10-2026. **Comprobaciones de autoría documental y modelos inertes; no tests del CyberSim implementado, estudiantes ni validación psicométrica.** Los antiguos conteos de los cuatro casos retirados no se transfieren aquí.

## 1. Evidencia observada

| Unidad | Ejecución real y resultado | Límite |
|---|---|---|
| AndinaPay, autor de ficha | PowerShell7.6.5/.NET AesGcm: siete cifrados/roundtrips exactos, negativos de key/tag, K1 no abre R03 ni filas K2; relectura de Markdown correcta | No WebCrypto, custodia/migración/UI/scanner |
| AndinaPay, control del padre | Node24.22.1/OpenSSL3.5.9 lee claves/envelopes/plaintexts del documento: siete descifrados iguales y once rechazos (siete tags alterados + cuatro claves K1 incorrectas) | Segundo motor mejora consistencia de bytes; no prueba seguridad de la aplicación |
| BibliotecaViva, autor | Python SQLite3.53.1 in-memory: trece entradas concatenadas/enlazadas; title_only/fixed_S101 y sonda INSERT denegada preservando estado | Véase memo para checks no ejecutados; no Worker/WASM ni toda matriz futura |
| BibliotecaViva, control del padre | Node SQLite3.53.4, DB desde tablas del documento y consulta ligada extraída: tres consultas correctas, redes→1001/1003, O'Reilly→1002, entrada adversa literal→vacío | Diferente motor empaquetado, no suite completa ni adaptación del navegador |
| AndeanLogix, autor | Modelo inerte120 configuraciones×156 entradas=18.720 evaluaciones; dos configuraciones B/Q, una B/Q/C, rechazo sin cambios de negocio | Autor comprobó presencia de efectos, no exactitud independiente de todos sus valores; no servicio HTTP real |
| AndeanLogix, control del padre | 6actores×2métodos×3acciones=36 transiciones seleccionadas: rechazo sin cambios, efectos exactos cancel/reassign/reset al permitir | Modelo de política segura; no reproduce red/mantenimiento ni las18.720 |
| NubeAndina, vectores | Generación Node HMAC: siete tags recomputados + mutación de tag/mensaje; control posterior relee siete JSON/hash/bytes/MAC y S08 del Markdown: todo coincide | HMAC correcto no equivale a productor autorizado; clave pública |
| NubeAndina, abstracción cerrada | 7diffs×2commits×(8fixtures+1fault)=126 transiciones. Seis estados satisfacen B/Q y tres también C; corresponden a N3/N4/N6 con staged para C | Modelo resumido reconoce fixtures del catálogo; no prueba todos los límites, parseo, profundidad, handle o Worker |
| TalentoAndino, selección | Trece admisiones V2/L1 coinciden con tabla, tres refutadores (V1 engañado, sin límite, bloquear todo) y cuatro intercalaciones S1/S2×P0/P1=20 checks | Atributos de catálogo, no parser real, almacenamiento, inventario completo o carrera concurrente |
| TalentoAndino, estados adicionales |12 trazas S1/S2×P0/P1×3 actores: acceso provisional, revocación, dos handles temporales distintos, contador final intacto tras rechazo y TA-0100 al aceptar T01 | Modelo inerte de estados; no servidor, almacenamiento ni carrera real |

Los controles del padre son una selección adicional y no sustituyen las suites futuras por ficha. Los números son tamaños de cálculos, **no proporción de conocimiento ni tasa de seguridad**.

## 2. Corrección encontrada antes de consolidar

BibliotecaViva: «redes» coincide con «100% redes» bajo instr; se corrigió primera página a1001/1003. TalentoAndino: se precisó admisión provisional P0, porque un handler que siempre rechaza pending habría hecho redundante el contraste atribuido al modo de publicación. NubeAndina: se explicitó principal/sessionOwner y orden vulnerable para distinguir rechazo final de ausencia de efectos.

[Reproducción del control del padre](investigacion/calculos-autoria.md) contiene fuente del cálculo y resultados. Es un apéndice de investigación, no código de producto o verificador que se deba copiar sin tests.

## 3. Controles documentales

Control final observado:31 archivos Markdown de este conjunto, marco, antecedentes, ADR e índices;245 referencias locales y7 anclas comprobadas, sin destino/ancla ausente, fences abiertos ni columnas inconsistentes; cero espacios finales fuera de la fuente preservada. Los17 identificadores de revisión están presentes (AP3,B89 5,A306 3,TA3,NA3). Los slugs coinciden entre las cinco fichas y arquitectura. Fuente y snapshot idénticos, SHA25648DDFCDD17FF6FE08D6BEF6F88B29C1B92556551B72CDF6D6C1BBB6C07D2F6BD; plan canónico/temporal idénticos; sección7 del marco conserva SHA2566b3cb93060cdc4c71274ff216e8383167141f9c056f48f45bade828102b80fcd. git diff --check no informó errores, solo avisos de conversión LF/CRLF. Git no muestra cambios fuera de docs/ y odd/. Los cambios ajenos de GoogleCloud se conservaron, no se atribuyen a esta investigación.

No se ejecutan build, lint, tests frontend/backend, DB, seeds ni instalaciones por una modificación exclusivamente documental. RED/GREEN de comportamiento no aplica a documentación pasiva; los tests del runtime están en tareas futuras.

La evaluación nativa inicial no pudo clasificar archivos nuevos sin inventario explícito y su preflight falló por acceso denegado antes de mutación; authority not_evaluated. No hubo revisión nativa completada ni PASS, ni se reintentó indefinidamente. Para documentación pasiva se conservan los controles estructurales y el mapa/recheck limitado descritos aquí; no se afirma aprobación del software o del instrumento.

### Coherencia semántica revisada

El mapa transversal read-only detectó tres incompatibilidades y un recheck acotado confirmó su resolución: reset como revisión del mismo intento en AP/TA; entrega técnica AP anterior a explicación; rechazo del adaptador distinto de efectos vulnerables NA. El padre contrastó los pasajes y mantuvo la separación en contrato/plan. El mapa fue selectivo, no un arbitraje independiente de validez ni una revisión exhaustiva de cada enunciado científico. Las correcciones adicionales TA/slug/FUEL se leyeron y comprobaron en esta reanudación.

Una primera ejecución del comprobador documental produjo un falso positivo al quitar el espacio de estado de git status y truncar la d de docs. Se corrigió el comprobador para leer --porcelain=v1 -z sin trim antes de extraer la ruta; el nuevo control no encontró cambios fuera del alcance. No se modificó ningún archivo de aplicación para corregir ese chequeo.

## 4. Criterios antes de publicar un ejercicio implementado

Repetir todos los B/Q/C de la ficha contra el código real, no solo la abstracción; revisar límites y rutas alternativas; integración oficina/monitor, evidencia/persistencia y protección de intentos. Generar y probar forma B antes de habilitarla. Revisión especializada y pilotaje humano siguen pendientes, conforme al marco.
