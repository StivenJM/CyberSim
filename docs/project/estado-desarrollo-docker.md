# Estado del entorno de desarrollo con Docker

Revisión documental: **18 de octubre de 2026**. Este documento relaciona el sistema incorporado al repositorio con su evidencia. B1–B5 identifican áreas de entrega y aceptación, no una autorización pendiente ni una limitación a implementar únicamente B1.

## Componentes y evidencia

| Área | Implementación disponible | Evidencia y límite |
|---|---|---|
| B1: infraestructura y edición | Compose, imágenes fijadas, Watch, preflight, migración/seed y herramientas Windows | El conjunto local se construyó e inició; no certifica todavía 8 GB bajo carga ni todos los casos de Watch |
| B2: contratos y seguridad | Coordinación PostgreSQL, gateway OpenAI, validadores, JWT de instalación y sesiones por propietario | En la ejecución local previa pasaron 53 pruebas backend; comprobaciones HTTP de sesión ajena, contexto perdido y acceso por rol. No equivalen a pruebas reales de OpenAI |
| B3: n8n, conocimiento y voz | Seis workflows, bootstrap/export/apply, revisión del índice, corpus y Piper supervisado | Piper produjo WAV real; backend y frontend compilaron en comprobaciones previas. Bootstrap con credenciales/OAuth y calidad del índice aún no están aceptados contra proveedores reales |
| B4: configuración externa | Variables y puntos de integración definidos | El equipo debe proporcionar OpenAI, SMTP, cliente OAuth, consentimiento Google y owner/API key n8n |
| B5: aceptación externa y recursos | Perfil de verificación explícito y criterios C11 | Pendiente de ejecución autorizada; no se declara listo por tener contenedores encendidos |

La ejecución previa de frontend pasó **84 pruebas**. Estos resultados describen los checks realizados durante la implementación; no certifican automáticamente cada edición posterior. La revisión documental no vuelve a ejecutar llamadas de pago ni envía correo.

En esta actualización se ejecutó nuevamente `typecheck` de ambos workspaces sobre las fuentes actuales: backend y frontend finalizaron correctamente. También se corrigió una comilla SQL que impedía compilar el endpoint interno de reconciliación; esto no demuestra por sí solo su comportamiento durante una incidencia real.

Validación documental de esta actualización: 729 enlaces locales comprobados sin destinos ausentes, bloques Markdown cerrados, sin espacios finales y numeraciones D01–D26/C01–C12 conservadas. `git diff --check -- docs` finalizó correctamente. Los diagramas Mermaid se revisaron como fuente; no se certifica aquí su renderizado en cada visor.

## Límites conocidos de la entrega

- La migración `20261019000000_drive_round_lease` está versionada y la etapa `migrate` se ejecutó correctamente al recrear el entorno con imágenes separadas. La suite aislada también aplicó las cinco migraciones desde una base vacía.
- Las garantías de recuperación, cancelación, carreras de publicación, exportación saneada, retención y validez semántica completa requieren completar sus comprobaciones. C01–C12 conserva el contrato exigido; la mera existencia de un módulo no acredita todos sus casos límite.
- Falta medir RAM, picos de construcción, latencia y calidad en el equipo objetivo. Los caps de Compose son límites configurados, no resultados de carga.
- La configuración manual y la aceptación externa siguen diferidas. Un estado `requiere_configuracion` o `pendiente_validacion` es un diagnóstico correcto en esas condiciones.

## Conservación de datos y operación

La construcción se separa por destinos según [ADR 0010](adrs/0010-imagenes-desarrollo-por-destino.md). Se construyeron backend, frontend, herramientas y preparación; se comprobó aislamiento de fuentes y artefactos. Sobre esas imágenes pasaron nuevamente 53 tests backend, 84 frontend, typecheck backend y build frontend. El build frontend mantiene el aviso de bundle grande; no se atribuye una optimización de ese bundle a este cambio de Docker. La aceptación de proveedores permanece pendiente.

