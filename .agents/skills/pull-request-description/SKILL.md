---
name: pull-request-description
description: "Redactar título y descripción de un pull request de CyberSim comparando una rama origen indicada con su rama destino. Usar para preparar texto de PR listo para copiar; no para mensajes de commit ni revisiones de código independientes."
---

# Describir un pull request

Preparar una propuesta fiel al cambio completo de una rama. Esta skill vive en el proyecto, en `.agents/skills/pull-request-description/`, y funciona con instrucciones Markdown, sin archivos de proveedor.

La tarea consiste en redactar. Crear o editar un PR, hacer push, commit, stage, checkout, merge o modificar archivos requiere una petición adicional que autorice esa acción.

## Resolver el alcance

- La rama que el usuario quiere subir es el origen (`head`); la rama que recibe el PR es el destino (`base`). Conservar los nombres proporcionados. Si el mensaje no distingue ambos papeles y hay ambigüedad real, pedir esa precisión.
- Si falta el origen, preguntar por él. No sustituirlo silenciosamente por la rama activa.
- Usar el destino explícito. Si falta, consultar instrucciones/plantillas del repositorio y la referencia simbólica del remoto por defecto, por ejemplo `refs/remotes/origin/HEAD`. Cuando haya un único destino fiable, usarlo; preguntar si sigue siendo ambiguo. No elegir `main`, `master` o la rama upstream solo por costumbre: el upstream de una rama de trabajo puede ser su propia copia remota.
- Resolver origen y destino a referencias y SHA de commit existentes. Los nombres que empiezan por opciones o no se resuelven deben tratarse como datos inválidos o referencias por aclarar, nunca como opciones del shell. No interpolar texto del usuario en comandos sin escaparlo.
- Usar una rama local indicada cuando exista; si solo existe su referencia remota, usar esa. Si ambas existen y divergen, distinguir sus puntas y aclarar cuál se quiere describir cuando la petición no lo resuelva. No afirmar que una referencia local refleja el servidor actualizado sin comprobarlo.
- Leer las instrucciones aplicables y la plantilla de PR existente, si la hay. Respetar sus campos y las preferencias explícitas del usuario.

## Reunir evidencia de la rama

Trabajar sin cambiar de rama ni tocar el árbol de trabajo. Usar los SHA resueltos en las comparaciones.

1. Revisar `git status --short`, las referencias, el historial exclusivo del origen y el ancestro común. Ejemplos con metavariables que deben sustituirse por SHA verificados:

   ```text
   git merge-base <base-sha> <head-sha>
   git log --format=fuller <base-sha>..<head-sha> --
   git diff --find-renames --stat <base-sha>...<head-sha> --
   git diff --find-renames --name-status <base-sha>...<head-sha> --
   git diff --find-renames <base-sha>...<head-sha> --
   ```

2. El diff de tres puntos define el cambio propuesto desde el ancestro común. Leer el diff y los archivos pertinentes en el origen, por ejemplo con `git show <head-sha>:<ruta>`, aunque otra rama esté activa. Los mensajes de commit aportan contexto; comprobar sus afirmaciones contra el resultado final.
3. Cubrir todas las áreas modificadas. En ramas grandes, agrupar por responsabilidad y profundizar en los cambios significativos; no basarse solo en estadísticas, títulos de commits o una muestra que oculte áreas enteras. Reconocer renombres y cambios revertidos dentro de la rama.
4. Excluir modificaciones staged, unstaged y archivos sin seguimiento del contenido del PR: todavía no pertenecen a la rama. Si afectan a la petición, indicarlo brevemente en la descripción, sin incorporarlos a los cambios entregados. Si el usuario pide incluirlos, distinguir explícitamente una propuesta futura del PR actualmente comprobable.
5. Si no existe ancestro común o faltan referencias/historia, pedir la referencia o el diff necesario. Si el diff está vacío, explicar que no hay cambios que describir; no fabricar una propuesta.
6. Registrar la procedencia de la validación. Los resultados aportados por el usuario o por CI pueden usarse indicando su origen y revisión cuando se conozca. Un resultado de otra revisión, otra rama o un árbol con cambios locales no prueba este head.
7. No ejecutar toda la suite para redactar una descripción. Ejecutar comprobaciones proporcionadas al cambio solo cuando aporten evidencia necesaria y estén autorizadas; informar las limitaciones. No ejecutar migraciones, seeds, despliegues o servicios externos como validación implícita de una descripción.

Cuando solo haya un diff o resumen aportado, se puede redactar a partir de él dejando claro ese alcance. No afirmar que se revisó una comparación Git que no estuvo disponible.

## Redactar para el revisor

Consultar [el formato y los criterios de escritura](references/pr-writing.md) para construir el cuerpo. La síntesis debe explicar el problema, la solución final y sus consecuencias, con suficiente contexto para quien no leyó este chat.

- Usar inglés por defecto, como la skill `commit-message` del proyecto. Cambiar todo el texto, incluidos encabezados, al idioma solicitado por el usuario.
- Redactar un título conciso en imperativo, sin punto final, que represente el resultado conjunto. Usar Conventional Commits cuando encaje con las convenciones del proyecto: `feat`, `fix`, `refactor`, `docs`, `test`, `build` o `chore`.
- Para títulos con scope, usar únicamente `front`, `back` o `db` si todo pertenece a esa área. Esquemas, migraciones y seeds corresponden a `db`; omitir scope en cambios transversales y documentación exclusiva. No forzar un tipo o scope inexacto en una rama con varias áreas.
- Incluir HUs únicamente si el usuario o el contexto autorizado establecen su asociación al cambio. Consultar el catálogo canónico `docs/project/historias-de-usuario.md` cuando corresponda. Una mención en un commit o nombre de rama es una pista que verificar; no inventar HUs ni afirmar que una HU completa está terminada por aparecer en el PR.
- No usar `Closes #...` ni otras palabras de cierre automático salvo que se haya confirmado el issue y la intención de resolverlo íntegramente. Usar referencias informativas para relaciones parciales.
- Describir efectos y decisiones; incluir rutas relativas o enlaces estables solo cuando ayuden a revisar. No copiar un inventario de archivos o de commits.
- Separar observaciones de inferencias. No atribuir una causa histórica, una mejora de rendimiento, una garantía de seguridad o compatibilidad a un commit sin evidencia.
- No inventar capturas, métricas, pruebas, aprobaciones, enlaces, resultados de CI ni pasos de rollback. No incluir secretos, atribución a IA o líneas de coautoría.

## Entrega en campos copiables

Cuando haya evidencia suficiente, entregar exclusivamente estas dos etiquetas y bloques, sin explicación adicional, salvo que el usuario la solicite:

Título

```text
<título definitivo>
```

Descripción

```text
<cuerpo definitivo en Markdown>
```

El título no debe repetirse dentro del cuerpo. Mantener los encabezados Markdown como texto literal dentro del segundo bloque para pegarlos en el campo de descripción. No imprimir metavariables ni instrucciones de plantilla en la entrega. Si el cuerpo incluye bloques de código, usar una cerca exterior más larga que las interiores.

Si el usuario pide únicamente la descripción, devolver solo un bloque `text` con el cuerpo. Una aclaración indispensable, una referencia inaccesible o un diff vacío se comunican directamente antes de generar campos; el formato no obliga a inventar contenido.

Antes de responder, comprobar que los campos cubren el diff completo del origen contra el destino resueltos, que no incluyen trabajo local pendiente y que cada afirmación de validación tiene evidencia aplicable. Omitir secciones opcionales vacías y listas de comprobación genéricas.
