# Implementación de los ejercicios

Estado técnico de los cinco casos del conjunto 2.0. Cada caso tiene modelo de dominio cerrado y
verificador propio en `packages/exercises`; el banco de pruebas ejecuta la batería real.

## Integración con los escenarios

Los cinco escenarios siguen en el selector. AndinaPay incorpora sus ventanas y su flujo de trabajo
en la oficina 3D. La integración de las interacciones y del registro de evidencias en los demás
escenarios queda pendiente.

## Casos

| Caso | Módulo | Estado inicial | Ruta de referencia | Comprobaciones |
|---|---|---|---|---|
| AndinaPay (CWE-321) | `src/andinapay` | K1 activa, índice R01/R02 con K1 | stage K2 → fuente restringida → recifrar R01/R02 → publicar → prevención | B1, B2, Q1–Q3, C1–C5 |
| BibliotecaViva (CWE-89) | `src/bibliotecaviva` | concat + sesión + solo cliente + raw + read_write | named/positional, sesión, validación tipada, error público, solo lectura | B89, Q89, C89 |
| TalentoAndino (CWE-434) | `src/talentoandino` | V0/L0/N0/S0/D0/P0 | V2/L1/N1 + S1 o S2 + D1 + P1, cuarentena y migración | TA-B1, TA-B2, TA-Q1–Q6, TA-C1 |
| AndeanLogix (CWE-306) | `src/andeanlogix` | ui_only, bypass activo, ingreso público | server_roles, sin bypass, ops_only | B306, Q306, C306 |
| NubeAndina (CWE-502) | `src/nubeandina` | N0, commit eager | N6 (o N3/N4) + staged | NA-B1, NA-B2, NA-Q1–Q6, NA-C1 |

## Qué demuestra cada verificador

- **AndinaPay** descifra los siete envelopes AES-256-GCM publicados con WebCrypto y exige
  `ciphertext || tag`; una clave, tag o AAD incorrectos devuelven `AUTHENTICATION_FAILED` sin texto
  parcial. La recuperación completa exige recifrado con plaintext conservado y lectura posterior.
- **BibliotecaViva** ejecuta SQLite real con `node:sqlite` en las pruebas del paquete. El verificador
  comprueba la carga de contraste, la identidad por sesión, el manejo de errores y la restricción de
  escritura. Aún no hay un banco SQL integrado en el escenario 3D.
- **TalentoAndino** clasifica el catálogo inerte T01–T13 y el inventario LG01–LG03, aplica límites
  exactos, asigna IDs internos sin usar el nombre original y conserva la relación del propietario.
  La cuarentena bloquea la entrega y el contraste intercala la admisión provisional P0.
- **AndeanLogix** despacha 144 peticiones (seis identidades × tres acciones × dos métodos × dos redes
  × dos modos de mantenimiento) contra un oráculo escrito desde la ficha, más seis encabezados
  falsificados, cuatro payloads inválidos y dos seguimientos anónimos.
- **NubeAndina** reproduce los bytes, SHA-256 y HMAC-SHA256 publicados de S01–S07, conserva S08 con el
  primer byte alterado y exige que la autoridad venga del servidor. La publicación atómica se prueba
  con una falla anunciada tras el primer campo.

## Fronteras comprobadas

- BibliotecaViva rechaza antes de la base cualquier filtro que no sea texto, claves de entrada
  desconocidas y páginas fuera de 1–4, con independencia de la política de validación. La política
  `raw` de errores falla Q aunque los valores estén enlazados.
- TalentoAndino exige S1 o S2: un directorio público S0 falla Q6 incluso si la entrega pasa por el
  handler, porque el origen directo sigue expuesto.
- AndeanLogix devuelve `not_supported` para una operación fuera del catálogo y bloquea una red
  desconocida antes del handler.
- NubeAndina rechaza campos adicionales en el documento y exige vigencia en formato ISO antes de
  publicar.

## Pruebas

```powershell
pnpm --filter @cybersim/exercises test
pnpm --filter @cybersim/attempt-ledger test
pnpm --filter @cybersim/frontend exec vitest --run tests/exerciseReference.test.ts tests/exerciseCatalog.test.ts
pnpm test:integration:core tests/integration/intentos.spec.ts
```

- `@cybersim/exercises`: 84 pruebas del dominio y de los verificadores B/Q/C.
- `@cybersim/attempt-ledger`: 30 del ciclo de intento y del informe.
- `exerciseReference.test.ts` y `exerciseCatalog.test.ts`: modelos de referencia y publicación de los escenarios.
- `tests/integration/intentos.spec.ts`: persistencia y propiedad de los intentos mediante la API.

La suite de integración requiere Docker Desktop y aplica `migrate reset` antes de cada recorrido; no usa
proveedores externos con `--core`. La suite E2E con mocks se mantiene separada.

## Límites declarados

- El registro de evidencias dentro de los escenarios 3D se definirá por separado.
- Persistencia: adaptador Prisma y `/attempts` implementados; falta aplicar la migración y ejecutar la
  batería docente en el servidor.
- Informe, rúbrica y validación con personas corresponden a I10 e I12.
