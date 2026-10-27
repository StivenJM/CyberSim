# Investigación de NubeAndina

Unidad T8e, S9 y marco conservado. [Fuente íntegro](../fuentes/escenarios-companero.md), [especificación vigente](../cwe-502-nubeandina.md). La contribución es un diseño de medición con materiales verificables, no descubrir una nueva cadena de gadgets ni demostrar eficacia de CyberSim.

## Pregunta, alternativas y prueba prevista

¿Qué evidencia diferencia creer que un objeto opaco es seguro de comprender qué tipos, efectos y autoridad acepta el restaurador? Se contrastan Base64, MAC posterior, filtro de raíz, esquema/lista previa, datos sin fábrica y sesión en servidor. Además: actualización por antigüedad frente a identificar una entrada y API alcanzables; resultado final frente a efectos que ocurrieron antes o una publicación parcial.

Los fixtures se produjeron como autoría exploratoria, no preregistro ni observaciones de personas. Después de fijar JSON, contexto, key/tag, reglas y resultados requeridos se prevé releer los vectores desde Markdown y contrastar verificación correcta/alterada y rutas del modelo. Nunca ejecutar una cadena de explotación, instalar dependencias vulnerables o contar casos de autor como validación psicométrica.

## Tres revisiones progresivas reales

| Ciclo | Pregunta y búsqueda | Evidencia y revisión acumulativa | Límite |
|---|---|---|---|
| NA-I1 | ¿Es suficiente representar un dato grande sin una ruta de efectos? `Java deserialization security 2025 USENIX gadget chains defenses safe parsing serialization paper`; `Analyzing Prerequisites known Deserialization Vulnerabilities Java Applications EASE 2024 paper pdf` | NA-R1/R2 exigen entrada y camino, no solo nombre de librería. Se fija un formato tipado de juguete y un hook inerte con orden observable; se añade anidamiento S04 | No se reproduce Java ni se afirma que JSON tenga callbacks nativos |
| NA-I2 | ¿Una firma o lista superficial resuelve cualquier contenido? `site.owasp.org deserialization cheat sheet HMAC before deserialization untrusted data`; búsqueda NIST HMAC; reapertura FLASH/readObject | Distinguir autenticidad, esquema y efectos. MAC válido en S04 no autoriza un tipo; S08 inválido exige verificación antes de publicar. Se admiten DTO, lista completa inerte y sesión en servidor por propiedades | MAC es simétrico, no cifrado; clave de prueba pública no es seguridad de producción; no prohibir un parseo básico acotado sin efectos anterior a MAC |
| NA-I3 | ¿Una biblioteca vieja explica el incidente o basta actualizarla? `dependency age vulnerability not outdated dependencies empirical study 2024 software security update`; `"Analyzing Prerequisites" deserialization "entry point" 2024` | NA-R2 muestra combinación de entrada y dependencias, incluso recientes. Se añade catálogo ficticio sin CVE inventado, diff de versión insuficiente y política de revisión/regresión. Se distingue publicación final y fallo parcial mediante NA-C1 | No inferir vulnerabilidad de antigüedad ni ausencia de riesgo de «cero avisos»; la atomicidad es requisito de ingeniería propuesto, no efecto educativo demostrado |

Las diferencias entre huellas de ejecución permiten revisar una explicación rival, no eliminarla universalmente. Un estudiante podría seleccionar una tarjeta correcta con ayuda; por eso se preservan momento/texto de ayudas, diagnóstico con recursos, explicación de cierre y pruebas elegidas, sin sumar dimensiones como factores independientes ya demostrados.

## Fuentes originales y acceso

| ID | Referencia y localizador consultado | Aporte y límite |
|---|---|---|
| NA-R1 | Zhang, Y., Wen, M., Liu, S., He, D. y Jin, H. (2025), *Precise and Effective Gadget Chain Mining through Deserialization Guided Call Graph Construction*, USENIX Security,2947–2964. [Actas originales](https://www.usenix.org/system/files/usenixsecurity25-zhang-yiheng.pdf). PDF disponible; §2–3, ejemplos readObject y limitaciones de grafo examinados | Rutas y efectos frente a asociación superficial. No importar su tasa de detección ni confundir detector de gadgets con evaluación estudiantil |
| NA-R2 | Kreyßig, B. y Bartel, A. (2024), *Analyzing Prerequisites of known Deserialization Vulnerabilities on Java Applications*, EASE. [PDF institucional](https://www.diva-portal.org/smash/get/diva2%3A1883988/FULLTEXT01.pdf), DOI10.1145/3661167.3661176. Texto disponible; §2 y§4, discusión de requisitos/avisos examinados | La explotación depende de entrada y cadena alcanzables; versiones recientes no implican ausencia de mecanismos. No generalizar cifras de Java a esta simulación |
| NA-R3 | Santos, J.C.S., Mirakhorli, M. y Shokri, A. (2024), *Seneca*, DOI10.1145/3649851. [Original de autores ya utilizado en investigación anterior](https://joannacss.github.io/preprints/oopsla24-preprint.pdf) | Reutilizado como antecedente de callbacks/orden, no contado como lectura íntegra nueva ni réplica independiente |
| NA-R4 | OWASP, [Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html) y [WSTG](https://owasp.github.io/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Injection/23-Insecure_Deserialization). Páginas originales y pasajes sobre restricciones/autenticidad consultados | Guías de mecanismos, no ensayos educativos ni prueba de que un parser determinado sea seguro |
| NA-R5 | NIST, [SP800-224 Initial Public Draft](https://csrc.nist.gov/pubs/sp/800/224/ipd), estado publicado consultado | Se identificó explícitamente como borrador, no se citó como estándar final ni certificación de conformidad del ejercicio |

Se localizaron Modelstamp2026 y notas comerciales/skills sobre HMAC: no se adoptaron como fundamento experimental o dependencia del producto. No se descarga un artefacto de gadgets ni se verifica explotación sobre un servicio. No se afirma exhaustividad de literatura o auditoría universal de correcciones.

## Fixture criptográfico realmente generado

Se generaron siete JSON compactos y sus Base64/hash/HMAC con Node v24.22.1 y OpenSSL3.5.9, clave pública de laboratorio, contexto `NA1|session|org-7|`. Se publican JSON de S01–S06, receta exacta de S07, tamaños, hashes y tags. S08 altera un byte del tag de S01. La misma generación comprobó tags recomputados y diferencias ante alteración de mensaje/tag: nueve comprobaciones booleanas verdaderas. Es una comprobación de consistencia de autoría, **no una validación independiente de seguridad criptográfica**.

La relectura desde Markdown y los resultados del modelo, cuando se ejecuten, se registran aparte en la [verificación del conjunto](../verificacion-especificaciones.md). Las rutas WebCrypto, Worker, UI, persistencia, librerías y circuito de calificación todavía no se han implementado ni probado. No existe un estudiante real detrás de ninguno de estos registros.

## Qué se puede y no se puede justificar

Defendible con alcance: codificar no autentica; comprobar después de un efecto no lo previene; tipos/autoridad necesitan contrato; información de versiones y avisos no sustituye alcance. Propuestas locales: límites de tamaño, gramática, tres rutas, prueba de fallo de publicación, formato y secuencia de ayudas. No demostrado: mejor combinación para toda población, equivalencia de formas A/B, dificultad, confiabilidad, dominio operativo o ahorro de costes. La lista de tareas futura debe conservar estas diferencias.
