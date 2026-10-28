# Runtime SQL en el navegador: decisión y fuentes

Riesgo evaluado: ejecutar un motor SQL dentro del cliente introduce superficie de cadena de suministro,
consumo de CPU y memoria, y una posible vía de ejecución si el binario o la política de seguridad se
configuran mal. A la vez, sin motor real el caso BibliotecaViva no se puede verificar en el apartado y
quedaría como una simulación.

## Decisión

- **Motor:** `sql.js` **1.13.0**, versión exacta (sin rango) y con la integridad del lockfile de pnpm.
  Licencia MIT; SQLite compilado con Emscripten.
- **Aislamiento:** un **módulo Worker** dedicado. La base vive en memoria, se crea desde el esquema de la
  ficha y se destruye al terminar la comprobación. Sin OPFS, sin red, sin sistema de archivos del host y sin
  `eval`.
- **Presupuesto:** 4 s en el hilo principal. Al agotarse, el Worker **se termina**, el resultado se descarta
  y se registra una incidencia técnica; nunca se presenta como ataque bloqueado ni como desconocimiento.
- **Integración:** el adaptador recibe el verificador SQL por inyección. Las pruebas usan el mismo motor
  (`sql.js`) sin navegador; el Worker solo transporta la configuración y el informe.
- **Alternativa descartada:** `@sqlite.org/sqlite-wasm` (oficial) queda como reemplazo si `sql.js` bloquea
  una actualización de SQLite, porque su empaquetado para Vite es más costoso y aquí no se necesita OPFS ni
  persistencia.
- **CSP:** si el despliegue añade una política estricta, debe permitir `worker-src 'self'` y
  `script-src 'wasm-unsafe-eval'`; `'unsafe-eval'` no es necesario y no se añade.

## Método

Búsqueda en varios motores y lectura de documentación primaria (SQLite, sql.js, WebAssembly, MDN, OWASP) y
de análisis de cadena de suministro. Se consultaron 50 fuentes; las marcadas **leída** se abrieron completas.
No es una revisión sistemática ni sustituye una auditoría del binario.

## Fuentes consultadas

**Documentación primaria y estándares**

1. **SQLite — WebAssembly/JavaScript docs** (**leída**). https://sqlite.org/wasm
2. **sqlite/sqlite-wasm** (**leída**). https://github.com/sqlite/sqlite-wasm
3. SQLite WASM — About. https://sqlite.org/wasm/doc/trunk/about.md
4. SQLite WASM — Worker1 y Promiser. https://sqlite.org/wasm/doc/92e1d3dab4/api-worker1.md
5. wa-sqlite (VFS en JavaScript). https://github.com/rhashimoto/wa-sqlite
6. **sql.js — documentación** (**leída**). https://sql.js.org/
7. sql-js/sql.js. https://github.com/sql-js/sql.js
8. sql.js — SQL.js vs SQLite nativo en Node. https://github.com/sql-js/sql.js/issues/350
9. **WebAssembly — Security** (**leída**). https://webassembly.org/docs/security/
10. MDN — `WebAssembly.instantiateStreaming`. https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiateStreaming_static
11. MDN — CSP `script-src` y `wasm-unsafe-eval`. https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src
12. WebAssembly CSP — propuesta. https://github.com/WebAssembly/content-security-policy/blob/main/proposals/CSP.md
13. WebAssembly CSP — discusión sobre `unsafe-eval`. https://github.com/WebAssembly/content-security-policy/issues/7
14. Chromium — soporte de `wasm-unsafe-eval`. https://issues.chromium.org/issues/41450810
15. MDN — Web Workers. https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
16. MDN — `Worker`. https://developer.mozilla.org/en-US/docs/Web/API/Worker
17. WHATWG HTML — Workers. https://html.spec.whatwg.org/multipage/workers.html
18. W3C — Content Security Policy Level 3. https://www.w3.org/TR/CSP3/
19. MDN — Subresource Integrity. https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
20. OWASP — Content Security Policy Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
21. OWASP — Third Party JavaScript Management. https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html
22. OWASP — Software Component Verification Standard. https://owasp.org/www-project-software-component-verification-standard/
23. SLSA — Supply-chain Levels for Software Artifacts. https://slsa.dev/

**Cadena de suministro y ejecución WASM**

