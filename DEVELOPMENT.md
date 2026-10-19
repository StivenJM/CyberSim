# Desarrollo de CyberSim

**[1. Comprende el sistema](docs/architecture/resumen.md)** · **[2. Sigue la guía de primer arranque](docs/guides/desarrollo-local.md)**

La guía contiene el procedimiento completo desde un clon nuevo: requisitos Docker, `.env`, configuración de proveedores, arranque, login, edición con Watch y comprobaciones. Es la referencia canónica de ejecución; esta página conserva un acceso breve.

Desde la raíz en PowerShell, con Docker Desktop iniciado:

```powershell
./scripts/dev.ps1 init
docker compose up --build --watch
```

Abrir `http://localhost:5173`. El primer comando se necesita solo para crear la configuración privada; si ya existe, la conserva. Las integraciones externas se preparan siguiendo la guía.

## Consulta opcional

- [Pruebas y calidad](docs/guides/pruebas-y-calidad.md).
- [Mantenimiento para humanos e IA](docs/guides/mantenimiento.md).
- [Crear escenarios](docs/guides/escenarios.md).
- [Estado del entorno y límites](docs/project/estado-desarrollo-docker.md).
- [Índice completo](docs/README.md).
