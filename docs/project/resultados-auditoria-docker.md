# Resultado de la auditoría final Docker

Esta referencia conserva las alternativas, riesgos, fuentes y justificaciones que sustentan el sistema. Sus conclusiones se concretan en el [contrato vigente](../architecture/contrato-desarrollo-docker.md) y los [ADRs](adrs/README.md).

Para consultar lo incorporado al código, las verificaciones y los límites actuales, usar el [estado del entorno](estado-desarrollo-docker.md). Los pendientes que aparecen en el informe original corresponden a su fecha de investigación; las decisiones vigentes están en [D01–D26](decisiones-desarrollo-docker.md).

## Investigación y evidencia conservadas

El contenido original permanece completo, incluidas las opciones retiradas y el motivo de su sustitución.

<details>
<summary>Leer el informe original y todas sus referencias</summary>

Los textos siguientes conservan el contexto de su elaboración. Sus pendientes y expresiones de futuro describen esa revisión histórica; el estado vigente es el indicado arriba. No son instrucciones actuales de ejecución.

# Resultado de la auditoría final de planificación Docker

> Cierre posterior por encargo: la consolidación técnica ya terminó en el [contrato v1](../architecture/contrato-desarrollo-docker.md) y [cierre de proyecto](estado-desarrollo-docker.md). Esta página conserva el resultado previo de la auditoría; la provisión manual y aceptación real siguen diferidas.

- Fecha: **18 de octubre de 2026**.
- Estado: **planificación auditada; contrato por cerrar; sin implementación**.
- Detalle: [auditoría técnica completa](../architecture/auditoria-desarrollo-docker.md).
- Acuerdos: [registro D01–D26](decisiones-desarrollo-docker.md).

## Resultado general

Se revisaron **26 decisiones y 171 elementos concretos**, desde persistencia y autorización hasta puertos, límites, versiones, limpieza y opciones descartadas. La auditoría relaciona cada elemento con su razón, evidencia, debilidad y recomendación. Incluye **64 referencias públicas** de mantenedores, documentación, código y prácticas publicadas.

La orientación elegida se mantiene: desarrollo con Docker y edición desde Windows; reutilización de PostgreSQL; n8n, Qdrant y Piper locales; OpenAI, Drive y SMTP externos. Se conserva JSON en Git con actualización explícita y el criterio de mantener el estado funcional mediante mecanismos estables entre entornos.

Las fuentes apoyan prácticas y explican límites; no existe una solución universal de todos los desarrolladores senior. Las elecciones concretas para CyberSim son recomendaciones derivadas de esas fuentes y del código revisado. La investigación no acredita todavía rendimiento ni compatibilidad en el equipo objetivo.

## Debilidades que deben quedar resueltas en el contrato

