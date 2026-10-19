# Guía del desarrollador: primer arranque y trabajo local

Esta guía lleva desde una máquina sin el proyecto preparado hasta la aplicación abierta y el primer cambio de código. Para comprender antes el producto y sus componentes, leer el [resumen de CyberSim](../architecture/resumen.md).

Ejecutar desde la raíz de CyberSim en PowerShell. El editor trabaja sobre Windows; Node, npm y Prisma se ejecutan en contenedores. No se exige Node instalado en Windows para este recorrido.

## 1. Prepara Docker y obtén el proyecto

- Windows 11 con Docker Desktop, WSL y contenedores Linux.
- Compose con Watch; mínimo funcional del contrato 2.32.2. La ejecución local revisada utilizó Compose 5.5.1.
- 16 GB RAM física; objetivo de 8 GB Docker pendiente de medición bajo carga.
- Internet para imágenes/dependencias/voz y para OpenAI, Google Drive y SMTP durante su uso.

Instalar Git si aún no está disponible. Clonar el repositorio desde la URL facilitada por el equipo, abrir su carpeta en el editor y abrir una terminal PowerShell en esa raíz, donde están `compose.yaml` y `package.json`. Si ya tienes el clon, utiliza esa carpeta y conserva su configuración y datos.

Iniciar Docker Desktop y comprobar que usa contenedores Linux. Desde la terminal:

```powershell
docker version
docker compose version
```

El primer comando debe mostrar cliente y servidor accesibles. Si Docker Desktop aún no ha iniciado o pide habilitar WSL/integración Linux, resolverlo antes de continuar. No es necesario ejecutar `npm install` ni preparar un PostgreSQL independiente en Windows.

## 2. Crea la configuración privada

Crear configuración privada una vez:

```powershell
./scripts/dev.ps1 init
```

El script genera secretos locales estables desde [.env.example](../../.env.example). Si `.env` existe, lo conserva. No publicar sus valores. Los `.env` heredados dentro de los workspaces no son la configuración Docker: las imágenes los excluyen y Compose proyecta las variables raíz por servicio.

Antes de reutilizar datos, comprobar `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`. Cambiar estas variables no cambia las credenciales que el volumen PostgreSQL ya guarda.

## 3. Inicia el entorno

```powershell
docker compose up --build --watch
```

`./scripts/dev.ps1 up` ejecuta el mismo comando. La terminal permanece abierta para Watch y logs. El primer arranque descarga/construye imágenes y voz; los siguientes reutilizan capas y volúmenes.

| Acceso desde Windows | Uso |
|---|---|
| `http://localhost:5173` | Aplicación y diagnóstico de preparación |
| `http://localhost:5678` | Editor n8n, owner y consentimiento OAuth |
| `http://localhost:5173/api/health/live` | Backend accesible mediante Vite |
| `http://localhost:5173/api/health/ready` | Estado agregado de preparación |

Backend 3000/3001, PostgreSQL, Qdrant y Piper no publican puertos al host. Usar Vite o herramientas dentro de Docker.

## Qué prepara Docker y qué datos conserva

1. Preflight de solo lectura: volumen vacío o PostgreSQL major 15.
2. Conexión comprobada, migraciones versionadas y seed de fixtures faltantes.
3. Aplicaciones, Qdrant, n8n con SQLite persistido, runner JS y Piper.
4. Preparación de workflows y baseline cuando la configuración necesaria está disponible.
5. Diagnóstico por capacidad; no se declara aceptación externa por tener procesos vivos.

Se reutiliza `cybersim_postgres_data`. El seed conserva contraseñas y progreso existentes. Las cuentas nuevas de demostración son `profesor@test.com`, `estudiante1@test.com` y `estudiante2@test.com`, con contraseña inicial `password123`. En un volumen reutilizado pueden conservar otra contraseña.

## 4. Completa los accesos externos de tu instalación

La provisión y las pruebas reales siguen siendo manuales. Completar el `.env` privado raíz:

