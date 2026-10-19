# Segunda revisión de fallos del desarrollo con Docker

Esta referencia conserva las alternativas, riesgos, fuentes y justificaciones que sustentan el sistema. Sus conclusiones se concretan en el [contrato vigente](contrato-desarrollo-docker.md) y los [ADRs](../project/adrs/README.md).

Para consultar lo incorporado al código, las verificaciones y los límites actuales, usar el [estado del entorno](../project/estado-desarrollo-docker.md). Los pendientes que aparecen en el informe original corresponden a su fecha de investigación; las decisiones vigentes están en [D01–D26](../project/decisiones-desarrollo-docker.md).

## Investigación y evidencia conservadas

El contenido original permanece completo, incluidas las opciones retiradas y el motivo de su sustitución.

<details>
<summary>Leer el informe original y todas sus referencias</summary>

Los textos siguientes conservan el contexto de su elaboración. Sus pendientes y expresiones de futuro describen esa revisión histórica; el estado vigente es el indicado arriba. No son instrucciones actuales de ejecución.

# Segunda revisión de fallos del desarrollo con Docker

> Cierre posterior: [contrato técnico v1](contrato-desarrollo-docker.md) especificado por encargo; las preguntas de esta ronda están respondidas y los mecanismos concretados. Implementación, provisión y pruebas siguen sin ejecutarse.

- Fecha: **18 de octubre de 2026**.
- Base: `8de71f5`, configuración actual y cinco exports en `workspace/n8n`.
- Método: lectura de código, parámetros de nodos y documentación oficial. No se levantaron servicios, ejecutaron workflows, llamadas a OpenAI, migraciones o seed.
- Estado: evaluación antes de implementar. D04, D06 y D15–D24 aceptadas; las preguntas planteadas están respondidas y faltan parámetros operativos y verificación.
- Registro de acuerdos y preguntas: [planificación](../project/decisiones-desarrollo-docker.md).

Esta revisión desarrolla mecanismos concretos de los riesgos R01–R24 de la [evaluación inicial](evaluacion-desarrollo-local-docker.md). No vuelve a proponer cambiar n8n, Google Drive, Piper, el volumen PostgreSQL o la política de JSON en Git con actualización explícita.

## Hallazgos y condiciones de fallo

### C01 — Metadatos de n8n y reset de la aplicación

**Hecho:** el [Compose actual](../../compose.yaml) usa PostgreSQL 15. No existe todavía una configuración local de persistencia para n8n. El usuario acepta resetear manualmente el esquema de CyberSim si lo necesita.

**Fallo anticipado:** si los metadatos de n8n se colocan en el mismo destino que borra Prisma, un reset podría afectar workflows, credenciales y estado de triggers. Si se decide reutilizar el servidor PostgreSQL 15 para n8n, hay otra condición de compatibilidad: la documentación actual de n8n enumera PostgreSQL 16–18, no 15. Esa comprobación debe hacerse contra la versión de n8n fijada, no darse por cumplida por compartir protocolo SQL.

**Decisión D15 aceptada:** SQLite en un volumen Linux propio de n8n para esta instancia de desarrollo; PostgreSQL de CyberSim permanece como está. La alternativa de PostgreSQL para los metadatos de n8n no fue elegida. El reset Prisma de la aplicación nunca debe utilizar como destino el almacenamiento de n8n. Queda especificar rutas, permisos y recuperación.

### C02 — Credenciales persistidas sin su clave de cifrado

**Mecanismo:** conservar la base de n8n no basta si cambia o desaparece la clave con la que se cifraron sus credenciales. Generar una nueva clave en cada arranque puede impedir reutilizarlas.

**Propuesta:** clave estable, preparada expresamente y conservada con la configuración privada de la instancia. No volver a generar una clave porque una petición OAuth falle. La recuperación de la instancia debe incluir la clave y su almacenamiento persistente; exportar únicamente JSON de workflows no es ese backup completo. D15 elige el medio de persistencia; la preparación de la clave se cerrará en el contrato.

