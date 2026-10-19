# Recomendaciones investigadas para el entorno de desarrollo

Esta referencia conserva las alternativas, riesgos, fuentes y justificaciones que sustentan el sistema. Sus conclusiones se concretan en el [contrato vigente](../architecture/contrato-desarrollo-docker.md) y los [ADRs](adrs/README.md).

Para consultar lo incorporado al código, las verificaciones y los límites actuales, usar el [estado del entorno](estado-desarrollo-docker.md). Los pendientes que aparecen en el informe original corresponden a su fecha de investigación; las decisiones vigentes están en [D01–D26](decisiones-desarrollo-docker.md).

## Investigación y evidencia conservadas

El contenido original permanece completo, incluidas las opciones retiradas y el motivo de su sustitución.

<details>
<summary>Leer el informe original y todas sus referencias</summary>

Los textos siguientes conservan el contexto de su elaboración. Sus pendientes y expresiones de futuro describen esa revisión histórica; el estado vigente es el indicado arriba. No son instrucciones actuales de ejecución.

# Recomendaciones investigadas para el entorno de desarrollo

> Cierre posterior: las selecciones técnicas están concretadas en el [contrato v1](../architecture/contrato-desarrollo-docker.md). El [cierre de proyecto](estado-desarrollo-docker.md) separa diseño terminado, preparación manual diferida e hitos por implementar; este informe conserva la investigación previa.

- Fecha: **18 de octubre de 2026**.
- Estado: **propuesta fundamentada; no implementada ni aceptada como contrato completo**.
- Revisión posterior: la [auditoría final](../architecture/auditoria-desarrollo-docker.md) contrasta D01–D26 y 171 elementos; [este resumen de cierre](resultados-auditoria-docker.md) recoge las debilidades y correcciones nuevas. H01 sustituye la autoridad doble de aliases/manifiesto; las cifras siguen siendo propuestas por validar.

El objetivo permanece: preparar y levantar CyberSim para desarrollo con un comando Docker, editar desde Windows y conservar los datos, utilizando OpenAI, Google Drive y el SMTP externo existente. El alcance aceptado está en la [planificación D01–D25](decisiones-desarrollo-docker.md). La [investigación técnica I01–I10](../architecture/investigacion-integral-desarrollo-docker.md) compara alternativas, aporta fuentes y propone cómo comprobarlas.

## Resultado por cada pendiente

| Punto | Recomendación seleccionada | Consecuencia para el desarrollador |
|---|---|---|
| Modelos y presupuesto | Modelo configurable según función, con evaluación de calidad y consumo visible | Se puede ajustar coste sin cambiar el resto de la infraestructura; falta acordar presupuesto con quien paga |
| Límites y retención | Entradas/contexto/respuestas acotados y limpieza de logs/ejecuciones | Los archivos o peticiones excesivos reciben un error claro; el disco no crece por registros ilimitados |
| Preparación y recuperación | Arranque por etapas verificables y trabajo pendiente recuperable | Un fallo identifica qué falta y permite continuar sin borrar lo ya preparado |
| Disponibilidad | Separar servicios vivos, preparación y aceptación funcional real | No confundir contenedores encendidos con una aplicación comprobada |
| Credenciales externas | `.env` privado, configuración por servicio y OAuth individual del equipo | La primera incorporación necesita credenciales y autorización; no se comparten contraseñas personales por Git |
| Conocimiento | Carpeta común Drive, reconciliación y publicación de revisiones completas | Actualizaciones y bajas llegan al índice local sin que una carga parcial aparezca como terminada |
| Piezas ausentes | Reconstruir solo los workflows necesarios y adaptar Piper oficial | Se conserva n8n y la voz local; no se ocultan integraciones faltantes mediante respuestas simuladas |
| Edición y herramientas | Compose Watch, dependencias Linux separadas y herramientas que escriban cambios al host | Guardar código actualiza contenedores; migraciones y cambios de dependencias siguen siendo operaciones expresas |
| Datos iniciales | Conservar PostgreSQL y completar los datos de prueba faltantes sin sobrescribir | Repetir el arranque no cambia contraseñas ni elimina el trabajo; el reset sigue siendo manual |
| Operación y recursos | Versiones fijadas, servicios internos y control común de las operaciones IA | Se evita añadir Redis y plataformas de despliegue innecesarias; los 8 GB todavía deben medirse |

