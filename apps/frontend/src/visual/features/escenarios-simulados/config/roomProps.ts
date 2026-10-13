import type { RoomInfo } from '../hooks/sceneLayout';
import { RACK_TOPE_Y } from '../components/procedural/rackModel';
import { rngInt, rngRange } from '../utils/seededRandom';

/**
 * Props decorativos generados en el frontend: dan riqueza visual a la escena sin
 * tocar el dato del escenario, el ECS ni los controllers. No son entidades, así
 * que nunca aparecen en topología, escaneo ni interacción.
 *
 * - Salas sintéticas: se amueblan según su tema (oficina → escritorios, datacenter
 *   → racks, casa → escritorio aislado…), replicando la jerarquía espacio→equipo.
 * - Salas reales: NO reciben props decorativos; se quedan con sus dispositivos del
 *   ECS para no mezclar equipo decorativo con los interactuables (confunde).
 *
 * La colocación la fija un PRNG sembrado por el id de la oficina, así que es
 * estable entre renders.
 */

export type PropModel =
  | 'rack' | 'serverrack' | 'switch' | 'router' | 'mesa' | 'workstation'
  | 'meetingtable' | 'sofa' | 'tv' | 'whiteboard';

/** Una instancia de prop ya posicionada en coordenadas de mundo. */
export interface PlacedProp {
  id: string;
  kind: PropModel;
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

// Altura de la superficie de la mesa (tablero), donde se apoya la workstation.
export const MESA_SURFACE_Y = 0.71;
// Distancia del centro de la primera fila a la pared trasera.
const WALL_CLEARANCE = 0.55;
// Separación entre filas paralelas (pasillo) cuando hay varias.
const AISLE = 1.3;
// Fracción central del ancho usada para la fila (deja libres las esquinas, donde
// RoomDecor pone las plantas).
const USABLE_SPAN_FRAC = 0.78;

/** Receta de una fila de muebles/equipo contra la pared trasera. */
export interface RowSpec {
  /** Item base apoyado en el piso. */
  base: 'rack' | 'serverrack' | 'mesa';
  count: { min: number; max: number };
  /** Separación entre items (centro a centro); también acota la cantidad. */
  pitch: number;
  /** Qué se apoya encima de cada item. */
  topper?: 'workstation' | 'gear';
  /** Probabilidad [0..1] del topper 'gear' (equipo de red sobre el rack). */
  gearChance?: number;
  /** Llenar la franja a tope en vez de una cantidad aleatoria (datacenter). */
  fill?: boolean;
  /** Nº de filas paralelas hacia el frente (si la profundidad lo permite). */
  rows?: number;
}

/**
 * Coloca una o varias filas de `base` (mesa/rack/serverrack) empaquetadas y
 * centradas contra la pared trasera, con un topper opcional sobre cada uno. Al
 * centrar y usar un `pitch` fijo, los items quedan juntos (no esparcidos por toda
 * la sala). Genérico: lo usan el amueblado de salas sintéticas y el equipo de
 * ambiente.
 */
export function placeBackRow(room: RoomInfo, rng: () => number, spec: RowSpec): PlacedProp[] {
  const props: PlacedProp[] = [];

  const usable = room.width * USABLE_SPAN_FRAC;
  const maxFit = Math.max(1, Math.floor(usable / spec.pitch) + 1);
  const perRow = spec.fill
    ? Math.min(spec.count.max, maxFit)
    : Math.min(rngInt(rng, spec.count.min, spec.count.max), maxFit);
  if (perRow <= 0) return props;

  const surfaceY = spec.base === 'mesa' ? MESA_SURFACE_Y : RACK_TOPE_Y;
  const facesNorth = room.corridorSide === 'north';
  // Frente hacia el interior; lo comparten mesa, equipo y el workstation de encima.
  const baseYaw = facesNorth ? 0 : Math.PI;
  const backZ = facesNorth ? room.padded.z1 + WALL_CLEARANCE : room.padded.z2 - WALL_CLEARANCE;
  const rowStep = facesNorth ? AISLE : -AISLE;
  const totalW = spec.pitch * (perRow - 1);
  const x0 = room.centerX - totalW / 2;
  const rowCount = spec.rows ?? 1;

  let idx = 0;
  for (let r = 0; r < rowCount; r++) {
    const z = backZ + r * rowStep;
    if ((!facesNorth && z < room.padded.z1 + 0.6) || (facesNorth && z > room.padded.z2 - 0.6)) break; // no cabe otra fila

    for (let i = 0; i < perRow; i++) {
      const x = x0 + i * spec.pitch + rngRange(rng, -0.04, 0.04);
      const yaw = baseYaw + rngRange(rng, -0.04, 0.04);

      props.push({
        id: `${spec.base}-${room.oficinaId}-${idx}`,
        kind: spec.base,
        position: [x, 0, z],
        rotationY: yaw,
        scale: spec.base === 'rack' ? rngRange(rng, 0.98, 1.04) : 1,
      });

      if (spec.topper === 'workstation') {
        props.push({
          id: `ws-${room.oficinaId}-${idx}`,
          kind: 'workstation',
          position: [x, surfaceY, z],
          rotationY: yaw,
          scale: 1,
        });
      } else if (spec.topper === 'gear' && rng() < (spec.gearChance ?? 0)) {
        props.push({
          id: `gear-${room.oficinaId}-${idx}`,
          kind: rng() < 0.5 ? 'switch' : 'router',
          position: [x + rngRange(rng, -0.06, 0.06), surfaceY, z + rngRange(rng, -0.04, 0.04)],
          rotationY: yaw,
          scale: 1,
        });
      }
      idx += 1;
    }
  }

  return props;
}