| Integración | Datos y procedimiento |
|---|---|
| OpenAI | `OPENAI_API_KEY` y acceso a modelos configurados; los valores de plantilla no prueban acceso ni calidad |
| n8n | Crear owner en la UI y clave de API pública; guardar `N8N_ADMIN_API_KEY` |
| Google Drive | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_DRIVE_FOLDER_ID`; cliente del equipo y cuenta individual con lectura de la carpeta común |
| Consentimiento Google | Autorizar credencial en n8n. Callback `http://localhost:5678/rest/oauth2-credential/callback`, comprobándolo con la UI de n8n |
| SMTP externo | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`; enlaces al frontend local |

Tras editar `.env`, recrear los servicios afectados mediante el comando de arranque. Watch no sincroniza secretos. No borrar SQLite ni regenerar su clave para resolver un consentimiento pendiente.

Puedes realizar el primer arranque con esos campos vacíos para acceder a la aplicación y crear el owner n8n. Solicita al responsable del equipo las credenciales compartidas y acceso de lectura a la carpeta común; no hace falta crear un proyecto Google independiente por desarrollador.

Con el owner creado y `N8N_ADMIN_API_KEY` configurada, volver a arrancar permite al preparador gestionar los workflows y las credenciales correspondientes. Después completa el consentimiento de tu cuenta Google en la credencial n8n. Ese consentimiento se conserva en SQLite; puede requerir renovación si Google lo revoca o caduca.

## 5. Comprueba tu instalación y entra

Abrir `http://localhost:5173` y revisar el diagnóstico de preparación. En otra terminal, desde la misma carpeta:

```powershell
docker compose ps
```

Las etapas auxiliares que terminan correctamente pueden aparecer como finalizadas; los servicios permanentes deben permanecer activos. Si falla `migrate`, revisar su log antes de intentar login. No ejecutar un reset automáticamente para ocultar ese fallo.

Para entrar con fixtures nuevos, usar `estudiante1@test.com` o `profesor@test.com` y `password123`. Si el volumen ya tenía esas cuentas, se conserva su contraseña previa. Comprobar que se puede acceder a la aplicación y consultar los datos de demostración.

Un login correcto confirma ese recorrido, no las llamadas de IA, la recepción SMTP ni OAuth. Si el diagnóstico indica configuración pendiente, revisar la integración nombrada en el paso 4. Si señala validación pendiente, consultar la sección de pruebas: la aceptación real de proveedores se ejecuta expresamente y puede tener coste.

## 6. Haz tu primer cambio

