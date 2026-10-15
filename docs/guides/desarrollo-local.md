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

Fuentes: [scripts backend](../../apps/backend/package.json), [scripts frontend](../../apps/frontend/package.json), [Compose](../../docker-compose.yml), [Prisma config](../../apps/backend/prisma.config.ts) y [seed](../../apps/backend/prisma/seed.ts).
