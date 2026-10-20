# Crear y mantener escenarios

Esta guía permite añadir un ejercicio de ciberseguridad usando capacidades existentes. La ruta normal consiste en **crear un archivo, validarlo, publicarlo y sincronizar su revisión**; no hay que editar listas paralelas.

Antes de cambiar el contrato o el motor, lee [Arquitectura modular de escenarios](../architecture/escenarios-modulares.md). Para conocer cada campo consulta [Contrato de escenarios](../architecture/contrato-de-escenarios.md).

## Ruta rápida

1. Copia el escenario publicado más parecido dentro de `apps/frontend/src/data/escenarios/`.
2. Cambia nombre de archivo, export, `id`, `slug`, metadatos y contenido.
3. Déjalo como `draft` mientras lo construyes.
4. Ejecuta la prueba del catálogo y corrige todas las referencias.
5. Prueba el recorrido completo en el navegador.
6. Incrementa `revision` y cambia el estado a `published`.
7. Sincroniza la revisión con PostgreSQL y exporta el conocimiento RAG.
8. Ejecuta lint, typecheck, tests y build.

## 1. Crear el archivo

Usa el patrón `escenarioNombre.ts`; el descubrimiento depende de `escenario*.ts`. El mínimo es:

```ts
import { defineScenario } from '../../scenarios/defineScenario'
import type { DefinicionEscenario } from '../../shared/types/EscenarioTypes'

const scenarioDefinition: DefinicionEscenario = {
  id: 14,
  slug: 'respuesta-phishing',
  titulo: 'Respuesta ante phishing',
  categoria: 'Ingeniería social',
  descripcion: 'Identifica el mensaje y contiene el incidente.',
  presupuestoInicial: 1000,
  ataques: [],
  eventos: [],
  accionesEsperadas: [],
  fases: [],
  zonas: [],
}

export const escenarioRespuestaPhishing = defineScenario(scenarioDefinition, {
  revision: 1,
  status: 'draft',
})
```

Completa las estructuras desde un ejemplo real; el fragmento solo muestra el contenedor. No exportes el objeto crudo: `defineScenario` añade versión de esquema, capacidades inferidas, perfil `office-3d`, versiones del runtime/catálogo, semilla y SHA-256.

No edites `NivelController`, un índice de escenarios, el exportador RAG ni un mapa del backend. Todos descubren o consultan el catálogo canónico.

## 2. Diseñar contenido coherente

### Identidad

- `id`: entero positivo que no exista en ningún archivo.
- `slug`: kebab-case estable; no lo cambies después de publicar.
- `revision`: comienza en 1 y aumenta por cada cambio de contenido publicado.
- `status`: usa `draft` hasta que todas las comprobaciones sean satisfactorias.

### Topología

Define zonas, redes, oficinas, espacios y dispositivos. Los nombres son referencias de dominio: un evento que usa `Servidor Web` debe encontrar exactamente ese dispositivo. Las redes de un dispositivo deben existir en su zona; `Internet` es la única referencia global especial.

El perfil visual predeterminado reutiliza la oficina 3D. Los tipos de dispositivo seleccionan modelos del catálogo confiable; el archivo no proporciona rutas de modelos ni lógica de renderizado.

### Fases y evaluación

- Usa IDs de fase únicos y referencia esos mismos IDs desde eventos y ataques.
- Marca únicamente la primera fase como actual.
- Incluye un cierre por fase y un cierre de escenario al final.
- Alinea objetivos, acciones esperadas y condiciones con los eventos que realmente registra el ECS.
- Usa tiempos enteros y alcanzables; define `tiempoEnOcurrir` cuando la verificación dependa del reloj.

| Reto | Referencias que debes revisar |
|---|---|
| Hardening | Dispositivo, configuración y estado esperado |
| Firewall/tráfico | Origen, destino, red, dirección, protocolo y bloqueo esperado |
| VPN | Gateway, cliente, hosts, dominios y tipo de protección |
| Firma | Documento, firma, clave y veredicto |
| Correo/ingeniería social | Emisor, destinatario, plantilla y acción registrada |
| Terminal | Dispositivo, credenciales, comando y respuesta esperada |