Las fuentes incluyen mantenedores de las herramientas, AWS Builders’ Library, Google SRE y Microsoft Architecture Center. Se revisaron también discusiones originales como experiencia complementaria. El informe distingue esas prácticas publicadas de las recomendaciones específicas para CyberSim; no atribuye a todos los desarrolladores senior un único método.

## Cambios que añade la recomendación, sin darlos por aprobados

Se mantiene la recomendación de un runner separado para ejecutar código de n8n; no es otro worker ni requiere Redis. **Se retira la propuesta de una base `cybersim_dev_control`** tras la objeción del usuario y la [investigación específica](../architecture/investigacion-persistencia-operativa.md). El estado funcional necesario de sincronización y operaciones pertenece a CyberSim: se recomienda administrarlo en su base PostgreSQL mediante las mismas migraciones Prisma en los entornos que usen esas funciones. La preparación Docker queda en procesos y diagnósticos, sin una base especial. Esta opción se desarrolla como propuesta en el [ADR 0008](adrs/0008-persistencia-funcional-compartida-entre-entornos.md).

La diferencia de ciclo de vida es expresa: un reset manual de la base de desarrollo también eliminaría esas tablas funcionales, que las migraciones recrearían. Después habría que reconciliar los índices y operaciones con n8n/Qdrant; no dar por válidos resultados o vectores antiguos. Se mantienen el SQLite y las credenciales privados de n8n conforme D15 y la memoria temporal del tutor conforme D22. La función tendrá el mismo contrato entre entornos, pero sus datos y credenciales nunca se comparten entre desarrollo y producción.

La elección de volúmenes tiene un compromiso concreto: un volumen con nombre explícito permite reutilizarlo o crearlo mediante Compose; un volumen declarado externo ofrece otra protección de ciclo de vida, pero Compose no lo crea si falta. El informe recomienda nombre explícito para el objetivo de un comando y ningún borrado automático. Esto necesita una prueba de reutilización antes de tocar datos existentes.

El comando recomendado para construir después es `docker compose up --build --watch`. Todavía no arranca el sistema completo con el Compose actual. Antes del primer uso deben estar Docker/WSL, la configuración privada y las autorizaciones necesarias. Un comando puede preparar servicios y mostrar tareas pendientes; no puede conceder permisos Google en nombre del desarrollador.

El servidor SMTP continúa externo según D25. Las pruebas de entrega real se ejecutarán con un destinatario definido; el arranque cotidiano no enviaría correos de prueba automáticamente. Tampoco se propone ejecutar toda la batería de IA de pago en cada healthcheck.

## Información que la investigación no puede inventar

- Presupuesto de OpenAI y responsables con acceso a las configuraciones externas.
- Credenciales disponibles y destinatario para comprobar correo; nunca entregar secretos en la conversación.
- Organización real del corpus común cuando se incorpore; se propone inicialmente una carpeta sin recursión y se conserva el corpus mínimo versionado.
- Compatibilidad medida de versiones, voces y workflows, consumo real y recuperación tras fallos.

El informe ya propone límites, modelos candidatos, versiones, plazos y pruebas para evitar pedir al usuario cada detalle interno. Sus valores deben verificarse antes de presentarlos como garantías. El siguiente paso es cerrar un contrato revisable usando la investigación, manteniendo las decisiones aceptadas; no comenzar implementación por el mero hecho de haber elegido recomendaciones.

</details>
