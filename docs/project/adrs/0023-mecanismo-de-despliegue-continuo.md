# ADR 0023: Mecanismo de despliegue continuo con agente pull propio

- Estado: aceptada por criterio técnico delegado; implementación pendiente (Fase 4).
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; el usuario pidió evaluar plataformas externas y elegir la opción de menor riesgo con investigación propia.
- Alcance: disparo y ejecución de despliegues. No modifica la construcción de imágenes del [ADR 0021](0021-artefactos-y-despliegue-pull.md).
- Relación: complementa el [ADR 0021](0021-artefactos-y-despliegue-pull.md) y concreta el disparo por entorno.

## Contexto

Una investigación externa propuso Komodo v2, Portainer Edge, GitHub Actions con Tailscale y Ansible Pull como alternativas al agente pull previsto. Las restricciones reales son: dos hosts (Ubuntu en producción, Windows Home en staging), un operador, redes privadas sin entrada desde internet, Docker Compose, GHCR y datos reales de estudiantes.

Se verificaron las afirmaciones contra documentación primaria. Hallazgos relevantes:

- Komodo v2 (marzo de 2026) sí permite Periphery con conexión saliente y autenticación PKI; requiere Core y MongoDB (o FerretDB) y no documenta Windows nativo.
- Portainer Edge consulta al servidor y abre un túnel, pero el servidor debe exponer 9443 y 8000; su edición comunitaria permanece en 2.x y la 3.x es Kubernetes-first.
- Tailscale permite un nodo efímero con identidad federada y ACL, pero introduce un servicio de coordinación externo y un modelo push.
- `ansible-pull` implementa el patrón pull con cron y locking externo; añade Ansible y un checkout, sin resolver la lógica específica.
- **Corrección:** la investigación afirmaba que Free, Pro y Team no permiten revisores obligatorios en repos privados. La documentación de GitHub indica que Free solo los permite en públicos, pero **Pro y Team sí pueden configurar environments en repos privados**.

## Decisión

1. **Agente pull propio**, sin plano de control adicional, sin base de datos propia y sin entrada desde internet.
2. **Staging automático:** tarea programada cada cinco minutos aplica el último Release.
3. **Producción sin timer:** una persona autorizada ejecuta `deploy.sh <version>`. El script aplica el mismo contrato: verificar digest, backup, migración, health, registro y rollback.
4. **Aprobación:** Release más disparo humano. Si el plan de GitHub lo permite, Environment con revisores; si no, protección de rama y revisión de PR.
5. **Criterios de aceptación** (los nueve de la evaluación externa):
   1. Desplegar en staging desde GitHub y GHCR.
   2. Mantener separados secretos y volúmenes por entorno.
   3. Ejecutar backup antes de migrar.
   4. Desplegar una versión inmutable por digest.
   5. Verificar `/health/ready` y una prueba funcional.
   6. Detener el despliegue si falla una comprobación.
   7. Volver a la versión anterior sin perder datos.
   8. Impedir despliegues no aprobados en producción.
   9. Recuperar el despliegue si staging estaba apagado.

## Consecuencias

- **Menor superficie:** no hay interfaz ni API de control con acceso root, no hay MongoDB que respaldar y no hay un tercer servicio que parchear.
- **Sin RBAC ni auditoría central:** la auditoría es local y append-only. Es aceptable para un operador; deja de serlo si aparecen más.
- **Código propio:** el agente debe probarse y mantenerse. Se mitiga con las nueve pruebas, lock de concurrencia, `--dry-run` y alerta de fallo.
- **Producción no se autoactualiza:** un Release no cambia producción hasta que una persona ejecuta el comando. Es una decisión de seguridad, no una carencia.
- **Staging sigue limitado por Windows:** Docker Desktop requiere sesión; ninguna herramienta evaluada elimina esa dependencia.

## Alternativas

- **Komodo v2:** outbound confirmado y buena cobertura de Compose, pero exige Core y MongoDB. Con dos hosts no hay ubicación segura: en producción concentra el control de ambos; en staging no es fiable porque el equipo se apaga; un tercer host no existe. **Además, Komodo v2 acumula CVEs críticos en su primer año:** CVE-2026-110005 (inyección de comandos en Periphery, CVSS 9.9, ejecución como root) y CVE-2026-110631 (bypass de autenticación en Periphery hasta 2.3.3, acceso sin autenticar). No es una base madura para datos reales. Se reconsiderará solo con un host dedicado, varios operadores y una línea 2.3.x estable sin CVEs abiertos.
- **Portainer Edge:** requiere 9443/8000 y socket de Docker; CE queda en 2.x y 3.x prioriza Kubernetes. **Portainer CE arrastra un historial de CVEs críticos** (bypass de autorización hasta 2.44.0 con acceso root al host; inicialización de administrador sin autenticar durante la ventana de setup; path traversal en restore). Se descarta para un proyecto que permanece en Compose.
- **GitHub Actions + Tailscale:** técnicamente sólido (OIDC, nodos efímeros, ACL) y con un modelo de seguridad maduro (WireGuard extremo a extremo, tailnet lock, SOC 2, auditorías). Se añade, no obstante, un servicio externo y un modelo push donde un workflow puede ejecutar comandos en producción. **Se recomienda adoptarlo para acceso administrativo (sustituir SSH expuesto), no para disparar despliegues**, si la universidad lo aprueba.
- **Ansible Pull:** mismo patrón con herramienta madura, pero la lógica de migración, backup y rollback seguiría siendo propia. Se considerará para aprovisionar el host, no para releases.
- **Runner self-hosted:** descartado en el [ADR 0021](0021-artefactos-y-despliegue-pull.md) por ejecución de código de GitHub en el host.

## Evidencia y validación

- [Komodo v2.0.0](https://komo.do/docs/releases/v2.0.0) (outbound periphery, PKI) y [setup](https://komo.do/docs/setup) (MongoDB/FerretDB).
- [CERT/CC VU#456950](https://kb.cert.org/vuls/id/456950) — CVE-2026-110005, inyección de comandos en Periphery (CVSS 9.9).
- [CVE-2026-110631](https://www.ionix.io/threat-center/cve-2026-110631) — bypass de autenticación en Periphery.
- [Portainer Edge Agent](https://docs.portainer.io/advanced/edge-agent), [Portainer 3.0](https://www.portainer.io/blog/portainer-3-0-is-coming) y [CVEs de Portainer](https://app.opencve.io/cve/?vendor=portainer).
- [Tailscale GitHub Action](https://tailscale.com/docs/integrations/github/github-action) y [Tailscale: seguridad](https://tailscale.com/security).
- [ansible-pull](https://docs.ansible.com/projects/ansible/latest/cli/ansible-pull.html).
- [GitHub: environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) para la corrección sobre repos privados.

Criterio para considerarla implementada: las nueve pruebas pasan en staging y las aplicables en producción, con evidencia registrada.
