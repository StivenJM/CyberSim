# Desarrollo de CyberSim

Para probar los recorridos de docente y estudiante con datos nuevos y servicios reales, consulta la [guía de tests de integración](docs/guides/tests-de-integracion.md). Esta suite tiene reset protegido y se ejecuta fuera de GitHub Actions.

**[1. Comprende el sistema](docs/architecture/resumen.md)** · **[2. Sigue la guía de primer arranque](docs/guides/desarrollo-local.md)**

La guía contiene el procedimiento completo desde un clon nuevo: requisitos Docker, `.env`, configuración de proveedores, arranque, login, edición con Watch y comprobaciones. Es la referencia canónica de ejecución; esta página conserva un acceso breve.

Desde la raíz en PowerShell, con Docker Desktop iniciado:

```powershell
./scripts/dev.ps1 init
docker compose up --build --watch
```

Abrir `http://localhost:5173`. El primer comando se necesita solo para crear la configuración privada; si ya existe, la conserva. Las integraciones externas se preparan siguiendo la guía.

## Comprobar la calidad antes de entregar

Sigue la **[guía de calidad para desarrolladores](docs/guides/pruebas-y-calidad.md)**: preparación en Docker o en el host, lint y formato con Biome, tipos, tests y build. Cada paso explica el resultado esperado y cómo investigar un fallo.

Después de instalar dependencias y generar Prisma según la guía, desde la raíz:

```powershell
foreach ($check in @('lint', 'typecheck', 'test', 'build')) {
    pnpm $check
    if ($LASTEXITCODE -ne 0) { throw "Falló el check: $check" }
}
```

La guía incluye el bloque equivalente en Docker y las pruebas adicionales de PostgreSQL y navegador.

## Consulta opcional

- [Pruebas y calidad](docs/guides/pruebas-y-calidad.md).
- [Mantenimiento para humanos e IA](docs/guides/mantenimiento.md).
- [Crear escenarios](docs/guides/escenarios.md).
- [Estado del entorno y límites](docs/project/estado-desarrollo-docker.md).
- [Índice completo](docs/README.md).
