## CRYPTOGRAPHIC FAILURE 

## CWE-321: Use of Hard-coded Cryptographic Key ESCENARIOS CONSIDERADOS PARA CIBERSIM

## Planteamiento:

AndinaPay es una fintech quiteña de 12 personas que permite a pequeños comercios cobrar con tarjeta. Su plataforma guarda la cédula y el token de tarjeta de cada cliente, y todo ese contenido se almacena cifrado en la base de datos. El equipo lo presumió en su última demo con inversionistas: “nuestros datos sensibles nunca se guardan en claro”.

El lunes por la mañana, la gerencia recibe un aviso anónimo. Un volcado parcial de la base de datos circula en un foro, y esta aparece en texto plano.

Nadie en la empresa sabe cómo es posible. El sistema no sufrió ningún ataque visible: no hubo alertas, no hubo accesos extraños al servidor y el cifrado usa un algoritmo moderno y reconocido. Aun así, alguien parece haber leído lo que debía ser ilegible.

Durante la primera reunión de crisis, el líder técnico deja caer un comentario casi de pasada: “Antes de la demo revisamos la seguridad a última hora. Dejamos unas cosas pendientes para después, pero nada que afectara el cifrado.” Nadie recuerda con exactitud cuáles eran esas cosas.

La gerencia te contrata como analista del equipo de respuesta a incidentes. Tienes una jornada para entender cómo se pudo descifrar la información, demostrar qué datos están realmente expuestos y contener el incidente antes de que el volcado completo salga a la luz.

## Lo que sabes al empezar

- Los datos del volcado están cifrados con un algoritmo robusto y vigente.

- No hay evidencia de intrusión en los servidores ni en la base de datos.

- El equipo de desarrollo es pequeño, trabajó bajo mucha presión de tiempo y varios módulos se construyeron a toda prisa para la demo.

- La revisión de seguridad previa a la demo fue apresurada y dejó tareas pendientes sin documentar.

- El código del sistema vive en un repositorio compartido, con meses de historial de cambios.

- El volcado, el repositorio y los equipos de la oficina están a tu disposición.


## 1. Qué se va a evaluar

- Capacidad de análisis forense en código: Habilidad para revisar repositorios, historiales de commits y detectar secretos expuestos (Hard- coded keys / CWE-321).

- Diagnóstico de causa raíz: Distinguir correctamente un fallo lógico de desarrollo (credenciales/llaves en el código) frente a fallos de infraestructura, intrusiones o debilidades algorítmicas.

- Remediación integral: Rotación segura de secretos, recifrado de datos y establecimiento de controles preventivos (CI/CD o escáneres).

## 2. Qué se espera del estudiante

- Que no caiga en distractores (como culpar al algoritmo de cifrado o buscar intrusiones inexistentes).

- Que siga una ruta lógica de investigación: inspección del historial  hallazgo de la clave → prueba de concepto (descifrado) → mitigación y parcheo.

- Que actúe con rigor técnico sin dar por ciertos supuestos incomprobables (como especular sobre el vector exacto de filtración del volcado sin evidencia).

## 3. Qué debe contemplar o incluir el escenario simulado

- Un entorno de repositorio accesible: Con historial de commits (incluyendo versiones previas donde se cometió el error con la llave temporal).

- Archivos de datos de prueba: Un volcado parcial de la base de datos con registros reales cifrados mediante la clave comprometida.

- Un sistema de feedback/mensajería: Que guíe el proceso mediante validaciones y dependencias técnicas sin regalar la solución de golpe.


INJECTION

## CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')

## Planteamiento

Eres parte del equipo de desarrollo de BibliotecaViva, una plataforma universitaria de préstamo de libros y recursos digitales. Esta semana se habilitó un nuevo módulo de consulta de historial de préstamos, donde cada estudiante puede filtrar sus préstamos por título, autor o fecha.

El lunes, la bibliotecaria jefe notó algo inquietante: un estudiante de primer semestre logró ver el historial de préstamos de otras personas, y en la base de datos aparecen registros de usuarios que nunca solicitaron esos libros. Nadie rompió una contraseña ni accedió al servidor. Dentro de la computadora simulada, tu tarea es investigar cómo ocurrió, entender qué hizo el sistema con el texto que escribe el usuario y corregirlo antes de que afecte a más personas.

