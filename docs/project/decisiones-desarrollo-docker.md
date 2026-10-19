# Decisiones del entorno de desarrollo con Docker

Registro vigente de las decisiones D01–D26, sus motivos y su evolución. Actualizado el **18 de octubre de 2026**. El usuario autorizó la implementación completa después del cierre técnico; las indicaciones antiguas de «no implementar» ya no aplican.

El detalle técnico está en el [contrato del sistema](../architecture/contrato-desarrollo-docker.md), el uso cotidiano en [desarrollo local](../guides/desarrollo-local.md) y la evidencia y límites en [estado del entorno](estado-desarrollo-docker.md). Los IDs de decisiones e historias HU001–HU025 se conservan.

## Decisiones vigentes y justificación

| ID | Decisión | Motivo y consecuencia |
|---|---|---|
| D01 | Windows 11, 16 GB de RAM, sin GPU; objetivo 8 GB Docker | Compatibilidad del equipo; las mediciones de carga siguen siendo aceptación, no una garantía. |
| D02 | OpenAI externo para texto y embeddings | Evita ejecutar un LLM local en el equipo mínimo. |
| D03 | n8n conserva lógica y prompts | Mantiene el editor visual; backend concentra transporte y validación. |
| D04 | Reutilizar cybersim_postgres_data; reset exclusivamente manual | Conserva datos; versión y conexión se comprueban antes de migrar. |
| D05 | Editor Windows y ejecución Linux con Compose Watch | Actualización de fuentes sin compartir node_modules entre sistemas. |
| D06 | JSON en Git y actualización explícita | Los reinicios no reemplazan ediciones locales de workflows. |
| D07 | Descargas iniciales y cambios explícitos de dependencias | No se exige instalación sin conexión; los proveedores elegidos necesitan red. |
| D08 | Preparación completa para declarar listo | Un contenedor vivo o un valor de configuración no certifican el recorrido funcional. |
| D09 | 120 s chat/feedback, 300 s análisis/generación, voz hasta 15 s | Presupuestos incluidos en la espera; sin reintentos interactivos ocultos. |
| D10 | Solo documentos TXT y Markdown | Sin PDF ni OCR en el flujo de ingestión; el corpus mínimo versionado es un acuerdo complementario. |
| D11 | Drive se conserva como origen automático de conocimiento | TXT/Markdown; no OCR ni PDF en este flujo. |
| D12 | Incluir bloqueos funcionales definidos en C01 | Rutas, contratos, audio y permisos forman parte del entorno utilizable. |
| D13 | Un .env privado en la raíz | Secretos proyectados por servicio; excluidos de Git y build. |
| D14 | Piper local | Voz disponible sin otro proveedor remoto de síntesis. |
| D15 | SQLite persistido propio de n8n y clave estable | Reset de Prisma no elimina credenciales ni workflows n8n. |
| D16 | Carpeta común de Drive | Mismo material de desarrollo; cada instancia mantiene su índice local. |
| D17 | Cliente OAuth del equipo con autorización individual | No compartir tokens personales; consentimiento persistido por n8n. |
| D18 | Retirada tras confirmación | Fallo global de inventario no equivale a eliminación de documentos. |
| D19 | Recuperación sana y contexto suficiente | Fallo técnico e insuficiencia de corpus se distinguen; sin fallback general. |
| D20 | Conservar texto cuando falla voz | Aviso de audio no disponible sin repetir la inferencia. |
| D21 | Generaciones independientes | No Redis ni una clave de memoria común entre usuarios. |
| D22 | Historial temporal con aviso de contexto perdido | Sesiones separadas; no persistencia de conversaciones. |
| D23 | Turno global único con prioridad interactiva | Una operación activa y como máximo una interacción esperando. |
| D24 | Último índice válido con aviso de sincronización | Una incidencia Drive no invalida por sí sola conocimiento previamente validado. |
| D25 | SMTP externo | Sin capturador local; aceptación SMTP y recepción son hechos distintos. |
| D26 | Estado funcional en la base CyberSim con Prisma | No cybersim_dev_control; mismo esquema funcional entre entornos. |

## Cómo mantener este registro

Una configuración externa pendiente no reabre estas decisiones. Una desviación comprobada se registra en el estado del entorno y se corrige o se justifica mediante ADR; no se convierte en comportamiento aceptado por cambiar un título. Las versiones, los parámetros y las fronteras de confianza se consultan en C01–C12 para evitar valores duplicados.

## Fundamento y evolución de las decisiones

Se conserva íntegro el registro anterior: respuestas, alternativas descartadas, preguntas resueltas y restricciones. Es evidencia del porqué de las decisiones, no una lista actual de trabajo por definir.

<details>
<summary>Consultar el registro completo de decisiones y sus antecedentes</summary>

Los textos siguientes conservan el contexto de su elaboración. Sus pendientes y expresiones de futuro describen esa revisión histórica; el estado vigente es el indicado arriba. No son instrucciones actuales de ejecución.

# Planificación del entorno de desarrollo con Docker

- Última actualización: **18 de octubre de 2026**.
- Base del código revisado: `8de71f5`. Si cambia el código antes de retomar, contrastar los cambios relevantes sin descartar las decisiones del usuario.
- Estado actual: **contrato técnico v1 terminado; implementación no iniciada; provisión manual y aceptación de ejecución diferidas**.
- Último criterio del usuario: D26, evitar dependencias funcionales exclusivas de desarrollo y exigir creación/mantenimiento estables del estado necesario para la aplicación. D25 conserva SMTP externo; las rondas anteriores siguen vigentes. No se ha autorizado implementar.
- Último trabajo solicitado y realizado: investigación amplia de cada pendiente, comparación de alternativas y selección de recomendaciones I01–I10. Consultar el [informe técnico](../architecture/investigacion-integral-desarrollo-docker.md) y el [resumen de proyecto](recomendaciones-desarrollo-docker.md). La selección investigada no es aceptación del contrato ni implementación.
- Revisión de persistencia: [investigación específica](../architecture/investigacion-persistencia-operativa.md). Se retira `cybersim_dev_control`; la selección de tablas en la misma base/historial Prisma quedó concretada después en el [ADR 0008](adrs/0008-persistencia-funcional-compartida-entre-entornos.md) y contrato v1 por encargo de cierre técnico. No es una implementación ni una aprobación separada de cada campo por el usuario.
- Última iteración: [auditoría final](../architecture/auditoria-desarrollo-docker.md) de D01–D26 y 171 elementos, con 64 referencias, y [resumen de consecuencias](resultados-auditoria-docker.md). H01–H12 corrigen o precisan publicación, admisión/cancelación, reset, bootstrap, identidad, voz, Drive y correo. La selección única de revisión en SQL es una nueva corrección propuesta; H05 requiere delimitar autorización expresamente en el alcance. No dar por aceptados estos mecanismos ni iniciar implementación por la solicitud de auditarlos.
- Cierre posterior por nuevo encargo: el usuario pidió terminar precisamente la consolidación técnica y dejar los otros dos puntos para después. El [contrato v1 C01–C12](../architecture/contrato-desarrollo-docker.md) concreta H01–H12, incluida autorización, y el [cierre de proyecto](estado-desarrollo-docker.md) define B1–B5. La selección técnica ya está especificada; no es funcionamiento validado ni un encargo de implementación. Véase [ADR 0009](adrs/0009-contrato-tecnico-desarrollo-docker.md).

