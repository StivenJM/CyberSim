# ADR 0020: Datos de demostración condicionados por entorno

- Estado: aceptada por criterio técnico delegado; implementación pendiente.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; decisión incluida en el plan aprobado (Fase 1).
- Alcance: inicialización de la base de datos en desarrollo, staging y producción.
- Relación: complementa el [ADR 0017](0017-aislamiento-de-entornos.md).

## Contexto

El servicio `migrate` ejecuta `migrate:deploy`, `db:seed` y `db:sync-scenarios` en **cada arranque** ([db-init.mjs](../../../infra/db-init.mjs)). El seed crea cuentas conocidas (`profesor@test.com`, `estudiante1@test.com`, `estudiante2@test.com`) con la contraseña `password123`, un curso `CYBER2024` y matrículas ([seed.ts](../../../apps/backend/prisma/seed.ts)).

En producción eso recrearía credenciales públicas en cada despliegue. No es un riesgo teórico: el seed no distingue entorno.

## Decisión

1. Introducir `SEED_DEMO_DATA` en `infra/db-init.mjs`; el seed solo se ejecuta con el valor explícito `true`.
2. Desarrollo y staging lo activan en su archivo de entorno; **producción no lo define o lo define en `false`**.
3. El job de despliegue de producción no ejecuta seed bajo ninguna ruta alternativa.
4. `db:sync-scenarios` se mantiene en todos los entornos: publica el catálogo real y no crea identidades.
5. Las pruebas de integración que hoy dependen del seed lo activan explícitamente ([run.mjs](../../../infra/integration/run.mjs)).

## Consecuencias

- Producción nace sin cuentas conocidas; el alta de usuarios sigue el flujo normal.
- Staging conserva datos reproducibles para pruebas.
- Un operador que olvide la variable en staging obtendrá una base sin demo; el error es visible y no compromete seguridad.
- La documentación de arranque debe indicar el valor por entorno.

## Alternativas

- **Eliminar el seed:** rompe el desarrollo y el arnés de integración, que dependen de cuentas y curso.
- **Imagen separada solo para seed:** añade una pieza y no cambia el riesgo de ejecutarla por error.
- **Seed con contraseña aleatoria:** sigue creando cuentas no solicitadas y obliga a consultar el valor; peor operación sin mejorar el riesgo.

## Evidencia y validación

- Ejecución actual: [db-init.mjs](../../../infra/db-init.mjs).
- Contenido del seed: [seed.ts](../../../apps/backend/prisma/seed.ts).
- Dependencia del arnés: [run.mjs](../../../infra/integration/run.mjs).
- Criterio de seguridad: [OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/), requisitos de credenciales por defecto y cuentas integradas.

Implementación: `infra/seed-policy.mjs` decide la secuencia (`migrate:deploy`, seed opcional, `db:sync-scenarios`); `infra/db-init.mjs` la ejecuta; el servicio `migrate` de Compose fija `SEED_DEMO_DATA=true` solo en desarrollo. Pruebas: `node --test infra/seed-policy.test.mjs`, cuatro casos, incluidos `undefined`, `false` y valores distintos de `true`.

Criterio para considerarla implementada: en un entorno sin `SEED_DEMO_DATA=true`, la base no contiene las cuentas demo; en staging sí; las pruebas de integración siguen pasando con la variable explícita.