### C03 — Importación correcta y Google todavía sin autorización

**Hecho:** los nodos Drive de los exports utilizan `googleDriveOAuth2Api`. Las referencias exportadas identifican credenciales, pero no autorizan a otra instancia local.

**Mecanismo:** Client ID/Secret, consentimiento del usuario y acceso efectivo a la carpeta son requisitos diferentes. Un contenedor no puede concederse el consentimiento Google. El callback que ve el navegador debe coincidir con el registrado, incluidos protocolo y puerto; el hostname interno Docker no es la URL local del navegador.

**Estado D16 y D17:** origen común D16 y OAuth del equipo con autorización individual D17 ya aceptados. Queda preparar proyecto/cliente/callback/scopes y consentimiento; no se han creado cuentas/proyectos ni conectado Google durante esta evaluación.

La revisión adicional del código oficial actual de Google Drive Trigger encontró soporte tanto de OAuth2 como de cuenta de servicio. Los exports usan OAuth, pero eso no demuestra que sea el único método disponible. Una cuenta de servicio de lectura podría reducir pasos individuales para el corpus común; requiere validar permisos, tipo de Drive, versión de los nodos y descarga, sin presumir que una clave basta.

Google documenta acceso directo a archivos/carpetas compartidos con la identidad de servicio, sin delegación de dominio para ese caso. n8n publica una advertencia específica sobre cuentas nuevas y Mi unidad. Esa diferencia se conserva como resultado de la investigación, sin afirmar imposibilidad de lectura ni dar compatibilidad por probada. El usuario confirmó **Mi unidad de una cuenta personal @gmail.com** y eligió OAuth del equipo con autorizaciones individuales. La cuenta de servicio no es requisito del diseño elegido y no se necesita probarla para cerrar D17.

### C04 — La autorización funciona al principio y deja de hacerlo después

**Hecho externo:** Google documenta que una aplicación OAuth externa en Testing puede emitir refresh tokens que expiran en siete días para los permisos de Drive. Los tokens también pueden revocarse por otros motivos.

**Fallo anticipado:** la sincronización deja de avanzar aunque los procesos sigan encendidos. Declarar «solo autorizar una vez» sin revisar el estado OAuth sería una promesa incorrecta.

**Propuesta:** diagnóstico de autorización caducada/revocada distinto de error de descarga, sin borrar documentos ni regenerar credenciales. D17 incluye este coste de preparación. Queda por fijar política de aplicación Google y comportamiento del entorno si pierde sincronización después de estar listo.

### C05 — Eventos de Drive, periodo de apagado y primera carga

**Hecho:** los tres cargadores tienen triggers `fileCreated` y `fileUpdated`, observan carpetas específicas y declaran `everyMinute`. No hay que suponer inmediatez ni que esperar al primer evento cargue todo lo que ya existe.

La comparación adicional de los exports mostró **un mismo identificador de carpeta en los tres cargadores**, con salidas a `ciberseguridad`, `desafiosCiberseguridad` y `topologiasCiberseguridad`. No se accedió a Drive para conocer su contenido real. Compartir origen entre desarrolladores no decide por sí solo filtros, separación por tipo o alcance a subcarpetas; eso debe concretarse para no enviar material incompatible a varios recorridos.

**Fallo anticipado:** un archivo anterior a la preparación nunca genera un evento nuevo; un periodo sin ejecutar el stack deja cambios pendientes; perder el cursor/estado del trigger puede causar omisiones o repeticiones.

**Propuesta:** carga inicial por inventario del alcance autorizado y reconciliación posterior con identidades estables, sin depender de un evento nuevo. Conservar cursores/estado y completar paginación antes de marcar la ronda como terminada. Quedan por definir subcarpetas, shared drives, frecuencia definitiva y límite de trabajo por ronda. No se ha verificado qué garantías ofrece el trigger de la versión que se elegirá.

### C06 — Actualizar un documento agrega otra versión de sus fragmentos

