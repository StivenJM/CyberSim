# Tests de integración del frontend

Esta suite abre Chromium y conecta las pantallas de CyberSim con Express, Prisma y PostgreSQL reales. Prueba los perfiles docente y estudiante desde los datos de una instalación nueva. La ejecución completa incluye SMTP, OpenAI, Qdrant, n8n y Piper reales: envía correos y consume recursos del proveedor. No intercepta respuestas de la API con `page.route`, no inventa sesiones ni sustituye el motor ECS.

Está separada de los tests unitarios y de los [E2E con mocks](../../apps/frontend/tests/e2e). Sus archivos viven en [tests/integration](../../apps/frontend/tests/integration), su configuración en [playwright.integration.config.ts](../../apps/frontend/playwright.integration.config.ts) y su orquestador en [infra/integration](../../infra/integration).

## Inicio rápido en PowerShell

1. Abre Docker Desktop y espera a que el motor de contenedores Linux esté disponible. Abre una terminal en la raíz de CyberSim.
2. Completa la [preparación](#preparación): instala las dependencias y Chromium, y configura `OPENAI_API_KEY` en tu `.env` local para usar los proveedores reales. El runner prepara sus servicios y su base desechable automáticamente; no necesitas arrancar la aplicación de desarrollo ni resetear su base manualmente.
3. Ejecuta los recorridos sin correo mientras siga pendiente la configuración SMTP:

   ```powershell
   pnpm test:integration --skip-email
   if ($LASTEXITCODE -ne 0) { throw 'Fallaron las pruebas de integración; revisa el reporte' }
   ```

   Esta ejecución consume recursos reales de OpenAI y abre Chromium. Deja que termine la preparación del índice y los recorridos sin cerrar el navegador. Los datos educativos se restauran antes de cada caso.

4. Abre el resultado al terminar, tanto si hubo éxito como si falló algún caso:

   ```powershell
   pnpm test:integration:report
   ```

   Comprueba que no haya casos fallidos y revisa capturas y trazas en los casos que lo necesiten. Con `--skip-email`, los dos casos de correo aparecerán omitidos; eso no equivale a validar las HUs de registro, confirmación y recuperación. El [registro de validaciones](#validaciones-de-esta-implementación) distingue las corridas realizadas y lo pendiente.

5. Cuando se resuelva el [pendiente SMTP](#pendiente-acordado-smtp), completa las variables de correo y ejecuta `pnpm test:integration` sin filtros para validar también esos recorridos.

Si solo necesitas comprobar los flujos sin proveedores externos, usa `pnpm test:integration:core`. Consulta [comandos](#comandos) para filtrar HUs o depurar, [reportes y diagnóstico](#reportes-y-diagnóstico) ante un fallo y [datos iniciales y reset protegido](#datos-iniciales-y-reset-protegido) para entender el aislamiento. Ejecuta esta suite localmente: el runner bloquea su uso en CI/GitHub Actions.

## Preparación

Ejecuta los comandos desde la raíz de CyberSim. Necesitas Node y la versión de pnpm declarados en [package.json](../../package.json), Docker Desktop con contenedores Linux, acceso a los registros de imágenes y Chromium de Playwright. El entorno completo arranca PostgreSQL, API, n8n, runner JavaScript, Qdrant y Piper; reserva memoria suficiente para esos servicios además del navegador.

```powershell
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación' }
pnpm --filter @cybersim/frontend exec playwright install chromium
if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación de Chromium' }
```

Prepara `.env` siguiendo la [guía de desarrollo](desarrollo-local.md). La suite solo utiliza sus parámetros de OpenAI y SMTP; genera sus propias claves internas, contraseñas, puertos y servicios locales. No reutiliza la base, las credenciales internas ni los volúmenes de desarrollo. Los modelos seleccionados deben estar disponibles para tu cuenta real de OpenAI.

Para la ejecución completa son obligatorios `OPENAI_API_KEY`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` y `VERIFY_RECIPIENT`. También se respetan `SMTP_PORT`, `SMTP_SECURE`, `OPENAI_TUTOR_MODEL`, `OPENAI_COMPLEX_MODEL` y `OPENAI_EMBEDDING_MODEL`. `VERIFY_RECIPIENT` debe ser un correo de pruebas bajo tu control, de un dominio admitido por el registro: Gmail, Hotmail, Outlook o EPN. No uses los correos ficticios del seed como destinatarios externos.

Puedes definir el destinatario solo para la terminal actual:

```powershell
$env:VERIFY_RECIPIENT = 'tu-cuenta-de-pruebas@gmail.com'
pnpm test:integration
if ($LASTEXITCODE -ne 0) { throw 'Falló la integración completa' }
```

La preparación descarga las voces y publica/indexa el conocimiento versionado cuando sea necesario. Utiliza los workflows reales del repositorio y un owner/API key generados para el n8n desechable. No necesita configurar un owner manualmente. La autorización OAuth y la sincronización con Google Drive quedan fuera de estas HUs; no se copian credenciales de la instancia n8n de desarrollo.

## Comandos

| Objetivo | Comando desde la raíz |
|---|---|
| Todos los recorridos, incluidos servicios externos reales | `pnpm test:integration` |
| Proveedores reales excepto los dos casos de correo | `pnpm test:integration --skip-email` |
| Solo recorridos que no requieren proveedores externos | `pnpm test:integration:core` |
| Chromium sin ventana (requiere WebGL funcional en ese modo) | `pnpm test:integration --headless` |
| Inspeccionar paso a paso | `pnpm test:integration --debug` |
| Interfaz interactiva de Playwright | `pnpm test:integration --ui` |
| Seleccionar historias concretas | `pnpm test:integration --grep 'HU022\|HU023'` |
| Filtrar un recorrido básico sin arrancar proveedores | `pnpm test:integration:core --grep HU006` |
| Abrir el último reporte | `pnpm test:integration:report` |
| Comprobar las barreras del reset sin conectarse a una BD | `pnpm test:integration:safety` |
| Eliminar los recursos de una corrida interrumpida | `pnpm test:integration:cleanup <id>` ([procedimiento](#limpiar-una-ejecución-interrumpida)) |

El filtro es una expresión regular; en PowerShell usa `--grep 'HU022|HU023'` para seleccionar cualquiera de las dos. El modo `core` ejecuta solo el proyecto Playwright `core`; no sustituye la ejecución completa ni acredita las HUs de correo, IA o voz. La suite usa un worker y cero reintentos automáticos para mantener un estado de datos predecible y hacer visibles los fallos externos. No ejecutes dos instancias simultáneas desde el mismo checkout.

Chromium se abre con ventana por defecto para utilizar la GPU del escritorio local. En este equipo las interacciones 3D se bloquearon en modo sin ventana; con ventana el primer recorrido pasó. `--skip-email` marca expresamente como omitidos los dos casos SMTP y permite continuar con OpenAI, n8n, Qdrant y Piper reales; no acredita registro ni recuperación por correo.

Al abrir `pnpm test:integration --ui`, revisa el selector de proyectos de Playwright. Si está seleccionado solo `core`, los tests de correo no aparecerán: `externos.spec.ts` pertenece al proyecto `servicios-reales`. Selecciona `servicios-reales` para inspeccionar esos casos o todos los proyectos para ver la suite completa. La interfaz no elimina los requisitos del comando: sin `--skip-email`, los casos SMTP requieren las variables configuradas y envían correos reales.

### Pendiente acordado: SMTP

El 19 de octubre de 2026 se comprobó que Gmail rechaza las credenciales actuales con `535` durante `AUTH`. Se acordó posponer su corrección. Quedan pendientes los recorridos SMTP de **HU001, HU002, HU003 y HU005**. Para retomarlo: actualizar `SMTP_USER` y `SMTP_PASS` en el `.env` local con una contraseña de aplicación válida, verificar la conexión y ejecutar `pnpm test:integration --grep 'HU001|HU002'`. Después repetir la suite completa sin `--skip-email`. No publicar credenciales ni marcar estos recorridos como aprobados mientras sigan pendientes.

## Datos iniciales y reset protegido

El orquestador crea un proyecto Docker `cybersim-integration-<id aleatorio>`, puertos exclusivos en `127.0.0.1` y volúmenes propios. **`prisma migrate reset --force` destruye únicamente esa base desechable al comenzar la ejecución**; después ejecuta el [seed de instalación](../../apps/backend/prisma/seed.ts), sin un seed alternativo de usuarios.

| Perfil/dato | Estado inicial |
|---|---|
| Docente | `profesor@test.com`, contraseña `password123`, confirmado |
| Estudiante 1 | `estudiante1@test.com`, misma contraseña, confirmado |
| Estudiante 2 | `estudiante2@test.com`, misma contraseña, confirmado |
| Curso | Ciberseguridad 101, invitación histórica `CYBER2024` |
| Matrículas | Ambos estudiantes en el curso inicial |
| Historial | Un intento no completado de `control-acceso` del estudiante 1 |

Antes de **cada test**, una transacción Prisma elimina los datos educativos de esa base y vuelve a ejecutar el mismo seed. La fixture comprueba exactamente tres cuentas, dos estudiantes, un docente, un curso, dos matrículas y un intento antes de abrir el recorrido. Los IDs autoincrementales pueden cambiar: los tests obtienen los IDs reales o navegan desde las pantallas, sin asumirlos como estado compartido.

Entre casos se conserva solo la infraestructura de integración y el conocimiento real indexado. Así no se paga una reconstrucción completa de embeddings por cada HU. Cada navegador tiene su propia sesión/contexto; los casos con docente y estudiante simultáneos usan contextos separados. Cada test debe poder ejecutarse con `--grep` sin depender de otro.

El reset exige un marcador de ejecución, nombre de base con el mismo ID aleatorio, host loopback, puerto de pruebas y coincidencia entre `DATABASE_URL` y `DIRECT_URL`. El runner sobrescribe las URLs heredadas; no toma la base de `.env` como destino. La limpieza automática elimina únicamente el proyecto Docker creado por esa ejecución, también ante un fallo ordinario o Ctrl+C.

## Cobertura por historia y pantalla

La trazabilidad usa el [catálogo HU001–HU025](../project/historias-de-usuario.md). Una historia puede tener criterios pendientes en el producto: que un recorrido pase no equivale a aceptar todos sus criterios, ni a una auditoría de seguridad completa.

| HU | Recorrido automatizado | Archivo |
|---|---|---|
| HU001 | Registro de estudiante mediante el formulario y persistencia de cuenta | `externos.spec.ts` |
| HU002 | Alta docente por API existente, confirmación en pantalla y panel docente | `externos.spec.ts` |
| HU003 | Reenvío SMTP y confirmación desde la página correspondiente | `externos.spec.ts` |
| HU004 | Login/logout reales y rechazo de contraseña incorrecta, ambos perfiles | `perfiles.spec.ts` |
| HU005 | Solicitud SMTP, formulario de nueva contraseña y login posterior | `externos.spec.ts` |
| HU006 | Crear, renombrar, recargar y borrar un curso vacío desde el panel | `cursos.spec.ts` |
| HU007 | Regenerar una invitación y comprobar su respuesta/persistencia | `cursos.spec.ts` |
| HU008 | Unirse desde el perfil con el código real de instalación | `cursos.spec.ts` |
| HU009 | Docente retira al estudiante y este vuelve a matricularse | `cursos.spec.ts` |
| HU010 | Selección de tutorial y estado de niveles tras un éxito persistido | `simulacion.spec.ts` |
| HU011 | Oficina 3D, cambio de zona y escritorio de un dispositivo | `simulacion.spec.ts` |
| HU012 | Pausa/reanudación, objetivos y resultado del tutorial | `simulacion.spec.ts` |
| HU013 | Cambiar protección e instalar/desinstalar aplicaciones | `simulacion.spec.ts` |
| HU014 | Explorador de activos y veredictos de firma válida y documento alterado | `simulacion.spec.ts` |
| HU015 | Consola: listar, leer archivo y rechazar comando no soportado | `simulacion.spec.ts` |
| HU016 | Asignar LAN y configurar firewall para resolver el tutorial | `simulacion.spec.ts` |
| HU017 | Configurar gateway y cliente compatibles, ejecutar el reto y guardar el resultado | `simulacion.spec.ts` |
| HU018 | Historial inicial en ambos perfiles y persistencia del tutorial completado | `cursos.spec.ts`, `simulacion.spec.ts` |
| HU019 | Ranking inicial y puntos tras el primer tutorial exitoso | `cursos.spec.ts`, `simulacion.spec.ts` |
| HU020 | Pregunta al tutor, respuesta respaldada y citas del índice real | `externos.spec.ts` |
| HU021 | Audio real de Piper y controles de reproducción | `externos.spec.ts` |
| HU022 | Generar feedback real y recuperarlo tras recargar | `externos.spec.ts` |
| HU023 | Generar análisis real como docente y consultar persistencia | `externos.spec.ts` |
| HU024 | Generar un desafío real y abrir su laboratorio | `externos.spec.ts` |
| HU025 | Redirección por rol y rechazos de API ante falta de identidad/rol incorrecto | `perfiles.spec.ts` |

En HU002 no se inventa un formulario docente que el producto aún no tiene: solo su alta usa la API. Para correo, la suite exige aceptación SMTP y lee el token emitido en la BD **de pruebas** para continuar por la pantalla real; no accede a tu bandeja. La entrega final, spam y lectura del email requieren una comprobación independiente del buzón.

La prueba focalizada de firma/VPN carga la definición publicada de criptografía mediante el punto de entrada de pruebas existente del contexto de nivel. No modifica el escenario ni escribe éxitos ficticios para desbloquearlo. Por ello acredita sus pantallas y el motor local, pero no el recorrido completo de desbloqueo hasta criptografía. El tutorial sí se selecciona desde el mapa y se resuelve con acciones de la interfaz. Los clics 3D calculan la posición de los modelos leyendo su geometría/cámara; no invocan sus handlers ni alteran el ECS.

En HU023 se comprueban las cinco secciones generadas y el texto persistido tras recargar. El contrato actual de `/course-analysis/generate` incluye agregados en `resumen`; `/course-analysis/latest/:id_curso` conserva las secciones y la fecha, pero no ese resumen numérico. Las vistas toleran su ausencia y muestran el análisis guardado sin inventar estadísticas históricas.

Los criterios de concurrencia, idempotencia, autorización de todos los endpoints, rechazo de perfiles VPN incompatibles y trazabilidad permanente de escenarios generados siguen necesitando cobertura específica. HU009 prueba el retiro por el docente: la salida propia del estudiante no tiene un control en el frontend actual y queda fuera de este recorrido. Mantén visibles las brechas del catálogo; no marques una HU como aceptada solo porque su ID aparece en un test.

## Reportes y diagnóstico

Cada caso adjunta una captura final, también cuando pasa. Los fallos conservan screenshot y trace en `apps/frontend/test-results/integration/`; el reporte HTML separado está en `apps/frontend/playwright-report/integration/`. Los clics 3D adjuntan su posición objetivo y buscan una superficie del dispositivo, evitando el espacio vacío entre antenas. La grabación de vídeo está desactivada para reducir la carga de WebGL. El runner conserva diagnósticos de contenedores y workflows en `.dev/integration/<id>/` antes de limpiar los servicios. Abre el reporte con el comando de la tabla y entra al caso para ver acciones, errores y evidencias. Los artefactos son locales e ignorados por Git: pueden contener correos, tokens de sesión y datos de prueba, y requieren revisión antes de compartirlos.

| Problema | Comprobación |
|---|---|
| Docker no está disponible | Inicia Docker Desktop y comprueba `docker info` |
| Falta un proveedor/configuración | Completa las variables exigidas; no hay fallback a mocks |
| OpenAI rechaza modelo, permisos o cuota | Verifica los modelos y la cuenta; el test debe fallar y conservar el error |
| Índice real no disponible | Revisa preparación/n8n/Qdrant; el runner permite hasta 15 minutos de indexación |
| No llega un correo aunque SMTP lo acepta | Revisa bandeja, spam y entrega del proveedor; la aceptación no demuestra recepción |
| Escena o zoom lentos | Comprueba WebGL y recursos de Docker; usa `--headed` o `--debug` |
| Canvas transparente o cuadriculado en la UI de Playwright | Activa `Settings` → `Display canvas content`; consulta el procedimiento siguiente |
| Fallo de una pantalla | Abre trace y captura; corrige la causa y repite el caso con `--grep` |
| Proceso interrumpido por cierre forzado | Limpia sus recursos con [el procedimiento siguiente](#limpiar-una-ejecución-interrumpida) |

### Limpiar una ejecución interrumpida

Úsalo cuando la suite terminó por cierre forzado, la terminal se cerró antes de su limpieza o el lock quedó huérfano. En esos casos sobreviven contenedores, volúmenes o red del proyecto desechable, y `run.mjs` puede negarse a arrancar otra corrida con *Ya hay una suite activa en este checkout*. Ejecuta los comandos de esta sección desde la raíz del repositorio: las rutas `.dev/...` son relativas a ella.

**1. Recupera el ID de la corrida**

Cada ejecución genera un identificador aleatorio de 24 caracteres hexadecimales (`randomBytes(12).toString('hex')` en [run.mjs](../../infra/integration/run.mjs)) que nombra su proyecto Docker (`cybersim-integration-<id>`), su base de datos (`cybersim_integration_<id>`) y su carpeta de diagnóstico (`.dev/integration/<id>/`).

| Fuente | Comando |
|---|---|
| Lock de la ejecución (canónica) | `Get-Content .dev/integration/active.lock` |
| Solo el valor | `(Get-Content .dev/integration/active.lock \| ConvertFrom-Json).id` |
| Carpetas de diagnóstico | `Get-ChildItem .dev/integration -Directory \| Select-Object -ExpandProperty Name` |
| Volúmenes Docker | `docker volume ls --format "{{.Name}}" \| Select-String cybersim-integration` |
| Salida del arranque | `Integración: cybersim-integration-<id>. Base aislada; ...` |

El lock es la fuente fiable mientras exista: la línea del arranque solo sirve si conservas esa salida en la terminal.

**2. Ejecuta la limpieza**

```powershell
pnpm test:integration:cleanup 0123456789abcdef01234567
```

Sustituye el valor por tu ID. Al terminar imprime `Recursos desechables eliminados: cybersim-integration-<id>`. Si ese ID ya no tiene recursos, el comando recorre listas vacías, retira el lock cuando corresponde y confirma igualmente: es seguro repetirlo.

**3. Qué elimina y qué no**

| Acción | Detalle |
|---|---|
| Elimina | Contenedores, volúmenes y redes cuya etiqueta `com.docker.compose.project` coincide exactamente con el proyecto de esa corrida |
| Elimina | `.dev/integration/active.lock`, solo si el ID coincide con el del lock |
| No elimina | La carpeta `.dev/integration/<id>/` con `compose.json`, `services.log` y `workflow-errors.json` |
| No toca | Otros proyectos de integración, la base de desarrollo ni los recursos de [compose.yaml](../../compose.yaml) |

**Barreras de seguridad**

- Exige exactamente un ID de 24 caracteres `[a-f0-9]`. `pnpm test:integration:cleanup` sin ID es un error de uso, no un borrado genérico.
- Si el lock pertenece a ese ID y su proceso sigue vivo, se niega con *La suite sigue activa. Ciérrala con Ctrl+C antes de limpiar.*
- Antes de borrar cada recurso comprueba su etiqueta de proyecto; si no coincide, aborta con *Recurso ajeno: limpieza rechazada.*
- Solo funciona en local: se bloquea si detecta `CI`, `GITHUB_ACTIONS` o `GITHUB_RUN_ID`, igual que el resto de la suite.

**4. Borra las carpetas de diagnóstico cuando ya no las necesites**

La limpieza no las toca: son evidencia y se acumulan una por corrida. Elimínalas a mano:

```powershell
Remove-Item -Recurse .dev\integration\0123456789abcdef01234567
```

No compartas esa carpeta: `compose.json` contiene la contraseña generada para la base desechable de esa corrida. Como el resto de artefactos locales, requiere revisión antes de adjuntarla.

### Ver la escena 3D en la UI de Playwright

La ventana del navegador ejecuta la escena real. La vista central de Playwright reconstruye snapshots del DOM: el contenido WebGL del `canvas` puede aparecer como un fondo cuadriculado aunque la escena se vea correctamente en Chromium y en las miniaturas de la línea de tiempo.

1. En la UI de Playwright, abre **Settings**, abajo a la izquierda.
2. Activa **Display canvas content**.
3. Selecciona de nuevo una acción del recorrido para revisar sus vistas **Before**, **Action** y **After** con la apariencia capturada del canvas.

Esta opción viene desactivada por defecto desde Playwright 1.50 y está presente en la versión instalada del proyecto. Es una preferencia del visor, no una opción de `playwright.integration.config.ts`; no necesitas modificar la aplicación ni volver a preparar n8n para activarla. Playwright advierte que la reconstrucción del canvas puede ser imprecisa: comprueba las capturas de la línea de tiempo y el adjunto **pantalla-final** en **Attachments** si la vista reconstruida no coincide. Consulta las [notas oficiales sobre esta opción](https://playwright.dev/docs/release-notes#version-150).

Si necesitas inspeccionar el navegador real paso a paso, repite solo la HU afectada con el inspector:

```powershell
pnpm test:integration:core --debug --grep HU016
```

Ese comando inicia una nueva ejecución aislada y permite avanzar o detener las acciones en el navegador real. Para una HU que requiera IA, usa `pnpm test:integration --skip-email --debug --grep HU020`. Un canvas transparente en el visor no demuestra que el test fallase por WebGL: selecciona la acción roja y revisa **Errors**, **Call**, **Console** y **Network** para identificar el fallo efectivo.

## Separación de CI y calidad habitual

No añadas esta suite al workflow GitHub ni a `pnpm test` o `pnpm test:e2e`. Tanto el runner como la configuración y los helpers de reset rechazan `CI`, `GITHUB_ACTIONS` o `GITHUB_RUN_ID` presentes, antes de iniciar el reset. Vitest excluye expresamente `tests/integration/**` y Playwright habitual sigue limitado a `tests/e2e`. El typecheck sí verifica estáticamente los nuevos tests sin ejecutarlos ni conectarse a servicios.

La [guía de calidad](pruebas-y-calidad.md) sigue siendo la referencia para lint, formato, tipos, unitarios y builds. Una entrega de esta suite requiere también `pnpm test:integration`; ejecutar únicamente `core` deja pendientes los proveedores reales.

## Evidencia histórica de validación

Las comprobaciones de esta tabla se realizaron el 19 de octubre de 2026 durante la implementación inicial. Son evidencia histórica, no una ejecución del estado actual del repositorio. Los 14 recorridos aprobados se acumularon entre una corrida completa y una focalizada; no pasaron todos en una sola corrida verde.

| Comprobación | Resultado |
|---|---|
| `pnpm lint` y `pnpm format:check` | 543 archivos, sin errores ni advertencias |
| `pnpm test` | 134 tests aprobados; los seis contratos PostgreSQL opcionales siguen omitidos por el comando habitual |
| `pnpm build` | Backend y frontend construidos, con tipos comprobados; Vite advierte del tamaño del bundle |
| `pnpm test:e2e --workers 1` | 12 aprobados, incluido el smoke WebGL con mocks |
| `pnpm test:integration:safety` | Tres pruebas aprobadas de las protecciones de CI y del destino del reset |
| Parser de la imagen n8n configurada | Las 47 expresiones de los workflows compilan |
| Última suite completa con `pnpm test:integration --skip-email` | 12 aprobados, dos fallos corregidos después y dos SMTP omitidos |
| Repetición focalizada `pnpm test:integration --skip-email --grep 'HU023\|HU024'` | Dos aprobados: análisis persistido y apertura del escenario generado, sobre otra base recién creada |
| Verificación focalizada posterior de HU012 | Aprobó después de corregir la carrera que podía mostrar progreso anterior al volver al mapa; no reemplaza una ejecución completa |

La evidencia histórica combina los 12 recorridos aprobados en la corrida completa y los dos aprobados en la repetición focalizada tras corregir sus fallos: **14 recorridos verificados entre corridas**. La suite completa no se volvió a ejecutar después de esas correcciones. La verificación focalizada posterior de HU012 confirmó su arreglo, pero tampoco sustituye una corrida completa. Los casos SMTP siguen pendientes de validación real. Se comprobó la eliminación de los contenedores, volúmenes y red del último proyecto desechable. Los reportes de las corridas se conservaron localmente en `.dev/integration/<id>/report/`; el comando habitual de reporte abre el reporte de la última ejecución.

La suite permitió corregir la dependencia del runtime Prisma bajo pnpm, la invitación histórica de nueve caracteres al copiar/pegar, el bloqueo de niveles en el mapa, la duplicación de `Content-Type` del cliente HTTP, la preparación del corpus sin OAuth Drive, una expresión del workflow generador, la normalización de eventos con `infoAdicional: null` y la consulta del análisis cuando el curso termina de cargar. Las vistas toleran el análisis guardado sin agregados numéricos. También se añadieron nombres y estados accesibles a los controles usados por los recorridos.

Referencias de Playwright: [proyectos](https://playwright.dev/docs/test-projects), [ejecución y depuración](https://playwright.dev/docs/running-tests). El patrón de inicialización y ejecución separada está inspirado en el módulo socioemocional de Edinun, adaptado a los datos, servicios y riesgos de CyberSim.