| Hallazgo | Qué podría pasar | Recomendación y efecto |
|---|---|---|
| H01 — Publicación del conocimiento | PostgreSQL y Qdrant podrían señalar revisiones diferentes tras una caída | Una sola autoridad funcional en PostgreSQL que seleccione colecciones físicas y modelo compatibles; preparar y validar antes de publicar |
| H02 — Turno global de IA | Backend y n8n podrían llamar simultáneamente aunque cada uno tenga su límite | Admisión común e identidad de operación; distinguir timeout de ejecución terminada y revisar reintentos de todas las capas |
| H03 — Reset manual | Podrían llegar resultados antiguos después de borrar los datos de CyberSim | Pausar trabajo cuando se prepare el reset y reconciliar después; rechazar resultados que ya no correspondan a operaciones válidas |
| H04 — Configuración del generador | Si falta una variable, el código actual puede enviar el prompt a un webhook externo de respaldo | Exigir el destino n8n configurado; mostrar el error de preparación en vez de usar ese respaldo |
| H05 — Sesiones y permisos | La separación por un identificador enviado por el navegador no demuestra propiedad de la conversación | Vincular sesiones a identidad autorizada y controlar generación/borrado/estadísticas; incluir expresamente esta corrección en el alcance |
| H06 — Texto y voz | La voz puede consumir el tiempo restante o seguir trabajando después del timeout HTTP | Reservar tiempo de entrega, controlar trabajo Piper y conservar el texto una sola vez; fijar voz permitida |
| H07 — Primer arranque | La preparación podría esperar un consentimiento OAuth que no se puede completar porque n8n aún no está accesible | Grafo de arranque sin ciclos y diagnóstico de configuración pendiente; distinguir primera incorporación del comando cotidiano |
| H08 — PostgreSQL reutilizado | Cambiar la contraseña en Compose no actualiza la guardada en el volumen | Comprobar conexión autenticada y versión antes de migrar; conservar reset exclusivamente manual |
| H09 — Edición y migraciones | Hot reload podría ejecutar código que espera un esquema o dependencias distintos | Mantenimiento explícito para schema/dependencias, con archivos generados conservados en el host |
| H10 — Drive y OAuth | Una consulta incompleta podría parecer una baja; Testing podría obligar a reautorizar periódicamente | Confirmar bajas, paginar correctamente y documentar el estado real del cliente OAuth del equipo |
| H11 — Corpus y proveedor | Un documento podría introducir instrucciones maliciosas o enviarse más información educativa de la necesaria | Tratar documentos como datos, limitar herramientas, citar fuentes y minimizar datos enviados; explicar la retención real del proveedor |
| H12 — Correo y conservación | Una respuesta HTTP correcta podría ocultar correo no enviado; limpieza parcial podría dejar datos sensibles | Alinear expiraciones, estado de envío y reenvío; verificar enlaces y separar retención de logs y ejecuciones |

Estos hallazgos no autorizan todavía cambios funcionales. H01 corrige una recomendación técnica anterior; H05 necesita delimitarse expresamente porque no figuraba entre las correcciones enumeradas en D12. Las elecciones ya aceptadas no se reabren.

## Qué sigue siendo un objetivo, no un resultado

- El presupuesto de **8 GB para Docker** y los límites por servicio requieren medir arranque, build, uso e indexación en Windows 11 con 16 GB y sin GPU.
- Los **120 s de chat, 15 s máximos de voz y 300 s de análisis/generación** son objetivos aceptados; hay que definir cómo cuenta la espera y comprobar los recorridos.
- Tamaños de archivos, fragmentos, contexto, sesiones y retención son parámetros propuestos; ninguna fuente garantiza que sus cifras exactas sean óptimas para este corpus.
- Las versiones candidatas deben verificarse juntas y fijarse a artefactos reales. Publicar una versión no demuestra que sus integraciones funcionen.
- La calidad del modelo y la suficiencia de recuperación necesitan preguntas de referencia y casos negativos en español.

## Cómo terminar la planificación

El siguiente entregable debe ser un contrato concreto que resuelva los mecanismos H01–H12 y reúna comando, configuración inicial, estados, propietarios, mantenimiento y aceptación. Las elecciones internas deben llegar recomendadas y justificadas; no trasladar al usuario una nueva encuesta sobre 171 parámetros.

Solo el equipo puede proporcionar acceso al cliente OAuth, permisos del origen común, presupuesto de OpenAI y destinatario autorizado para pruebas de correo. Es información para preparar integraciones, no para compartir secretos en la conversación.

Las pruebas de ejecución se harán por hitos cuando exista la implementación: inicialización vacía y reutilizada, edición con Watch, recorridos reales, fallos/carreras y medición de recursos. Se definen ahora; su ejecución no es un requisito imposible de cumplir antes de escribir el código.

## Cambios de esta entrega

Se añadió la auditoría y este resumen, se actualizó la continuidad de decisiones y se corrigió la recomendación contradictoria de aliases/manifiesto en los informes previos y el ADR propuesto. Se mantuvieron las tres áreas documentales: explicación técnica en architecture, acuerdos/consecuencias en project y procedimientos ejecutables en guides cuando existan.

No se iniciaron contenedores, no se cambió código/configuración ejecutable y no se modificaron datos ni credenciales. La auditoría incluye investigación pública y revisión estática; no declara listo el futuro entorno.


</details>