**Hecho:** los cargadores terminan en Qdrant con `mode: insert`. No se encontró una etapa explícita de búsqueda/retirada de fragmentos previos ni un manifiesto de versión/hash en la muestra.

**Riesgo inferido, no incidente reproducido:** si la inserción crea identidades nuevas, cada modificación puede dejar contenido anterior junto al nuevo. La misma entrada puede volver a procesarse tras un fallo o un evento repetido. Si una nueva versión tiene menos fragmentos, actualizar solo los primeros tampoco retira necesariamente los sobrantes.

**Propuesta:** identidad por origen/documento, revisión de contenido y configuración de extracción/fragmentación/embeddings. Preparar la revisión completa antes de hacerla visible; conservar o aislar la revisión anterior de forma definida si falla la carga. Repetir un evento no debe duplicar contenido ni pedir embeddings cuando la entrada no cambió. No se presupone que varios nodos de n8n formen una transacción Qdrant.

### C07 — Borrado, papelera, movimiento o pérdida de permiso

**Hecho:** los exports inspeccionados no muestran un trigger o recorrido explícito de bajas. La ausencia de un documento en una respuesta incompleta no demuestra que se haya eliminado.

**Fallo anticipado:** las búsquedas continúan utilizando material retirado; o una credencial caducada se interpreta como carpeta vacía y causa una purga del índice. Un cambio marcado como removido puede necesitar distinguir pérdida de acceso de borrado físico.

**Decisión D18 aceptada:** retirada automática de búsquedas tras confirmar baja o pérdida de acceso. No interpretar un fallo de red/autorización como baja masiva. D24 acepta usar el último índice válido con aviso de sincronización pendiente durante un incidente posterior a la preparación; eso no permite conservar en búsquedas un documento cuya retirada o pérdida de acceso ya se confirmó. Quedan aislamiento de elementos no autorizados y retención física; no borrar toda la colección ante una respuesta fallida.

### C08 — TXT/Markdown pasan por un recorrido de extracción PDF

**Hecho:** los cargadores antiguos declaran extracción PDF y los de topologías/desafíos esperan campos diferentes del JSON actual, como se detalla en la evaluación inicial. D10 acepta TXT/Markdown; los JSON estructurados del proyecto siguen teniendo un recorrido distinto.

**Mecanismo:** importar los exports sin adaptar el contenido puede producir texto vacío o propiedades inexistentes, aunque los nodos hayan terminado. Crear una colección no demuestra que el payload contenga conocimiento legible.

**Propuesta:** comprobar tipo, encoding, contenido, tamaño y payload final antes de indexar. Un archivo vacío o una conversión fallida no debe sustituir silenciosamente una revisión válida. Se necesitan límites concretos y un contrato de texto/metadatos común a indexación y búsqueda.

### C09 — Un fallo de Qdrant se presenta como búsqueda sin resultados

**Hecho:** [QdrantService.search](../../apps/backend/src/chat/infrastructure/services/QdrantService.ts) captura errores y devuelve `[]`. [NativeChatRepository](../../apps/backend/src/chat/infrastructure/repositories/NativeChatRepository.ts) transforma una lista vacía en ausencia de contexto y continúa la llamada al modelo. El healthcheck de Qdrant solo consulta la lista de colecciones.

**Consecuencia:** colección ausente, dimensión incompatible, conexión caída y búsqueda válida sin coincidencias pueden acabar en el mismo camino. La respuesta puede parecer normal aunque haya fallado la recuperación. Además, la configuración de Qdrant usa HTTPS por defecto; la conexión HTTP interna de desarrollo necesita configurarse expresamente.

**Decisión D19 aceptada:** exigir recuperación sana y contexto suficiente. Fallo técnico → indisponibilidad; búsqueda sana insuficiente → informar y pedir aclaración, sin respuesta general sustitutiva. No se asume que un payload cualquiera sea contexto suficiente. La validación inicial debe comprobar colecciones, dimensiones y contrato de payload, no solo el proceso vivo. D24 plantea por separado qué ocurre cuando Qdrant está sano pero Drive no puede actualizarlo después de la preparación inicial.

