import type { RoomInfo } from '../hooks/sceneLayout';
import { rngRange } from '../utils/seededRandom';
import { placeBackRow, type PlacedProp } from './roomProps';

/**
 * Prefabs de sala: cada uno acopla TAMAÑO + TEMA + regla de amueblado, al estilo de
 * los prefabs de game dev. El edificio se arma colocando prefabs en una fila tras
 * el corredor; así las proporciones y la densidad quedan diseñadas (no derivadas
 * de datos arbitrarios), evitando salas largas-y-estrechas o enormes-y-vacías.
 *
 * Todas las salas comparten una profundidad estándar (`CELL_DEPTH`) para que la
 * fila quede alineada; el ancho lo da el prefab en celdas (`CELL_WIDTH`).
 * Render-only y determinista: la elección de prefabs se siembra por la zona.
 */

// Tamaño base de celda (metros). Una sala "normal" ≈ cuadrada; un hall = 2 celdas
// de ancho. La profundidad es común a todas las salas.
export const CELL_WIDTH = 4.4;
export const CELL_DEPTH = 4.4;

const INTERIOR_MARGIN = 0.95; // separación a las paredes

export interface RoomPrefab {
  id: string;
  /** Tema (paleta/decorado) que toma la sala. */
  theme: RoomInfo['tipo'];
  /** Ancho en celdas (1 = sala normal, 2 = hall/sala grande). */
  wCells: number;
  /** Coloca el mobiliario del prefab (render-only, determinista). */
  furnish: (room: RoomInfo, rng: () => number) => PlacedProp[];
}

// ─── Helpers de colocación (sobre el footprint estándar de la sala) ───

/** Coloca un único mueble centrado en X, a una z dada, mirando a `yaw`. */
function placeOne(room: RoomInfo, kind: PlacedProp['kind'], z: number, yaw: number): PlacedProp {
  return { id: `${kind}-${room.oficinaId}`, kind, position: [room.centerX, 0, z], rotationY: yaw, scale: 1 };
}

/** Pizarra contra la pared trasera, con la superficie hacia el interior (-Z). */
function whiteboardBack(room: RoomInfo, rng: () => number): PlacedProp {
  const facesNorth = room.corridorSide === 'north';
  return {
    id: `wb-${room.oficinaId}`,
    kind: 'whiteboard',
    position: [room.centerX + rngRange(rng, -0.2, 0.2), 0, facesNorth ? room.padded.z1 + 0.3 : room.padded.z2 - 0.3],
    rotationY: facesNorth ? 0 : Math.PI,
    scale: 1,
  };
}

/** Fila de escritorios (mesa + workstation) contra la pared trasera. */
function deskRow(room: RoomInfo, rng: () => number, min: number, max: number): PlacedProp[] {
  return placeBackRow(room, rng, { base: 'mesa', count: { min, max }, pitch: 2.0, topper: 'workstation' });
}

/** Nave de servidores: filas densas de server racks; dos filas si hay profundidad. */
function serverHall(room: RoomInfo, rng: () => number): PlacedProp[] {
  return placeBackRow(room, rng, {
    base: 'serverrack',
    count: { min: 6, max: 10 },
    pitch: 0.72,
    fill: true,
    rows: room.depth > 4 ? 2 : 1,
  });
}

/** Sala de reuniones: mesa central + pizarra al fondo. */
function meetingRoom(room: RoomInfo, rng: () => number): PlacedProp[] {
  const table = placeOne(room, 'meetingtable', room.centerZ + 0.2, rngRange(rng, -0.04, 0.04));
  return [table, whiteboardBack(room, rng)];
}

/**
 * Aula: pizarra al fondo + pupitres (mesa, sin workstation) en DOS COLUMNAS de 3
 * filas con pasillo central, mirando hacia la pizarra. Va en una sala más ancha
 * (ver wCells del prefab); los pupitres se escalan para que quepan 3 filas.
 */
