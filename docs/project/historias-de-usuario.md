# Historias de usuario

Catálogo nuevo acordado desde **HU001**, creado el **14 de octubre de 2026** a partir del sistema revisado en `cc0c9cb`. Los IDs son estables para seguimiento y commits futuros. **Soporte observado** describe código existente; no significa que los criterios hayan sido aceptados o que se hayan probado todas las integraciones reales.

Los criterios son resultados comprobables, no números de tareas. Las referencias RF enlazan [reglas funcionales](reglas-funcionales.md); las brechas H enlazan [la revisión técnica](../architecture/revision-del-sistema.md). Las funciones que acceden a actividad educativa están sujetas al requisito transversal HU025.

## Catálogo

| ID | Historia | Actor | Soporte observado |
|---|---|---|---|
| [HU001](#hu001) | Registrar cuenta de estudiante | Estudiante | Existente, con diferencias de validación |
| [HU002](#hu002) | Incorporar docente | Docente | Parcial: API sin recorrido completo de UI |
| [HU003](#hu003) | Confirmar correo y reenviar enlace | Usuario | Existente; bloqueo efectivo parcial |
| [HU004](#hu004) | Iniciar y cerrar sesión | Usuario | Existente; controles de vigencia parciales |
| [HU005](#hu005) | Recuperar acceso | Usuario | Existente; política de contraseña divergente |
| [HU006](#hu006) | Gestionar cursos | Docente | Existente; permisos y borrado limitados |
| [HU007](#hu007) | Gestionar invitaciones | Docente | Existente; protección pendiente |
| [HU008](#hu008) | Unirse a un curso | Estudiante | Existente; unicidad concurrente pendiente |
| [HU009](#hu009) | Retirar una matrícula | Estudiante/docente | Existente; autorización pendiente |
| [HU010](#hu010) | Elegir y desbloquear escenarios | Estudiante | Existente en UI |
| [HU011](#hu011) | Explorar oficina y dispositivos | Estudiante | Existente en simulación local |
| [HU012](#hu012) | Resolver fases y objetivos | Estudiante | Existente; depende de coherencia de eventos |
| [HU013](#hu013) | Configurar dispositivos y apps | Estudiante | Existente; presupuesto no aplicado plenamente |
| [HU014](#hu014) | Examinar activos y verificar firmas | Estudiante | Existente en modelo educativo |
| [HU015](#hu015) | Utilizar consola simulada | Estudiante | Existente, limitada a comandos implementados |
| [HU016](#hu016) | Gestionar redes y firewall | Estudiante | Existente en modelo educativo |
| [HU017](#hu017) | Configurar VPN simulada | Estudiante | Existente en modelo educativo |
| [HU018](#hu018) | Guardar y consultar intentos | Estudiante/docente | Existente; guardado fiable pendiente |
| [HU019](#hu019) | Consultar ranking del grupo | Estudiante | Existente; depende de resultados del cliente |
| [HU020](#hu020) | Consultar tutor y contexto | Estudiante | Existente; proveedor real no verificado |
| [HU021](#hu021) | Escuchar respuesta del tutor | Estudiante | Existente; voz real no verificada |
| [HU022](#hu022) | Obtener feedback individual | Estudiante | Existente; habilitación en servidor pendiente |
| [HU023](#hu023) | Consultar análisis del curso | Docente | Existente; validación/propiedad pendientes |
| [HU024](#hu024) | Jugar un desafío generado | Estudiante | Existente; trazabilidad y calidad limitadas |
| [HU025](#hu025) | Proteger datos y operaciones | Usuario | Parcial; requiere corrección transversal |

## HU001

**Registrar cuenta de estudiante.** Como estudiante, quiero crear mi cuenta con mis datos y correo para acceder a las prácticas con un perfil identificable.

Criterios de aceptación:

- Con datos válidos y un correo/código no utilizados, se crea un perfil asociado a la cuenta y se informa que debe confirmarse el correo.
- Un correo o código ya registrado produce un mensaje claro sin crear una cuenta/perfil incompletos.
- UI y servidor aplican la misma regla de contraseña y campos, y se puede solicitar reenvío si falla el correo inicial.

Soporte: registro implementado; hay diferencia de longitud de contraseña y riesgo de identidad sin perfil (H-05, H-14). Reglas: RF-01–RF-04, RF-08. Evidencia: [registro estudiante](../../apps/backend/src/auth/application/useCases/RegisterEstudianteUseCase.ts) y [formulario](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/pages/AuthPage.tsx).

## HU002

**Incorporar docente.** Como docente, quiero disponer de una cuenta con perfil de profesor para organizar cursos y revisar el aprendizaje de mis estudiantes.

Criterios de aceptación:

- El procedimiento de incorporación identifica datos necesarios y quién puede dar de alta docentes.
- El registro crea cuenta y perfil coherentes, solicita confirmación e informa errores sin dejar un alta parcial.
- Tras confirmar e iniciar sesión, el docente accede a su panel.

Soporte: existe registro API y login docente; falta recorrido completo de alta en UI y definición de incorporación. RF-01–RF-08; H-05, H-14. Evidencia: [registro profesor](../../apps/backend/src/auth/application/useCases/RegisterProfesorUseCase.ts) y [rutas](../../apps/frontend/src/visual/main.tsx).

## HU003

**Confirmar correo y reenviar enlace.** Como usuario, quiero verificar mi correo y solicitar un enlace nuevo para habilitar mi cuenta con un medio de contacto válido.

Criterios de aceptación:

- Un enlace válido confirma la cuenta; un enlace inválido o vencido informa el problema.
- Se puede solicitar otro correo de confirmación mientras la cuenta no esté confirmada; su vigencia ordinaria es 24 horas.
- Las funciones que exigen confirmación la verifican tanto al navegar como al acceder a la API.

Soporte: confirmación/reenvío existentes; API no impone confirmación de forma general (H-03). RF-05. Evidencia: [confirmación](../../apps/backend/src/auth/application/useCases/ConfirmarEmailUseCase.ts) y [reenvío](../../apps/backend/src/auth/application/useCases/ReenviarConfirmacionEmailUseCase.ts).

## HU004

**Iniciar y cerrar sesión.** Como usuario, quiero acceder con mis credenciales y cerrar la sesión para utilizar las funciones de mi rol y terminar mi acceso local cuando corresponda.

Criterios de aceptación:

- Credenciales válidas devuelven una sesión y el perfil; credenciales inválidas no permiten acceso.
- La navegación presenta panel docente o selección de niveles según rol y estado de confirmación.
- Cerrar sesión elimina las credenciales locales; una sesión vencida recibe rechazo de API y una opción clara de volver a acceder.

Soporte: JWT de una hora y logout local; guard comprueba presencia y no expiración. No hay revocación de servidor. RF-07; H-03. Evidencia: [login](../../apps/backend/src/auth/application/useCases/LoginUseCase.ts) y [sesión cliente](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/hooks/useAuth.ts).

## HU005

**Recuperar acceso.** Como usuario con correo confirmado, quiero restablecer mi contraseña mediante un enlace temporal para recuperar mi cuenta.

Criterios de aceptación:

- Una cuenta confirmada puede solicitar recuperación sin exponer innecesariamente el estado de otras cuentas.
- El enlace vence en una hora; un token inválido o vencido no modifica la contraseña.
- El cambio válido aplica una política coherente de contraseña, limpia el token y permite iniciar sesión con la nueva clave.

Soporte: recuperación implementada; mínimo de seis distinto al registro y diferencias de respuesta para cuentas no confirmadas. RF-04, RF-06; H-14. Evidencia: [solicitud](../../apps/backend/src/auth/application/useCases/SolicitudCambioContraseniaUseCase.ts) y [cambio](../../apps/backend/src/auth/application/useCases/CambiarContraseniaUseCase.ts).

## HU006

**Gestionar cursos.** Como docente, quiero crear, consultar, renombrar y retirar mis cursos para organizar la actividad educativa.

Criterios de aceptación:

- Un curso creado aparece en la lista del docente con su nombre e identificador.
- Editar cambia campos permitidos y el detalle refleja la actualización.
- Borrar informa el resultado y maneja explícitamente las matrículas existentes, preservando datos según el procedimiento acordado.
- Solo el propietario autorizado modifica el curso.

Soporte: CRUD existente; falta autorización y matrículas pueden impedir borrar. RF-09, RF-15; H-01. Evidencia: [grupos](../../apps/backend/src/groups/infrastructure/controller/GroupsController.ts) y [persistencia](../../apps/backend/src/groups/infrastructure/repositories/PrismaGroupsRepository.ts).

## HU007

**Gestionar invitaciones.** Como docente, quiero consultar y renovar el código de un curso para invitar estudiantes durante una ventana definida.

Criterios de aceptación:

- Crear un curso genera un código ordinario de ocho caracteres y vigencia de siete días.
- Regenerarlo invalida el anterior y muestra la nueva expiración.
- Solo un docente autorizado obtiene o cambia las invitaciones de su curso.

Soporte: códigos/vencimiento existentes, sin protección en las rutas. RF-10, RF-11; H-01. Evidencia: [generación](../../apps/backend/src/groups/application/GenerateGroupCodeUseCase.ts) y [formato](../../apps/backend/src/groups/domain/utils/CodeGenerator.ts).

## HU008

**Unirse a un curso.** Como estudiante, quiero matricularme con un código válido para participar en el grupo de mi docente.

Criterios de aceptación:

- Un código válido y no vencido matricula al estudiante y muestra su grupo.
- Código inválido/vencido o pertenencia previa a un grupo produce un rechazo claro.
- Solicitudes simultáneas respetan la regla de un grupo por estudiante.
- La matrícula pertenece a la identidad autenticada, no a un ID arbitrario enviado.

Soporte: validación secuencial existente; atomicidad y autorización pendientes. RF-12; H-01, H-04. Evidencia: [unión](../../apps/backend/src/groups/application/JoinGroupsUseCase.ts) y [esquema](../../apps/backend/prisma/schema.prisma).

## HU009

**Retirar una matrícula.** Como estudiante, quiero salir de mi grupo, y como docente quiero retirar participantes de mi curso, para mantener la composición adecuada del grupo.

Criterios de aceptación:

- El estudiante puede retirar su propia matrícula y luego unirse a otro curso.
- El docente puede retirar una matrícula de un curso propio, con confirmación clara del resultado.
- Retirar la matrícula conserva el historial personal y rechaza operaciones ajenas o inexistentes.

Soporte: operaciones existentes; ID docente declarado en body no prueba identidad. RF-13, RF-14; H-01. Evidencia: [retiro](../../apps/backend/src/groups/application/LeaveGroupUseCase.ts) y [expulsión](../../apps/backend/src/groups/application/RemoveStudentGroupUseCase.ts).

## HU010

**Elegir y desbloquear escenarios.** Como estudiante, quiero ver los niveles, su estado y el siguiente reto disponible para avanzar ordenadamente en la práctica.

Criterios de aceptación:

- El mapa muestra los escenarios activos con título, categoría y estado del historial.
- El primer nivel está disponible; los siguientes se desbloquean al completar todos los anteriores del orden establecido.
- Seleccionar un nivel habilitado carga su definición y abre el laboratorio.

Soporte: recorrido UI existente, sin regla de desbloqueo equivalente en API. RF-16–RF-18. Evidencia: [selección](../../apps/frontend/src/visual/features/escenarios-simulados/components/LevelSelectionMenuList.tsx) y [catálogo](../../apps/frontend/src/data/escenarios/index.ts).

## HU011

**Explorar oficina y dispositivos.** Como estudiante, quiero recorrer el entorno 3D y seleccionar dispositivos para comprender la situación y abrir sus herramientas.

Criterios de aceptación:

- El nivel muestra zonas, oficinas, espacios y dispositivos definidos, con navegación comprensible.
- Seleccionar un dispositivo interactivo presenta sus datos y opciones sin confundirlo con decoración.
- Al cambiar de nivel, la selección se actualiza de forma coherente; una recarga sin nivel conduce a selección.

Soporte: escena/selección existentes; partida en memoria, sin restauración completa. RF-16, RF-19. Evidencia: [contexto de escenario](../../apps/frontend/src/visual/common/contexts/EscenarioContext.tsx) y [escena](../../apps/frontend/src/visual/features/escenarios-simulados/components/Escena3D.tsx).

## HU012

**Resolver fases y objetivos.** Como estudiante, quiero conocer objetivos, recibir eventos y ver el resultado de cada fase para relacionar mis acciones con las consecuencias de seguridad.

Criterios de aceptación:

- Se presentan objetivos y fase actual; notificaciones y verificaciones ocurren en los tiempos definidos.
- Acciones correctas completan objetivos y permiten avanzar; fallo relevante comunica resultado y termina el intento correspondiente.
- Pausa/reanudación y cierre de partida mantienen tiempos coherentes y liberan los relojes al finalizar.

Soporte: sistemas existentes; coherencia de nombres/orden necesaria y reloj total no se limpia. RF-19, RF-20; H-08. Evidencia: [fases](../../apps/frontend/src/ecs/systems/SistemaFase.ts) y [tiempo](../../apps/frontend/src/ecs/systems/SistemaTiempo.ts).

## HU013

**Configurar dispositivos y apps.** Como estudiante, quiero ajustar protecciones y administrar aplicaciones simuladas para mitigar amenazas según el objetivo del nivel.

Criterios de aceptación:

- Se muestran configuraciones y aplicaciones disponibles del dispositivo seleccionado.
- Activar/desactivar o instalar/desinstalar modifica el estado y registra la acción usada por las verificaciones del reto.
- La interfaz informa el resultado; no presenta como efectiva una restricción de presupuesto que el motor no aplique.

Soporte: configuraciones/apps existentes; comprobaciones de monto desactivadas. RF-27. Evidencia: [sistema de configuraciones/apps](../../apps/frontend/src/ecs/systems/SistemaPresupuesto.ts) y [dispositivos](../../apps/frontend/src/visual/features/hardening-de-dispositivos/pages/Dispositivos.tsx).

## HU014

**Examinar activos y verificar firmas.** Como estudiante, quiero consultar documentos, claves y firmas de un dispositivo para practicar decisiones sobre integridad y autenticidad en el modelo educativo.

Criterios de aceptación:

- El explorador muestra activos presentes y permite la interacción definida por el escenario.
- La verificación relaciona documento, firma y clave seleccionados y registra un veredicto.
- El resultado se evalúa contra el reto y actualiza el objetivo correspondiente, sin presentarse como servicio criptográfico real.

Soporte: activos/verificaciones simuladas existentes. RF-19, RF-23. Evidencia: [sistema de activos](../../apps/frontend/src/ecs/systems/SistemaActivo.ts) y [verificación de firma](../../apps/frontend/src/visual/features/hardening-de-dispositivos/components/ModalVerificacionFirma.tsx).

## HU015

**Utilizar consola simulada.** Como estudiante, quiero ejecutar los comandos previstos por el nivel para practicar exploración e interacción con dispositivos sin operar el equipo real.

Criterios de aceptación:

- La consola presenta contexto del dispositivo y respuestas a comandos soportados.
- Un comando no reconocido informa su limitación sin ejecutarse en el sistema anfitrión.
- Las acciones relevantes afectan el modelo simulado y quedan disponibles para sus verificaciones.

Soporte: intérprete local con conjunto de comandos implementados. RF-19, RF-23. Evidencia: [sistema de comandos](../../apps/frontend/src/ecs/systems/SistemaComandos.ts) y [consola](../../apps/frontend/src/visual/features/hardening-de-dispositivos/components/ModalConsola.tsx).

## HU016

**Gestionar redes y firewall.** Como estudiante, quiero inspeccionar topología, asignar redes y configurar reglas para controlar el tráfico simulado del reto.

Criterios de aceptación:

- Tabla/topología refleja dispositivos, redes y relaciones del nivel.
- Agregar/quitar red y modificar reglas cambia el modelo y registra la acción.
- La comprobación de tráfico considera origen, destino, protocolo y reglas, e informa si cumple el objetivo.

Soporte: servicios de red/firewall existentes. RF-19, RF-23. Evidencia: [sistema de red](../../apps/frontend/src/ecs/systems/SistemaRed.ts) y [vista de redes](../../apps/frontend/src/visual/features/simulacion-redes/pages/Redes.tsx).

## HU017

**Configurar VPN simulada.** Como estudiante, quiero definir perfiles compatibles de gateway y cliente para practicar una comunicación protegida entre extremos del escenario.

Criterios de aceptación:

- Se pueden consultar/configurar los perfiles previstos para los dispositivos VPN.
- La verificación compara dominios, hosts y protección según la regla simulada.
- Configuración compatible o incompatible comunica resultado y afecta el reto cuando corresponde.

Soporte: VPN dentro del modelo educativo. RF-19, RF-23. Evidencia: [servicio VPN](../../apps/frontend/src/ecs/systems/red/VPNService.ts) y [modal](../../apps/frontend/src/visual/features/simulacion-redes/components/ModalVPN.tsx).

## HU018

**Guardar y consultar intentos.** Como estudiante, quiero conservar mi actividad, y como docente quiero consultar el historial autorizado, para observar resultados y evolución.

Criterios de aceptación:

- Fallar una fase o completar un escenario registra resultado, slug, tiempo y acciones legibles del intento.
- El usuario conoce el éxito/fallo de guardado; un reenvío de la misma operación no duplica silenciosamente un intento.
- El historial muestra secuencia de intentos y un resumen marca completado si existe un éxito.
- La consulta y escritura están limitadas a la persona o relación docente autorizada.

Soporte: inserción e historial existentes; sin idempotencia, serialización/confirmación robustas o permisos generales. RF-20–RF-23; H-01, H-06, H-07. Evidencia: [cliente de progreso](../../apps/frontend/src/ecs/controllers/ProgresoController.ts) y [persistencia](../../apps/backend/src/auth/infrastructure/repositories/PrismaProgresoRepository.ts).

## HU019

**Consultar ranking del grupo.** Como estudiante, quiero comparar mi progreso con compañeros del grupo para identificar avances y mantener motivación.

Criterios de aceptación:

- Se muestran participantes del grupo autorizado, sus puntos y posición.
- Cada escenario aporta `round(1000 × 0.7^fallosPrevios)` al primer éxito; el tiempo no altera la fórmula y repetir éxito no vuelve a sumar.
- Empates comparten posición; orden visual usa nombre como desempate.
- Sin grupo o sin resultados se informa un estado comprensible.

Soporte: cálculo cliente existente; depende de resultados enviados por navegador. RF-24–RF-26; H-01, H-17. Evidencia: [ranking](../../apps/frontend/src/visual/features/escenarios-simulados/hooks/useLeaderboard.ts).

## HU020

**Consultar tutor y contexto.** Como estudiante, quiero preguntar conceptos o consultar un objeto seleccionado para comprender mejor la decisión que debo tomar.

Criterios de aceptación:

- El chat acepta pregunta o contexto válido y presenta respuesta o fallo claro de procesamiento.
- Usa conocimiento recuperado cuando está disponible; ausencia/fallo de búsqueda permite continuar según el comportamiento documentado.
- Mantiene historia reciente de la sesión con sus límites explícitos y la vincula al usuario autorizado.

Soporte: chat/RAG/memoria existentes, sin proveedor real verificado ni aislamiento por cuenta. RF-28; H-02. Evidencia: [repositorio de chat](../../apps/backend/src/chat/infrastructure/repositories/NativeChatRepository.ts) y [UI](../../apps/frontend/src/visual/features/chat/components/ChatContainer.tsx).

## HU021

**Escuchar respuesta del tutor.** Como estudiante, quiero reproducir el audio disponible de una explicación para usar otra forma de acceder al contenido.

Criterios de aceptación:

- Una respuesta con audio válido ofrece reproducción desde la interfaz.
- Si no hay audio o falla síntesis/reproducción, sigue disponible el texto sin presentar éxito de voz inexistente.
- Los recursos de reproducción se manejan coherentemente al cambiar de mensaje o cerrar la vista.

Soporte: Piper/reproducción existentes; integración real no verificada. RF-29. Evidencia: [Piper](../../apps/backend/src/chat/infrastructure/services/PiperTTSService.ts) y [audio cliente](../../apps/frontend/src/visual/features/chat/hooks/useAudioPlayer.ts).

## HU022

**Obtener feedback individual.** Como estudiante, quiero consultar análisis, fortalezas, mejoras y consejos de mi práctica para decidir qué reforzar.

Criterios de aceptación:

- Se consulta el último feedback y si hay nuevos intentos para generar otro.
- Generación devuelve y conserva cuatro secciones asociadas al estudiante/escenario correctos.
- El servidor aplica la regla de habilitación y evita generaciones duplicadas no previstas; los fallos se comunican sin perder historial.

Soporte: consulta/generación/persistencia existentes; la habilitación no se impone en generate y respuesta no se valida completamente. RF-30, RF-31; H-12, H-13. Evidencia: [generación](../../apps/backend/src/feedback/application/useCases/GenerateFeedbackUseCase.ts) y [estado](../../apps/backend/src/feedback/application/useCases/CheckFeedbackStatusUseCase.ts).

## HU023

**Consultar análisis del curso.** Como docente, quiero conocer tendencias y recomendaciones de mi curso para orientar el acompañamiento de estudiantes.

Criterios de aceptación:

- Se puede recuperar el último análisis o informar ausencia de uno.
- Generación devuelve estadísticas y secciones comprensibles del curso solicitado y las conserva.
- El docente debe estar autorizado; la respuesta externa se valida y no puede persistirse bajo otro curso por un ID inconsistente.
- Falta de configuración o fallo externo muestra un estado claro.

Soporte: endpoints y persistencia existentes; propiedad y validación completa pendientes. RF-32; H-01, H-13. Evidencia: [controller](../../apps/backend/src/course-analysis/infrastructure/controllers/CourseAnalysisController.ts) y [persistencia](../../apps/backend/src/course-analysis/infrastructure/repositories/PrismaCourseAnalysisRepository.ts).

## HU024

**Jugar un desafío generado.** Como estudiante, quiero obtener un escenario variable y jugarlo para practicar decisiones en situaciones diferentes.

Criterios de aceptación:

- Solicitar generación presenta loading y resultado/fallo; un resultado válido puede seleccionarse para jugar.
- El desafío es compatible con el motor y conserva objetivos, nombres y tiempos coherentes tras normalización.
- Se comunica que la generación puede variar; si se necesita reconstruir una actividad exacta, su definición/versionado debe conservarse por intento.
- El historial diferencia correctamente qué generación se evaluó cuando se implemente esa trazabilidad.

Soporte: flujo existente; fallback de ruta falla, calidad no garantizada y generaciones comparten slug sin definición persistida. RF-33, RF-34; H-09, H-17. Evidencia: [servicio cliente](../../apps/frontend/src/visual/features/agent-malvado/infrastructure/services/ScenarioBuilderApiService.ts) y [builder](../../apps/frontend/src/visual/features/agent-malvado/presentation/hooks/useScenarioBuilder.ts).

## HU025

**Proteger datos y operaciones.** Como usuario, quiero que solo personas autorizadas accedan a mis datos educativos y funciones para preservar privacidad e integridad de mi actividad.

Criterios de aceptación:

- Acceso educativo exige identidad válida y confirmación donde corresponda, con rechazo claro de token ausente, inválido o vencido.
- Estudiantes no escriben/consultan actividad privada ajena; docentes no modifican cursos ajenos y acceden a estudiantes por relación permitida.
- El servidor deriva o valida IDs contra identidad/propiedad, en vez de confiar en el body o localStorage.
- Chat protege sesiones y la generación aplica controles de uso vinculados a cuenta.

Soporte: parcial; JWT aplicado solo a dos rutas de auth y varias áreas públicas. RF-01, RF-05, RF-07, RF-09, RF-13, RF-23, RF-28, RF-32; H-01–H-03. Evidencia: [middleware](../../apps/backend/src/auth/infrastructure/middlewares/authMiddleware.ts), [montajes](../../apps/backend/src/server.ts) y [ADR propuesto 0005](adrs/0005-autorizacion-en-servidor.md).

## Uso del catálogo

La [suite de integración del frontend](../guides/tests-de-integracion.md#cobertura-por-historia-y-pantalla) relaciona HU001–HU025 con sus recorridos, pantallas y límites de cobertura. Sus resultados deben consultarse en el reporte de la ejecución correspondiente; la existencia de esos tests no cambia por sí sola el estado de aceptación de las historias.

Refinar criterios manteniendo IDs. Una mejora puede cubrir parte de una HU sin completarla; registrar esa diferencia al revisar trabajo. Los límites de implementación viven en las reglas/revisión y la validación futura debe aportar evidencia por criterio.

El catálogo no asigna responsables, sprints, plazos ni prioridad institucional. Ver [requisitos y trazabilidad](requisitos.md) para relación con commits y requisitos no funcionales.