### C10 — El plazo termina pero el trabajo continúa

**Hecho:** [GPTService](../../apps/backend/src/chat/infrastructure/services/GPTService.ts), los clientes de [feedback](../../apps/backend/src/feedback/infrastructure/repositories/N8nFeedbackRepository.ts), [análisis](../../apps/backend/src/course-analysis/infrastructure/repositories/N8nCourseAnalysisRepository.ts) y [generación](../../apps/backend/src/agent-malvado/infrastructure/repositories/N8nWebhookRepository.ts) llaman a `fetch` sin un deadline explícito en esos recorridos.

**Mecanismo:** cortar la espera HTTP no garantiza que n8n o el proveedor cancelen la ejecución. Una petición posterior puede arrancar otra tarea mientras la anterior sigue consumiendo recursos. La ingestión independiente de Drive también realiza embeddings y puede competir con las operaciones interactivas.

**Decisión D23 aceptada:** turno global compartido con prioridad interactiva al terminar cada unidad de indexación, sin ejecutar indexación e interacción simultáneas. Como máximo una petición interactiva esperando; documentos pendientes conservan estado y continúan después. Quedan plazo en cola, respuesta al exceso de solicitudes, cancelación y resultados tardíos. No implementar varias colas independientes que, sumadas, incumplan el máximo ni un bloqueo circular cuando una operación llama a n8n y sus llamadas internas solicitan otro turno. No reintentar escrituras automáticamente sin definir su identidad.

### C11 — Pérdida de conversación y memoria compartida

**Hecho:** el [gestor de conversación](../../apps/backend/src/chat/infrastructure/services/ConversationMemoryManager.ts) mantiene datos en RAM. El export del generador fija la clave Redis en `=1` y la petición actual de generación envía solo `{prompt}`.

**Mecanismo:** recargar el backend pierde historial del tutor; usar una clave común puede mezclar generaciones independientes. Añadir Redis no resuelve el problema si no hay una identidad correcta de sesión. Un límite en número de mensajes tampoco limita por sí solo sus tokens/tamaño.

**Decisión D21 aceptada:** generador independiente por petición, conservando consultas al catálogo y uso de IA. No se encontró otro uso Redis en workspaces/Compose; no se añadirá por la memoria global descartada del export. **D22 aceptada:** historial temporal del tutor con aviso al perder contexto, sin persistencia de conversaciones. Guardar solo un identificador en el navegador no restaura mensajes perdidos en el backend; queda definir la señal de pérdida, aislamiento y límites de memoria.

### C12 — Voz lenta, memoria de audio y contrato del navegador

**Hecho:** [NativeChatRepository](../../apps/backend/src/chat/infrastructure/repositories/NativeChatRepository.ts) espera la síntesis antes de devolver el mensaje, aunque guarda el historial antes. [PiperTTSService](../../apps/backend/src/chat/infrastructure/services/PiperTTSService.ts) devuelve WAV en base64 y acepta una respuesta con base64 o URL. [useAudioPlayer](../../apps/frontend/src/visual/features/chat/hooks/useAudioPlayer.ts) etiqueta el Blob como `audio/mpeg` y no se encontró liberación de sus Object URLs en ese hook.

**Mecanismo:** TTS lento retiene la respuesta de texto; el timeout puede ocurrir después de guardar historial. Convertir WAV a base64 y luego a arrays/Blob duplica representaciones en memoria. Reproducir muchos audios puede retener recursos si no se liberan.

**Decisión D20 aceptada:** conservar texto y mostrar fallo de audio, sin repetir el modelo o descartar el mensaje. El límite de voz no extiende los 120 segundos totales. Quedan contrato único del servicio HTTP Piper y longitud máxima de texto/audio. La disponibilidad de voz en preparación sigue siendo obligatoria conforme a D08.

### C13 — Prisma modifica un destino y el backend consulta otro

