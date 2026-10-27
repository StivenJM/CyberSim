# Investigación de AndeanLogix y funciones críticas

**Salida:** [especificación AndeanLogix v2.0](../cwe-306-andeanlogix.md), propuesta documental; no implementada ni validada con estudiantes. Consulta bibliográfica: 26 de octubre de 2026. Foco: completar la propuesta del compañero sin sustituir el objetivo «Qué tanto saben los estudiantes de ciberseguridad y cómo evaluarlos» por construir un escáner o demostrar seguridad de producción.

## 1. Pregunta y diseño antes de la comprobación

No estaba definido cómo distinguir, con evidencias interpretables, que el estudiante comprende la protección de una función de quien solo activa un login, cierra el puerto o repara una URL. El [fuente](../fuentes/escenarios-companero.md), líneas208–274, exige funciones críticas, roles, exposición, mantenimiento, logs, feedback e informe; no precisa política completa, estados, entradas, ayudas o criterios.

Se adapta el método local de `workspace/Investigación/Descubrimiento e innovación/Marco de trabajo para investigar e innovar.md`: delimitar, revisar antecedentes, alternativas, prueba discriminante, evidencia, revisión, comprobación proporcional e implementación solo cuando se autorice. Se consultó ese documento completo y la plantilla/criterios del [marco conservado](../../marco-evaluacion-ciberseguridad.md). No se aplicó una plantilla como fórmula que garantice validación.

Antes de enumerar el modelo se fijaron estas alternativas:

| Decisión | Alternativa de menor información | Alternativa contrastable | Resultado que cambiaría el diseño |
|---|---|---|---|
| Protección | Login visible o URL no publicada | Petición directa con sesiones/roles definidos por política | Un actor sin sesión modifica negocio: el login no basta |
| Evaluación de efectos | Código de respuesta como veredicto | Estado de negocio antes/después más respuesta | Un rechazo después de mutar invalida el verificador basado solo en status |
| Remediación | Reparar una función o bloquear todo | Matriz de funciones/roles más pruebas positivas | Una función legítima deja de operar o queda otra expuesta: revisar el parche |
| Confianza | Rol declarado en petición | Rol del registro de una sesión comprobada | La cabecera amplía permisos: la verificación de identidad no resuelve autorización |
| Modo mantenimiento | Probar solo modo normal | Mismos actores/acciones con excepción activada | Reaparece acceso ilegítimo: la corrección tiene un bypass |

**Predicción de la batería:** el parche con sesión y rol de servidor y sin bypass debe preservar las tres operaciones legítimas; cerrar el panel completo no debe recibir éxito; restringir la red no debe permitir omitir las pruebas desde Operaciones. Si las tablas o traducción discreparan, corregirlas y conservar el hallazgo, no reinterpretar el resultado como aprobación.

## 2. Tres ciclos progresivos de investigación

Las consultas son reales y nuevas para cada pregunta, no nombres de experimentos. Las decisiones locales son derivaciones, no resultados publicados sobre CyberSim.

### A306-I1 — No inferir permisos solo desde interfaz o logs

**Pregunta:** ¿una pantalla de login y un log sin inicio de sesión permiten decidir qué acceso era legítimo? Se comparó confiar en indicios frente a suministrar política y contrastar peticiones directas. Consultas: `authorization vulnerabilities web applications testing access control USENIX 2024 2023 authentication endpoints paper`; `web applications access control vulnerabilities testing model based authorization paper AC-PT 2022 2024`.

**Evidencia:** A306-01 distingue funciones/objetos y necesita información sobre derechos esperados para interpretar accesos; su procedimiento supone que la navegación suele ofrecer acciones legítimas. Ese supuesto no se adopta como verdad en un caso cuyo defecto incluye controles de interfaz.

**Revisión:** fijar política externa al comportamiento defectuoso; D1 debe unir código, petición y estado. El expediente no identifica al atacante ni vuelve completos los logs. **Límite:** se apoya una forma de observación; no se demuestra que estudiantes entiendan esa política.

### A306-I2 — Incluir mutaciones sin contaminar la comparación

