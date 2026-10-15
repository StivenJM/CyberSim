# Mantenimiento para humanos y asistentes de IA

Esta guía permite localizar cambios y preservar el comportamiento del producto. Describe la estructura existente; no sustituye las instrucciones del usuario o las reglas del repositorio que existan en una sesión de trabajo.

## Reconocer el estado de trabajo

1. Leer la solicitud, `git status --short` y cualquier `AGENTS.md` aplicable antes de editar. No sobrescribir cambios ajenos.
2. Leer [visión técnica](../architecture/vision-general.md) y [reglas funcionales](../project/reglas-funcionales.md) de la funcionalidad.
3. Localizar archivos con `rg`/`rg --files`, excluyendo `node_modules`, `dist` y cliente Prisma generado. Buscar tanto consumidores como productores del contrato.
4. Revisar el [informe](../architecture/revision-del-sistema.md) para conocer limitaciones previas. No atribuir a un cambio nuevo un problema ya registrado.
5. Ejecutar checks proporcionales al cambio y registrar lo probado, lo simulado y lo que exige servicios externos.

No es necesario llamar servicios externos para editar documentación o probar reglas con mocks. Los scripts de seed, migraciones y concurrencia sí alteran datos; revisar la conexión efectiva y usar una base de prueba para esas tareas.

Para trabajo asociado a una funcionalidad, consultar [el catálogo de HUs](../project/historias-de-usuario.md) y preservar sus IDs. No atribuir una HU a un commit por semejanza de título; establecer la asociación del cambio seleccionado. La documentación transversal usa el formato `docs:` de la skill de commits.

## Puntos de entrada por tarea

| Necesidad | Código que revisar | Documentación vinculada |
|---|---|---|
| Ruta o pantalla | `apps/frontend/src/visual/main.tsx`, feature correspondiente | [Frontend](../architecture/frontend.md), [uso](uso-del-sistema.md) |
| Endpoint Express | Controller de módulo y `apps/backend/src/server.ts` | [API](../architecture/api-http.md), [backend](../architecture/backend.md) |
| Autorización | Middleware, router, caso de uso y ownership del recurso | [Seguridad](../architecture/seguridad.md), [ADR 0005](../project/adrs/0005-autorizacion-en-servidor.md) |
| Persistencia | Puerto/repo, `schema.prisma`, migraciones | [Datos](../architecture/modelo-de-datos.md), [operación](operacion-y-despliegue.md) |
| Nivel educativo | Definición, índice, metadatos en ambas apps, exportador | [Escenarios](escenarios.md), [reglas](../project/reglas-funcionales.md) |
| Regla simulada | `ecs/systems`, controller, componentes y hooks consumidores | [ECS](../architecture/simulacion-ecs.md), [pruebas](pruebas-y-calidad.md) |
| Chat/RAG/audio | Fachada cliente, repo nativo, servicios y prompt | [Integraciones](../architecture/integraciones.md), [configuración](configuracion.md) |
| n8n | Adaptador, DTO/caso de uso y consumidor frontend | [API](../architecture/api-http.md), [integraciones](../architecture/integraciones.md) |
| URL API | Config central, adaptadores chat/generador, hook análisis, Vite | [Configuración](configuracion.md), [frontend](../architecture/frontend.md) |
| Proceso de validación | Scripts por workspace, configs y CI | [Pruebas](pruebas-y-calidad.md) |

## Implementar una funcionalidad backend

Definir el contrato de entrada/salida y la autorización antes de agregar una ruta. Obtener identidad de JWT cuando corresponda y verificar propiedad de curso/estudiante; los IDs recibidos no son autorización.

Mantener las reglas en un caso de uso cuando haya comportamiento de dominio. Definir un puerto para persistencia/integración y un adaptador compatible. Evitar una copia nueva de repositorio si puede reutilizarse un contrato claro. Registrar diferencias legítimas entre módulos; no mover carpetas solo para uniformar nombres durante un cambio menor.

Validar entrada en runtime; interfaces y casts TypeScript desaparecen al ejecutar. Clasificar errores y devolver respuestas que el consumidor ya espera o actualizar ambos extremos. Revisar bodies y respuestas externas antes de persistir, especialmente IDs devueltos por un servicio.

## Cambiar el motor o interfaz

La definición declarativa y la escena de ejecución no son el mismo tipo de dato. Revisar qué componentes crea el builder y cómo se invoca el sistema. No asumir que existe un loop general o eliminación automática de entidades.

Cuando se agrega un evento, revisar enum, emisor, listeners, orden de fases y actualización React. Desuscribir listeners y liberar todos los intervalos al terminar. Registrar acciones con valores compatibles con las verificaciones y serializar con herramientas JSON, sin concatenar texto manualmente.

Revisar catálogo y títulos en las dos apps. No inferir que un archivo de escenario está activo por existir: el índice de exports es la autoridad del catálogo del cliente.

## Migraciones, publicación y evidencia

Crear una migración versionada para cambios de esquema duraderos. Evaluar datos existentes y política de borrado antes de imponer unicidad o cascadas. Generar Prisma después de modificar esquema. No editar el cliente generado.

Una propuesta de autorización, almacenamiento o integraciones que cambie fronteras merece un ADR. Utilizar [la plantilla](../project/adrs/plantilla.md), distinguir propuesta de decisión aplicada y enlazar la evidencia de implementación.

Al entregar un cambio, describir comportamiento final, pruebas y limitaciones. La compilación no demuestra conexión real a PostgreSQL, un test con mocks no demuestra propiedad del recurso y un HTTP 200 del chat no siempre significa éxito de procesamiento.

## Mantener la documentación

Actualizar una página canónica y sus índices, en lugar de duplicar procedimientos en varios lugares. Conservar `README.md`, `DEVELOPMENT.md` y `docs/arquitectura.md` como accesos breves. No presentar propuestas de corrección como funciones ya implementadas.

Mantener [el resumen visual](../architecture/resumen.md) cuando cambien procesos, responsabilidades, flujos o servicios. Usar Mermaid cuando ayude a comprender esas relaciones y enlazar al detalle. Si cambian reglas/requisitos, actualizar criterios de la HU correspondiente sin renumerar el catálogo.

Los ADRs retrospectivos describen decisiones inferidas del código y sus consecuencias; no inventar reuniones, fechas, responsables, alternativas supuestamente discutidas o compromisos institucionales.