Este es el registro de continuidad de la conversación. Conserva requisitos, decisiones confirmadas, alternativas pendientes y el punto exacto para retomar. La [evaluación técnica](../architecture/evaluacion-desarrollo-local-docker.md) contiene la evidencia de código, los riesgos R01–R24, el diagrama Mermaid de preparación y los casos de verificación. La [decisión de alcance](adrs/0006-alcance-del-desarrollo-con-docker.md) formaliza únicamente las opciones ya elegidas, sin aprobar todo el diseño.

Actualización del 18 de octubre: **D04, D06 y D15–D24 confirmadas**. El usuario eligió «JSON en Git y actualización explícita» tras la [investigación de D06](../architecture/investigacion-versionado-workflows-n8n.md), registrada en el [ADR 0007](adrs/0007-versionado-explicito-de-workflows.md). La [segunda revisión técnica](../architecture/revision-detallada-arranque-docker.md) y las rondas posteriores cerraron persistencia n8n, origen/autorización de Drive, bajas, recuperación del tutor, fallo de voz, generación independiente, historial temporal, turno global y último índice validado durante fallos de sincronización. No quedan respuestas pendientes de D15–D24. La especificación operativa ahora está concretada en el contrato v1; su implementación y verificación siguen sin ejecutarse.

## Objetivo y límites del trabajo

El objetivo es que cada desarrollador pueda preparar y levantar la infraestructura necesaria con un comando Docker, editar el código desde Windows y ver los cambios en los procesos de desarrollo ejecutados en contenedores. El contrato v1 fija `docker compose up --build --watch` y sus condiciones iniciales; el Compose actual todavía no cumple ese objetivo.

El usuario pidió primero una evaluación profunda, preguntas con suficiente contexto y definición de las decisiones antes de implementar. La petición de guardar este registro no autoriza comenzar esa implementación. No se ha solicitado un despliegue de producción, configurar los otros proyectos aportados como referencia, borrar datos ni ejecutar varias copias simultáneas de CyberSim.

El significado de «todo local» cambió durante la conversación: inicialmente se admitían descargas de primera instalación y posterior ejecución sin internet. Después se eligieron expresamente OpenAI, Google Drive y conservar el SMTP externo existente (D25). Por tanto, la infraestructura de desarrollo será local, con esas integraciones externas durante la ejecución. Piper permanece local como excepción expresa respecto a los modelos de IA.

## Cómo leer los estados

Este registro conserva las rondas históricas. Los apartados que dicen «pendiente», «propuesto» o «falta fijar» se refieren a su etapa de definición: para el estado actual prevalece el contrato v1. La consolidación técnica está terminada; quedan implementación, provisión manual y aceptación real. Esto no convierte los resultados sin medir en garantías ni todas las selecciones del agente en respuestas literales del usuario.

- **Confirmado:** elección expresada por el usuario; no equivale a implementación ni a prueba superada.
- **Objetivo sin medir:** cifra aceptada para diseñar y verificar; no es un resultado observado.
- **Propuesto:** recomendación técnica pendiente de cerrar, aunque parezca conveniente.
- **Pendiente:** falta una respuesta o una especificación. No resolverla por silencio.
- **Aplazado expresamente:** el usuario pidió dejarlo para otra ocasión.
- **Sustituido:** una decisión posterior cambió el alcance; no recuperar la premisa anterior como requisito vigente.

## Decisiones detalladas D01–D14

Los identificadores D01–D14 conservan la numeración utilizada en las preguntas de esta conversación. No son HUs ni identificadores de commits. No se añaden historias artificiales al catálogo HU001–HU025 para documentar esta planificación.

### D01 — Equipo mínimo y presupuesto de recursos

**Confirmado:** Windows 11, 16 GB de RAM física y sin GPU dedicada. El usuario eligió «Objetivo de 8 GB para Docker».

El conjunto de contenedores debe diseñarse y medirse dentro de ese presupuesto. Windows, el editor y el navegador también consumen memoria; no se pueden asignar los 16 GB completos a los servicios. No se ha medido consumo en reposo, preparación, ingestión, compilación ni pruebas simultáneas. Tampoco se ha fijado CPU mínima, espacio de disco, arquitectura de CPU ni versiones mínimas comprobadas de Docker Desktop, WSL y Compose.

**Pendiente:** mediciones y límites concretos por servicio. No declarar cumplido el requisito solo porque los contenedores arranquen o utilicen swap.

### D02 — Proveedor de IA y generación de escenarios

**Confirmado:** el usuario pidió que, para desarrollo, la IA siga utilizando la API de ChatGPT/OpenAI y que no se prepare una IA local en Docker todavía.

Se conserva el enfoque de generación actual. La recomendación anterior de un modelo pequeño local que seleccionara piezas para que el código construyera el escenario quedó retirada. Tampoco se deben conservar por omisión los proveedores Gemini u Ollama de los exports antiguos.

La propuesta de integración utiliza OpenAI tanto para generación como para embeddings, de manera coherente en carga y consulta de Qdrant. **Quedan por concretar** modelos, dimensión de vectores, contexto, tamaño máximo de salida, parámetros y control del consumo. Elegir API externa implica red y posibles costes durante uso y pruebas; no se han ejecutado llamadas para esta evaluación.

### D03 — Mantener n8n

**Confirmado:** el usuario eligió conservar n8n en lugar de trasladar sus procesos al backend.

n8n mantiene la responsabilidad de los workflows de generación, análisis y carga de conocimiento. Esto requiere una instancia local con persistencia, workflows distribuibles y configuración de sus credenciales y webhooks. Conservar n8n no significa ejecutar todos los nodos encontrados: algunos están deshabilitados o desconectados. Tampoco demuestra que los cinco exports sean la versión actualmente utilizada en otro servidor.

**Pendiente:** versión de n8n, detalles de preparación/recuperación de su SQLite propio D15, acceso administrativo, provisión de las credenciales OAuth D17 ya elegidas y publicación de workflows. D21 ya exige generaciones independientes. El único uso de Redis identificado está en la memoria del export del generador; no se encontró uso en los workspaces o Compose. No se añadirá Redis por esa memoria eliminada del diseño; cualquier otra necesidad descubierta deberá justificarse antes de incorporarlo.