**Hecho:** [prisma.config.ts](../../apps/backend/prisma.config.ts) prioriza `DIRECT_URL`; el [runtime](../../apps/backend/src/auth/infrastructure/db/prisma.ts) y el [seed](../../apps/backend/prisma/seed.ts) usan `DATABASE_URL`.

**Mecanismo:** valores heredados o distintos pueden aplicar SQL en una BD y servir desde otra. Esto es especialmente relevante al reutilizar el volumen acordado D04 y preparar un `.env` raíz en lugar de las configuraciones separadas actuales.

**Propuesta:** comprobar destinos efectivos sin imprimir contraseñas; usar un destino local coherente para migración, seed, runtime y consultas de análisis. No recurrir a un servicio externo porque el destino local falle. No cambiar versión mayor de PostgreSQL como efecto implícito de elegir otra imagen.

### C14 — Una segunda preparación falla por el seed o deja datos parciales

**Hecho:** el seed actual realiza `create` sucesivos y no tiene transacción global ni estrategia para conservar filas ya existentes. Incluye cuentas conocidas, matrícula, curso y progreso.

**Mecanismo:** repetirlo puede fallar por restricciones únicas y una interrupción deja parte del conjunto creado. Usar un marcador de archivo como única prueba de éxito puede aceptar datos incompletos. Cambiar contraseñas en cada arranque rompería trabajo de los desarrolladores.

**Propuesta pendiente de cerrar en el contrato:** inicialización repetible que cree lo que falte y conserve lo ya editado, un único preparador y verificación de estado. Si hay una colisión de datos que no se pueda resolver de forma inequívoca, diagnosticar; no ejecutar un reset automático pese a que el usuario acepte hacerlo manualmente.

### C15 — Sincronización Windows/Linux y dependencias ocultas

**Hecho:** los workspaces instalan dependencias desde el lockfile raíz, el backend observa `src` y el frontend usa Vite. Todavía no existen Dockerfiles para estos servicios.

**Fallo anticipado:** montar todo el repositorio puede ocultar dependencias de la imagen, incorporar `node_modules` del host o dejar artefactos generados en rutas equivocadas. Una migración creada dentro de un contenedor efímero puede perderse si no vuelve al host. Cambios del esquema Prisma o manifiestos no equivalen a editar un archivo observado por nodemon.

**Pendiente:** tabla precisa de rutas fuente/artefactos y reacción a cambios de código, schema, lockfile y workflow. Verificar recarga con altas, renombres y borrados; separar generación/aplicación de migraciones. Los scripts deben funcionar con permisos y saltos de línea del contenedor Linux. No ejecutar reset o `db push` al guardar un esquema.

### C16 — Un proceso sano oculta funciones no preparadas

**Hecho:** [server.ts](../../apps/backend/src/server.ts) devuelve `/health` desde Express sin verificar el conjunto. El cliente de feedback necesita su webhook y no apareció su workflow entre los cinco exports. Tampoco apareció el servidor HTTP de Piper ni un cargador explícito de la colección contextual del tutor.

**Mecanismo:** importar solo lo disponible puede dejar funciones desconectadas. Los recorridos de alta/confirmación/recuperación requieren correo y URLs del navegador, aunque el equipo use cuentas del seed para entrar.

**Pendiente:** reconstrucción/adaptación de piezas ausentes, lista exacta de funciones exigidas para declarar listo y pruebas de contratos sin fixtures silenciosos. D25 conserva el SMTP externo existente y descarta la captura local; queda comprobar conectividad/configuración y entrega real en una prueba explícita, sin enviar correos en cada arranque por defecto. La aceptación D12 permite corregir bloqueos concretos; no autoriza una reescritura de todo el sistema.

## Primera ronda de preguntas de esta revisión

Se plantearon D15–D18 para resolver persistencia de n8n y el alcance operativo de Drive. El usuario aceptó todas: SQLite propio, origen común, OAuth del equipo con autorización individual y retirada tras confirmación. Los textos y antecedentes se conservan en la planificación; no volver a preguntar D04, D06 ni D15–D18.