**Debilidad de I1:** el antecedente2022 solo prueba GET para evitar efectos, pero cancelar/reasignar/restablecer son operaciones mutadoras. Consulta: `"A2CT" "Schlaubitz" "2025" access control state side effects reset`. Se recuperó A306-02 por depósito institucional tras403 del editor.

**Evidencia:** A306-02 amplía métodos y restaura estado al cambiar de usuario; su discusión conserva el problema de cambios mientras se usa un mismo usuario. **Revisión:** en este laboratorio finito se restaura una copia por petición, no solo por actor, y se observa la mutación esperada exacta. Los GET administrativos no mutan. Una prueba individual no cambia la siguiente, aunque las dos usen dispatcher.

**Límite:** el reinicio por petición sirve al contraste del modelo, pero no observa errores dependientes de historia o concurrencia. No se importa el escáner, su rendimiento ni resultados de vulnerabilidades como evidencia educativa.

### A306-I3 — Comprobar seguridad y función tras cambios de configuración

**Debilidad de I2:** muchas denegaciones pueden significar que todo está apagado, no que la política es correcta. Consultas: `"Testing Access-Control Configuration Changes for Web Applications" paper 2025 authors`; `"Automated Testing of Broken Authentication Vulnerabilities" AuthREST state 2025`; `"Testing Access-Control Configuration Changes" correction retraction`; búsqueda oficial de WSTG v4.2.

**Evidencia:** A306-03 examina deltas de solicitudes permitidas y denegadas al cambiar configuraciones, con límites de cobertura dinámica. La guía A306-N2 distingue el login de una petición directa. AuthREST apareció como trabajo pertinente sobre autenticación, pero sus otros ataques no se añaden a este caso solo para aumentar cobertura temática.

**Revisión:** separar B/Q/C, mantener seguimiento público y roles legítimos; añadir mantenimiento y cabecera de rol a la batería. No usar «muchos403» como nota ni introducir fuerza bruta o protocolos OAuth ajenos a la propuesta. **Límite:** el preprint no valida estas rúbricas y no se afirma que sea el procedimiento óptimo.

## 3. Fuentes originales y acceso real

TC-S significa texto completo recuperado con secciones indicadas examinadas, no lectura exhaustiva; R, resumen original. Normas/guías se separan de papers.