### D04 — Reutilización del volumen PostgreSQL existente

**Confirmado el 18 de octubre de 2026:** reutilizar el volumen existente. La pregunta estuvo aplazada desde el 16 de octubre, pero ya tiene respuesta.

El Compose actual declara el volumen lógico `postgres_data` montado en `/var/lib/postgresql/data` y un contenedor llamado `cybersim-db`. En el motor Docker consultado se encontró `cybersim_postgres_data`, pero no un contenedor con ese nombre. Se consultó la existencia del volumen; no se abrió su contenido ni se comprobó su versión interna, integridad o registros. La ausencia del contenedor no prueba que la base esté vacía.

El usuario eligió la primera de las alternativas planteadas:

1. **Reutilizar el volumen:** comprobar primero su versión y estado y planificar las migraciones para conservar los datos que contenga. No implica resetearlo ni sobrescribirlo con un seed.
2. **Crear otro volumen:** inicializar una base de desarrollo y datos de prueba en un almacenamiento distinto, conservando intacto el volumen existente.

La decisión afecta a usuarios, cursos, matrículas, progreso y demás filas persistidas. No se refiere a guardar código ni a crear una base por rama. Cambiar de rama dentro de una carpeta no crea por sí mismo otra BD. El soporte de varias copias simultáneas fue una posibilidad planteada por el asistente, no un requisito del usuario.

**Política confirmada:** el nuevo entorno reutilizará `cybersim_postgres_data`; no se necesita volver a preguntar si se crea uno nuevo para sustituirlo. El usuario acepta errores de preparación y considera asumible ejecutar él mismo `prisma migrate reset` si lo necesita por tratarse de desarrollo. El arranque debe informar del fallo y no incluir un reset automático, borrar el volumen ni ocultar el error. Esta respuesta no solicita ejecutar un reset ahora.

