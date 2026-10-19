# ADR 0012: Biome para lint y formato

- Estado: Incorporada por solicitud del usuario.
- Fecha: 2026-10-19.
- Alcance: frontend, backend, scripts, tests, CSS, JSON, Docker y CI.
- Relación: complementa ADR 0011 y sustituye ESLint como comprobador de lint vigente.

## Contexto

El usuario pidió sustituir ESLint por Biome, comprobar lint y formato y adaptar las configuraciones frontend/backend del proyecto Cuero. CyberSim utiliza un monorepo pnpm, un motor ECS mutable, React Three Fiber y herramientas ejecutadas en contenedores Linux. La configuración anterior no comprobaba formato y excluía los tests del lint.

## Decisión

Fijar Biome 2.5.15 como dependencia de desarrollo de la raíz y de ambas apps. Retirar las configuraciones y dependencias de ESLint. Usar una [configuración raíz](../../../biome.json) y configuraciones heredadas por [frontend](../../../apps/frontend/biome.json) y [backend](../../../apps/backend/biome.json).

Se adaptan de Cuero las tabulaciones, comillas simples, punto y coma cuando es necesario y organización de imports. La versión actual de Biome expresa las reglas recomendadas con `preset: recommended`. Se incluyen fuentes, tests, scripts, CSS y JSON mantenidos; se excluyen dependencias, builds y artefactos generados. Git conserva LF para evitar diferencias de formato entre Windows y Linux.

`lint` ejecuta `biome check` sin escribir y falla ante advertencias. `lint:fix` aplica correcciones seguras; `format` escribe formato y `format:check` lo verifica. CI utiliza la comprobación combinada. Las imágenes copian la configuración raíz y `.gitignore`, y Watch reconstruye cuando cambian las configuraciones Biome.

## Adaptaciones al proyecto

Se mantiene `useButtonType` desactivado como en el frontend de Cuero. Los efectos React conservan la política anterior de no inferir dependencias automáticamente: agregar dependencias a efectos vinculados al ECS mutable puede reejecutar acciones. Las aserciones no nulas existentes siguen permitidas en frontend y en las rutas backend protegidas por middleware; TypeScript continúa comprobando los tipos.

CSS conserva la cascada y los `!important` existentes: no se fuerza una reorganización por especificidad ni su retirada. Se corrigen declaraciones duplicadas y sintaxis inválida conservando las declaraciones que efectivamente prevalecían. Los mocks de tests admiten `any`; los límites de datos externos y constructores heterogéneos del ECS usan excepciones locales explicadas.

Las reglas DOM tienen excepciones limitadas para objetos WebGL y controles compuestos existentes. El foco automático se conserva en la consola y formularios que ya lo utilizaban. Las claves posicionales se conservan con supresiones locales en geometría fija, esqueletos, texto segmentado, logs sin estado y perfiles identificados por posición. Donde existen claves de datos apropiadas, se utilizan. Estas excepciones no equivalen a una auditoría completa de accesibilidad.

## Consecuencias

La adopción formatea gran parte del código mantenido y organiza imports. Corrige además tipados implícitos, comparaciones y callbacks señalados por Biome; los controles seleccionables incorporan activación por teclado, los iconos decorativos se identifican y las etiquetas VPN se asocian con sus controles. La función de consulta de redes usada entre servicios queda pública en TypeScript, preservando su comportamiento existente. El cliente Prisma conserva su exportación y su caché global.

La huella de evidencia depende del contenido del código y cambia al reformatearlo; no se alteran ni se aprueban automáticamente datos, revisiones o workflows instalados. El contenido JSON de workflows, calibración e imágenes conserva sus valores.

## Alternativas y validación

Mantener ESLint junto a Biome duplicaría herramientas y no corresponde al reemplazo solicitado. Desactivar el linter completo o aplicar cambios de comportamiento automáticos para silenciar todas las reglas no se adopta; se documentan excepciones concretas y se comprueban formato, lint, tipos, tests y build.

Comandos y resultados de la implementación en [pruebas y calidad](../../guides/pruebas-y-calidad.md). Referencias oficiales: [configuración en monorepos](https://biomejs.dev/configuration/big-projects/) y [supresiones](https://biomejs.dev/analyzer/suppressions/).
