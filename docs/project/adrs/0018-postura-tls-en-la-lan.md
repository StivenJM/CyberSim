# ADR 0018: Postura TLS en la red local

- Estado: aceptada por decisión explícita del usuario; riesgo residual documentado.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; el usuario indicó que solo requiere cifrado y no que el navegador confíe en el certificado.
- Alcance: staging y producción; transporte de credenciales y datos de estudiantes.
- Relación: depende del [ADR 0015](0015-ingress-unico-con-caddy.md).

## Contexto

No hay dominio público ni reachability entrante; los usuarios acceden por IP o nombre interno de la LAN. El usuario aceptó un certificado no confiable a cambio de cifrado. Producción manejará datos reales de estudiantes y credenciales.

Es necesario separar dos propiedades que suelen confundirse:

- **Cifrado:** impide la lectura pasiva del tráfico.
- **Autenticación del servidor:** impide que un atacante activo se interponga. Requiere una cadena de confianza.

Un certificado autofirmado sin raíz instalada aporta la primera y no la segunda.

## Decisión

1. Caddy sirve **solo HTTPS** en 443 con `tls internal` (CA local de Caddy) o con un certificado de la CA de la universidad si está disponible.
2. **HSTS permanece desactivado.** Con un certificado no confiable, HSTS impediría a los usuarios continuar y dejaría el sitio inaccesible.
3. Se documenta el riesgo residual: un atacante activo en la LAN podría interceptar credenciales y sesiones.
4. Mejora recomendada, sin cambiar el diseño: instalar la raíz de Caddy en los dispositivos del piloto o usar la CA institucional. El certificado presentado cambia; la arquitectura no.

## Consecuencias

- Los usuarios verán una advertencia del navegador y deberán continuar manualmente.
- El cifrado protege datos en tránsito frente a observadores pasivos, incluidos otros equipos de la LAN.
- No se puede afirmar que la conexión sea auténtica. Los controles compensatorios son: red segmentada, acceso limitado, rate limiting en login (Fase 2) y no reutilizar credenciales institucionales.
- En producción, con datos reales, la raíz instalada o la CA institucional deja de ser opcional desde el punto de vista de riesgo; se recomienda fuertemente antes del go-live.

## Alternativas

- **HTTP sin cifrado:** descartado; expone credenciales y datos en una red compartida.
- **ACME público (Let's Encrypt):** requiere dominio y validación alcanzable; no disponible en la red prevista.
- **`mkcert` u otra CA local:** mismo problema de distribución de la raíz que Caddy, con una pieza adicional.
- **CA institucional:** la mejor opción cuando exista; elimina advertencias sin trabajo por dispositivo.

## Evidencia y validación

- Caddy documenta HTTPS automático, CA local para IPs y nombres internos, y que la raíz solo es confiable donde se instala: [Automatic HTTPS](https://caddyserver.com/docs/automatic-https).
- Semántica de HSTS y su efecto con certificados no confiables: [MDN: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security).
- Marco de verificación: [OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/) (comunicaciones y autenticación).

Criterio para considerarla implementada: 443 responde con TLS; 80 no sirve la aplicación; la cabecera `Strict-Transport-Security` está ausente; el certificado cubre el nombre o IP usados.