| ID | Original y versión consultada | Acceso y uso acotado |
|---|---|---|
| A306-01 | Rennhard, M., Kushnir, M., Favre, O., Esposito, D. y Zahnd, V. (2022). *Automating the Detection of Access Control Vulnerabilities in Web Applications*. SN Computer Science3,376. DOI[10.1007/s42979-022-01271-1](https://link.springer.com/article/10.1007/s42979-022-01271-1) | TC-S: Solution Approach, Testing Multiple Users and Roles, Validating. Antecedente de prueba por identidades; alcance GET y supuestos de navegación, no tareas educativas |
| A306-02 | Schlaubitz, M., Veyisoglu, O. y Rennhard, M. (2025). *A2CT: Automated Detection of Function and Object-Level Access Control Vulnerabilities in Web Applications*. ICISSP2025 vol2,425–436. DOI10.5220/0013092700003899. [PDF institucional](https://digitalcollection.zhaw.ch/server/api/core/bitstreams/1c48b773-c827-497b-9196-7945ffa3685c/content) | TC-S: §3, pp427–428 y discusión §5, p435. Soporta observar efectos y controlar estado; no se heredan tasas o garantía general |
| A306-03 | Xiang, C., Zhong, L., Mugnier, E., Nguyen, N., Zhou, Y. y Xu, T. (2025). *Testing Access-Control Configuration Changes for Web Applications*. [arXiv2505.12770v1](https://arxiv.org/html/2505.12770v1),19-05-2025 | TC-S: §3–4 y §6. **Preprint**, no se acredita revisión por pares de esta versión. Respalda el contraste de cambios, no la seguridad total ni la medición educativa |
| A306-N1 | MITRE, [CWE-306 v4.20](https://cwe.mitre.org/data/definitions/306.html) | Definición oficial: funcionalidad que requiere identidad comprobable no la autentica. No equivale a toda falta de autorización |
| A306-N2 | OWASP WSTG v4.2, [WSTG-ATHN-04](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/04-Authentication_Testing/04-Testing_for_Bypassing_Authentication_Schema/) | Guía técnica, no experimento. Petición directa puede eludir protección limitada al login |
| A306-N3 | OWASP, [Authorization Regression Testing Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Regression_Testing_Cheat_Sheet.html), consulta26-10-2026 | Guía técnica actual: matriz actor/recurso/acción y regresiones. No se usa como prueba de eficacia pedagógica |

Fallos de acceso: PDF y HTML SciTePress130927 devolvieron403; se recuperó el mismo artículo por ZHAW. La página ORBilu de *Automated Reverse Engineering...* devolvió timeout; no se afirmó lectura íntegra ni se usaron sus cifras. La URL antigua WSTG/latest redirigió a portada; se cambió a la página versionada v4.2. Resúmenes, índices y páginas comerciales solo orientaron recuperación, no sustituyeron los originales usados.

La búsqueda acotada de correcciones no aportó aviso pertinente sobre A306-03; no es auditoría exhaustiva de integridad ni garantía de que no existan actualizaciones. A306-01/A306-02 pertenecen a una misma línea de desarrollo: no contarlas como réplicas educativas independientes. Las muestras y porcentajes de sus evaluaciones no se trasladan al escenario.

## 4. Comprobación de escritorio ejecutada

Se ejecutaron funciones JavaScript temporales en el runtime de herramientas, sin escribir un motor en la aplicación. Material: estado y reglas de la ficha; 5 guard bundles ×2 condiciones de bypass ×3 ingresos ×2 estados de seguimiento ×2 estados del panel =**120 configuraciones**. Cada una recibió144 combinaciones de actor/acción/método/red/mantenimiento,6 intentos de cabecera de rol,4 payloads/precondiciones no admitidos y2 consultas públicas: **156 entradas de batería**,18720 evaluaciones de esa batería.

Resultados observados:

- Dos configuraciones satisfacen B/Q: server_roles, sin bypass, servicios activos y entrada public_and_ops u ops_only.
- Solo ops_only añade C; no se premia cerrar el panel o seguimiento.
- No apareció cambio de estado de negocio en respuestas rechazadas de esa traducción.
- Se comprobó el estado mutado y la respuesta en ejemplos básicos del flujo; el oracle de la batería relaciona decisión esperada y condición de cambio. Una implementación deberá además comparar el efecto exacto de cada recurso con la ficha, no conformarse con «algún cambio».

La comparación de integridad utilizó igualdad de serialización del estado de negocio de la copia; no se midió resistencia criptográfica, autenticación real, HTTP ni un hash firmado. La bitácora de observación puede crecer tras un rechazo: no se confunde con mutar shipments/drivers. La propia traducción y las reglas comparten autor, por lo que no constituyen verificación independiente. Los resultados no son estudiantes sintéticos, fiabilidad de puntuación ni test de CyberSim implementado.

## 5. Afirmaciones y próxima evidencia necesaria

| Afirmación | Estado y límite |
|---|---|
| Login visible o puerto distinto bastan para probar protección | Rechazada por los contraejemplos definidos; no se afirma frecuencia humana |
| La matriz explicita la política y permite comprobar este conjunto finito | Respaldada por definición y comprobación lógica local |
| Las revisiones propuestas miden comprensión del estudiante | No demostrado: hace falta revisión de contenido, proceso de respuesta y pilotaje |
| Esta combinación es la mejor posible o resiste un sistema real | No justificado; alcance excluido |
| La ausencia de un login histórico identifica al atacante | No justificado; no se infiere del expediente |

Siguiente contraste humano: revisar si estudiantes distinguen rol, identidad y red o solo reconocen nombres de tarjeta; observar barreras de lectura y si los anclajes permiten corrección consistente. La variante B cambia identificadores y valores, no acredita equivalencia. Población efectiva, ética, muestra y consecuencias se justifican antes del campo conforme al marco; no se reclutó a nadie.

Para implementar se requieren capacidades de dominio nuevas, no solo datos del manifiesto. La prueba funcional de esa implementación debe cubrir método/actor/red/mantenimiento, rechazo sin mutación, efecto legítimo exacto, errores técnicos distintos de denegaciones y revisión de soluciones no previstas. Esta tarea no autorizó crear esas capacidades, instalar dependencias o ejecutar servicios vulnerables.