24. Microsoft — Compromiso AsyncAPI en npm. https://www.microsoft.com/en-us/security/blog/2026/07/15/unpacking-asyncapi-npm-supply-chain-compromise-import-time-payload-delivery/
25. Microsoft — ChainDrop, gusano en npm. https://www.microsoft.com/en-us/security/blog/2026/08/04/chaindrop-supply-chain-compromise-anatomy-self-propagating-worm/
26. GitHub — Interrupción de ataques en npm y Actions. https://github.blog/security/supply-chain-security/disrupting-supply-chain-attacks-on-npm-and-github-actions/
27. Datadog Security Labs — Lecciones de compromisos npm. https://securitylabs.datadoghq.com/articles/learnings-from-recent-npm-compromises/
28. ArmorCode — Ataque npm de septiembre de 2025. https://www.armorcode.com/blog/inside-the-september-2025-npm-supply-chain-attack
29. Mend — Paquetes npm comprometidos. https://www.mend.io/blog/npm-supply-chain-attack-packages-compromised-by-self-spreading-malware/
30. HackerNoon — Toma de control de 1 500 paquetes npm. https://hackernoon.com/bloom-security-found-a-supply-chain-vulnerability-exposing-1500-npm-packages-to-malicious-takeover
31. OpenCVE — Vulnerabilidades de Node.js. https://app.opencve.io/cve/?vendor=nodejs
32. BeeWeb — Endurecimiento de WASM frente a cadena de suministro. https://beeweb.dev/blog/post.php?slug=webassembly-security-hardening-defending-your-wasm-stack-against-supply-chain-threats
33. Safeguard.sh — Riesgos de cadena de suministro en WASM. https://safeguard.sh/resources/blog/wasm-webassembly-security-considerations
34. Systems Hardening — Seguridad de registros de módulos WASM. https://www.systemshardening.com/articles/wasm/wasm-module-registry-security/
35. Systems Hardening — Cadena de suministro de componentes WASM. https://www.systemshardening.com/articles/wasm/wasm-component-supply-chain/
36. CyberAttack.ai — Sandboxing, syscalls y cadena de suministro. https://cyberattack.ai/blog/webassembly-security-browser-sandboxing-wasi-syscalls-supply-chain-risks
37. Pilecode — Guía de seguridad WASM. https://www.pilecode.com/en/blog/webassembly-security-guide-smbs
38. Systemshardening — WASM en navegador: CSP y aislamiento. https://www.systemshardening.com/articles/wasm/wasm-browser-security/
39. WebAssembly-wasm — Implicaciones de seguridad en aplicaciones empresariales. https://www.webassembly-wasm.com/webassembly-core-concepts-browser-runtime/browser-sandbox-security-boundaries/security-implications-of-wasm-in-enterprise-apps/
40. WebAssembly-wasm — Escribir una CSP para WASM. https://www.webassembly-wasm.com/webassembly-core-concepts-browser-runtime/browser-sandbox-security-boundaries/writing-a-content-security-policy-for-wasm/

**SQLite en el navegador: práctica**

41. WebAssembly-wasm — SQLite en el navegador con Wasm. https://www.webassembly-wasm.com/production-wasm-workloads-and-deployment/databases-and-persistent-storage/running-sqlite-in-the-browser-with-wasm/
42. recca0120 — sql.js en el navegador. https://recca0120.github.io/en/2026/03/04/sql-js-browser-sqlite/
43. recca0120 — Comparativa sql.js, IndexedDB y localStorage. https://recca0120.github.io/en/2026/03/06/browser-storage-comparison/
44. DraganSr — SQLite en el navegador con WASM. https://blog.dragansr.com/2026/08/sqlite-db-in-web-browser-with-wasm.html
45. dev.to — Guía práctica de sql.js y WASM. https://dev.to/deeshansharma/running-sqlite-in-the-browser-with-sqljs-and-wasm-a-practical-guide-with-google-drive-sync-edh
46. SQLite Forum — SQLite en WebAssembly. https://www.sqliteforum.com/p/sqlite-in-webassembly-running-databases
47. DeepWiki — Workers de sqlite-wasm. https://deepwiki.com/sqlite/sqlite-wasm/3.3-web-workers
48. DeepWiki — Web y WebAssembly en sqlite-sync. https://deepwiki.com/sqliteai/sqlite-sync/8.4-web-and-webassembly
49. Sachin Sharma — SQLite WASM y OPFS en 2026. https://sachinsharma.dev/blogs/opfs-sqlite-browser-storage-2026
50. Sachin Sharma — WASM + OPFS a velocidad nativa. https://sachinsharma.dev/blogs/sqlite-wasm-opfs-native-speed-browser-storage-2026

## Evidencia local

- `apps/frontend/tests/sqljsPort.test.ts` ejecuta la batería completa de BibliotecaViva sobre `sql.js` en
  Node: estado inicial con Q falso, ruta de referencia con B, Q y C verdaderos, y bases separadas por prueba.
- `pnpm --filter @cybersim/frontend run build` emite el Worker (65.67 kB) y el binario
  `sql-wasm.wasm` (659.81 kB); el paquete queda versionado de forma exacta.
- Advertencias de Vite sobre `fs`, `path` y `crypto` en `sql-wasm.js`: son ramas de Node externalizadas; el
  Worker del navegador carga el `.wasm` por URL y no usa esas ramas.

## Riesgos residuales y disparadores de revisión

- Un CSP estricto sin `wasm-unsafe-eval` bloqueará el motor: revisar la cabecera antes de desplegar.
- `sql.js` no es el proyecto oficial de SQLite: si deja de recibir actualizaciones o aparece un CVE sin
  parche, migrar a `@sqlite.org/sqlite-wasm` manteniendo el mismo puerto `SqlPort`.
- El binario se sirve desde el propio bundle; no se acepta un `.wasm` de terceros en tiempo de ejecución.
- Cualquier actualización exige repetir la batería completa y revisar licencia, integridad y tamaño.
