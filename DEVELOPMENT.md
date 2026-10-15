# Desarrollo de CyberSim

El procedimiento completo está en [desarrollo local](docs/guides/desarrollo-local.md). La raíz instala ambos npm workspaces; cada aplicación define sus scripts.

```powershell
npm ci
# Preparar .env de ambas apps y PostgreSQL según la guía.
npm run db:generate --workspace @cybersim/backend
npm run migrate:deploy --workspace @cybersim/backend
```

En terminales separadas:

```powershell
npm run dev --workspace @cybersim/backend
```

```powershell
npm run dev --workspace @cybersim/frontend
```

- [Requisitos y variables](docs/guides/configuracion.md), incluidas las integraciones exigidas durante arranque.
- [Pruebas y calidad](docs/guides/pruebas-y-calidad.md).
- [Mantenimiento para humanos e IA](docs/guides/mantenimiento.md).
- [Crear escenarios](docs/guides/escenarios.md).
- [Resolución de problemas](docs/guides/resolucion-de-problemas.md).
- [Documentación general](docs/README.md).
