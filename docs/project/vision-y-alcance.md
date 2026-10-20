# Visión y alcance

## Propósito

CyberSim es una plataforma educativa de ciberseguridad que permite aprender mediante acciones sobre oficinas, dispositivos y redes simulados. Une práctica guiada, objetivos por fases, registro de intentos y apoyo conversacional para que estudiantes y docentes puedan observar el aprendizaje.

La intención educativa se deduce del README, del catálogo y de las pantallas actuales. El repositorio no contiene una validación formal de eficacia pedagógica ni una especificación institucional aprobada.

## Personas y necesidades

| Actor | Necesidad | Funciones disponibles |
|---|---|---|
| Estudiante | Practicar y comprender decisiones de seguridad | Tutorial, niveles, dispositivos/redes, tutor, feedback, historial y ranking |
| Docente | Organizar estudiantes y revisar actividad | Cursos/grupos, invitaciones, lista de estudiantes, historiales y análisis de curso |
| Operador de la instancia | Mantener acceso y servicios | Configuración, base de datos, correo y servicios externos mediante procedimientos técnicos |
| Mantenedor o asistente de IA | Evolucionar contenido y sistema | Código, pruebas, guías, revisión y registros de decisiones |

Operador y mantenedor son responsabilidades de trabajo, no roles adicionales de usuario implementados en la interfaz.

## Alcance actual

- Cuentas de estudiante y profesor, confirmación de correo y recuperación de acceso.
- Formación con cinco escenarios activos: introducción/tutorial, amenazas, criptografía, control de acceso y hacking ético.
- Interacciones con configuraciones, aplicaciones, activos y redes simulados; avance por objetivos y fases.
- Cursos con códigos de invitación y participación de estudiantes.
- Historial de intentos y ranking entre compañeros del grupo.
- Tutor conversacional, contexto seleccionable y audio cuando la integración funciona.
- Retroalimentación individual y análisis de curso generados externamente.
- Desafíos dinámicos propuestos por un generador externo y adaptados para jugar.

Otros archivos de escenario existen pero están deshabilitados en el catálogo. Su presencia no representa una entrega disponible al estudiante.

## Límites del producto

La plataforma modela situaciones educativas, no opera infraestructura de red real. La consola, ataques y verificaciones de firma representan ejercicios dentro del modelo. No se documenta soporte para laboratorios remotos reales, despliegue de malware o administración de equipos del usuario.

Una partida en curso no se restaura completamente tras recargar. Se conservan intentos enviados, no un guardado continuo de escena. Los desafíos generados no tienen una definición histórica recuperable por intento; varias generaciones comparten la misma categoría de progreso.

El ranking depende de resultados enviados por el cliente y los textos de IA pueden contener errores. La implementación actual no aporta garantías suficientes para tratar esos resultados como evaluación formal inviolable. No hay integración documentada con un LMS, calificaciones oficiales, pagos o certificaciones.

La interfaz de alta registra estudiantes; el backend tiene registro de profesores, pero no hay un proceso completo de incorporación docente en la pantalla actual. Debe definirse para una instancia real.

## Criterios de evaluación propuestos

Estos criterios orientan futuras revisiones; no representan métricas ya medidas:

| Dimensión | Evidencia a recopilar |
|---|---|
| Aprendizaje | Comprensión del objetivo y explicación de la acción tomada |
| Usabilidad | Finalización del tutorial y obstáculos observados en estudiantes |
| Calidad del contenido | Retos resolubles, nombres coherentes y feedback comprensible |
| Seguimiento docente | Historial correcto, pertenencia clara y análisis contextualizado |
| Confiabilidad | Guardado confirmado, recuperación de errores y disponibilidad observada |
| Acceso y privacidad | Permisos por persona y exposición mínima de actividad/datos |

Antes de fijar metas de lanzamiento hay que acordar audiencia, dispositivos compatibles, expectativas de disponibilidad y revisión pedagógica. Consultar [riesgos y pendientes](riesgos-y-pendientes.md).

## Trazabilidad

Fuentes del alcance: [README](../../README.md), [pantallas/rutas](../../apps/frontend/src/visual/main.tsx) y [catálogo publicado](../../apps/frontend/src/scenarios/catalog.ts). Las reglas específicas están en [reglas funcionales](reglas-funcionales.md) y las decisiones técnicas en [ADRs](adrs/README.md).