El usuario aceptó D19–D21 para fallos de recuperación, voz y memoria del generador, D22–D24 para historial temporal del tutor, turno global con prioridad interactiva y uso del índice validado con aviso si Drive deja de sincronizar después de estar listo, y D25 para conservar el SMTP externo existente. Las preguntas planteadas ya tienen respuesta. Quedan para la especificación operativa provisión/verificación del correo y funciones obligatorias, modelos y límites de entrada/salida, sincronización de dependencias y plazos de preparación; distinguir decisiones del usuario de parámetros técnicos propuestos, sin reabrir elecciones cerradas.

## Verificaciones de aceptación que faltan

| Condición a provocar en la futura implementación | Resultado que debe quedar especificado y verificarse |
|---|---|
| Reset manual del esquema de CyberSim | No afecta a metadatos o credenciales de n8n |
| Reinicio con credenciales guardadas | Se reutilizan con la clave estable, sin nuevo consentimiento causado por pérdida de estado local |
| Token OAuth expirado o callback incorrecto | Etapa y causa reconocibles; no se anuncia sincronización completa ni se purga el índice |
| Archivos previos al primer arranque y cambios durante apagado | La reconciliación recupera el conjunto completo autorizado |
| Dos eventos de la misma revisión y documento que se acorta | No duplica versiones ni deja fragmentos sobrantes visibles |
| Paginación incompleta o permiso revocado | No confunde un inventario parcial con bajas confirmadas |
| Colección ausente, Qdrant caído y búsqueda sana vacía | Resultados distinguibles y comportamiento de respuesta explícito |
| n8n sigue ejecutando tras el timeout HTTP | Se respeta la política global de concurrencia y no se persiste un resultado tardío como nueva operación |
| Piper lento y audio repetido en navegador | Deadline, texto/aviso y liberación de recursos comprobados |
| Interrupción del seed, indexación o importación | Repetición con estado verificable, sin reset automático ni marcador de éxito falso |
| Cambio de esquema, dependencia o archivo en Windows | Operación prevista, artefactos útiles en el host y dependencias compatibles con Linux |

## Fuentes externas contrastadas

- [n8n: bases soportadas](https://docs.n8n.io/hosting/configuration/supported-databases-settings/): almacenamiento de metadatos y versiones PostgreSQL publicadas al consultar.
- [n8n: clave de cifrado](https://docs.n8n.io/hosting/configuration/configuration-examples/encryption-key/): relación entre clave y credenciales persistidas.
- [n8n: OAuth Google self-hosted](https://docs.n8n.io/integrations/builtin/credentials/google/oauth-single-service/): cliente propio, consentimiento y callback local.
- [Google: OAuth y expiración](https://developers.google.com/identity/protocols/oauth2#expiration): revocación y expiración de refresh tokens, incluido el caso External/Testing.
- [Google Drive: cambios](https://developers.google.com/workspace/drive/api/guides/manage-changes): cursores, paginación y recursos removidos. La API disponible no demuestra que los exports actuales implementen todas esas garantías.
- [Google Drive Trigger: código oficial](https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/Google/Drive/GoogleDriveTrigger.node.ts): opciones de autenticación OAuth2 y cuenta de servicio en la rama consultada; contrastar con la versión fijada al implementar.
- [Google: crear credenciales y compartir con cuentas de servicio](https://developers.google.com/workspace/guides/create-credentials): identidad técnica, permisos de archivos y distinción frente a roles del proyecto Cloud.
- [n8n: cuentas de servicio Google](https://docs.n8n.io/integrations/builtin/credentials/google/service-account/): preparación y advertencias específicas de compatibilidad con Drive.

No se han medido memoria, latencias ni efectos sobre datos. Los hallazgos estáticos se distinguen de los riesgos inferidos; ninguna de estas propuestas constituye todavía una prueba del futuro stack.

</details>
