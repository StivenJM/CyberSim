# ADR 0021: Artefactos inmutables y despliegue pull desde GitHub

- Estado: aceptada por decisión explícita del usuario y criterio técnico delegado; implementación pendiente (Fase 4).
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; el usuario pidió investigar la automatización del despliegue desde GitHub.
- Alcance: construcción, distribución y aplicación de releases.
- Relación: depende del [ADR 0014](0014-plataforma-de-despliegue-en-host-unico.md) y del [ADR 0016](0016-imagen-de-runtime-del-backend.md).

## Contexto

El repositorio está en GitHub y ambas máquinas tienen salida a internet. No hay evidencia de reachability entrante hacia la universidad; asumirla sería un riesgo de diseño. Producción manejará datos reales y tiene un solo operador.

## Decisión

1. **Construcción en GitHub Actions**, nunca en el host de producción: build de backend y web, escaneo de vulnerabilidades, SBOM y publicación en GHCR.
2. **Publicación por digest**; el despliegue referencia `@sha256:...`, no un tag mutable.
3. Un **`release.json`** adjunto al GitHub Release con versión, commit, digests y migraciones incluidas.
4. Un **agente pull** en el host consulta Releases y aplica el manifiesto. No hay runner self-hosted en producción.
5. **Aprobación** mediante la creación del Release; si el plan de GitHub lo permite, un Environment con revisores obligatorios. La aprobación es humana y por release.
6. Token de solo lectura en el host, asociado a una cuenta dedicada con acceso únicamente a este repositorio, almacenado con permisos restringidos y con rotación documentada.

## Consecuencias

- GitHub no ejecuta código en el host de producción: la superficie se reduce a un cliente HTTP que descarga imágenes y un manifiesto.
- Se pierden los logs nativos de deployment y las aprobaciones integradas si el plan no las habilita; el registro vive en el host.
- El agente debe manejar: bloqueo, comparación de versión, backup previo, migración, healthcheck, rollback y alerta.
- Un fallo tras aplicar una migración **no revierte la base automáticamente**: se detiene y restaura desde el backup. Fingir un rollback transaccional sería peor que fallar.
- El mismo digest probado en staging es el que se aprueba para producción.

## Alternativas

- **Runner self-hosted:** GitHub advierte que una máquina runner debe asumirse comprometible y que no debe usarse en repositorios públicos; en producción eso significa ejecución de código de workflows sobre el host con datos reales. Se descarta.
- **SSH push desde Actions:** requiere reachability entrante o un túnel (Tailscale, Cloudflare); añade una dependencia de red y expone un servicio de administración.
- **Despliegue manual:** el más simple, pero repetitivo y propenso a errores; se conserva como procedimiento de emergencia, no como mecanismo principal.
- **Watchtower u auto-actualización por tag:** actualiza sin aprobación ni verificación de digest. Se descarta.

## Evidencia y validación

- Riesgos de runners self-hosted: [GitHub: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use).
- Pull por digest y autenticación de GHCR: [GitHub Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).
- Aprobaciones por entorno y requisitos de plan: [Managing environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).
- Inmutabilidad de imágenes y fijación por digest: [Docker: build best practices](https://docs.docker.com/build/building/best-practices/).

Criterio para considerarla implementada: un tag produce imágenes y un Release con digests; staging se actualiza sin intervención; producción exige aprobación; un healthcheck fallido revierte la aplicación y deja evidencia; el digest desplegado coincide con el aprobado.
