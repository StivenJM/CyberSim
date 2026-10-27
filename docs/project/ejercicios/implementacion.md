# Implementación de los ejercicios

Estado técnico de los cinco casos del conjunto 2.0. Cada caso tiene modelo de dominio cerrado y
verificador propio en `packages/exercises`; el banco de pruebas ejecuta la batería real.

```powershell
pnpm --filter @cybersim/exercises test
pnpm --filter @cybersim/frontend exec vitest --run tests/exercisesSection.test.ts
```

## Apartado en la aplicación

`/ejercicios` muestra solo los cinco casos investigados. `/ejercicios/:caseId` permite ejecutar el
verificador sobre el estado inicial y sobre la solución de referencia, y publica la tabla de
comprobaciones con su evidencia. Las tarjetas y la tabla son navegables por teclado y no dependen del
color para indicar el resultado.

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
- **BibliotecaViva** ejecuta SQLite real (`node:sqlite`) sobre el esquema y las filas de la ficha,
  reconstruido por prueba. El verificador reejecuta la batería completa, incluida la carga de
  contraste, la identidad por sesión, el error público frente al inspector autorizado y la sonda de
  escritura denegada por una conexión de solo lectura.
- **TalentoAndino** clasifica el catálogo inerte T01–T13 y el inventario LG01–LG03, aplica límites
  exactos, asigna IDs internos sin usar el nombre original y conserva la relación del propietario.
  La cuarentena bloquea la entrega y el contraste intercala la admisión provisional P0.
- **AndeanLogix** despacha 144 peticiones (seis identidades × tres acciones × dos métodos × dos redes
  × dos modos de mantenimiento) contra un oráculo escrito desde la ficha, más seis encabezados
  falsificados, cuatro payloads inválidos y dos seguimientos anónimos.
- **NubeAndina** reproduce los bytes, SHA-256 y HMAC-SHA256 publicados de S01–S07, conserva S08 con el
  primer byte alterado y exige que la autoridad venga del servidor. La publicación atómica se prueba
  con una falla anunciada tras el primer campo.

## Límites declarados

- BibliotecaViva necesita el motor SQLite/WASM dentro de un Worker para la ejecución en navegador. El
  apartado lo dice explícitamente y no simula el banco; el verificador se ejecuta en las pruebas del
  paquete con SQLite real.
- Las vistas propias de cada caso (expediente, banco criptográfico, editor de parches) son I03. El
  apartado actual expone el modelo y el verificador, no un escritorio por caso.
- Persistencia del intento y endpoint HTTP siguen pendientes de migración autorizada.
- Informe, rúbrica y validación con personas corresponden a I10 e I12.