## Lo que sabes al empezar

- El módulo tiene un formulario de búsqueda con campos de texto libre (título, autor y fecha).

- La aplicación se conecta a una base de datos que guarda usuarios, libros y préstamos.

- El equipo asegura que el formulario es seguro porque 
solo acepta texto
 y tiene un límite de longitud.

- Tienes acceso al código fuente del backend, al esquema de la base de datos y a los registros de la aplicación.

- Los registros muestran consultas con estructuras que el desarrollo original nunca previó.

- Algunas búsquedas devuelven mensajes de error de la base de datos directamente en pantalla.

## 1. Qué se va a evaluar

- Comprensión de que la entrada del usuario es dato, no código, y de qué ocurre cuando ambos se mezclan en una misma cadena.

- Capacidad para identificar construcciones inseguras de consultas en el código, como la concatenación de texto del usuario dentro de sentencias SQL.


- Conocimiento de las defensas correctas: consultas parametrizadas (prepared statements), uso adecuado de ORMs, validación de entradas por tipo y formato, y principio de mínimo privilegio en la cuenta de la base de datos.

- Criterio para distinguir entre defensas reales y falsas: limitar la longitud o “limpiar” algunos caracteres no resuelve el problema de fondo.

- Conciencia del riesgo de exponer mensajes de error internos al usuario final.

- Uso de los registros para reconstruir qué consultas se ejecutaron realmente.

## 2. Qué se espera del estudiante

- Localizar en el código las consultas que se construyen con datos del usuario y trazar el recorrido del texto desde el formulario hasta la base de datos.

- Demostrar el problema de forma controlada dentro del entorno (por ejemplo, observar que una entrada inesperada altera el comportamiento de la consulta) y documentar la evidencia.

- Explicar la causa raíz con sus propias palabras: por qué el motor de base de datos no distingue entre la intención del desarrollador y el texto introducido por el usuario.

- Implementar o proponer la corrección: reemplazar la concatenación por consultas parametrizadas, validar las entradas, ocultar los mensajes de error detallados y reducir los permisos de la cuenta que usa la aplicación.

- Verificar la solución comprobando que las entradas manipuladas ya no alteran la consulta y que las búsquedas legítimas siguen devolviendo los resultados correctos.

- Redactar un breve informe del incidente (qué pasó, qué datos quedaron expuestos, causa, corrección y recomendación preventiva), practicando la comunicación hacia perfiles no técnicos.

## 3. Qué debe contemplar o incluir el escenario simulado

- Una aplicación sencilla con formulario de búsqueda y una base de datos con datos ficticios (usuarios, libros y préstamos), donde al menos una consulta se construya concatenando texto del usuario.

- Una consulta ya corregida en otra parte del sistema, para que el estudiante pueda comparar el enfoque seguro con el inseguro.


- Mensajes de error visibles que revelen detalles de la estructura interna, como ejemplo de configuración inadecuada.

- Una cuenta de base de datos con permisos excesivos, para que el estudiante evalúe el impacto y aplique el mínimo privilegio.

- Registros coherentes con marcas de tiempo y consultas anómalas que permitan reconstruir la secuencia del incidente.

- Un entorno completamente aislado: todo ocurre dentro de la computadora simulada del entorno 3D, con datos ficticios y sin conexión a sistemas reales.

- Retroalimentación inmediata: al aplicar la corrección, el entorno confirma si la consulta ya no es manipulable y si la búsqueda legítima se conserva.

- Un cierre narrativo que muestre la consecuencia de haber corregido (o no) la vulnerabilidad, manteniendo el componente gamificado.

## Insecure Design 

## CWE-434: Unrestricted Upload of File with Dangerous Type Planteamiento

Trabajas en el equipo de desarrollo de TalentoAndino, una bolsa de empleo donde los postulantes suben su hoja de vida y los reclutadores la descargan para revisarla. Para el lanzamiento, el equipo diseñó la carga de archivos pensando en la comodidad: “que el candidato suba lo que quiera y el sistema lo guarde”.

Esta semana, el área de reclutamiento reportó que al abrir el portal aparecen páginas que nadie diseñó, que el servidor se ralentiza por las noches y que en la carpeta de hojas de vida hay archivos con nombres extraños que no corresponden a ningún postulante. Dentro de la computadora, tu tarea es investigar qué se ha estado subiendo al servidor, entender por qué el sistema lo permitió y rediseñar la carga para que no vuelva a ocurrir.

