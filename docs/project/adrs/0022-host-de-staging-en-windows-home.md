# ADR 0022: Host de staging en Windows Home con Docker Desktop

- Estado: aceptada por restricción del entorno y criterio técnico delegado; implementación pendiente.
- Fecha de documentación: 2026-10-21.
- Fecha y evidencia de aprobación: 2026-10-21; el usuario confirmó Windows Home en el PC de laboratorio.
- Alcance: host temporal de staging; no aplica a producción.
- Relación: complementa el [ADR 0014](0014-plataforma-de-despliegue-en-host-unico.md).

## Contexto

El PC de laboratorio tiene Windows Home, 16 GB de RAM, 256 GB de disco y se apaga ocasionalmente. Se usará para probar el despliegue y acceder desde otros equipos de la LAN. Windows Home no admite el rol Hyper-V.

Docker Desktop documenta el backend WSL 2 para Windows 10/11 Enterprise, Pro o Education; para Home solo indica que permite contenedores Linux. Es una configuración que funciona en la práctica pero no está listada formalmente en la matriz de requisitos.

## Decisión

1. **Docker Desktop en instalación per-user**, backend WSL 2. No requiere administrador para instalar; sí una vez para habilitar WSL 2.
2. **Sin autologon.** Docker Desktop se inicia con la sesión del usuario; `restart: unless-stopped` levanta los contenedores. Se acepta que staging quede caído hasta que alguien inicie sesión.
3. Límite de memoria de WSL en `~/.wslconfig` (`memory=10GB`) para que los 6,5 GiB de límites no ahoguen a Windows.
4. Firewall: solo 443/TCP entrante, perfil privado. Suspensión deshabilitada. IP reservada o hostname estable.
5. Se documenta la limitación y se planifica mover staging a un host Linux cuando exista.

## Consecuencias

- Staging no vuelve solo tras un reinicio sin sesión: es una limitación aceptada, no un fallo a corregir con autologon (que dejaría una sesión con acceso al daemon de Docker, equivalente a privilegio de root).
- El `ext4.vhdx` de WSL crece y no se reduce solo; hace falta podar imágenes y conservar pocos releases.
- Windows Update puede reiniciar la máquina y dejar staging caído.
- La paridad con producción es de contenedores, no de host: el kernel y el arranque difieren.

## Alternativas

- **Docker Engine dentro de WSL 2 sin Desktop:** evita Docker Desktop, pero WSL 2 hace NAT; publicar en la LAN exige `networkingMode=mirrored` o `netsh portproxy`, que se rompe al cambiar la IP de WSL. Mayor fragilidad para el requisito de acceso desde otros equipos.
- **VirtualBox con Ubuntu Server:** permite un Linux real, pero el arranque automático en Windows no está soportado oficialmente y añade otra capa.
- **Instalar Linux en el PC:** resolvería el problema, pero el equipo es de laboratorio y no se puede reimagenar.
- **Autologon:** descartado por seguridad física.

## Evidencia y validación

- Requisitos y modos de instalación, incluido el alcance de Home: [Docker Desktop en Windows](https://docs.docker.com/desktop/setup/install/windows-install/).
- Backend WSL 2 y límites de memoria: [Docker Desktop WSL](https://docs.docker.com/desktop/features/wsl/), [WSL configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config).
- Equipo: 16 GB RAM, 256 GB disco, Windows Home (confirmado por el usuario).

Criterio para considerarla implementada: el stack arranca tras iniciar sesión, es accesible desde otro equipo de la LAN por 443, el consumo cabe en 10 GB y un reinicio con sesión iniciada recupera el servicio con datos intactos.
