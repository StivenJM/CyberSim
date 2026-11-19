# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Estudiantes de la EPN en laboratorio.** Universitarios que practican ciberseguridad en equipos de laboratorio, en sesiones supervisadas o dentro de una clase. Su trabajo es entender el objetivo de un escenario, decidir qué configuración, dispositivo o red intervenir y comprobar el resultado antes de que se cumpla la comprobación temporal. La sesión es acotada y una recarga pierde el estado de la partida, así que necesitan orientarse rápido en el mapa de niveles y reconocer qué ya completaron.

**Docentes.** Organizan grupos con código de invitación, revisan historiales individuales y análisis de curso. No operan la ruta de aprendizaje, pero son la razón de que esa pantalla muestre ranking y pertenencia a grupo.

**Investigador responsable del estudio.** No es un rol de interfaz. Es quien usa la plataforma como recurso instrumental para responder cuánto saben los estudiantes de ciberseguridad y cómo evaluarlos; las decisiones de ejercicios, entornos y seguimiento se justifican por la evidencia que permiten obtener.

## Product Purpose

CyberSim permite aprender ciberseguridad actuando sobre oficinas, dispositivos y redes simulados en 3D: se elige un escenario, se intervienen configuraciones y se cumplen objetivos por fases. El producto existe para que estudiantes y docentes puedan **observar el aprendizaje**: práctica guiada más registro de intentos, historial, ranking de grupo y apoyo conversacional con IA.

El éxito no es "terminar un nivel". Es que el estudiante comprenda qué decisión tomó y por qué, y que quede un intento legible que el docente y el investigador puedan interpretar después.

## Positioning

La práctica completa ocurre en el navegador: una oficina y una topología de red simuladas que el estudiante manipula, con un motor ECS propio que procesa acciones, eventos, objetivos y fases. Lo que un producto vecino no podría copiar honestamente es la combinación de:

- escenarios versionados como manifiestos publicados y validados, con objetivos verificables por fase;
- un intento persistido con revisión y SHA-256 que alimenta historial, ranking, retroalimentación y análisis de curso;
- contenido construido para un instrumento de investigación educativa, no para un curso de catálogo genérico.

La simulación modela situaciones educativas; no opera infraestructura de red real.

## Operating Context

- Una cuenta confirmada de estudiante entra a `/seleccion-niveles`; ahí conviven el mapa de niveles, el ranking del grupo y el asistente. Es el punto de partida de toda práctica.
- El escenario elegido vive en memoria del cliente; la sesión se conserva en `localStorage` y el JWT dura una hora.
- Cinco escenarios activos: introducción/tutorial, amenazas, criptografía, control de acceso y hacking ético. Otros archivos existen en el repositorio pero están deshabilitados en el catálogo.
- Al fallar una fase o completar el escenario se envía un intento al servidor. Historial y ranking conservan intentos enviados, no la escena.
- El ranking suma puntos por escenario completado (1000 sin fallos previos, 700 con uno, 490 con dos); el tiempo no puntúa y los empates comparten posición.
- El tutor, la retroalimentación, el análisis de curso y los desafíos generados dependen de servicios externos que pueden no estar disponibles.
- La interfaz y la documentación están en español. Los nombres de apps y configuraciones dentro de un escenario son parte del reto y no se traducen ni "mejoran".

## Capabilities and Constraints

Confirmado y en uso:

- Registro de estudiantes, confirmación de correo, sesión y recuperación de contraseña.
- Cursos con código de invitación de siete días y una sola pertenencia de grupo a la vez.
- Oficina 3D, vista de dispositivos, vista de redes con firewall y VPN, consola sobre el modelo simulado.
- Tutor conversacional con contexto seleccionable y audio cuando la integración responde.
- Retroalimentación individual, análisis de curso y generación de desafíos por workflows externos.

Límites que condicionan cualquier rediseño:

- Recargar no restaura la partida; guardar significa conservar un intento, no la escena.
- El servidor recibe resultados calculados en el cliente: no reproduce ni certifica las acciones simuladas. Nada en la interfaz debe presentar un resultado como evaluación formal inviolable.
- Los textos de IA pueden contener errores y requieren revisión pedagógica antes de usarse en decisiones sobre estudiantes.
- No hay integración con LMS, calificaciones oficiales, pagos ni certificaciones.
- La pantalla de alta registra estudiantes; el alta docente completa no existe en la interfaz.
- Guardado e idempotencia no ofrecen garantías plenas ante todos los errores HTTP.