function classroom(room: RoomInfo, rng: () => number): PlacedProp[] {
  const props: PlacedProp[] = [whiteboardBack(room, rng)];

  const rows = 3; // 2 columnas (colXs) × 3 filas
  const PUPITRE_SCALE = 0.82;

  // Columnas a 1/3 y 2/3 del ancho útil → pasillo central.
  const x1 = room.padded.x1 + INTERIOR_MARGIN;
  const usableW = (room.padded.x2 - INTERIOR_MARGIN) - x1;
  const colXs = [x1 + usableW / 3, x1 + (2 * usableW) / 3];

  // Filas desde el fondo del aula hacia la pizarra (en +Z).
  const facesNorth = room.corridorSide === 'north';
  const zRear = facesNorth ? room.padded.z2 - 0.8 : room.padded.z1 + 0.8;
  const zBoard = facesNorth ? room.padded.z1 + 0.9 : room.padded.z2 - 0.9;
  for (let r = 0; r < rows; r++) {
    const z = zRear + (r * (zBoard - zRear)) / (rows - 1);
    colXs.forEach((cx, c) => {
      const x = cx + rngRange(rng, -0.05, 0.05);
      props.push({ id: `pup-${room.oficinaId}-${r}-${c}`, kind: 'mesa', position: [x, 0, z], rotationY: facesNorth ? 0 : Math.PI, scale: PUPITRE_SCALE });
    });
  }
  return props;
}

/**
 * Sala de estar: sofá contra la pared lateral izquierda mirando a la pared
 * opuesta, con un televisor (apagado) montado en esa pared derecha, frente al
 * sofá. El frente del sofá (+Z) y de la TV (+Z) se orientan con yaw.
 */
function lounge(room: RoomInfo, rng: () => number): PlacedProp[] {
  const TV_MOUNT_Y = 1.45; // altura del centro de la TV en la pared
  const sofa: PlacedProp = {
    id: `sofa-${room.oficinaId}`,
    kind: 'sofa',
    // Contra la pared izquierda, mirando hacia +X (la pared derecha).
    position: [room.padded.x1 + 0.62, 0, room.centerZ + rngRange(rng, -0.15, 0.15)],
    rotationY: Math.PI / 2 + rngRange(rng, -0.03, 0.03),
    scale: 1,
  };
  const tv: PlacedProp = {
    id: `tv-${room.oficinaId}`,
    kind: 'tv',
    // En la pared derecha, mirando hacia -X (hacia el sofá).
    position: [room.padded.x2 - 0.05, TV_MOUNT_Y, room.centerZ],
    rotationY: -Math.PI / 2,
    scale: 1,
  };
  return [sofa, tv];
}

// ─── Catálogo de prefabs ───

const PREFABS: Record<string, RoomPrefab> = {
  'office-solo': { id: 'office-solo', theme: 'office', wCells: 1, furnish: (r, rng) => deskRow(r, rng, 1, 1) },
  'office-team': { id: 'office-team', theme: 'office', wCells: 2, furnish: (r, rng) => deskRow(r, rng, 3, 4) },
  meeting: { id: 'meeting', theme: 'office', wCells: 2, furnish: meetingRoom },
  'server-hall': { id: 'server-hall', theme: 'datacenter', wCells: 2, furnish: serverHall },
  classroom: { id: 'classroom', theme: 'classroom', wCells: 3, furnish: classroom },
  lounge: { id: 'lounge', theme: 'home', wCells: 1, furnish: lounge },
  studio: { id: 'studio', theme: 'hacker', wCells: 1, furnish: (r, rng) => deskRow(r, rng, 1, 2) },
  'law-office': { id: 'law-office', theme: 'legal', wCells: 1, furnish: (r, rng) => deskRow(r, rng, 1, 1) },
};

export const getPrefab = (id: string): RoomPrefab => PREFABS[id] ?? PREFABS['office-solo'];
