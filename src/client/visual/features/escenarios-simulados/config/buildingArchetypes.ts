import type { RoomTheme } from '../hooks/sceneLayout';
import { pick } from '../utils/seededRandom';

/**
 * Arquetipos de edificio: cada zona se lee como un "edificio" distinto (casa,
 * oficina, datacenter…). El arquetipo define cuántas salas decorativas se añaden y
 * de qué POOL de prefabs salen. Los prefabs (ver roomPrefabs) acoplan tamaño + tema
 * + amueblado, así que las proporciones y la densidad quedan diseñadas.
 *
 * Selección COHERENTE POR TEMA: un tema fuerte (casa, datacenter, aula, estudio,
 * bufete) toma su edificio característico; las zonas genéricas de oficina varían
 * entre sub-layouts de oficina por semilla. Determinista (sembrado por la zona).
 */

export interface BuildingArchetype {
  id: string;
  /** Cuántas salas decorativas añadir alrededor de la(s) real(es). */
  rooms: { min: number; max: number };
  /** Pool de ids de prefab (con repeticiones para ponderar). */
  prefabs: string[];
}

const ARCHETYPES: Record<string, BuildingArchetype> = {
  // Sub-layouts de oficina (para zonas de tema genérico 'office').
  'office-open': { id: 'office-open', rooms: { min: 2, max: 3 }, prefabs: ['office-team', 'meeting', 'office-solo'] },
  'office-cellular': { id: 'office-cellular', rooms: { min: 3, max: 5 }, prefabs: ['office-solo', 'office-solo', 'meeting', 'office-team'] },
  'office-mixed': { id: 'office-mixed', rooms: { min: 2, max: 4 }, prefabs: ['office-solo', 'office-team', 'meeting', 'lounge'] },
  // Edificios característicos de temas fuertes.
  house: { id: 'house', rooms: { min: 2, max: 3 }, prefabs: ['lounge', 'lounge', 'office-solo'] },
  datacenter: { id: 'datacenter', rooms: { min: 1, max: 2 }, prefabs: ['server-hall', 'server-hall', 'office-solo'] },
  studio: { id: 'studio', rooms: { min: 1, max: 2 }, prefabs: ['studio', 'lounge'] },
  school: { id: 'school', rooms: { min: 2, max: 3 }, prefabs: ['classroom', 'classroom', 'office-solo'] },
  law: { id: 'law', rooms: { min: 2, max: 3 }, prefabs: ['law-office', 'meeting', 'office-solo'] },
};

const OFFICE_VARIANTS = ['office-open', 'office-cellular', 'office-mixed'] as const;

// Tema fuerte → su edificio característico. El resto ('office') se reparte entre
// las variantes de oficina por semilla.
const ARQUETIPO_POR_TEMA: Partial<Record<RoomTheme, string>> = {
  home: 'house',
  datacenter: 'datacenter',
  hacker: 'studio',
  classroom: 'school',
  legal: 'law',
};

/** Elige el arquetipo de una zona a partir de su tema dominante y su semilla. */
export function chooseArchetype(zoneTheme: RoomTheme, rng: () => number): BuildingArchetype {
  const id = ARQUETIPO_POR_TEMA[zoneTheme] ?? pick(rng, OFFICE_VARIANTS);
  return ARCHETYPES[id];
}