Se reutiliza el volumen PostgreSQL existente. Durante la implementación se obtuvo una copia local previa en `.dev/backups/before-docker-contract.dump`; esa copia es privada de esta instalación, no un archivo que se distribuya al clonar. No se automatiza `prisma migrate reset` ni se eliminan volúmenes para arrancar.

Consultar [la guía de desarrollo](../guides/desarrollo-local.md) para iniciar y mantener el entorno, [la arquitectura](../architecture/desarrollo-docker.md) para las responsabilidades y [las decisiones](decisiones-desarrollo-docker.md) para sus motivos.

## Trazabilidad del cierre técnico

El cierre original se conserva a continuación con sus selecciones, consecuencias, criterios e hitos. Describe la situación anterior a la autorización de implementación y no reemplaza la evidencia actual.

<details>
<summary>Consultar el cierre técnico original, con sus justificaciones y criterios</summary>

Los textos siguientes conservan el contexto de su elaboración. Sus pendientes y expresiones de futuro describen esa revisión histórica; el estado vigente es el indicado arriba. No son instrucciones actuales de ejecución.

# Cierre del contrato de desarrollo con Docker

- Fecha: **18 de octubre de 2026**.
- Estado: **punto de consolidación técnica terminado; implementación no iniciada**.
- Encargo: el usuario pidió terminar la definición técnica y dejar para después la configuración manual y las pruebas de ejecución.
- Contrato canónico: [desarrollo Docker v1](../architecture/contrato-desarrollo-docker.md).
- Antecedentes: [decisiones D01–D26](decisiones-desarrollo-docker.md) y [auditoría final](../architecture/auditoria-desarrollo-docker.md).

## Qué quedó terminado

Las recomendaciones se convirtieron en mecanismos concretos, con responsables, estados, límites y comportamiento ante fallos. Ya no queda pendiente elegir cómo publicar conocimiento, coordinar IA, detectar memoria perdida, recuperar tras reset, arrancar sin ciclos o cancelar la voz. El contrato define estas respuestas y mantiene la distinción entre diseño y funcionamiento probado.

Se conserva el objetivo del equipo: arrancar el entorno de desarrollo con Docker, editar desde Windows y conservar datos sin instalar una plataforma adicional de trabajo. Permanecen las integraciones externas elegidas y los acuerdos de JSON en Git, actualización explícita y reset manual.

## Selecciones que concretan la auditoría

| Tema | Selección final de diseño | Consecuencia para el equipo |
|---|---|---|
| Conocimiento | PostgreSQL selecciona una revisión completa; búsquedas usan sus colecciones físicas y modelo | Una actualización parcial no se publica; aliases no tienen una segunda autoridad |
| IA | Backend coordina y transporta todas las llamadas incluidas; n8n conserva lógica | Un turno global efectivo a nivel de admisión, sin claves OpenAI en cada workflow |
| Resultados inciertos | Bloqueo y reconciliación; resolución excepcional explícita cuando no hay confirmación remota | Un timeout no inicia otra generación ni promete cancelar el proveedor |
| Persistencia | Tablas funcionales en la base actual, mediante el historial Prisma | Se elimina definitivamente la base especial de desarrollo; reset también afecta estos metadatos |
| Reset y sesiones | Instalación/generación identificadas; callbacks y JWT anteriores dejan de ser válidos | Reutilizar IDs después del reset no concede acceso con tokens antiguos |
| Permisos | Proteger tutor, generación, feedback y análisis, con propiedad de sesiones/cursos | Se incluye la corrección limitada de identidad; no se afirma corregir toda la seguridad del sistema |
| Voz | Worker Piper precargado, supervisado y terminable; texto conservado | Fallar la voz no vuelve a ejecutar el modelo ni pierde el texto |
| Arranque | UI n8n/backend accesibles durante preparación, estados por capacidad | Se puede terminar configuración sin que un ciclo impida acceder a la propia herramienta |
| Workflows | API pública n8n, mapa lógico de IDs, bootstrap por elemento y apply explícito | Se conserva edición local y no se modifica SQLite privadamente |
| Correo | Proveedor externo, estado de envío explícito y recuperación de una hora | Cuenta creada no equivale a correo entregado; un fallo permite reenviar sin duplicar alta |
| Herramientas | Watch para fuentes y mantenimiento expreso para dependencias/schema | SQL, lockfile y exports generados quedan en el host |

