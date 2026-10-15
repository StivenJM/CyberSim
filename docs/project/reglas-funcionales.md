# Reglas funcionales

Las reglas siguientes describen el comportamiento implementado. Cuando una regla existe solo en pantalla o una garantía no está aplicada en servidor, se indica expresamente. Para contratos y protecciones HTTP consultar [API](../architecture/api-http.md) y [seguridad](../architecture/seguridad.md).

Los requisitos se organizan en [historias de usuario enumeradas](historias-de-usuario.md), que referencian estos IDs RF. Las HUs definen necesidades y criterios; esta página conserva el comportamiento observado.

## Cuentas

| ID | Regla actual | Límite o diferencia |
|---|---|---|
| RF-01 | Existen perfiles estudiante y profesor | No existe un rol administrador de aplicación |
| RF-02 | Correo de cuenta y código de estudiante son únicos | La creación de cuenta/perfil puede quedar parcial si falla el segundo paso |
| RF-03 | Registro acepta Gmail, Hotmail, Outlook y `epn.edu.ec` | La validación de dominio no normaliza todos los formatos/casos |
| RF-04 | Registro exige al menos ocho caracteres de contraseña | Formulario y recuperación permiten seis en su validación |
| RF-05 | Confirmación y reenvío usan un enlace válido por 24 horas | La UI bloquea navegación sin confirmar; login del servidor sí emite token |
| RF-06 | Recuperación exige cuenta confirmada y enlace de una hora | No hay revocación de sesiones existentes al cambiar contraseña |
| RF-07 | Sesión autenticada del servidor dura una hora | La UI comprueba presencia local del token, no su vigencia |
| RF-08 | Alta visible registra estudiantes | Incorporación de profesores requiere otro procedimiento |

## Cursos y participación

| ID | Regla actual | Límite o diferencia |
|---|---|---|
| RF-09 | Un profesor crea un curso/grupo con nombre | La API no verifica identidad del solicitante de grupo |
| RF-10 | Código de invitación de ocho letras/números, válido por siete días | El seed usa un código y vencimiento distintos para demostración |
| RF-11 | Regenerar código reemplaza el anterior | No hay historial de códigos de invitación |
| RF-12 | Un estudiante debe salir de su grupo antes de unirse a otro | La comprobación no garantiza unicidad con solicitudes simultáneas |
| RF-13 | Estudiante puede salir y docente puede retirar matrículas | Los IDs en estas rutas no están ligados a una identidad autenticada |
| RF-14 | Retirar matrícula conserva los intentos personales | La actividad no está asociada a una matrícula específica |
| RF-15 | El grupo se puede borrar cuando las referencias lo permiten | Las matrículas existentes pueden impedir el borrado |

## Práctica y seguimiento

| ID | Regla actual | Límite o diferencia |
|---|---|---|
| RF-16 | Cinco escenarios activos del catálogo | Otros archivos permanecen deshabilitados |
| RF-17 | El mapa desbloquea un nivel cuando todos los anteriores están completados | Es una regla de interfaz, sin comprobación equivalente en API |
| RF-18 | Orden del mapa por categoría definida y por ID dentro de cada categoría | Cambiar categoría/ID puede alterar orden y desbloqueo |
| RF-19 | La práctica se organiza por fases y objetivos | Nombres y orden de eventos deben ser coherentes para avanzar |
| RF-20 | Fallar una fase o completar el escenario envía un intento | No hay guardado continuo de partida ni reanudación completa |
| RF-21 | Cada envío de progreso crea un intento independiente | Un reenvío accidental también cuenta como intento |
| RF-22 | Un escenario se considera completado si cualquier intento fue exitoso | Los fallos posteriores no borran ese éxito del resumen |
| RF-23 | Historial registra resultado, tiempo y acciones por escenario | Valores llegan del cliente; no se certifica su autenticidad |
| RF-24 | Ranking suma puntos por el primer éxito de cada escenario | Sin aporte de escenarios no completados ni ponderación por tiempo |
| RF-25 | Puntaje por escenario: redondear `1000 × 0.7^fallos previos` | Éxitos repetidos del mismo slug no suman nuevamente |
| RF-26 | Empates comparten posición; orden visual se desempata por nombre | No equivale a una rúbrica de calificación oficial |
| RF-27 | Configuraciones y apps pueden activarse/comprarse en simulación | Comprobaciones de monto de presupuesto están desactivadas |

## Asistencia por IA

| ID | Regla actual | Límite o diferencia |
|---|---|---|
| RF-28 | Tutor recibe pregunta o contexto de objeto | Conversación temporal, sin conservación tras reinicio del servidor |
| RF-29 | Voz acompaña la respuesta si puede generarse | La caída operativa de voz permite continuar con texto |
| RF-30 | Feedback ofrece análisis, fortaleza, mejora y consejo | El texto debe interpretarse según la práctica y puede fallar |
| RF-31 | UI habilita feedback inicial o tras nuevos intentos | El endpoint de generación no obliga a cumplir esa condición |
| RF-32 | Análisis de curso presenta estadísticas y cinco secciones | No verifica ownership del profesor en servidor |
| RF-33 | Generador ofrece retos variables que el cliente adapta | No se garantiza calidad de toda generación ni reproducibilidad histórica |
| RF-34 | Todos los retos generados usan `ai-generated-scenario` | Distintas generaciones comparten historial y primer éxito para ranking |

## Evidencia

- Cuentas: [registro estudiante](../../apps/backend/src/auth/application/useCases/RegisterEstudianteUseCase.ts), [login](../../apps/backend/src/auth/application/useCases/LoginUseCase.ts), [recuperación](../../apps/backend/src/auth/application/useCases/CambiarContraseniaUseCase.ts) y [formulario](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/pages/AuthPage.tsx).
- Grupos: [unión](../../apps/backend/src/groups/application/JoinGroupsUseCase.ts), [códigos](../../apps/backend/src/groups/domain/utils/CodeGenerator.ts) y [repositorio](../../apps/backend/src/groups/infrastructure/repositories/PrismaGroupsRepository.ts).
- Práctica: [selección](../../apps/frontend/src/visual/features/escenarios-simulados/components/LevelSelectionMenuList.tsx), [progreso backend](../../apps/backend/src/auth/infrastructure/repositories/PrismaProgresoRepository.ts), [ranking](../../apps/frontend/src/visual/features/escenarios-simulados/hooks/useLeaderboard.ts) y [presupuesto](../../apps/frontend/src/ecs/systems/SistemaPresupuesto.ts).
- IA: [estado feedback](../../apps/backend/src/feedback/infrastructure/repositories/PrismaFeedbackPersistenceRepository.ts), [generación](../../apps/backend/src/feedback/application/useCases/GenerateFeedbackUseCase.ts) y [builder dinámico](../../apps/frontend/src/visual/features/agent-malvado/presentation/hooks/useScenarioBuilder.ts).