## Lo que sabes al empezar


- El portal permite subir una hoja de vida y una foto de perfil desde un formulario.

- Los archivos se guardan en una carpeta del servidor que también sirve contenido a los visitantes.

- La interfaz muestra 
Solo PDF o JPG
, pero no sabes si el servidor lo comprueba realmente.

- El nombre del archivo se conserva tal como lo envía el usuario.

- Tienes acceso al código fuente, a la configuración del servidor, a la carpeta de cargas y a los registros.

- Los registros muestran cargas de archivos con extensiones que la aplicación no declara aceptar.

- 1. Qué se va a evaluar

- Comprensión de que un archivo subido es entrada no confiable: su nombre, su extensión y su tipo declarado pueden ser falsos.

- Capacidad para detectar un problema de diseño, no solo de implementación: la carga se concibió sin pensar en qué ocurre cuando alguien sube algo inesperado.

- Distinción entre controles del lado del cliente y del servidor: restringir tipos en la interfaz no protege nada si el servidor no verifica.

- Conocimiento de las defensas adecuadas: lista de tipos permitidos validada en el servidor, comprobación del contenido real y no solo de la extensión, renombrado del archivo, límites de tamaño y almacenamiento fuera del directorio que sirve contenido ejecutable.

- Criterio para reconocer configuraciones peligrosas: carpetas de carga con permisos de ejecución o accesibles directamente desde la web.

- Uso de registros y del contenido de la carpeta para reconstruir qué se subió, cuándo y qué efectos tuvo.

- 2. Qué se espera del estudiante

- Recorrer el flujo de carga completo, desde el formulario hasta el lugar donde se guarda el archivo, e identificar qué se valida y qué no.

- Comprobar de forma controlada, dentro del entorno, que el servidor acepta un archivo de tipo no permitido y que queda disponible en una ubicación accesible, documentando la evidencia.


- Explicar la causa raíz con sus propias palabras: por qué la restricción visible en la interfaz era insuficiente y qué decisiones de diseño hicieron posible el problema.

- Rediseñar y corregir la carga: validar tipo y contenido en el servidor, generar nombres propios para los archivos, limitar tamaño, guardar los archivos fuera de la ruta pública o sin permisos de ejecución, y servirlos mediante un mecanismo controlado.

- Revisar el contenido existente de la carpeta y proponer cómo aislar o eliminar los archivos sospechosos.

- Verificar la solución comprobando que un archivo no permitido es rechazado y que un postulante legítimo puede seguir subiendo su hoja de vida.

- Redactar un breve informe del incidente (qué pasó, impacto, causa, corrección y recomendación preventiva, incluyendo cómo incorporar la seguridad desde la etapa de diseño), con un enfoque cercano al trabajo de gestión de proyectos.

- 3. Qué debe contemplar o incluir el escenario simulado

- Un portal sencillo con formulario de carga que valide el tipo de archivo únicamente en la interfaz, y un servidor que acepte cualquier contenido.

- Una carpeta de cargas accesible desde la web y con permisos demasiado amplios, para que el estudiante evalúe el riesgo de su configuración.

- Archivos ficticios inofensivos ya presentes en la carpeta (por ejemplo, un archivo con extensión engañosa o un documento con contenido que no coincide con su tipo), que el estudiante deba detectar y clasificar. El entorno no incluye código malicioso real.

- Registros coherentes con cargas, marcas de tiempo y efectos observables (páginas inesperadas, consumo anómalo de recursos) que permitan reconstruir la secuencia.

- Una comparación de diseño: una breve descripción de requisitos originales donde la seguridad de la carga no se consideró, para que el estudiante identifique en qué momento debió incorporarse.

- Un entorno completamente aislado: todo ocurre dentro de la computadora simulada del entorno 3D, con datos ficticios y sin conexión a sistemas reales.


- Retroalimentación inmediata: al aplicar la corrección, el entorno confirma si los archivos no permitidos son rechazados y si la carga legítima se conserva.

- Un cierre narrativo que muestre la consecuencia de haber corregido (o no) el diseño, manteniendo el componente gamificado.

