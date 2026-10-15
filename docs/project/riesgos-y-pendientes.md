# Riesgos y pendientes del proyecto

Registro de impacto del sistema revisado el 13 de octubre de 2026. Las prioridades son propuestas de esta revisión; no hay responsables o fechas de entrega asignados. La evidencia técnica y los identificadores H están en [el informe](../architecture/revision-del-sistema.md).

## Prioridades propuestas

| ID | Prioridad | Riesgo para usuarios/operación | Resultado esperado de una corrección | Evidencia |
|---|---|---|---|---|
| RP-01 | Alta | Personas ajenas pueden acceder o alterar grupos, intentos y actividad | Acceso condicionado a identidad, rol y relación con el recurso | H-01, H-03 |
| RP-02 | Alta | Generación de IA puede consumir recursos sin control de cuenta | Límites de uso, acceso y sesiones vinculadas al usuario | H-02 |
| RP-03 | Alta | Un estudiante puede quedar con matrículas simultáneas incoherentes | La regla de participación se cumple aun con solicitudes simultáneas | H-04 |
| RP-04 | Media | Registro fallido puede dejar cuenta incompleta | Alta consistente o recuperación clara de una falla | H-05 |
| RP-05 | Media | Intentos pueden no guardarse o contener acciones ilegibles | Confirmación de guardado y registro de acciones válido | H-06, H-07 |
| RP-06 | Media | Partidas terminadas siguen consumiendo recursos locales | Reinicio/cierre libera todos los relojes | H-08 |
| RP-07 | Media | Preparar una instancia siguiendo plantillas deja funciones inaccesibles | Configuración coherente y rutas funcionando para todas las áreas | H-09, H-10, H-11 |
| RP-08 | Media | Feedback/análisis repetido o incoherente se toma como seguimiento correcto | Validar generación, contexto, identidad y contenido persistido | H-12, H-13 |
| RP-09 | Media | Claves aceptadas en una pantalla son rechazadas en otra | Una regla de contraseña coherente en todo el recorrido | H-14 |
| RP-10 | Media | Errores y señales de salud ocultan una caída real | Mensajes controlados y verificaciones que reflejen dependencias reales | H-15, H-16 |
| RP-11 | Media | Retos dinámicos mezclan resultados de actividades diferentes | Historial con definición/versión de desafío identificable | H-17 |
| RP-12 | Media | Arranque y carga 3D resultan pesados en equipos o conexiones limitadas | Medición con audiencia real y carga razonable por funcionalidad | H-18 |
| RP-13 | Media | El equipo interpreta pruebas simuladas como garantía de servicio real | Validación separada de UI, autorización, persistencia e integraciones | H-19 |
| RP-14 | Baja | Catálogo/conocimiento externo se desactualiza | Proceso único y verificable de publicación de contenido | H-20 |

Los hallazgos de acceso son observados en código; la concurrencia y el impacto en un despliegue concreto requieren pruebas adicionales. No se ejecutaron cambios sobre datos reales para esta revisión.

## Asuntos que requieren definición de proyecto

| Tema | Decisión pendiente |
|---|---|
| Incorporación docente | Quién autoriza/crea profesores y cómo se verifica su relación institucional |
| Audiencia y acceso | Edad/población objetivo, uso individual o por institución, accesibilidad y soporte |
| Evaluación | Si ranking/feedback son solo motivación o se usarán para decisiones académicas |
| Calidad pedagógica | Quién revisa escenarios estáticos y generación dinámica antes de su uso |
| Privacidad y retención | Qué datos se conservan, quién los consulta, cuándo se eliminan y qué se comparte externamente |
| Operación | Responsables de disponibilidad, soporte, backup y restauración de servicios |
| Uso de IA | Presupuesto, límites, proveedores autorizados y revisión de resultados |
| Trazabilidad | Necesidad de recuperar una definición exacta de desafío por intento |
| Catálogo | Orden de aprendizaje, escenarios deshabilitados y criterios para incorporarlos |
| Participación | Confirmar si cada estudiante seguirá limitado a un grupo o podrá cursar varios |

Estas decisiones no están resueltas por un cambio de documentación. Las que alteren arquitectura deben registrarse en [ADRs](adrs/README.md), y las que alteren reglas educativas en [reglas funcionales](reglas-funcionales.md).

## Criterio propuesto antes de usar datos reales

Resolver acceso por identidad/propiedad, control de uso de IA e integridad de matrículas; comprobar guardado y restauración de datos; acordar responsables y tratamiento de actividad de estudiantes. La evidencia de pruebas de interfaz actual ayuda a mantener la navegación, pero no cubre esas garantías.