## 3. Validar mientras desarrollas

Desde la raíz:

```powershell
pnpm --filter @cybersim/frontend exec vitest --run tests/scenarioCatalog.test.ts
pnpm --filter @cybersim/frontend run typecheck
```

El catálogo valida también escenarios `draft`, aunque no los muestre. Entre otros errores detecta:

- IDs o slugs duplicados;
- versión, estado, capacidad o perfil desconocidos;
- fase inexistente;
- dispositivo atacado inexistente;
- red inexistente en la zona;
- nombre/ID de dispositivo duplicado;
- huella que no coincide con el contenido.

Un error detiene la importación del catálogo: no lo ocultes ni lo conviertas en fallback.

## 4. Probar el ejercicio

Un `draft` no aparece en el selector. Para una prueba visual local puedes cambiarlo temporalmente a `validated` y cargarlo mediante una prueba dirigida, o marcarlo `published` solo en tu rama mientras recorres:

- selección y carga;
- todas las zonas y dispositivos;
- cada objetivo y condición de mitigación;
- pausa/reanudación y tiempos;
- finalización y guardado del intento.

La validación estructural NO demuestra que el ejercicio sea resoluble o pedagógicamente correcto.

## 5. Publicar una revisión

Cuando el contenido esté listo:

```ts
export const escenarioRespuestaPhishing = defineScenario(scenarioDefinition, {
  revision: 1,
  status: 'published',
})
```

Después de aplicar migraciones al entorno correspondiente, ejecuta:

```powershell
pnpm --filter @cybersim/backend run db:sync-scenarios
```

El comando descubre los archivos, valida el contrato y SHA-256, sincroniza solo revisiones `published`, impide sobrescribir una revisión con contenido distinto y archiva la revisión publicada anterior cuando aparece una nueva. Si la revisión ya existe con el mismo hash, completa o actualiza sus metadatos y manifiesto sin crear un duplicado.

Este comando escribe en la base configurada. Revisa `DATABASE_URL` o las variables PostgreSQL antes de ejecutarlo. La preparación local mediante Docker lo ejecuta automáticamente después de migrar y sembrar; no se ejecuta durante build ni en el CI general.

Si cambias un escenario ya publicado, aumenta `revision`. Reutilizar el número con otro contenido falla deliberadamente.

## 6. Actualizar conocimiento RAG

```powershell
pnpm --filter @cybersim/frontend run export:rag
```

El exportador descubre las mismas revisiones publicadas. Revisa la salida en `apps/frontend/scripts/rag-output/` antes de incorporarla al índice de conocimiento; generar JSON no publica puntos en Qdrant.

## 7. Cierre de calidad

```powershell
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

Si cambiaste Prisma, ejecuta además:

```powershell
pnpm --filter @cybersim/backend exec prisma validate
pnpm --filter @cybersim/backend run db:generate
```

## Cuando el manifiesto no alcanza

Detente si el ejercicio necesita un evento, acción, verificador, dispositivo o presentación que no existe. Eso es una **capacidad nueva**, no datos faltantes. Implementa primero la capacidad en código, añádela al registro cerrado de `packages/scenario-contract`, prueba su comportamiento y solo después úsala desde el escenario.

No uses valores libres para simular una capacidad ni relajes el validador. Esa separación permite que la autoría futura siga siendo segura y específica de ciberseguridad.

## Checklist

- [ ] ID y slug son únicos y estables.
- [ ] Todas las referencias de fases, redes y dispositivos existen.
- [ ] El recorrido completo es resoluble.
- [ ] La revisión aumentó si el contenido ya estaba publicado.
- [ ] `db:sync-scenarios` sincronizó la base correcta.
- [ ] El export RAG fue revisado si aplica.
- [ ] Formato, lint, tipos, tests y build pasan.
