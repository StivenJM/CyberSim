# ADR 0007: Versionar workflows y aplicar sus actualizaciones explícitamente

> Actualización de implementación, 18 de octubre de 2026: esta decisión se refleja en [Compose](../../../compose.yaml), [infra](../../../infra), [schema Prisma](../../../apps/backend/prisma/schema.prisma) y [módulo de integraciones](../../../apps/backend/src/integrations). Consultar [estado y límites](../estado-desarrollo-docker.md). Las referencias siguientes a trabajo futuro o pruebas no realizadas conservan el contexto de la revisión original, sin revocar la implementación autorizada después.

- Estado: **Aceptada; herramientas y workflows incorporados, validación con instancia configurada pendiente**.
- Fecha de documentación: **18 de octubre de 2026**.
- Aprobación: el 18 de octubre el usuario eligió expresamente «JSON en Git y actualización explícita» tras la investigación, pidiendo que se tome en cuenta para el diseño.
- Alcance: workflows de n8n del entorno de desarrollo local de CyberSim.
- Relación: complementa el [ADR 0006](0006-alcance-del-desarrollo-con-docker.md), sin modificar el acuerdo de mantener n8n.
- Cierre técnico posterior: [contrato v1 C08](../../architecture/contrato-desarrollo-docker.md) y [ADR 0009](0009-contrato-tecnico-desarrollo-docker.md) seleccionan API pública para bootstrap/export/apply y mapa lógico de IDs; sustituyen recomendaciones anteriores de mecanismo CLI, conservando esta política aceptada.

## Contexto

Se quiere inicialización con un comando Docker y conservar la edición visual de n8n. Las definiciones se distribuyen como archivos mientras n8n guarda su estado editable en una base de datos. Reimportar al reiniciar puede reemplazar trabajo no exportado. Construir una sincronización bidireccional que combine nodos y conexiones añade complejidad a una fase centrada en desarrollo.

La [investigación D06](../../architecture/investigacion-versionado-workflows-n8n.md) contrastó documentación oficial, el starter kit de n8n, experiencias de desarrolladores y herramientas comunitarias. El control Git nativo requiere una edición que lo incluya y tampoco realiza una fusión automática de workflows. La alternativa de paquetes oficiales sigue en Preview.

## Decisión

Usar Git para la versión compartida de los workflows, conservando n8n como espacio local de edición y prueba:

1. Preparación inicial automática del conjunto requerido, con comprobación de objetos y dependencias antes de marcarla completa.
2. Reinicios normales conservan el estado guardado, sin reimportar, publicar borradores o generar commits por omisión.
3. Cambios del conjunto versionado se detectan respecto de la última preparación correcta y se presentan como actualización pendiente; no se anuncia el entorno completamente preparado para esa revisión mientras siga pendiente.
4. Exportar una edición seleccionada y aplicar cambios del repositorio son operaciones explícitas, ejecutables desde contenedores.
5. Antes de reemplazar, conservar la definición local y revisar diferencias. Si existen ediciones divergentes, resolverlas expresamente mediante exportación/conservación o descarte; no fusionar automáticamente el grafo.
6. Verificar credenciales/referencias, publicación y contrato funcional después de aplicar. Registrar la nueva versión preparada solo después del resultado correcto.
7. Retirar workflows gestionados requiere una acción explícita; no borrar experimentos locales ni recursos por el simple borrado de un archivo.

La aceptación define la política, no el nombre de comandos ni una herramienta instalada. El transporte se apoyará en interfaces oficiales compatibles con la versión fijada. No se impone una licencia Business/Enterprise, una herramienta comunitaria o paquetes Preview como requisito inicial. La elección de interfaz, autenticación, detección de cambios y versión debe cerrarse antes de implementar. Los controles operativos detallados son el diseño a verificar, no una implementación ya acreditada.

## Consecuencias

El primer arranque de un clon sigue automatizado. Un reinicio cotidiano no modifica la lógica guardada. Las actualizaciones compartidas necesitan una acción deliberada; esa es la contrapartida de conservar ediciones sin desarrollar una sincronización continua.

Git conserva cambios revisables y la colaboración usa los commits/PR del proyecto. Las credenciales permanecen locales y los exports deben revisarse antes de versionarlos. El respaldo de una definición no equivale al backup completo de n8n ni garantiza revertir efectos ya ejecutados sobre otros servicios.

Hay que implementar operaciones acotadas de estado, exportación y aplicación, su recuperación tras fallos y una distinción entre borrador y publicación. Deben comprobarse identidades y referencias para evitar duplicados o credenciales equivocadas. No se promete atomicidad global de varias importaciones sin verificarla.

## Alternativas

- **Source Control nativo:** opción integrada si existe licencia compatible; no elimina por sí sola conflictos de edición. No se acordó requerir esa licencia.
- **Reimportación en cada arranque:** aproxima la instancia a Git, pero puede reemplazar trabajo sin exportar.
- **Respaldo periódico a Git:** útil para recuperación, insuficiente como política de actualización.
- **n8n-as-code u otra herramienta:** amplía la experiencia de editor y sincronización, con otra dependencia que mantener. Evaluarla si el volumen de trabajo justifica ese coste.
- **Paquetes oficiales:** mejoran portabilidad de referencias; su estado Preview exige valorar versiones y mantenimiento antes de hacerlos obligatorios.
- **Sincronización/fusión propia automática:** no justificada para la primera etapa de este proyecto.

## Evidencia de la investigación original

Las fuentes y su valoración están en la investigación, no en una atribución genérica a «lo que hacen todas las grandes empresas». La recomendación es una conclusión para las restricciones concretas de CyberSim.

No se ejecutaron imports, instalaron herramientas o modificaron workflows durante esta investigación. La implementación deberá demostrar conservación de ediciones, detección de actualización pendiente, exportación sin sobrescribir cambios entrantes, importación inicial repetible, tratamiento de fallos y publicación correcta. La política ya está aceptada; faltan la implementación y su verificación.
