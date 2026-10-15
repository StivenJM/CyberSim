# ADR 0002: Simulación ECS en el navegador

- Estado: **Observada en implementación (retrospectiva)**.
- Fecha de documentación: 2026-10-13.
- Base revisada: `cc0c9cb`.
- Alcance: partida, escena, dispositivos, redes y progreso.
- Aprobación histórica: no consta.

## Contexto

La práctica requiere interacción visual con dispositivos, acciones y objetivos temporales. El cliente contiene el catálogo, builders, componentes, sistemas y controladores del juego.

## Decisión observada

Construir la escena desde datos TypeScript y ejecutar comportamiento educativo con el ECS del frontend. Mantener la partida en memoria del navegador y enviar resultados/acciones a la API al fallar una fase o completar un escenario.

## Consecuencias

Las interacciones no necesitan una llamada HTTP por cada operación simulada. React puede actualizar escena y paneles mediante eventos del motor. La disponibilidad del navegador y su capacidad 3D condicionan la experiencia.

La partida se pierde al recargar; no hay reanudación completa. El servidor recibe resultados que el cliente puede alterar y no valida el recorrido, por lo que la persistencia no constituye evidencia inviolable de aprendizaje. Las definiciones generadas también necesitan validación pedagógica y compatibilidad temporal.

## Alternativas de comparación

Un motor autoritativo en servidor permitiría validar acciones y sesiones persistentes, con mayor complejidad y latencia. Una solución híbrida podría mantener render local y validar transiciones críticas en servidor, pero necesitaría un contrato compartido de eventos y versiones.

## Evidencia y validación

[ECSManager](../../../apps/frontend/src/ecs/core/ECSManager.ts), [builder](../../../apps/frontend/src/ecs/utils/EscenarioBuilder.ts), [controlador](../../../apps/frontend/src/ecs/controllers/EscenarioController.ts) y [progreso](../../../apps/frontend/src/ecs/controllers/ProgresoController.ts). Las unitarias cubren sistemas; el smoke E2E monta un fixture 3D, sin certificar todos los recorridos. Detalles en [simulación](../../architecture/simulacion-ecs.md) y [revisión](../../architecture/revision-del-sistema.md).