## Security Misconfiguration

## CWE-306: Missing Authentication for Critical Function

## Planteamiento

Eres parte del equipo de desarrollo de AndeanLogix, una startup ecuatoriana de logística que acaba de lanzar su plataforma de seguimiento de envíos. Durante la última semana antes del lanzamiento, el equipo habilitó un panel de administración interno para operaciones: desde ahí se pueden reasignar rutas, cancelar envíos y restablecer contraseñas de repartidores.

Esta mañana, el equipo de soporte reportó algo extraño: varios envíos aparecieron cancelados sin que ningún operador lo hubiera hecho. Nadie inició sesión en el panel durante esa franja horaria. Tu tarea es investigar el servicio dentro de la computadora simulada, entender cómo fue posible y corregirlo antes de que el incidente se repita.

## Lo que sabes al empezar

- La aplicación tiene una interfaz pública para clientes y un panel de administración que “solo debería usar el personal interno”.

- El panel corre en el mismo servidor, en un puerto distinto al de la aplicación principal.

- El equipo asegura que el panel es seguro porque -nadie conoce la dirección”.

- Tienes acceso al código fuente del backend, a los archivos de configuración y a los registros (logs) del servidor.

- Los registros muestran peticiones que cancelaron envíos, pero no aparece ningún inicio de sesión asociado.

- Hay una pantalla de login en el panel, pero no sabes si realmente se está usando.


## 1. Qué se va a evaluar

- Capacidad para reconocer funciones críticas (cancelar envíos, restablecer credenciales, cambiar rutas) y entender que requieren autenticación y autorización propias.

- Comprensión de que ocultar una ruta no es un control de seguridad (“seguridad por oscuridad”).

- Habilidad para leer código y configuración e identificar dónde falta la verificación de identidad: endpoints sin middleware de autenticación, rutas administrativas expuestas, configuraciones por defecto o de depuración que quedaron activas.

- Uso de registros del servidor como evidencia para reconstruir lo ocurrido.

- Criterio para proponer una corrección adecuada, no solo parchar un endpoint, sino reducir la superficie de exposición.

## 2. Qué se espera del estudiante

- Explorar la aplicación y el servidor simulado, y localizar las funciones críticas que no exigen autenticación.

- Demostrar el problema de forma controlada dentro del entorno (por ejemplo, ejecutar una acción administrativa sin sesión) y registrar la evidencia.

- Explicar la causa raíz con sus propias palabras: qué control faltaba, por qué la pantalla de login no protegía realmente la función y qué papel jugó la configuración.

- Implementar o proponer la corrección: exigir autenticación en todas las rutas críticas, aplicar verificación de roles, cerrar o restringir el acceso al puerto del panel y desactivar configuraciones inseguras.

- Verificar la solución comprobando que la acción ahora es rechazada sin credenciales válidas y que un operador legítimo sigue pudiendo trabajar.

- Redactar un breve informe del incidente (qué pasó, impacto, causa, corrección y una recomendación preventiva), con un enfoque que además practique la comunicación propia de un rol de gestión de proyectos.

## 3. Qué debe contemplar o incluir el escenario simulado

- Un backend sencillo con rutas públicas y rutas administrativas, donde al menos una función crítica carezca por completo de verificación de


- identidad, y otra que dependa solo de una comprobación del lado del cliente.

- Un panel de administración con pantalla de login funcional, para que el estudiante note que la existencia de un login no equivale a protección real.

- Archivos de configuración con un puerto expuesto y una opción de depuración o modo “mantenimiento” que desactiva controles.

- Registros del servidor con evidencia coherente: peticiones administrativas sin sesión asociada, con marcas de tiempo que permitan reconstruir la secuencia.

- Un entorno aislado y seguro: todo ocurre dentro de la computadora simulada del entorno 3D, con datos ficticios y sin conexión a sistemas reales.

- Retroalimentación inmediata: al aplicar la corrección, el entorno confirma si la función crítica quedó protegida y si el acceso legítimo se conserva.

- Un cierre narrativo que muestre la consecuencia de haber corregido (o no) el problema, para mantener el componente gamificado.

## Software and Data Integrity Failures

## CWE-502: Deserialization of Untrusted Data

## Planteamiento