Mantener abierta la terminal con Watch. Editar un texto de un componente en `apps/frontend/src/visual`, guardar y comprobar el cambio en el navegador; restaurarlo si era una prueba. Para cambios de backend, editar sus fuentes y observar el reinicio en los logs. El [mapa del código del resumen](../architecture/resumen.md#dónde-trabajar-en-el-repositorio) permite elegir el módulo correcto.

Con la aplicación accesible, el login comprobado y Watch propagando cambios, ya puedes trabajar sobre frontend/backend. Las funciones externas concretas necesitan además su configuración y validación. En días posteriores basta con el comando del paso 3: no recrear `.env` ni volver a configurar todo desde cero.

## Referencia de mantenimiento

Los apartados siguientes se consultan cuando la tarea los requiere; no forman parte de la lectura inicial obligatoria.

## Edición y mantenimiento

Watch sincroniza fuentes: HMR frontend y reinicio backend. Reiniciar backend pierde el historial temporal del tutor; la UI informa pérdida de contexto y no reenvía automáticamente el mensaje fallido.

Schema, migraciones y dependencias requieren mantenimiento explícito. Detener Watch antes y revisar SQL/lockfile:

```powershell
./scripts/dev.ps1 status
./scripts/dev.ps1 migrate create --name descripcion_del_cambio
./scripts/dev.ps1 migrate apply
```

El script pausa admisión, detiene aplicaciones/preparador, ejecuta herramientas y reconstruye. Ante fallo conserva la pausa. El verbo `deps` actualiza el lockfile mediante npm y exige revisar el diff. No hay reset automático. Consultar [estado y límites](../project/estado-desarrollo-docker.md) antes de operaciones importantes: la existencia del comando no acredita todos los casos de mantenimiento Windows.

Cambios de corpus/catálogos/workflows requieren reconstruir las imágenes correspondientes; workflows instalados usan además actualización explícita.

Las imágenes se construyen por destino desde el Dockerfile común. Para reconstruir solo una aplicación:

```powershell
docker compose build frontend
docker compose build backend
```

Frontend no genera Prisma; backend no exporta el catálogo frontend. El preparador usa una etapa propia con los JSON de conocimiento, y `tools` conserva ambas toolchains para ejecutar los checks de esta guía. El arranque completo sigue usando el comando del paso 3. Consultar [el mapa de etapas](../architecture/desarrollo-docker.md#etapas-e-imágenes-de-desarrollo) si necesitas cambiar la construcción.

## Workflows: versión compartida en Git

Los JSON y manifiesto están en [infra/n8n](../../infra/n8n). El bootstrap prepara los faltantes; reiniciar no reemplaza ediciones guardadas.

```powershell
./scripts/dev.ps1 workflows export
# Revisar JSON y diff antes de incluirlos en Git.
./scripts/dev.ps1 workflows apply
```

`export` escribe en el host: conservar antes cambios Git no resueltos en esos archivos. `apply` pausa y respalda. Resolver/exportar ediciones divergentes; `--discard-local` significa descarte explícito y no forma parte del arranque cotidiano. No versionar credenciales ni SQLite. La validación contra API n8n real y el saneamiento completo siguen sujetos a la aceptación correspondiente.

## Pruebas y aceptación

Checks sin llamadas de pago, ejecutados en contenedores:

```powershell
docker compose --profile tools run --rm tools npm run typecheck --workspace @cybersim/backend
docker compose --profile tools run --rm tools npm run typecheck --workspace @cybersim/frontend
docker compose --profile tools run --rm tools npm run lint --workspace @cybersim/backend
docker compose --profile tools run --rm tools npm run test --workspace @cybersim/frontend
docker compose --profile tools run --rm tools node infra/test-db.mjs
```

`test-db.mjs` crea una base aleatoria, aplica migraciones/seed, ejecuta tests backend y elimina exclusivamente esa base al terminar. No ejecutar la suite de integración contra la base educativa reutilizada.

`./scripts/dev.ps1 verify` sin autorización externa informa la aceptación pendiente. Con `--external --budget-ack` puede consumir OpenAI y enviar correo al destinatario configurado; reservarlo para la tarea manual autorizada. Los criterios están en C11 del [contrato](../architecture/contrato-desarrollo-docker.md).

## Detención y diagnóstico

`Ctrl+C` termina el arranque adjunto. Para retirar contenedores conservando datos:

```powershell
docker compose down
```

No usar `down -v` como cierre cotidiano. Corregir incompatibilidades de versión, conexión o estados inciertos sin borrar volúmenes ni regenerar secretos. No publicar configuración resuelta ni logs con tokens.

Preparación incompleta, índice pendiente y OAuth ausente se muestran como capacidades pendientes. Piper puede fallar sin descartar texto; una búsqueda RAG técnicamente fallida bloquea generación. Consultar [arquitectura Docker](../architecture/desarrollo-docker.md), [D01–D26](../project/decisiones-desarrollo-docker.md) y [evidencia](../project/estado-desarrollo-docker.md).


<details>
<summary>Referencia conservada: ejecución anterior con Node en el host</summary>

Procedimiento documentado antes del entorno Docker integrado. Sus puertos, requisitos de variables y comportamiento del seed corresponden a aquella revisión; para el uso actual seguir los apartados anteriores. Se conserva para mantener el detalle y contexto del cambio.

# Desarrollo local

## Requisitos

- Node.js `>=20.19.0` y npm `>=9.0.0`, según el manifiesto raíz.
- PostgreSQL; el Compose del repositorio proporciona PostgreSQL 15.
- Docker con Compose si se usa esa base local.
- Configuración SMTP, OpenAI, Qdrant, Piper y webhook de feedback. Sus variables se exigen durante el arranque actual; consultar [configuración](configuracion.md).

Las pruebas unitarias y E2E simuladas pueden ejecutarse sin PostgreSQL ni esos servicios. Para validar interacciones reales se necesitan sus endpoints accesibles.

## Instalar y copiar plantillas

Desde la raíz, en PowerShell:

```powershell
npm ci
Copy-Item apps/backend/.env.example apps/backend/.env
Copy-Item apps/frontend/.env.example apps/frontend/.env
```

Copiar solamente si no existen los archivos de destino; conservar la configuración personal ya creada. En Linux/macOS usar `cp` en lugar de `Copy-Item`. No versionar `.env`.

Completar la plantilla backend con valores del entorno. Una clave ficticia satisface algunas comprobaciones de presencia, pero no hace funcionar una integración. El servidor no dispone de un modo oficial que desactive todos los servicios de IA y correo. Para desarrollo aislado se necesitan endpoints de prueba compatibles o una adaptación explícita de composición.

Configurar en `apps/frontend/.env`:

```dotenv
VITE_BACKEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

La primera variable evita el fallo de ruta del generador con el fallback `/api`. La segunda cubre el hook de análisis de curso, que usa configuración separada. Reiniciar Vite después de modificar variables.

## Preparar PostgreSQL

```powershell
docker compose up -d postgres
docker compose ps
npm run db:generate --workspace @cybersim/backend
npm run migrate:deploy --workspace @cybersim/backend
```

La plantilla conecta a `postgresql://postgres:postgres@localhost:5432/cybersim`. `DATABASE_URL` se usa durante ejecución; `DIRECT_URL`, si está definida, se utiliza por la CLI. Asegurar que ambas apunten a la base local prevista.

`migrate:deploy` aplica las migraciones versionadas a una base nueva sin generar una migración adicional. Si se está diseñando un cambio de esquema, usar `db:migrate`. En una base desechable se puede optar por `db:push`, que sincroniza sin historial de migraciones; no mezclar ese flujo indiscriminadamente con una base administrada por migraciones.

## Datos de demostración opcionales

```powershell
npm run db:seed --workspace @cybersim/backend
```

Ejecutar solo en una base de prueba preparada para ello. El seed inserta directamente, no hace `upsert`: repetirlo falla por correos/códigos únicos y puede dejar inserciones parciales. Crea usuarios ya confirmados y un curso. Sus cuentas locales son `profesor@test.com`, `estudiante1@test.com`, `estudiante2@test.com`, con contraseña `password123`. Esos correos no necesitan pasar la validación del registro porque el seed usa Prisma directamente.

## Iniciar las aplicaciones

En una terminal:

```powershell
npm run dev --workspace @cybersim/backend
```

En otra:

```powershell
npm run dev --workspace @cybersim/frontend
```

URLs por defecto:

- Aplicación: `http://localhost:5173`.
- API: `http://localhost:3000`.
- Salud básica: `http://localhost:3000/health`.

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/api/chat/health
Invoke-RestMethod http://localhost:3000/course-analysis/health
```

La primera llamada no comprueba la base; la segunda solo verifica realmente Qdrant; la tercera comprueba que haya URL de análisis. Verificar login y un intento con datos de prueba para comprobar persistencia.

## Cierre y siguientes pasos

Detener frontend y backend con `Ctrl+C`. `docker compose stop postgres` conserva el volumen. No borrar volúmenes para resolver un error sin revisar sus datos.

Ejecutar [los checks](pruebas-y-calidad.md) antes de proponer cambios. Si falla una etapa, consultar [resolución de problemas](resolucion-de-problemas.md).

Fuentes: [scripts backend](../../apps/backend/package.json), [scripts frontend](../../apps/frontend/package.json), [Compose](../../compose.yaml), [Prisma config](../../apps/backend/prisma.config.ts) y [seed](../../apps/backend/prisma/seed.ts).

</details>