Estas son selecciones técnicas elaboradas bajo el encargo de cerrar el diseño. No se atribuye una votación independiente del usuario sobre cada parámetro, ni autorización para ejecutar cambios funcionales ahora. Los [ADRs](adrs/README.md) enlazan el contrato y conservan el historial.

## Lo que se deja para después

**Preparación manual del equipo:** permisos y configuración del cliente Google, cuentas con acceso al Drive común, presupuesto/claves de OpenAI, SMTP, buzón de prueba y alta/clave administrativa local n8n. El contrato ya especifica dónde se almacenan y cómo se informa si faltan. No se solicita completar esto ahora.

**Aceptación de ejecución:** pruebas reales de proveedores, correo, cancelación, fallos, calidad y objetivo de RAM/tiempos. Están definidas en C11. No se ejecutan ahora ni se convierten en una nueva investigación pendiente.

Los valores y versiones de C10 son base inicial seleccionada, con compatibilidad y mediciones pendientes. Ajustarlos por resultados exige registrar evidencia y mantener el objetivo; no significa que este cierre certifique 8 GB, latencias, imágenes o calidad.

## Con qué avanzar

Recomiendo avanzar a **B1: infraestructura de desarrollo y edición**, cuando se solicite implementar.

| Bloque | Trabajo de implementación | Entregable observable |
|---|---|---|
| B1 — Infraestructura y edición | Dockerfiles/workspaces Linux, Compose Watch, PostgreSQL reutilizado, verificación de destino, migraciones/seed no destructivos, herramientas y estados iniciales | Un comando construye/inicia la base local; código cambia con Watch; faltantes externos se muestran sin anunciar listo |
| B2 — Contratos y seguridad | Modelos funcionales, admisión/gateway, instalación/generación, permisos/ownership, rutas y memoria temporal | Recorridos coordinados y errores definidos, sin depender de inventar respuestas de proveedores |
| B3 — n8n, conocimiento y voz | Manifiesto/bootstrap/apply, workflows faltantes/adaptados, baseline/exportador, revisión física y Piper supervisado | Integraciones construidas y preparadas para las credenciales del equipo |
| B4 — Preparación manual | El equipo incorpora los accesos y consentimientos diferidos | Conexiones configuradas sin secretos en Git |
| B5 — Aceptación real | Ejecutar casos y mediciones definidos con proveedores/destinatario autorizados | Evidencia de funcionamiento y límites reales; corregir fallos antes de declarar completo |

B1 puede desarrollarse sin claves reales de OpenAI, Google o SMTP. Requiere modificar la composición actual que lanza errores al importar algunos routers: el proceso de preparación debe poder arrancar y mostrar faltantes; las funciones externas permanecerán bloqueadas explícitamente. Esto no autoriza simular un entorno completo.

El orden B1→B2→B3 reduce integración simultánea. B4/B5 se retoman cuando el usuario lo decida; no bloquear este cierre documental esperando esos datos.

Texto de continuación sugerido:

> Implementa B1 del contrato Docker v1. Conserva las decisiones y los datos existentes; deja la configuración manual de proveedores y la aceptación real para después.

## Verificación de este cierre

Se contrasta el diseño con código y documentación primaria, se comprueban rutas/enlaces locales, IDs, bloques y consistencia entre registros. No se ejecutan los comandos futuros ni se modifica configuración ejecutable. La numeración HU001–HU025 y D01–D26 se conserva.

Resultado de revisión documental: 20 documentos modificados o nuevos, 238 enlaces locales comprobados, C01–C12 y D01–D26 ordenados, A001–A171 conservados y H01–H12 vinculados al contrato. Sin enlaces locales ausentes, bloques abiertos, espacios finales o cambios fuera de docs. `git diff --check` pasó; el chequeo adicional incluyó los documentos no rastreados.


</details>