Trabajas en el equipo de desarrollo de NubeAndina, una plataforma de gestión de eventos que permite a los organizadores guardar sus “sesiones de trabajo” (filtros, plantillas y preferencias) para retomarlas después. Para ahorrar tiempo, el equipo decidió que el servidor entregue al navegador un objeto serializado con toda la sesión y que el navegador lo devuelva en cada petición.

Hace dos días, el servidor comenzó a comportarse de forma errática: procesos que se reinician solos, usuarios con permisos que no les corresponden y un archivo de configuración modificado sin que nadie del equipo lo tocara. Dentro de la computadora simulada, tu tarea es investigar el origen de la anomalía, entender

por qué el servidor confió en datos que venían del exterior y corregirlo.

## Lo que sabes al empezar

- La aplicación guarda la sesión del usuario en un objeto serializado que viaja entre el cliente y el servidor.


- El servidor lo reconstruye automáticamente al recibirlo, antes de validar cualquier cosa.

- El equipo cree que el objeto es seguro porque -está codificado y no se entiende a simple vista”.

- Tienes acceso al código fuente, a las dependencias del proyecto y a los registros del servidor.

- Los registros muestran peticiones con objetos de sesión inusualmente grandes o con estructuras que la aplicación nunca genera.

- Una de las librerías del proyecto no se actualiza desde hace más de un año.

- 1. Qué se va a evaluar

- Comprensión de que los datos que llegan del cliente nunca son confiables, aunque parezcan opacos o estén codificados.

- Capacidad para identificar puntos de deserialización en el código y reconocer cuáles reciben información externa.

- Entendimiento de la diferencia entre codificar, firmar y validar un dato: ocultar el contenido no garantiza su integridad.

- Criterio para elegir alternativas más seguras: formatos de datos simples (como JSON con esquema validado), listas de clases permitidas, firmas de integridad y almacenamiento de la sesión del lado del servidor.

- Conciencia del riesgo en la cadena de suministro: dependencias desactualizadas que amplían el impacto de una deserialización insegura.

- Uso de los registros para reconstruir la secuencia del incidente.

- 2. Qué se espera del estudiante

- Localizar en el código dónde se deserializan datos recibidos del cliente y trazar el recorrido del objeto desde que llega hasta que se usa.

- Comprobar de forma controlada, dentro del entorno, que el servidor acepta objetos alterados sin verificar su origen ni su estructura, y documentar la evidencia.

- Explicar la causa raíz con sus propias palabras: por qué reconstruir objetos a partir de datos no confiables es peligroso y qué falló en la confianza depositada en el cliente.

- Implementar o proponer la corrección: dejar de deserializar objetos arbitrarios, adoptar un formato de datos seguro con validación estricta,


- firmar los datos que deban viajar al cliente o mantener la sesión en el servidor.

- Revisar las dependencias del proyecto y proponer una política de actualización y verificación.

- Verificar la solución comprobando que los datos manipulados son rechazados y que el flujo normal de un usuario legítimo sigue funcionando.

- Redactar un breve informe del incidente (qué pasó, impacto, causa, corrección y recomendación preventiva), practicando la comunicación hacia perfiles no técnicos.

- 3. Qué debe contemplar o incluir el escenario simulado

- Una aplicación sencilla con un mecanismo de sesión basado en objetos serializados que viajan entre cliente y servidor, sin validación de integridad.

- Un servidor que deserializa antes de validar, con el flujo claramente visible en el código para que el estudiante pueda rastrearlo.

- Una dependencia desactualizada dentro del proyecto, cuyo estado sea evidente en el archivo de dependencias.

- Registros coherentes con peticiones anómalas, marcas de tiempo y efectos observables (reinicios, cambios de permisos, archivos alterados) para reconstruir la historia.

- Un entorno completamente aislado: todo ocurre dentro de la computadora simulada del entorno 3D, con datos ficticios, sin conexión a sistemas reales y sin que el estudiante deba construir cargas maliciosas reales; la comprobación del fallo se hace con herramientas o acciones guiadas por el propio entorno.

- Retroalimentación inmediata: al aplicar la corrección, el entorno confirma si el dato manipulado es rechazado y si la sesión legítima se conserva.

- Un cierre narrativo que muestre el resultado de haber corregido (o no) el problema, manteniendo el componente gamificado.