Decisiones aún abiertas (no inventar):

- Dispositivos y navegadores objetivo de la audiencia (RNF005 no fija cifras ni equipos).
- Política de privacidad, retención de datos y responsables.
- Procedimiento real de incorporación docente para una instancia en producción.

## Brand Commitments

- El nombre es **CyberSim** y no se sustituye ni se acompaña con otra marca.
- La identidad visual es fija: logo en `public/logo.svg`, pictograma en `public/assets/pictures/computer_logo.webp`, imágenes de introducción y login, y la oficina 3D como superficie reconocible del producto. El trabajo futuro la preserva en lugar de reemplazarla.
- El español es obligatorio en toda la interfaz, incluidos estados, errores y mensajes vacíos. No hay versión en inglés ni mezcla de idiomas.
- Tono registrado en la documentación: instructivo, directo y en español neutro profesional. No existe una guía de voz formal; las pantallas deben sonar como la documentación del proyecto.
- La orientación investigativa es parte de la identidad: el producto se presenta como plataforma educativa, nunca como herramienta ofensiva o de operación de redes reales.

## Evidence on Hand

- Documentación de producto y arquitectura: `docs/project/vision-y-alcance.md`, `docs/project/requisitos.md` (HU001–HU025, RNF001–RNF007), `docs/project/historias-de-usuario.md`, `docs/project/reglas-funcionales.md`, `docs/architecture/resumen.md`.
- Marco de evaluación y límites metodológicos: `docs/project/marco-evaluacion-ciberseguridad.md`, `docs/project/evidencia-marco-evaluacion.md`.
- Decisiones de accesibilidad con fuentes y alternativas descartadas: `docs/project/ejercicios/accesibilidad.md`.
- Catálogo activo y manifiestos: `apps/frontend/src/scenarios/catalog.ts`, `apps/frontend/src/data/escenarios`.
- Guion de uso verificable: `docs/guides/uso-del-sistema.md`.

Ausencias que el trabajo futuro no debe rellenar con ficción: no hay testimonios, casos de éxito, clientes, benchmarks, métricas de eficacia pedagógica medidas, aprobación institucional de los instrumentos de evaluación, validación con estudiantes reales (I12 pendiente) ni política de privacidad aprobada.

## Product Principles

1. **La evidencia manda sobre la impresión.** Cada pantalla debe acercar al estudiante a entender su decisión y dejar un rastro interpretable, no solo a sentirse bien.
2. **Lo simulado se declara simulado.** Nunca insinuar que se opera infraestructura real, que un resultado está certificado o que un puntaje equivale a conocimiento demostrado.
3. **La sesión de laboratorio es corta.** Orientar y decidir rápido: reconocer dónde estoy, qué completé y qué sigue, sin depender de memoria entre recargas.
4. **El estado del sistema se muestra.** Fallos de guardado, servicios externos caídos o contexto perdido se anuncian de forma accionable; el silencio que parece éxito es el peor resultado.
5. **El español es la voz del producto**, también en lo que normalmente queda sin diseñar: errores, vacíos, confirmaciones y estados de carga.

## Accessibility & Inclusion

- Referencia declarada: **WCAG 2.2** para el apartado de ejercicios, con decisiones ya tomadas y documentadas: patrones APG para pestañas, foco visible con `:focus-visible`, elementos nativos antes que `div` con rol, regiones `aria-live` para resultados, sin atajos de teclado propios, y analizadores automáticos tratados como suelo y no como prueba.
- Riesgo identificado: un banco de evaluación operable solo con puntero excluye a estudiantes con discapacidad visual o motora, y un verde de analizador produce falsa sensación de conformidad.
- Las pantallas de práctica no deben asumir que la escena 3D es el único canal: el objetivo de la fase debe ser legible y verificable fuera de la vista tridimensional.
- Pendiente y no sustituible: prueba con lector de pantalla real, teclado físico y estudiantes (I12).
