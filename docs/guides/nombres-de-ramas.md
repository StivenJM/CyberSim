# Cómo nombrar ramas de trabajo

Esta guía define cómo nombrar ramas en CyberSim para que cualquier persona reconozca el tipo de cambio,
el área dueña y el resultado esperado sin inspeccionar su contenido.

## Formato

Usa siempre esta estructura:

```text
<tipo>/<alcance>/<resultado>
```

El resultado se escribe en inglés, en minúsculas y con palabras separadas por guiones:

```text
feat/exercises/implement-bibliotecaviva-verifier
fix/contract/reject-unknown-case-capability
refactor/back/split-progress-repository
```

## Tipos de cambio

| Tipo | Uso |
|---|---|
| `feat` | Incorpora una capacidad nueva y verificable. |
| `fix` | Corrige un comportamiento defectuoso. |
| `refactor` | Reorganiza una implementación sin cambiar su comportamiento. |
| `test` | Añade o corrige pruebas sin modificar el comportamiento productivo. |
| `docs` | Actualiza documentación de un componente o guía. |
| `build` | Modifica empaquetado, imágenes, Compose o despliegue. |
| `chore` | Mantenimiento sin alterar capacidades (dependencias, CI, scripts). |
| `experiment` | Prueba de concepto o comparación que todavía no es una capacidad integrada. |

`experiment` distingue el trabajo exploratorio del plan de investigación de una capacidad ya integrada.
Un prototipo no se presenta como `feat` hasta que tiene comportamiento verificable y pruebas.

## Alcances

| Alcance | Responsabilidad principal |
|---|---|
| `front` | `apps/frontend`: interfaz, oficina 3D, ECS, monitor, escritorio, vistas de escenarios y apartado de ejercicios. |
| `back` | `apps/backend`: API Express, casos de uso, controladores, repositorios e integraciones. |
| `db` | Esquema Prisma, migraciones, seeds y configuración específica de PostgreSQL. |
| `contract` | `packages/scenario-contract` y `packages/attempt-ledger`: manifiestos, registro cerrado de casos, contrato de intento y ciclo de evidencia. |
| `exercises` | `packages/exercises`: modelos de dominio y verificadores B/Q/C de los cinco casos investigados. |
| `infra` | Docker Compose, Dockerfiles, Caddy, staging, volúmenes y recursos operativos. |
| `platform` | Comportamiento que exige cambios coordinados e inseparables en varios componentes. |
| `docs` | Organización y mantenimiento transversal de la documentación. |
| `repo` | CI, tooling, scripts y configuración compartida por todo el repositorio. |

El alcance representa el **dueño del resultado**, no todas las carpetas modificadas. Una rama
`feat/exercises/implement-talentoandino-verifier` incluye sus pruebas y su documentación sin cambiar de
alcance.

Para documentación específica de un componente, conserva ese componente como alcance:

```text
docs/front/document-desktop-access
docs/contract/explain-attempt-envelope
```

Usa `chore/docs/...` solo cuando el cambio afecta la organización documental en sí (índices, navegación,
plantillas):

```text
chore/docs/fix-guide-navigation
```

### Relación con los commits

El alcance de la rama puede ser más fino que el de los commits. Los mensajes siguen la convención del
proyecto con alcances `front`, `back` y `db`; una rama `feat/exercises/...` puede producir commits
`feat(front): ...` y `feat: ...` cuando el cambio cruza áreas. No renombres la rama para que coincida con
cada commit: la rama nombra el resultado, los commits nombran cada unidad.

## Procedimiento

### 1. Define un único resultado

Describe qué debe quedar resuelto al integrar la rama. Si el nombre necesita enumerar resultados
independientes, divide el trabajo.

### 2. Selecciona el tipo

Elige el tipo por la intención principal. No uses `chore` como categoría genérica cuando `feat`, `fix`,
`test` o `experiment` expresan mejor el propósito.

### 3. Identifica el alcance dueño

Selecciona el componente responsable del comportamiento. Los cambios auxiliares en pruebas,
documentación o configuración no convierten la rama en transversal.

Usa `platform` solo cuando el resultado no pueda entregarse modificando un único componente. No combines
alcances en el nombre (`front-back-db`, `exercises-contract`).

### 4. Escribe un resultado breve

Usa una frase verbal concreta de dos a cinco palabras. Evita nombres que solo describan actividad o un
estado temporal.

| Evita | Prefiere |
|---|---|
| `arreglos` | `fix/back/reject-cross-actor-progress` |
| `pruebas` | `test/exercises/cover-size-limits` |
| `rama-nueva` | `refactor/contract/split-pass-through` |
| `wip-ejercicios` | `feat/exercises/add-andinapay-verifier` |

### 5. Crea la rama desde `develop`

`develop` es la rama de integración; `main` conserva versiones estables. Actualiza antes de comenzar:

```powershell
git switch develop
git pull --ff-only
git switch -c <tipo>/<alcance>/<resultado>
```

Los pull requests se abren contra `develop`. La CI (`.github/workflows/ci.yml`) valida pull requests
dirigidos a `develop` o `main`.

### 6. Verifica antes de publicar

Desde la raíz, ejecuta los checks que correspondan al alcance y deja constancia del resultado real:

```powershell
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

Las pruebas de integración (`pnpm run test:integration`) requieren el entorno descrito en
[tests de integración](tests-de-integracion.md); no las presentes como ejecutadas si no lo fueron.

## Cambios transversales

Un cambio que toca varias carpetas no es necesariamente transversal.

- Usa el alcance principal cuando los demás cambios solo habilitan o verifican su resultado.
- Usa `platform` cuando frontend, backend o base de datos deban cambiar juntos para entregar un único
  comportamiento.
- Crea ramas separadas cuando cada componente pueda revisarse, probarse e integrarse de forma
  independiente.

Ejemplos:

```text
feat/platform/persist-attempt-evidence
feat/exercises/implement-nubeandina-verifier
build/infra/isolate-staging-volumes
fix/db/gate-demo-seed
```

## Ramas existentes

Las ramas creadas antes de esta guía (`feat/extend-docker`, `feat/quality-improve`,
`feat/deploy-staging-production`, `refactor/structure` y `new-branch`, que contiene la implementación de
los ejercicios) no se renombran de forma retroactiva. La convención aplica a ramas nuevas y a las que se
reabran para un resultado distinto.

## Reglas obligatorias

- Mantén una sola finalidad revisable por rama.
- Usa únicamente minúsculas, caracteres ASCII y guiones.
- Conserva el formato `tipo/alcance/resultado` durante todo el proyecto.
- Incluye en la misma rama las pruebas y la documentación necesarias para verificar su resultado.
- Evita nombres personales, números de tarea temporales y estados como `wip`, `temp` o `final`.
- No mezcles alcances en el nombre; usa `platform` si de verdad no se pueden separar.
- Elimina la rama después de integrarla si ya no contiene trabajo activo.

## Lista de verificación

Antes de publicar una rama, confirma:

- [ ] El tipo explica la intención principal.
- [ ] El alcance identifica al dueño del cambio.
- [ ] El resultado permite anticipar qué quedará resuelto.
- [ ] La rama no mezcla resultados independientes.
- [ ] El nombre usa minúsculas y `kebab-case`.
- [ ] Las pruebas y la documentación relacionadas forman parte de la misma unidad de trabajo.
- [ ] Los checks ejecutados y sus resultados reales están registrados.
