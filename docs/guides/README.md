# Guías

Procedimientos para ejecutar, usar y mantener CyberSim. Cada guía enlaza a los contratos técnicos cuando son necesarios.

| Guía | Destinatario y resultado |
|---|---|
| [Desarrollo local](desarrollo-local.md) | Inicializar configuración privada, arrancar todo con Compose Watch y mantener el entorno |
| [Configuración](configuracion.md) | Completar variables con sus requisitos reales de arranque |
| [Uso del sistema](uso-del-sistema.md) | Registrar estudiantes, practicar y gestionar cursos como docente |
| [Pruebas y calidad](pruebas-y-calidad.md) | Ejecutar checks y entender qué valida cada suite |
| [Escenarios y RAG](escenarios.md) | Crear un nivel, habilitarlo y exportar su conocimiento |
| [Mantenimiento para humanos e IA](mantenimiento.md) | Encontrar puntos de cambio y preservar reglas y documentación |
| [Operación y despliegue](operacion-y-despliegue.md) | Preparar build, migraciones, hosting y comprobaciones operativas |
| [Resolución de problemas](resolucion-de-problemas.md) | Diagnosticar arranque, rutas, correo, datos e integraciones |

Los comandos se ejecutan desde la raíz del repositorio salvo indicación expresa. El `package.json` raíz no define scripts propios: seleccionar siempre el workspace. Las guías no presuponen que existan servicios externos solo por haber copiado una plantilla.
