# Google Cloud desde cero

Runbook para provisionar el cliente OAuth que consume la integración de Google Drive de CyberSim, partiendo de una cuenta de Google sin proyecto creado.

**Destinatario:** la persona que administra el proyecto de Google Cloud del equipo y cada desarrollador que necesita autorizar su propia instancia.

**Alcance:** este documento describe el procedimiento. No ejecuta la provisión, no crea credenciales y no cambia el estado diferido de C11 en el [contrato técnico](../architecture/contrato-desarrollo-docker.md#c11--secretos-configuración-y-validación-diferida).

> Base de revisión: 26 de octubre de 2026. Redactado desde la documentación oficial de Google y el código del repositorio. El procedimiento no se ejecutó de punta a punta en esa revisión; las comprobaciones se describen con el comportamiento observado en el código.

## 1. Qué resuelve y qué no

La [guía de desarrollo local](desarrollo-local.md#5-configura-las-integraciones-que-necesites) asume que las credenciales de Google ya existen y que alguien las entrega. Este runbook cubre el tramo anterior: crear el proyecto, habilitar la API, configurar el consentimiento y compartir la carpeta.

No sustituye esos pasos. Al terminar, continúa en el paso 5 de la guía de desarrollo local para autorizar la cuenta en n8n.

## 2. Modelo mental: cuatro capas independientes

La causa más frecuente de confusión es creer que el identificador de carpeta limita lo que la aplicación puede leer. No es así. Intervienen cuatro capas y todas deben alinearse:

| Capa | Qué es | Qué concede | Qué no concede |
|---|---|---|---|
| API habilitada | Servicio activo en el proyecto | Que Drive responda a las peticiones | Acceso a archivos |
| Cliente OAuth | `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` | Identificar la aplicación ante Google | Acceso a un Drive concreto |
| Consentimiento + scope | Token emitido por cada usuario | Leer lo que **ese** usuario ya puede leer | Leer datos de otro usuario |
| ACL de Drive | Permisos del archivo o carpeta | Abrir esa carpeta | Descubrirla o construir su URL |

Consecuencias que conviene retener:

- `GOOGLE_DRIVE_FOLDER_ID` **no es una credencial ni un límite de seguridad**. El servicio de preparación la inyecta como texto en la URL del workflow ([`infra/tools.mjs`](../../infra/tools.mjs), [workflow de Drive](../../infra/n8n/drive.json)).
- Compartir `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` no comparte archivos: identifica la aplicación, no a la persona.
- Compartir el token de una cuenta sí comparte su Drive completo. Está prohibido por D17 ([decisiones](../project/decisiones-desarrollo-docker.md)).
- Un usuario de prueba puede autorizar la aplicación sobre **sus** datos, no sobre los de quien administra el proyecto.

## 3. Requisitos

- Cuenta de Google con acceso a [Google Cloud Console](https://console.cloud.google.com/).
- Acceso de propietario o editor al proyecto elegido.
- Acceso de escritura a la carpeta de Drive que actuará como origen del corpus, para poder compartirla.
- `.env` raíz creado desde [`.env.example`](../../.env.example).
- Servicios de n8n accesibles en `http://localhost:5678` (ver [desarrollo local](desarrollo-local.md)).

## 4. Procedimiento

### 4.1 Crear un proyecto propio

1. En Google Cloud Console, abre el selector de proyecto y crea uno nuevo.
2. Anota el número de proyecto: aparece en el identificador del cliente OAuth.

**No reutilices el proyecto de otra aplicación.** El nombre que se muestra en la pantalla de consentimiento es la propiedad *App name* del proyecto, no del cliente OAuth. Si el proyecto se comparte con otra aplicación, todos los desarrolladores de CyberSim verán el nombre de esa otra aplicación al autorizar, y ambas aplicaciones compartirán cuota, estado de publicación, historial de verificación y lista de usuarios de prueba. Los archivos no se mezclan, pero el acoplamiento es real: rotar el secreto o cambiar el estado de publicación de una afecta a la otra.

### 4.2 Habilitar Google Drive API

1. Ve a **APIs y servicios → Biblioteca**.
2. Busca **Google Drive API** y habilítala en el proyecto.

Sin esta capa, un token válido sigue produciendo error al llamar a la API.

> **Habilitar la API no exige crear una cuenta de servicio.** Google ofrece tres tipos de credencial y la elección depende del caso de uso, no de la habilitación ([credenciales de acceso](https://developers.google.com/workspace/guides/create-credentials)). Tras habilitar la API, la consola puede mostrar un panel de inicio rápido o el asistente **Help me choose**, que sugiere una cuenta de servicio si se indica «datos de la aplicación».
>
> CyberSim no usa ese camino. El servicio de preparación crea una credencial **OAuth2** con `clientId` y `clientSecret` ([`infra/tools.mjs`](../../infra/tools.mjs)) y los nodos del workflow referencian ese mismo tipo ([workflow de Drive](../../infra/n8n/drive.json)). Si el asistente creó una cuenta de servicio, puedes dejarla sin uso o eliminarla: no interviene en este flujo y no hace falta su clave JSON.

No continúes con el asistente de credenciales. El cliente OAuth se crea en el paso 4.6, después de configurar el consentimiento.

### 4.3 Configurar la marca

En **Google Auth Platform → Branding** ([referencia oficial](https://developers.google.com/workspace/guides/configure-oauth-consent)):

1. Define **App name**. Es el nombre que verá cada persona en la pantalla de consentimiento; úsalo como identificador del proyecto, no como nombre de una integración concreta.
2. Define el correo de soporte.
3. Acepta la política de datos de usuario de las API de Google.

Este paso no se puede deshacer: la pantalla de consentimiento no se elimina una vez configurada.

### 4.4 Configurar la audiencia y los usuarios de prueba

En **Google Auth Platform → Audience** ([referencia oficial](https://support.google.com/cloud/answer/15549945)):

1. Selecciona el tipo de usuario **External**.
2. Mantén el estado de publicación en **Testing**.
3. Añade cada cuenta que deba autorizar la aplicación en **Google Auth Platform -> Audience -> Test Users** (máximo 100).
4. Añade también tu propia cuenta.

Qué significa exactamente: la lista habilita a esas cuentas para **autorizar la aplicación sobre sus propios datos**. No comparte archivos de quien administra el proyecto. Sin estar en la lista, Google bloquea el consentimiento porque la aplicación no está verificada.

### 4.5 Declarar el scope

En **Google Auth Platform → Data Access**, añade:

```
https://www.googleapis.com/auth/drive.readonly
```

Es un scope **restringido**. La documentación oficial lo describe como «View and download all your Drive files» ([scopes de Drive](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)). Consecuencia directa: el token de cada persona alcanza **todo su Drive**, no solo la carpeta configurada. La restricción a una carpeta la aplica el workflow, no OAuth.

Para un entorno de desarrollo en Testing no se solicita verificación. Publicar la aplicación sí exige verificación del scope restringido y una evaluación de seguridad ([requisitos](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)).

### 4.6 Crear el cliente OAuth

En **Google Auth Platform → Clients** ([referencia oficial](https://support.google.com/cloud/answer/15549257)):

1. **Create client** → tipo **Web application**.
2. En **Authorized redirect URIs**, añade:

```
http://localhost:5678/rest/oauth2-credential/callback
```

   El valor debe coincidir exactamente con el que muestre n8n, incluidos esquema, puerto y ruta. Los URI de `localhost` están exentos de exigir HTTPS.
3. Crea el cliente y copia el **Client ID**.
4. Copia el **Client secret** en ese momento. En clientes creados recientemente el secreto solo se muestra una vez; si se pierde, hay que rotarlo.

No añadas orígenes JavaScript: el flujo de n8n es de servidor.

### 4.7 Registrar las variables

Completa en el `.env` raíz:

| Variable | Origen |
|---|---|
| `GOOGLE_CLIENT_ID` | Cliente OAuth del paso 4.6 |
| `GOOGLE_CLIENT_SECRET` | Secreto del paso 4.6 |
| `GOOGLE_DRIVE_FOLDER_ID` | Identificador de la carpeta compartida del corpus |

El identificador de carpeta se obtiene de la URL de la carpeta en Drive (`https://drive.google.com/drive/folders/<ID>`). No requiere ningún trámite en Google Cloud.

Reinicia el arranque después de editar `.env`: los cambios de configuración requieren recrear los servicios.

### 4.8 Compartir la carpeta: el paso que concede los datos

Este es el paso que **realmente** comparte el corpus, y no se hace en Google Cloud sino en Drive:

1. En Drive, abre la carpeta del corpus.
2. **Compartir** → añade la cuenta de cada desarrollador con rol **Lector** (equivalente a `reader`).
3. Confirma que cada persona ve la carpeta en su propio Drive.

Sin este permiso, cada instancia apunta a la misma carpeta pero recibe un error de acceso. La ACL de Drive es el mecanismo de autorización sobre archivos ([referencia oficial](https://developers.google.com/workspace/drive/api/guides/manage-sharing)); el scope solo delimita el tipo de operación.

### 4.9 Autorizar la cuenta en n8n

Continúa en el paso 5 de la [guía de desarrollo local](desarrollo-local.md#5-configura-las-integraciones-que-necesites): el servicio de preparación crea la credencial `cybersim-google` con el scope anterior, y cada persona la autoriza con su propia cuenta.

## 5. Comprobar el resultado

El estado se consulta desde el panel **Entorno de desarrollo** del frontend. Cada valor tiene un significado distinto y conviene no confundirlos, porque el servicio de preparación y el diagnóstico miden cosas diferentes.

| Señal | Qué demuestra | Qué no demuestra |
|---|---|---|
| `preparation.json` reporta `drive: configured` | La credencial existe en n8n | Que alguien haya autorizado ni que el token siga vigente |
| Panel: `requiere configuración` | Falta la credencial o las variables | — |
| Panel: `pendiente` | La credencial existe y aún no hay sincronización exitosa | Que el consentimiento esté completo |
| Panel: `sync_pending` | Hubo sincronización, pero la última supera 3 minutos | — |
| Panel: `ready` | Sincronización exitosa dentro de los últimos 3 minutos | Cobertura de todo el corpus |

La comprobación real es una sincronización exitosa. El diagnóstico del backend marca `drive: ready` solo cuando existe un registro de última sincronización con menos de 180 segundos ([`routes.ts`](../../apps/backend/src/integrations/routes.ts)). El estado global es `requiere_configuracion` si algún componente lo indica, `pendiente_validacion` si falta cualquier otra comprobación, y `listo` solo cuando todo está en verde.

## 6. Límites conocidos

- **Caducidad de siete días.** Una aplicación externa en Testing emite autorizaciones y refresh tokens que expiran a los siete días, salvo que solo solicite `name`, `email` y `profile` ([documentación oficial](https://developers.google.com/identity/protocols/oauth2#expiration)). Con `drive.readonly` aplica siempre: hay que reautorizar periódicamente.
- **Máximo 100 usuarios de prueba.** Es un tope del proyecto y no se puede ampliar sin cambiar el estado de publicación.
- **Pantalla de advertencia.** Cada autorización muestra un aviso de aplicación no verificada.
- **Alcance de cuenta completa.** El scope restringido permite leer todo el Drive de quien autoriza. El aislamiento por carpeta no existe a nivel OAuth.
- **Un secreto visible una sola vez.** Si se pierde, se rota y hay que actualizar el `.env` de todo el equipo.
- **Clientes inactivos se eliminan.** Un cliente OAuth sin uso durante seis meses puede borrarse automáticamente.
- **Límite de refresh tokens.** Hay un máximo de 100 refresh tokens por cuenta y cliente; al superarlo se invalida el más antiguo sin aviso.

## 7. Alternativas de mínimo privilegio (propuestas)

Ninguna de estas opciones está decidida ni implementada. Se documentan porque el alcance de cuenta completa del scope restringido es una consecuencia conocida.

| Alternativa | Ventaja | Costo |
|---|---|---|
| Cuenta de Google dedicada al proyecto | El token solo alcanza el Drive de esa cuenta, que contiene únicamente el corpus | Una cuenta más que administrar |
| Cuenta de servicio con la carpeta compartida | Sin consentimiento de usuario ni caducidad de siete días | **No es viable tal como está el diseño.** Ver la limitación siguiente |
| `drive.file` con Google Picker | Permiso por archivo, sin verificación | Cambia el flujo: no permite listar una carpeta preexistente sin selección explícita |

### Por qué una cuenta de servicio no sustituye a OAuth en este diseño

n8n 2.43.7 admite `serviceAccount` en los nodos Google Drive y Google Drive Trigger ([compatibilidad](https://docs.n8n.io/integrations/builtin/credentials/google/#compatible-nodes)). La restricción no viene de n8n sino de Google:

- Según la [documentación de n8n](https://docs.n8n.io/integrations/builtin/credentials/google/service-account/), Google ya no permite que las cuentas de servicio creadas después del **15 de abril de 2025** accedan a **Mi unidad**; solo a unidades compartidas. Los reportes públicos lo atribuyen a que esas cuentas no reciben cuota de almacenamiento en Drive.
- El corpus de CyberSim vive en **Mi unidad** por decisión vigente ([D16](../project/decisiones-desarrollo-docker.md), [contrato](../architecture/contrato-desarrollo-docker.md)). Compartir la carpeta con el correo de la cuenta de servicio no supera esa restricción.

Salidas posibles, todas con costo:

| Salida | Requisito |
|---|---|
| Mover el corpus a una unidad compartida | Google Workspace |
| Delegación de dominio para impersonar un usuario | Google Workspace con superadministrador; Google la desaconseja |
| Mantener OAuth2 con una cuenta dedicada | Ninguno adicional |

El análisis previo está en [investigación integral](../architecture/investigacion-integral-desarrollo-docker.md) y en [decisiones D16–D17](../project/decisiones-desarrollo-docker.md).

## 8. Errores habituales

| Síntoma | Causa probable |
|---|---|
| La pantalla de consentimiento muestra el nombre de otra aplicación | El proyecto GCP se reutilizó con otra app |
| `redirect_uri_mismatch` | El URI registrado no coincide con el que muestra n8n |
| `access_denied` al autorizar | La cuenta no está en la lista de usuarios de prueba |
| La sincronización falla pero la credencial aparece creada | Consentimiento incompleto, token caducado o carpeta no compartida con esa cuenta |
| Un desarrollador ve archivos que no debería | Autorizó con una cuenta con acceso a más carpetas, o se compartió el token de otra persona |
| Todo funciona y deja de funcionar a los siete días | Caducidad esperada del modo Testing |
| La consola pidió crear una cuenta de servicio al habilitar la API | Es una sugerencia del asistente de credenciales, no un requisito. El flujo usa OAuth2 |

## 9. Referencias

- [Elegir scopes de Google Drive API](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [Configurar la pantalla de consentimiento y los scopes](https://developers.google.com/workspace/guides/configure-oauth-consent)
- [Administrar la audiencia de la aplicación](https://support.google.com/cloud/answer/15549945)
- [Administrar clientes OAuth](https://support.google.com/cloud/answer/15549257)
- [Expiración de refresh tokens](https://developers.google.com/identity/protocols/oauth2#expiration)
- [Verificación de scopes restringidos](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
- [Compartir archivos, carpetas y unidades](https://developers.google.com/workspace/drive/api/guides/manage-sharing)
- [Contrato técnico de desarrollo Docker](../architecture/contrato-desarrollo-docker.md)
- [Estado del entorno de desarrollo](../project/estado-desarrollo-docker.md)
