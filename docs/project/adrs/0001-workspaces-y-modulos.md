# ADR 0001: Dos workspaces y módulos por funcionalidad

- Estado: **Observada en implementación (retrospectiva)**.
- Fecha de documentación: 2026-10-13.
- Base revisada: `cc0c9cb`.
- Alcance: organización de frontend y backend.
- Aprobación histórica: no consta en el material revisado.

## Contexto

CyberSim necesita una aplicación interactiva de navegador y una API con persistencia e integraciones. El repositorio contiene ambos componentes y los instala con un lockfile raíz.

## Decisión observada

Mantener `apps/frontend` y `apps/backend` como npm workspaces con dependencias, scripts y configuraciones propios. Agrupar código por funcionalidad y usar capas de dominio, aplicación e infraestructura donde se implementan. Comunicar apps mediante HTTP, sin paquete compartido de dominio.

Esta descripción refleja el código; no afirma cuál fue la motivación histórica de quienes lo organizaron.

## Consecuencias

Instalación conjunta y builds por aplicación. Los mantenedores pueden localizar una funcionalidad sin recorrer un único árbol por tipo de archivo. Las diferencias de configuración y contratos deben coordinarse explícitamente; actualmente hay duplicación de metadatos de escenarios y URLs de API.

La separación de capas es parcial: hay acceso directo a repositorios en controllers y dependencias construidas al importar. No prometer independencia completa de infraestructura solo por tener directorios de dominio.

## Alternativas de comparación

Repositorios separados permitirían ciclos independientes, pero requerirían coordinación adicional. Un paquete compartido podría reducir DTOs/metadatos duplicados, a costa de acoplar releases. Una aplicación única podría simplificar arranque, pero mezclaría responsabilidades y herramientas.

## Evidencia y validación

[Manifiesto raíz](../../../package.json), [frontend](../../../apps/frontend/package.json), [backend](../../../apps/backend/package.json), [servidor](../../../apps/backend/src/server.ts) y [entrada React](../../../apps/frontend/src/visual/main.tsx). Los checks de ambos workspaces están registrados en [la revisión](../../architecture/revision-del-sistema.md). Mantener documentación de API/configuración al modificar contratos entre apps.
