# Resolución de problemas

Diagnosticar primero el proceso que falla: Vite, Express, PostgreSQL o integración. Registrar comando, status HTTP y mensaje sin incluir secretos. Esta guía se basa en el código actual y en [la revisión](../architecture/revision-del-sistema.md).

| Síntoma | Causa probable en esta implementación | Acción |
|---|---|---|
| Backend no arranca con variable faltante | Routers construyen SMTP/feedback/GPT/Qdrant/Piper al importar | Completar la [matriz de configuración](configuracion.md); reiniciar el proceso |
| Error importando Prisma generado | Cliente no generado o no copiado a `dist` | Ejecutar `db:generate`; para compilado repetir build backend y revisar `dist/generated/prisma` |
| Error de conexión PostgreSQL | Base detenida, URL incorrecta o puerto ocupado | Revisar `docker compose ps` y conexiones; CLI puede usar otra URL que runtime |
| Cambio de esquema no aparece | Migración pendiente o cliente viejo | Aplicar migraciones previstas y generar cliente; no resetear datos como primer diagnóstico |
| `npm run dev` en raíz falla | Raíz no tiene ese script | Usar `--workspace @cybersim/frontend` o `@cybersim/backend` |
| Login funciona, generador devuelve 404 | Base `/api` y eliminación adicional del prefijo en generador | Configurar `VITE_BACKEND_URL` absoluto sin prefijo y reiniciar Vite; revisar ruta final |
| Solo análisis apunta a localhost en sitio remoto | Hook usa `VITE_API_URL` independiente | Configurar también esa variable y reconstruir frontend |
| API responde HTML en vez de JSON | Proxy/ruta/hosting intercepta endpoint | Revisar URL solicitada en Network y [tabla de paths](../architecture/frontend.md) |
| Ruta de interfaz falla al refrescar en hosting | Falta fallback SPA | Servir `index.html` para rutas React, preservando paths de API/assets |
| CORS bloquea llamadas del sitio | Origen no coincide con `FRONTEND_URL` en producción | Comprobar protocolo/host/puerto configurados y reconstrucción si cambió URL pública |
| Registro rechaza clave aceptada por formulario | UI exige seis; API exige ocho | Utilizar ocho o más; registrar la inconsistencia para corrección |
| Registro completó pero no llegó correo | El registro tolera error SMTP | Revisar spam y logs SMTP; usar reenvío una vez corregida la conexión |
| Token de confirmación expirado | Vencimiento de 24 horas | Solicitar reenvío |
| Recuperación rechazada | Cuenta sin confirmar o enlace de una hora vencido | Confirmar cuenta o solicitar otro enlace |
| UI tiene sesión, API devuelve 401 | Guard comprueba presencia, no expiración del JWT | Volver a iniciar sesión; revisar header Bearer de esa llamada |
| Código de grupo inválido/expirado | Código reemplazado o vencido | Docente consulta/regenera código y lo comunica por el canal previsto |
| Borrar grupo falla con FK | Matrículas usan `NoAction` | Revisar alumnos matriculados y procedimiento de retiro; no borrar datos por SQL improvisado |
| Intento no aparece tras finalizar | Fallo HTTP no expuesto por controlador de progreso | Revisar POST `/progreso`, status y body; confirmar persistencia antes de reintentar |
| No avanza un objetivo | Nombre/orden/fase/tiempos no coinciden | Comparar objetivo con evento, enums y `tiempoEnOcurrir`; seguir [guía de escenarios](escenarios.md) |
| Partida desaparece al recargar | Estado ECS/selección solo en memoria | Volver a seleccionar; no hay restauración completa implementada |
| Consumo de intervalos tras reinicios de partida | Destrucción no limpia reloj total | Revisar `SistemaTiempo`; el problema está registrado en la revisión |
| Chat devuelve 200 pero muestra fallo | Repo captura error y devuelve `success: false` | Inspeccionar campo success y logs de embeddings/generación |
| Qdrant degradado | Host, TLS, puerto, clave o colecciones incorrectos | Alinear `QDRANT_HTTPS` y puerto; comprobar colección y modelo de embeddings |
| Texto del chat sin audio | Piper cayó o devolvió audio inválido | Verificar ambas URLs Piper y contrato de respuesta; el texto puede funcionar independientemente |
| Análisis de curso devuelve 503 | Falta webhook | Configurar `N8N_COURSE_ANALYSIS_WEBHOOK_URL` |
| Feedback/análisis falla con 500 | n8n no responde, body inválido o persistencia falla | Revisar contrato, logs y base; health de análisis no llama n8n |
| Export RAG no actualiza JSON raíz | Salida resuelta junto al script del frontend | Revisar `apps/frontend/scripts/rag-output/`; acordar ruta canónica |
| Seed falla al repetirse | Inserciones con correos/códigos únicos | Usar base de prueba apropiada; no asumir idempotencia |
| Tests/build fallan con EPERM en Windows | Restricciones de filesystem antes de tests | Repetir en entorno permitido y separar limitación del entorno de fallo funcional |

## Comprobaciones rápidas

```powershell
node --version
npm --version
docker compose ps
Invoke-RestMethod http://localhost:3000/health
npm run typecheck --workspaces
```

En el navegador comprobar la solicitud final y el body de respuesta. Con base absoluta auth llama `/auth/*`, chat `/api/chat` y generador `/api/agent-malvado/generate`. Con proxy las transformaciones varían por adaptador.

Evitar reenvíos automáticos al investigar progreso o generación: cada POST puede crear un intento/feedback/análisis adicional. Si se necesita comprobar concurrencia, preparar cuentas de prueba y revisar las limitaciones del harness en [pruebas](pruebas-y-calidad.md).
