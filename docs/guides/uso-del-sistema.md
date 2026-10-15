# Uso del sistema para estudiantes y docentes

CyberSim permite practicar decisiones de ciberseguridad sobre dispositivos y redes simulados. Para una demostración local, primero seguir [desarrollo local](desarrollo-local.md). Para conocer los límites de cada regla consultar [reglas funcionales](../project/reglas-funcionales.md).

## Cuenta de estudiante

1. Abrir `/signup` y completar los cuatro nombres/apellidos y el código único. El formulario pide un código de nueve dígitos.
2. Introducir un correo de dominio admitido: Gmail, Hotmail, Outlook o `epn.edu.ec`.
3. Usar una contraseña de al menos ocho caracteres y confirmarla. Aunque la interfaz muestra mínimo seis, el registro del servidor exige ocho.
4. Abrir el enlace de confirmación enviado por correo. Vence en 24 horas; si no llega o vence, utilizar reenvío desde la pantalla de verificación.
5. Iniciar sesión; una cuenta confirmada de estudiante entra a `/seleccion-niveles`.

Si se pierde la contraseña, utilizar `/recuperar-contrasenia` con una cuenta confirmada. El enlace dura una hora. Después del cambio, volver a iniciar sesión. No compartir enlaces de confirmación o recuperación.

## Practicar un escenario

1. Comenzar por el tutorial y seleccionar un nivel habilitado en el mapa.
2. Leer descripción, fases, objetivos y notificaciones de la simulación.
3. Seleccionar dispositivos en la oficina 3D para examinar su escritorio, activos, apps o configuraciones.
4. Usar la vista de redes para revisar topología, asignaciones, reglas de firewall y perfiles VPN que corresponden al reto.
5. Realizar las acciones antes de su comprobación temporal. Cuando una notificación pausa el reloj simulado, continuar la partida desde la interfaz.
6. Revisar el resultado de fase/escenario y el historial del perfil. Se envía un intento al fallar una fase o al completar el escenario.

Los nombres de apps y configuraciones forman parte del reto. La consola actúa sobre el modelo simulado, no sobre el sistema operativo del equipo. Una recarga pierde el estado en curso; el historial conserva los intentos enviados, no permite reanudar toda la escena.

Los niveles activos abarcan tutorial, amenazas, criptografía, control de acceso y hacking ético. Hay otros archivos de escenario en el repositorio que no aparecen en el catálogo activo.

## Tutor, audio y feedback

Abrir el chat flotante para consultar conceptos. El modo contexto permite preguntar por un objeto/configuración seleccionados. La respuesta puede incluir audio si el servicio de voz está disponible. La conversación es temporal y puede perderse al reiniciar el servidor o tras inactividad.

La retroalimentación individual resume análisis, fortaleza, área de mejora y consejo. La interfaz consulta si existe un feedback previo y si hubo nuevos intentos. Una nueva generación depende de n8n y PostgreSQL; un error de ese servicio no significa necesariamente que se haya perdido el intento.

El generador de desafíos solicita un escenario a un workflow externo, lo normaliza y permite jugarlo. Cada resultado puede variar. Sus intentos se agrupan actualmente bajo `ai-generated-scenario`; no existe un historial de definiciones que permita reconstruir exactamente cada desafío.

## Grupos y ranking

Desde el perfil, un estudiante puede unirse mediante el código proporcionado por su docente. El código ordinario vence en siete días. La regla funcional admite un solo grupo a la vez: hay que salir del actual antes de entrar a otro.

El ranking muestra compañeros del grupo y suma puntos por escenarios completados. Un primer éxito sin fallos previos da 1000 puntos; con un fallo previo, 700; con dos, 490. El tiempo no entra en esa fórmula. Un mismo puntaje comparte posición. No completar un escenario no aporta puntos de ese escenario.

## Docente

La interfaz actual de `/signup` registra estudiantes. El backend ofrece registro de profesor, pero el formulario no implementa un alta docente completa. Para una demo usar la cuenta docente del seed; para cuentas reales coordinar el procedimiento con quien administra la instancia.

Un profesor confirmado entra al panel `/docente`, donde puede crear grupos, consultar el código, regenerarlo, abrir estudiantes y revisar historiales. Puede consultar el análisis de curso y solicitar una generación cuando la integración está configurada.

Quitar una matrícula no elimina el historial del estudiante. Borrar un grupo con matrículas puede fallar por restricciones de base de datos; revisar y retirar matrículas según el procedimiento de la instancia antes de borrar. Los análisis generados deben revisarse en su contexto pedagógico antes de usarlos para decisiones sobre estudiantes.

## Incidencias habituales

- Si no llega correo, solicitar reenvío y revisar spam; el operador debe comprobar SMTP.
- Si la interfaz indica sesión pero una ruta protegida devuelve 401, volver a iniciar sesión: el JWT dura una hora.
- Si una partida aparece completa pero falta el intento en perfil, comunicar escenario y hora aproximada; el guardado actual no ofrece confirmación robusta ante todos los errores HTTP.
- Si generador, feedback o chat fallan, registrar la función y el mensaje visible para el operador. Consultar [resolución de problemas](resolucion-de-problemas.md).

Fuentes: [formulario](../../apps/frontend/src/visual/features/admin-docente-y-estudiante/pages/AuthPage.tsx), [rutas](../../apps/frontend/src/visual/main.tsx), [ranking](../../apps/frontend/src/visual/features/escenarios-simulados/hooks/useLeaderboard.ts), [unión a grupo](../../apps/backend/src/groups/application/JoinGroupsUseCase.ts) y [progreso](../../apps/frontend/src/ecs/controllers/ProgresoController.ts).