Queda por comprobar el estado real antes de conectarlo y fijar la configuración que preserve su identidad. Un reset Prisma recrea el esquema/datos de la aplicación y aplica migraciones; no arregla por sí solo un servidor PostgreSQL que no pueda arrancar por incompatibilidad de sus archivos. En Prisma 7 el seed se ejecuta expresamente después cuando se necesite, no se presupone automático. Véase la [referencia oficial](https://www.prisma.io/docs/orm/v7/reference/prisma-cli-reference#migrate-reset).

### D05 — Edición local y sincronización con contenedores

**Confirmado el estilo de trabajo:** editar en Windows y reflejar los cambios en Docker, como en los proyectos de referencia facilitados. El usuario pidió concentrarse en desarrollo.

Se revisaron, sin modificarlos:

- `C:\Users\stive\Documents\contextual-pii-anonymizer`: Compose Watch, healthchecks, preparación y volúmenes.
- `C:\Users\stive\Documents\Zonride-Backend`: fuentes montadas, herramientas JavaScript dentro del contenedor y proceso de recarga para desarrollo.

**Propuesta técnica:** montar las fuentes necesarias, mantener dependencias Linux separadas de `node_modules` de Windows y ejecutar los procesos de desarrollo dentro de Docker. No exigir un Dev Container. Un Node local opcional para el editor no debe convertirse silenciosamente en requisito para levantar los servicios.

**Pendiente:** rutas y mecanismos exactos, reacción al cambio de lockfile, retorno de migraciones/exports al host, autocompletado y prueba de creación, edición, renombrado y borrado de archivos. No se ha comprobado aún la recarga de CyberSim en Docker.

### D06 — Importación y actualización de workflows

**Confirmada el 18 de octubre de 2026:** el usuario eligió «JSON en Git y actualización explícita», expresando que se tome muy en cuenta. No volver a preguntar si se adopta esa política.

Los archivos JSON de `workspace/n8n` describen nodos, conexiones, consultas y prompts. El backend no ejecuta directamente esos archivos: llama a webhooks de n8n. Para que el futuro entorno funcione con un comando, se propone importar las definiciones adaptadas al almacenamiento de n8n y publicar los workflows necesarios. Ese importador automático todavía no existe.

Editar un workflow desde la interfaz modifica el almacenamiento de n8n, pero no el JSON del repositorio. Por ello, una nueva importación puede reemplazar una definición editada. El conflicto que debe resolverse es el cambio simultáneo de la definición guardada en n8n y de la versión recibida por Git.

Las alternativas inicialmente preguntadas fueron:

1. **Orientación elegida tras la investigación:** conservar la edición de n8n y resolver expresamente las diferencias al actualizar.
2. **Alternativa:** reemplazar automáticamente la definición por el JSON del repositorio, perdiendo la edición que no se haya exportado.

En ambas alternativas se propuso automatizar la primera importación. La detección precisa de diferencias, el tratamiento de cambios solo en Git y la exportación de ediciones deben quedar especificados antes de implementar. Esta pregunta afecta a la lógica de los procesos, no a las matrículas guardadas en la BD de CyberSim.

**Política aceptada tras la recomendación del 18 de octubre:** JSON revisables en Git como versión compartida; edición visual local; importación automática durante la preparación inicial; reinicios posteriores conservan el estado. Los cambios recibidos desde Git se aplican mediante una operación explícita, con revisión y copia local previa, sin fusión automática ni sobrescritura silenciosa. Exportar un workflow es otra operación explícita antes del commit/PR. No realizar commits automáticos desde n8n.

Si cambia el conjunto versionado respecto a la última aplicación correcta, se propone informar de la actualización pendiente y no anunciar el entorno como completamente preparado para esa revisión hasta resolverla, conforme a D08. La política ya está elegida; los mecanismos de detección, comandos y criterios concretos se fijarán con la versión de n8n. La inicialización del clon sigue automatizada; aplicar una actualización posterior de lógica es una acción diferenciada. La [investigación](../architecture/investigacion-versionado-workflows-n8n.md) conserva la comparación y el [ADR 0007](adrs/0007-versionado-explicito-de-workflows.md) registra la aceptación.

### D07 — Descargas e internet

**Antecedente confirmado:** se aceptaron descargas de primera instalación. **Sustituida:** la premisa posterior de ejecutar todo sin conexión dejó de ser válida al elegir OpenAI y Google Drive.

Las descargas de imágenes Docker, paquetes npm y voz de Piper pertenecen a la preparación. Una dependencia o imagen nueva puede necesitar otra descarga. Las llamadas a OpenAI y el acceso a Drive requieren conexión durante sus recorridos de ejecución. No se descargarán modelos locales de chat como parte de este alcance.

No se aprobó una política específica sobre actualizaciones automáticas de imágenes, ejecución sin caché o cambios de versiones. Esos detalles deben cerrarse sin recuperar el requisito offline integral.

### D08 — Preparación completa antes de anunciar disponibilidad

**Confirmado:** «Preparación completa para declarar listo».

Un proceso iniciado o un contenedor marcado como activo no bastan. La preparación debe verificar los requisitos acordados de base de datos, integraciones, workflows, voz y corpus antes de presentar el entorno como listo. Una etapa obligatoria fallida debe identificarse y no ocultarse como éxito.

**Pendiente:** condición verificable de cada etapa, plazo máximo de preparación, recuperación tras interrupción y alcance de la comprobación de Google Drive cuando requiera autorización inicial. El comportamiento si Piper falla después de estar listo ya quedó elegido en D20: conservar texto y avisar; no reabrir esa política.

### D09 — Esperas y concurrencia

**Confirmados como objetivos iniciales, todavía sin medir:**

| Operación | Objetivo acordado |
|---|---|
| Chat | Hasta 120 segundos en total |
| Voz | Hasta 15 segundos dentro del plazo del chat, no añadidos después |
| Análisis de curso y generación | Hasta 300 segundos |
| Concurrencia | Una operación de IA activa y como máximo una esperando |
| Exceso de límite o fallo | Error explícito; sin repetir automáticamente ni presentar resultados inventados |

**Decisión posterior D23:** turno único global, unidades pequeñas de indexación y prioridad al usuario al terminar la unidad en curso. Como máximo una petición interactiva esperando; los documentos pendientes mantienen su estado sin poner todo el corpus delante del usuario. Quedan coordinador entre backend/n8n, respuesta al exceso de solicitudes, cancelación, resultados tardíos y cómputo concreto de deadlines. La propuesta técnica es que la espera cuente dentro del plazo total; debe fijarse en el contrato. Las cifras no garantizan que cualquier CPU o proveedor complete la operación dentro del plazo.

### D10 — Tipos de documentos admitidos

**Confirmado:** solo TXT y Markdown como documentos adicionales. No incluir extracción PDF ni OCR en esta etapa.

Los JSON estructurados de topologías/desafíos generados por el proyecto cumplen otra función y no se excluyen con esta decisión. Los nodos antiguos de extracción PDF deben revisarse al adaptar los workflows, aunque aparezcan en los exports.

**Pendiente:** encoding, tamaño máximo, fragmentación, manejo de ficheros vacíos o malformados y errores de procesamiento.

### D11 — Google Drive como origen de conocimiento

**Confirmado:** «Mantener Google Drive». La detección y actualización deben mantenerse en n8n como proceso independiente de la aplicación. No hacer depender la sincronización de reiniciar CyberSim.

Queda retirada la propuesta de vigilar una carpeta local cada 30 segundos. En los exports se observaron triggers de creación y actualización; no se comprobó un tratamiento completo de bajas. Los objetos de credenciales revisados contienen referencias `id` y `name`, no una autorización transferible a la nueva instancia local.

**Elecciones posteriores:** origen común en Mi unidad personal (D16), OAuth del equipo con autorización individual (D17) y retirada automática tras confirmación (D18). Quedan autenticación inicial, acceso al proyecto Cloud, identificadores, permisos, alcance de carpetas y verificación de cambios/bajas. La clave OpenAI en `.env` no resuelve la autorización de Google.

El corpus mínimo versionado sigue confirmado. Debe existir una carga inicial reproducible sin exigir los documentos privados del usuario y sin esperar a que cambie un archivo de Drive. La coordinación entre esa carga y la sincronización posterior debe evitar duplicados; su mecanismo está propuesto, no implementado.

### D12 — Bloqueos funcionales incluidos en el trabajo futuro

**Confirmado:** incluir las correcciones concretas que impidan comprobar el entorno local, además de contenedores y configuración.

El alcance identificado comprende:

- URLs del frontend y comunicación con el backend desde navegador y contenedores.
- Fechas y contratos del análisis, incluidos cursos vacíos y alumnos sin intentos cuando corresponda al defecto revisado.
- MIME/formato y reproducción del audio producido por Piper.
- Validación de las respuestas de workflows antes de persistir un análisis o utilizar un escenario.

**Cierre posterior:** C01/C06/C09 del contrato v1 fijan reglas, alcance y consumidores afectados, incluida autorización limitada de los recorridos de IA y el desajuste de expiración de correo. La selección exacta de archivos sigue los módulos existentes durante implementación; no autoriza una reescritura general del producto ni trasladar todos los workflows al backend.

### D13 — Configuración privada en la raíz

**Confirmado:** un `.env` privado en la raíz del repositorio, excluido de Git.

La clave OpenAI se proporcionará a consumidores del servidor, incluido n8n cuando corresponda; no se incluirá en el frontend, imágenes ni archivos versionados. No se ha solicitado compartir claves en el chat. La falta de configuración debe producir un diagnóstico que indique qué completar.

**Pendiente:** nombres definitivos de variables, plantilla sin secretos, correspondencia entre variables y credenciales n8n, claves locales estables y autorización Google. El archivo es el punto de configuración elegido; no garantiza que una integración externa quede autorizada sin pasos adicionales.

### D14 — Piper local

**Confirmado:** «Mantener Piper local».

La síntesis de voz se ejecutará localmente y requerirá preparar y persistir su voz. Esta es una excepción expresa a la decisión de no instalar modelos locales de chat. No cambiarla silenciosamente por voz de OpenAI.

**Pendiente:** implementación del servidor HTTP compatible, versión, voz/licencia, arquitectura compatible, tamaño/descarga y comprobación funcional. El fallo durante uso sigue D20, ya aceptada; H06 de la auditoría precisa reserva de tiempo y control de síntesis. El código del servidor Piper no apareció entre los materiales revisados; no se debe asumir que ya está distribuido en este repositorio.

## Acuerdos adicionales que deben conservarse

**Corpus mínimo versionado:** el usuario aceptó un corpus común elaborado a partir del proyecto para que la primera preparación no dependa de sus PDFs/TXT privados. No entregó la ruta de esos documentos y no hace falta volver a exigírsela para ese corpus. La selección exacta y la revisión del contenido siguen pendientes.

**Material disponible:** los cinco exports están en `C:\Users\stive\Documents\CyberSim\workspace\n8n`. Esa carpeta está ignorada por Git; otro desarrollador no recibirá sus archivos al clonar. Los JSON de conocimiento encontrados están en `scripts/rag-output`, mientras que el exportador actual calcula otra ruta de salida. La adaptación y distribución versionada deben diseñarse expresamente; no se han copiado aún los exports a otra carpeta.

**Reglas de documentación:** conservar `docs/architecture` para evidencia y diseño técnico, `docs/guides` para procedimientos y `docs/project` para alcance/requisitos/decisiones, con ADRs dentro de `docs/project/adrs`. Mantener Mermaid para las vistas que aclaren relaciones. No sustituir la guía actual de arranque por comandos del entorno futuro mientras no existan.

**Forma de preguntar al retomar:** explicar los componentes reales, qué datos utilizan, dónde persisten y qué efecto tiene cada alternativa. El usuario pidió detalles suficientes y sin analogías. No repetir preguntas ya respondidas ni interpretar las recomendaciones como respuestas del usuario.

## Segunda ronda de definiciones: D15–D18

Estas preguntas provienen de la [revisión detallada del arranque](../architecture/revision-detallada-arranque-docker.md). **D15–D18 están aceptadas** y desarrollan D03 y D11 sin reabrir D04 ni D06.

### D15 — Almacenamiento propio de n8n

n8n guarda workflows, credenciales cifradas, estado de triggers e historial. Ese estado debe sobrevivir a los reinicios y quedar separado del destino de un reset Prisma de CyberSim.

**Aceptado por el usuario:** «SQLite persistido solo para n8n». n8n utilizará un volumen propio y conservará una clave de cifrado estable. PostgreSQL sigue guardando usuarios, cursos y progreso de CyberSim; no se trasladan a SQLite. El reset de Prisma de la aplicación no tiene como destino la persistencia de n8n.

La alternativa PostgreSQL para los metadatos de n8n no fue elegida. La selección de n8n no exige actualizar la versión mayor del PostgreSQL existente. Quedan los detalles de rutas, preparación, permisos y recuperación; no volver a preguntar qué motor debe utilizar n8n.

### D16 — Origen de Drive por desarrollador

Los exports observan carpetas concretas. Mantener Drive no define si el equipo debe leer los mismos documentos o disponer de carpetas independientes.

**Aceptado por el usuario:** «me gusta la primera opción», origen común, porque evita que cada desarrollador configure sus propias carpetas. D16 decide el origen y la gestión de documentos; no comparte bases de datos ni instancias de n8n y no resuelve por sí sola la autorización D17.

La comprobación de los exports del 18 de octubre mostró que los tres cargadores de conocimiento referencian **el mismo identificador de carpeta**, aunque escriben en tres colecciones diferentes. Solo se compararon los valores exportados; no se consultó el contenido real de Drive. Antes de reutilizar esa estructura habrá que definir filtros o separación de tipos para que un documento no alimente recorridos incompatibles por omisión.

**Organización elegida:** carpeta común de desarrollo con lectura para la integración y edición a cargo de responsables del conocimiento. Cada n8n actualiza su Qdrant local, sin modificar Drive. Un cambio común terminará afectando al índice de todos cuando se sincronice. El corpus mínimo versionado se conserva como punto inicial. D17 ya elige OAuth con autorización de cada desarrollador.

La alternativa de una carpeta propia por desarrollador no fue elegida. Podrá evaluarse un área de experimentos en otra etapa, sin convertirla en requisito inicial.

En ambos casos n8n y Qdrant siguen siendo locales y persistidos por instalación. Compartir una carpeta solo comparte los archivos de origen, no PostgreSQL, conversaciones ni vectores entre desarrolladores. La misma fuente no garantiza respuestas idénticas: también influyen revisión sincronizada, modelo, fragmentación, consulta e historial.

Con un origen común, una corrección o baja repercute en cada índice local al sincronizarse; no hay actualización instantánea ni una única ingestión pagada para todo el equipo. Con orígenes individuales, clonar Git no copia automáticamente documentos o carpetas privados de otra persona. El corpus mínimo versionado ofrece una base inicial común en ambas opciones, pero no convierte la evolución de Drive en contenido versionado por Git.

No volver a preguntar si el origen será común o individual. Quedan por concretar los identificadores del origen compartido, filtros por tipo de conocimiento y alcance a subcarpetas. Elegir origen común reduce configuración de carpetas; no demuestra todavía que no habrá pasos iniciales de autorización.

### D17 — Cliente OAuth y autorización Google

**Aceptado por el usuario:** «OAuth del equipo con autorización individual». El aplazamiento y la investigación anteriores quedan como antecedentes; no se vuelve a preguntar qué mecanismo elegir. No se han configurado credenciales ni accedido a Drive.

Los exports usan `googleDriveOAuth2Api`. Client ID/Secret identifica a la aplicación; cada cuenta Google concede autorización y debe tener acceso a los documentos. Importar los JSON no autentica una nueva instancia.

**Alternativas OAuth:** cliente de desarrollo del equipo con autorizaciones individuales, o proyecto/cliente Google Cloud por desarrollador. La primera centraliza proyecto, API, callback y mantenimiento; cada usuario conserva su consentimiento/tokens. La segunda añade preparación por persona. Compartir Client ID/Secret no equivale a compartir una cuenta Google ni a conceder acceso a una carpeta.

**Alternativa adicional investigada al aceptar el origen común:** cuenta de servicio dedicada a leer ese conocimiento, con permiso sobre los documentos, sin consentimiento personal por cada instalación. El código oficial actual de Google Drive Trigger admite `serviceAccount` además de `oAuth2`; los exports actuales usan OAuth. Hay que comprobarlo contra la versión fijada y adaptar también los nodos de descarga.

**Opción elegida tras conocer el tipo de Drive:** cliente OAuth del equipo con autorizaciones individuales para este origen personal. Centraliza proyecto/API/callback y mantenimiento, evitando exigir un proyecto Cloud por desarrollador. Cada cuenta autoriza su instalación y debe tener acceso de lectura al corpus común. No compartir contraseña/tokens personales del propietario de los documentos. La cuenta de servicio no fue elegida y no se necesita validarla como requisito del entorno.

**Dato confirmado por el usuario:** «Mi unidad de una cuenta personal @gmail.com». No se trata de una Unidad compartida de Workspace. No volver a preguntar el tipo de Drive ni el mecanismo D17. Sigue sin confirmarse el acceso administrativo al proyecto Google Cloud; faltan sus pasos de preparación.

La documentación de Google contempla compartir archivos/carpetas concretos con una cuenta de servicio sin delegación de dominio. La documentación de n8n publica una restricción sobre cuentas nuevas y Mi unidad. Esa diferencia impide prometer compatibilidad sin probar lista, descarga y detección de cambios con permisos reales; no se cambiará de mecanismo silenciosamente. No se realizó esa prueba ni se accedió a Drive.

El callback debe coincidir con el registrado, incluido el puerto local. Puede ser necesario reautorizar si se revoca o expira el permiso. Google documenta refresh tokens de siete días para aplicaciones externas en Testing con los permisos pertinentes; no prometer autorización permanente sin definir el estado del cliente.

D17 está cerrada como política. Client ID/Secret se suministrarán a servicios de servidor mediante configuración privada, siguiendo D13; cada autorización/tokens se conservará en el n8n local cifrado con su clave estable. Quedan provisión, rotación, scopes, estado de la aplicación OAuth y tratamiento de revocación/expiración. No prometer autorización en cada reinicio ni autorización perpetua; no solicitar secretos por chat.

### D18 — Bajas y pérdida de acceso a documentos

Los exports muestran altas/actualizaciones y Qdrant en modo `insert`, sin una etapa explícita de retirada. Esto no demuestra qué hace otra instancia externa en ejecución.

**Aceptado por el usuario:** «Retirada automática tras confirmación». Excluir de búsquedas los fragmentos de un documento cuando se confirme borrado, papelera, salida del alcance configurado o pérdida de acceso. No deducir una baja masiva de un error de red, autorización caducada o inventario incompleto. Conservar un diagnóstico y separar retiro lógico de limpieza física según el contrato que se cierre.

La alternativa de retirar conocimiento solo mediante una acción manual no fue elegida.

La política ya está elegida; falta especificar cómo se confirma una baja, la retención física y la disponibilidad del conocimiento durante un incidente no confirmado. No volver a preguntar si la retirada será manual o automática ni interpretar esta aceptación como autorización para vaciar índices ahora.

## Tercera ronda: D19–D21

Estas preguntas desarrollan C09, C11 y C12 de la revisión técnica. **Las tres fueron aceptadas por el usuario; todavía no están implementadas.**

### D19 — Fallo de recuperación y ausencia de contexto del tutor

El servicio Qdrant actual devuelve `[]` ante errores y el tutor puede continuar sin conocimiento recuperado. Deben distinguirse un fallo técnico (conexión, colección, dimensiones) y una búsqueda sana sin coincidencias útiles.

**Aceptado por el usuario:** «Exigir recuperación sana y contexto suficiente». Fallo técnico → indisponibilidad explícita sin generar una respuesta; búsqueda sana sin contexto suficiente → informar que el corpus no aporta información y pedir aclaración, sin presentar conocimiento general como respuesta respaldada. El contrato de contexto útil y los umbrales se dimensionarán y comprobarán; la mera existencia de un payload no demuestra suficiencia.

No se eligió permitir respuesta general del modelo ante esos fallos o ausencia de contexto.

La política está cerrada y no se vuelve a preguntar. Afecta al tutor; el comportamiento de las herramientas de recuperación del generador no se redefine implícitamente. Quedan su contrato de error y comprobación de contexto, no una autorización para fallbacks silenciosos.

### D20 — Fallo de voz después de la preparación

Piper sigue siendo obligatorio para declarar listo el entorno según D08. Esta pregunta se refiere al uso posterior, cuando la respuesta de texto ya se generó pero la síntesis falla o supera su plazo.

**Aceptado por el usuario:** «Conservar el texto y avisar del fallo de voz». Entregar el texto, mostrar «Audio no disponible», no repetir el modelo ni descartar la conversación. Hasta 15 segundos de voz dentro de los 120 segundos totales de chat; no sumar otros 15 segundos al agotarse el plazo global.

No se eligió considerar fallida toda la respuesta por un fallo de síntesis posterior a la generación correcta del texto. El historial debe conservar ese intercambio sin duplicarlo.

La política está cerrada. No añade automáticamente un botón de reintento ni una segunda llamada al modelo, y no cambia la preparación inicial completa D08.

### D21 — Memoria de la generación de escenarios

El contrato backend actual envía solo `{prompt}` al webhook; el export usa Redis con clave global `=1`. No existe en esa petición una identidad de conversación que permita aislar memoria correctamente.

**Aceptado por el usuario:** «Cada generación es independiente». Instrucciones completas en la petición, sin recordar solicitudes anteriores. Mantiene IA, recuperación del catálogo y validación del escenario; independencia no significa eliminar Qdrant ni pasar a una plantilla fija.

La alternativa de modificar conversacionalmente un escenario previo con memoria no fue elegida. No se añade por omisión historial de otras generaciones ni se conserva la sesión global Redis `=1`.

La política está cerrada. Solo afecta al generador; el historial del tutor se define en D22. La revisión de workspaces/Compose no encontró otros usos Redis; la memoria del export no justifica añadir ese servicio al nuevo entorno. Verificar que los workflows adaptados no dependan de ella.

## Cuarta ronda: D22–D24

**Las tres decisiones fueron aceptadas por el usuario.** Desarrollan duración del historial, alcance de D09 y disponibilidad de conocimiento durante fallos de sincronización; no están implementadas.

### D22 — Duración del historial del tutor

El backend conserva conversaciones en RAM y las pierde al reiniciarse con nodemon. El frontend mantiene su sesión en objetos de memoria; guardar un ID en el navegador no restauraría por sí solo la conversación del servidor.

**Aceptado por el usuario:** «Historial temporal con aviso de pérdida de contexto». Mantener conversaciones temporales en esta etapa de desarrollo, con sesiones separadas y aviso cuando se haya perdido contexto. No afecta a usuarios, cursos o progreso persistidos. La señal de reinicio/pérdida debe distinguirse de una conversación nueva voluntaria; no fingir recuperación de historial.

La alternativa de persistir conversaciones y recuperarlas después de reinicios no fue elegida. No añadir tablas de historial ni utilizar el SQLite de metadatos de n8n para conversaciones de CyberSim por esta decisión.

La política está cerrada. Quedan límites de mensajes/tamaño/expiración, aislamiento y señal de pérdida de contexto. No volver a preguntar si se persistirá el historial del tutor.

### D23 — Indexación y concurrencia de IA

D09 fijó una operación activa y como máximo una esperando. Tanto los recorridos interactivos como la ingestión de Drive solicitan IA/embeddings. Sin coordinación, una limitación independiente por servicio puede incumplir el límite global.

**Aceptado por el usuario:** «Turno único con prioridad al usuario». Una operación interactiva o una unidad pequeña de indexación activa globalmente. Terminar la unidad en curso y priorizar solicitudes del usuario antes de procesar la siguiente unidad de fondo; mantener como máximo una petición interactiva esperando. No cancelar llamadas ya iniciadas para adelantar trabajo. Los documentos pendientes conservan su estado y continúan después, sin cargar todo el corpus en una cola delante del usuario.

No se eligió permitir indexación y una operación interactiva simultáneas. No aplicar límites independientes por servicio que, sumados, incumplan el turno global.

La política está cerrada. Quedan implementación del coordinador, identidad de operación y participación de sus llamadas internas sin bloqueo circular. La preparación inicial completa sigue siendo obligatoria antes de anunciar disponibilidad. La prioridad interactiva puede retrasar indexación si hay trabajo continuo; no se promete un plazo máximo de sincronización que todavía no se haya definido.

### D24 — Drive no sincroniza después de una preparación correcta

Caso delimitado: el entorno ya estuvo preparado; Qdrant conserva un índice validado y está operativo; OpenAI funciona; Drive tiene un fallo de sincronización. No se aplica al primer arranque incompleto ni a Qdrant caído.

**Aceptado por el usuario:** «Usar el último índice válido con aviso». Seguir utilizando la última revisión validada con aviso visible de sincronización pendiente, sin caducidad automática causada únicamente por ese incidente. La evidencia de retiradas o pérdidas de acceso confirmadas sigue aplicando D18. No presentar el índice como actualizado ni interpretar el error como borrado masivo.

No se eligió bloquear automáticamente tutor y generador solo porque Drive no pueda actualizar un índice previamente validado. Esto no autoriza a usar índices incompatibles con modelo/dimensión/configuración vigente o material con pérdida de acceso confirmada.

La política está cerrada y D19 sigue exigiendo recuperación sana/contexto suficiente. Quedan mensajes, señal de última sincronización, recuperación y distinción entre preparación inicial y estado posterior. No repetir la pregunta ni confundir esta tolerancia con aceptar el primer arranque incompleto.

### D25 — Correo de desarrollo mediante el SMTP externo existente

**Confirmado:** el usuario quiere mantener el correo externo «como ya está». Se descarta la propuesta de captura local con Mailpit; no añadir ese contenedor ni sustituir el proveedor SMTP por una bandeja local.

El backend en Docker seguirá enviando mediante Nodemailer al SMTP externo configurado, con credenciales privadas del servidor conforme a D13. Los enlaces de confirmación y recuperación deben apuntar al frontend accesible desde el navegador del desarrollador, aunque el envío se realice fuera de Docker. No se han inspeccionado secretos ni verificado entrega real, proveedor, cuotas o acceso del equipo.

Quedan provisión de credenciales a los desarrolladores, destinatario autorizado para pruebas explícitas y comportamiento ante indisponibilidad SMTP. Conservar el transporte externo no decide compartir una contraseña personal ni autoriza enviar correos reales en cada arranque. La disponibilidad SMTP y la entrega en bandeja son comprobaciones diferentes.

### D26 — Persistencia funcional con contrato estable entre entornos

**Criterio confirmado por el usuario:** no introducir una base funcional que solo exista para desarrollo. Si un estado es necesario para que la aplicación funcione, su creación y mantenimiento deben ser estables y su diseño no puede depender de que se está desarrollando. Esto no solicita diseñar el despliegue de producción ni elimina herramientas propias de desarrollo como HMR, fixtures o diagnósticos.

La recomendación anterior `cybersim_dev_control` agrupaba preparación Docker, conocimiento y operaciones y buscaba conservarlos fuera del reset de Prisma. Tras [investigar las alternativas](../architecture/investigacion-persistencia-operativa.md), **se retira esa recomendación**, no se limita a cambiar su nombre. Se propone estado funcional mínimo en tablas de la base CyberSim administradas por Prisma/migraciones existentes, en todos los entornos que usen esas funciones; preparación Docker en procesos/artefactos, no en otra base.

**Propuesta técnica, aún no aceptada como implementación:** modelos para documentos/revisiones/operaciones sin persistir conversaciones ni credenciales n8n. Un reset manual de CyberSim también eliminaría esas tablas y exigiría reconciliar n8n/Qdrant antes de aceptar conocimiento/resultados anteriores. Esto sustituye la protección frente al reset que proponía la base adicional; no cambia D15, que sí exige preservar SQLite y credenciales n8n. El [ADR 0008](adrs/0008-persistencia-funcional-compartida-entre-entornos.md) recoge contexto y consecuencias.

## Explicación de los pendientes restantes

Estos cuatro bloques explican parámetros todavía abiertos; las recomendaciones siguientes no son decisiones aceptadas por el usuario.

- **Modelos y coste:** diferenciar generación de texto (tutor, feedback, análisis y escenarios) de embeddings para búsquedas. Elegir un equilibrio calidad/coste/espera por función y un presupuesto orientativo para las pruebas; después fijar modelos/configuración y validar con casos representativos. Cambiar embeddings exige preparar un índice coherente, no mezclar vectores de modelos distintos aunque compartan dimensión. No se recomienda un modelo concreto en esta actualización. Referencia conceptual: [OpenAI, optimización de costes](https://developers.openai.com/api/docs/guides/cost-optimization).
- **Límites de entrada, contexto, salida y retención:** concretar tamaño de TXT/Markdown y mensajes, fragmentación, historial/contexto enviado, respuestas/JSON y texto de voz. Definir rechazo explícito o reducción controlada según el tipo de entrada; no cortar JSON ni presentar un documento parcialmente indexado como completo. Limitar logs y ejecuciones n8n conservadas por edad/cantidad/tamaño; no confundir su limpieza con borrar corpus, datos educativos o credenciales. Los valores deben sustentarse en muestras y mediciones del presupuesto de 8 GB.
- **Preparación y recuperación:** distinguir descarga/construcción inicial, arranque normal y espera de intervención humana OAuth. Proponer plazos por etapa con progreso y diagnóstico, conservando etapas verificadas y retomando trabajo pendiente tras interrupción sin reset ni sobrescritura automática de workflows. Repetir preparación no autoriza repetir automáticamente una operación interactiva de IA fallida. No prometer un tiempo total antes de medir red y máquina objetivo.
- **Validación de disponibilidad:** separar procesos vivos, configuración/conexiones verificadas y pruebas funcionales reales. Proponer verificaciones locales/repetibles en el arranque; pruebas externas de pago o envío real en una validación explícita con presupuesto y destinatario acordados. Incluir persistencia/migraciones, workflows y contratos, OAuth/inventario, índices/dimensiones/payload, generación válida, Piper/audio y enlaces/correo. Las pruebas representativas no garantizan toda respuesta futura de IA ni entrega SMTP en la bandeja. Mantener D08 sin anunciar completo lo que no se verificó; cerrar vigencia de evidencias e incidentes posteriores en el contrato.

## Asuntos que siguen abiertos

Esta lista preserva lo detectado; no son nuevas decisiones aprobadas ni exige responder todo en una sola ronda.

La [investigación integral I01–I10](../architecture/investigacion-integral-desarrollo-docker.md) ya recomienda alternativas y valores para estos temas, incluidos modelos, retención, arranque, validación, credenciales, conocimiento, piezas ausentes, sincronización de fuentes, seed y operación. Lo pendiente es convertirlos en contrato revisable, aportar acceso/presupuesto del equipo y verificar compatibilidad y mediciones. No volver a plantear cada detalle interno como una pregunta abierta al usuario. Runner n8n separado, tablas funcionales con Prisma y política concreta de volúmenes son propuestas, no decisiones aceptadas anteriormente. La base adicional de desarrollo queda retirada según D26; no recuperarla al retomar.

| Tema | Qué falta fijar | Relación |
|---|---|---|
| Primer arranque | Comando definitivo; pasos previos inevitables de `.env` y autorización Google; señal verificable de disponibilidad | D08, D11, D13 |
| Persistencia | Comprobar y configurar D04; rutas, clave y recuperación del SQLite propio D15; conservación/migración de índices | D03, D04, D06, D15 |
| Google Drive | Precisar origen común D16 y provisión OAuth D17 ya elegidos; scopes, estado del cliente y ejecución de retirada automática D18 | D11, D16, D17, D18 |
| Workflows distribuibles | Selección/adaptación de exports, primera importación, publicación, actualización y exportación sin secretos | D03, D06 |
| Piezas ausentes | Workflow de feedback individual, carga de contexto del tutor y servidor HTTP Piper no encontrados en la muestra | D03, D12, D14 |
| Memoria y sesiones | Implementar independencia D21 y temporalidad D22, con límites y aviso de pérdida de contexto | D03, D09, D21, D22 |
| Modelos e índices | Modelo/dimensión OpenAI, parámetros, chunking, hashes/IDs, cambio de modelo y recuperación de indexación parcial | D02, D10, D11 |
| Corpus inicial | Contenido, ruta canónica y carga reproducible; coordinación con Drive sin duplicados | D10, D11 |
| Voz | Distribución del servicio/voz; implementar texto conservado y aviso D20, ya aceptado | D08, D09, D14, D20 |
| Red y correo | Puertos, proxy/API y enlaces; provisión y verificación del SMTP externo existente, elegido en D25 | D05, D12, D13, D25 |
| Herramientas | Volúmenes de fuentes/dependencias, autocompletado, migraciones nuevas en el host y cambios de lockfile | D05 |
| Inicialización repetible | Seed sin sobrescribir datos existentes, exclusión mutua, reintentos de preparación y migraciones versionadas | D04, D08 |
| Presupuestos | Versiones, CPU/disco, memoria medida, retención, límites de entrada/salida y preparación; implementar turno global D23 | D01, D02, D08, D09, D23 |
| Aceptación | Lista definitiva de correcciones, pruebas reales frente a mocks y criterio de cada etapa lista | D08, D12 |

Las políticas técnicas recomendadas —por ejemplo puertos publicados solo en loopback, seed repetible, no usar reset en el arranque y límites de retención— están identificadas como propuestas en la evaluación. No convertir todos sus detalles en acuerdos cerrados por el hecho de estar documentados.

## Estado material al cerrar esta conversación

Durante esta evaluación se leyeron código/configuraciones y se consultó documentación oficial y metadatos de Docker. No se ejecutaron workflows, llamadas a modelos, seed, migraciones ni pruebas del futuro stack; no se crearon contenedores o volúmenes. La existencia del volumen se observó en ese momento y puede cambiar antes de retomar: comprobarla de nuevo si se necesita actuar.

Los cambios de esta fase son documentales: evaluación técnica, este registro, investigación D06, segunda revisión detallada, ADR de alcance, ADR 0007 aceptado como política e índices de navegación. No se han modificado el Compose, Dockerfiles, dependencias, workflows ni código funcional para implementar la propuesta. No se ha creado un commit para estos cambios. La revisión del 18 de octubre añadió consultas web, lectura de recorridos y registro de aceptación de D04/D06/D15–D24; no se volvió a inspeccionar ni modificar el volumen. Las preguntas planteadas en D15–D24 ya tienen respuesta; los parámetros operativos siguen por especificar y verificar.

Una migración corregida en un trabajo anterior no demuestra por sí sola el estado presente del volumen observado. Tampoco las pruebas históricas del proyecto o las E2E con respuestas simuladas certifican que el nuevo stack funcione.

## Punto de reanudación

1. Leer este registro, el contrato v1 y el cierre de proyecto; comprobar cambios de Git posteriores a la base revisada y preservar trabajo ajeno.
2. Conservar **D04 y D06 confirmadas**: reutilizar el volumen con reset solo manual si lo necesita el usuario; workflows como JSON en Git con actualización explícita. No volver a preguntar esas elecciones.
3. Conservar D15–D25 y D26. El contrato ya concreta parámetros y mecanismos; no crear `cybersim_dev_control` ni reabrir elecciones cerradas. Configuración manual y aceptación real siguen diferidas por el usuario.
4. Ante recomendaciones históricas incompatibles, seguir el contrato C01–C12: API pública n8n, transporte OpenAI coordinado, manifiesto SQL único, reset con instalación/generación y autorización acotada. No repetir investigación ni pedir decisiones sobre todos los detalles internos.
5. La tarea de cerrar documentación está terminada. El siguiente trabajo recomendado es B1, cuando el usuario pida implementar. Este cierre no inicia automáticamente código, servicios, migraciones ni acceso a proveedores.

Texto reutilizable para continuar en este chat u otro:

```text
Retoma la planificación Docker de CyberSim leyendo
docs/project/decisiones-desarrollo-docker.md y
docs/architecture/contrato-desarrollo-docker.md.
El contrato técnico v1 está terminado, incluido el alcance de autorización.
Consulta docs/project/estado-desarrollo-docker.md para B1-B5.
La provisión manual de integraciones y aceptación real quedaron para después.
No repitas investigación ni vuelvas a pedir decisiones técnicas ya concretadas.
La tarea de cierre fue documental; implementa B1 solo cuando el usuario lo pida.
D04 está confirmada: reutilizar cybersim_postgres_data; ningún reset automático.
D06 está confirmada: JSON en Git y actualización explícita, según el ADR 0007.
D15 está confirmada: SQLite persistido solo para n8n.
D18 está confirmada: retirada automática del conocimiento tras confirmación.
D16 está confirmada: origen común de documentos de Drive.
D17 está confirmada: cliente OAuth del equipo con autorización individual.
D19 está confirmada: recuperación sana y contexto suficiente para el tutor.
D20 está confirmada: conservar texto y avisar si falla la voz.
D21 está confirmada: generaciones de escenarios independientes.
D22 está confirmada: historial temporal del tutor con aviso de pérdida de contexto.
D23 está confirmada: turno único global con prioridad al usuario.
D24 está confirmada: último índice válido con aviso si Drive deja de sincronizar.
D25 está confirmada: conservar SMTP externo existente; no añadir Mailpit.
D26 exige evitar persistencia funcional exclusiva de desarrollo. La base
cybersim_dev_control fue retirada; consultar la investigación de persistencia
y ADR 0008: tablas funcionales con Prisma es propuesta, no implementación.
Las rondas D15-D24 están respondidas; parámetros y mecanismos están en el contrato.
Faltan implementación, configuración manual y evidencia verificable de ejecución.
Conserva los acuerdos ya registrados y pregunta con contexto técnico real,
sin analogías. El alcance es desarrollo en Windows 11 con 16 GB de RAM,
objetivo de 8 GB para Docker, OpenAI y SMTP externos, n8n local, Google Drive,
Piper local, corpus mínimo versionado y .env privado en la raíz.
```

</details>
