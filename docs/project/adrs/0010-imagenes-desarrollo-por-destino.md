# ADR 0010: Imágenes de desarrollo separadas mediante destinos de construcción

- Estado: aceptada por selección explícita del usuario e incorporada al repositorio.
- Fecha: 18 de octubre de 2026.
- Alcance: construcción y ejecución de desarrollo; sin destinos de producción.

## Contexto

La primera imagen Node instalaba ambos workspaces, copiaba ambas apps y ejecutaba generación Prisma y exportación RAG en la misma etapa. Frontend, backend, migración y preparación compartían ese resultado. Así construir una app exigía tareas de la otra.

El usuario seleccionó la recomendación de conservar un Dockerfile común con etapas e imágenes específicas. La ubicación del Dockerfile no determina por sí sola el aislamiento: lo determina su grafo de construcción y los archivos de cada resultado.

## Decisión

Conservar [infra/node.Dockerfile](../../../infra/node.Dockerfile) y seleccionar destinos explícitos desde [compose.yaml](../../../compose.yaml):

- `backend-dev`: instalación filtrada al backend, fuentes propias y Prisma generado.
- `frontend-dev`: instalación filtrada al frontend y Vite, sin generación Prisma ni exportación RAG.
- `tools-dev`: herramientas de ambos workspaces para mantenimiento/pruebas y Prisma generado; no ejecuta exportación RAG.
- `preparation-dev`: scripts que usan bibliotecas estándar de Node, corpus y workflows; recibe únicamente los JSON producidos por `knowledge-build`.

Las etapas comparten base y manifiestos. Las imágenes llevan etiquetas distintas por destino. La exportación del catálogo depende de fuentes frontend mediante una etapa propia, sin hacer depender de ella los destinos de las apps o las herramientas.

## Consecuencias y límites

Construir frontend no genera Prisma; construir backend no exporta el catálogo ni copia fuentes frontend. La instalación completa queda en las herramientas explícitas, y preparación no necesita `node_modules`.

Se mantiene contexto raíz y lockfile único: un cambio de dependencias puede invalidar instalaciones de varios destinos. Dependencias transitivas del backend pueden contener React por Prisma Studio o Vite por Vitest; su presencia no implica haber instalado el workspace frontend. No eliminar esas dependencias a mano para aparentar aislamiento.

Watch reconstruye preparación cuando cambia el catálogo/exportador/corpus/workflows. La actualización de imágenes no reemplaza la política D06: aplicar cambios a workflows ya instalados sigue siendo una operación explícita.

## Alternativas

Dockerfiles por aplicación son válidos, pero la selección actual conserva la base y herramientas comunes sin crear dependencias entre imágenes etiquetadas manualmente. Una única imagen con todo reduce destinos a mantener, pero conserva el acoplamiento detectado. Añadir Turborepo o un generador de lockfiles parciales no es necesario para dos workspaces.

## Fundamento y evidencia

La decisión usa [etapas independientes de BuildKit](https://docs.docker.com/build/building/multi-stage/), [reutilización de etapas Docker](https://docs.docker.com/build/building/best-practices/), [imágenes relacionadas en Compose](https://docs.docker.com/compose/how-tos/dependent-images/) y [npm ci por workspace](https://docs.npmjs.com/cli/v11/commands/npm-ci/). [Turborepo](https://turborepo.dev/docs/guides/tools/docker) documenta el efecto de lockfiles compartidos y ofrece una alternativa de aislamiento adicional para monorepos; no se incorpora esa herramienta aquí.

Se construyeron los cuatro destinos. Comprobaciones sin red verificaron fuentes propias, ausencia de Prisma en frontend, ausencia de fuentes frontend en backend y preparador sin fuentes de apps ni dependencias npm, con cinco topologías y cinco desafíos exportados. Pasaron typecheck backend, build frontend y 137 pruebas en total; backend usó una base temporal aislada. El conjunto local se recreó conservando volúmenes. Esto no acredita proveedores externos, el objetivo de memoria ni todos los casos de Watch.
