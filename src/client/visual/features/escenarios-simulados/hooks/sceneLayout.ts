import type { Entidad } from '../../../../ecs/core/Componente';
import { OficinaComponent } from '../../../../ecs/components/OficinaComponent';
import { DispositivoComponent } from '../../../../ecs/components/DispositivoComponent';
import { mulberry32, pick, rngInt, seedFromId } from '../utils/seededRandom';
import { chooseArchetype } from '../config/buildingArchetypes';
import { CELL_DEPTH, CELL_WIDTH, getPrefab } from '../config/roomPrefabs';

/**
 * Motor de layout de la escena 3D (puro, sin React). Es la ÚNICA fuente de
 * posicionamiento visual: ignora las `posicion` del dato (que solo existían para
 * la presentación) y deriva todo de la jerarquía zona→oficina→espacio→dispositivo.
 *
 * Produce:
 *  - `rooms`: footprints de todas las salas (reales + decorativas) para paredes y decorado.
 *  - `placements`: posición (x,z) derivada de cada entidad real (espacios y dispositivos),
 *     que el renderer usa en vez del `Transform` del dato.
 *
 * Una sala REAL = "un cuarto cuyo mobiliario son las entidades reales": se le da
 * un footprint según cuántos espacios tiene y se acomodan en una grilla centrada.
 * Una sala DECORATIVA = un prefab (ver roomPrefabs). Todo determinista (sembrado
 * por la zona). No toca el ECS ni el dato: solo lee la jerarquía.
 */

// ─── Constantes de geometría del edificio ───
export const WALL_HEIGHT = 3.0;
export const WALL_THICKNESS = 0.16;
export const CEILING_Y = WALL_HEIGHT;
export const HALLWAY_DEPTH = 2.2;
export const DOOR_WIDTH = 1.0;
export const DOOR_HEIGHT = 2.25;
export const PARTITION_SOLID_H = 1.0;
export const ROOM_PADDING = 1.2;

const TOLERANCE = 0.35;

// Acomodo del mobiliario real dentro de una sala.
const SLOT_W = 2.1;         // separación entre escritorios en la fila (X)
const FURN_MARGIN = 1.0;    // margen a las paredes
//const BACK_CLEARANCE = 0.85; // distancia del mobiliario a la pared trasera

// Orientación (grados): el frente del mobiliario mira al interior de la sala. Lo
// comparten mesa, equipo y workstation, así el monitor queda de frente a la silla.
const facingDeg = (corridorSide: CorridorSide): number =>
    corridorSide === 'north' ? 0 : 180;

export type RoomTheme = 'office' | 'datacenter' | 'classroom' | 'home' | 'hacker' | 'legal';

export interface OfficeBounds {
    oficinaId: number;
    nombre: string;
    minX: number; maxX: number;
    minZ: number; maxZ: number;
}
export interface PaddedBounds { x1: number; x2: number; z1: number; z2: number; }

export interface RoomInfo {
    oficinaId: number;
    nombre: string;
    bounds: OfficeBounds;
    padded: PaddedBounds;
    centerX: number;
    centerZ: number;
    width: number;
    depth: number;
    tipo: RoomTheme;
    deviceTypes: string[];
    /** Sala decorativa generada en el frontend (no contiene entidades reales). */
    sintetico?: boolean;
    /** Prefab que amuebla esta sala sintética (ver roomPrefabs). */
    prefabId?: string;
    corridorSide: 'south' | 'north';
}

export interface WallSegment { position: [number, number, number]; size: [number, number, number]; }
export interface DoorLeaf { hinge: [number, number, number]; width: number; height: number; openRad: number; }
export interface CorridorWallResult {
    solidWalls: WallSegment[];
    glassWalls: WallSegment[];
    glassMullions: WallSegment[];
    doorFrames: WallSegment[];
    doorLeaves: DoorLeaf[];
}
export interface BuildingBounds { x1: number; x2: number; z1: number; z2: number; }

/** Posición (x,z) y rotación (grados) derivadas de una entidad real. La Y la pone
 *  el renderer según el mueble. */
export interface EntityPlacement { x: number; z: number; rotDeg: number; }

export interface BuildingLayout {
    rooms: RoomInfo[];
    bldg: BuildingBounds | null;
    officeBldg: BuildingBounds | null;
    officeFrontZ: number;
    corridorWall: CorridorWallResult | null;
    internalWalls: WallSegment[];
    hallways: { x1: number; x2: number; z1: number; z2: number }[];
    theme: RoomTheme;
}

export interface SceneLayout extends BuildingLayout {
    /** Posición derivada por entidad real (espacios + dispositivos). */
    placements: Map<Entidad, EntityPlacement>;
}

// Mínima referencia al builder/ecsManager que necesitamos (sin acoplar tipos).
interface BuilderLike {
    obtenerEntidadZonaPorId(zonaId: number): Entidad | undefined;
    obtenerZonas?: () => { id: number; nombre: string }[];
    getSistemaJerarquia: () => {
        obtenerOficinasDeZona: (z: Entidad) => Iterable<Entidad>;
        obtenerEspaciosDeOficina: (o: Entidad) => Entidad[];
        obtenerDispositivosDeEspacio: (e: Entidad) => Entidad[];
    };
}
interface EcsLike {
    getComponentes: (id: Entidad) => { get: <T>(c: new (...a: never[]) => T) => T | undefined } | undefined;
}

const EMPTY: SceneLayout = {
    rooms: [], bldg: null, officeBldg: null, officeFrontZ: 0,
    corridorWall: null, internalWalls: [], hallways: [], theme: 'office', placements: new Map(),
};

// ═══════════════════════════════════════════════════════════
// ═══ INFERENCIA DE TEMA ═══
// ═══════════════════════════════════════════════════════════

function inferRoomTheme(nombre: string, zonaNombre: string, deviceTypes: string[]): RoomTheme {
    const texto = `${nombre} ${zonaNombre}`.toLowerCase();
    if (/lisa|atacant|hacker|estudio/.test(texto)) return 'hacker';
    if (/bufete|legal|abogad|mendoza/.test(texto)) return 'legal';
    if (/aula|clase|classroom|computaci/.test(texto)) return 'classroom';
    if (/datacenter|servidor|server|sala de servidores|www|nube/.test(texto)) return 'datacenter';
    if (/casa|home|hogar|remot/.test(texto)) return 'home';
    const deRed = deviceTypes.filter(t => t === 'router' || t === 'vpn' || t === 'switch').length;
    const workstations = deviceTypes.filter(t => t === 'workstation').length;
    if (deRed >= 2 && workstations === 0) return 'datacenter';
    return 'office';
}

function dominantTheme(tipos: RoomTheme[]): RoomTheme {
    if (tipos.length === 0) return 'office';
    const priority: RoomTheme[] = ['hacker', 'datacenter', 'legal', 'classroom', 'home', 'office'];
    for (const tema of priority) if (tipos.includes(tema)) return tema;
    return tipos[0];
}

const SYNTH_NOMBRES: Record<RoomTheme, string[]> = {
    office: ['Administración', 'Recursos Humanos', 'Contabilidad', 'Gerencia', 'Soporte'],
    legal: ['Asesoría Legal', 'Cumplimiento'],
    classroom: ['Sala de Capacitación', 'Sala de Reuniones'],
    home: ['Sala', 'Estudio', 'Habitación'],
    datacenter: ['Sala de Servidores', 'Centro de Datos'],
    hacker: ['Estudio'],
};

// ═══════════════════════════════════════════════════════════
// ═══ PAREDES (corredor + particiones) ═══
// ═══════════════════════════════════════════════════════════

type CorridorSide = RoomInfo['corridorSide'];
type FloorPlanVariant = 'double-loaded' | 'grid-wings';
interface CorridorLine { x1: number; x2: number; z: number; side: CorridorSide; }

const FLOOR_PLAN_VARIANTS: FloorPlanVariant[] = ['double-loaded', 'grid-wings'];

function mergeCorridorWalls(results: CorridorWallResult[]): CorridorWallResult {
    return {
        solidWalls: results.flatMap(r => r.solidWalls),
        glassWalls: results.flatMap(r => r.glassWalls),
        glassMullions: results.flatMap(r => r.glassMullions),
        doorFrames: results.flatMap(r => r.doorFrames),
        doorLeaves: results.flatMap(r => r.doorLeaves),
    };
}

function generateCorridorWall(
    paddedOffices: (PaddedBounds & { sintetico?: boolean })[],
    bldgX1: number,
    bldgX2: number,
    officeFrontZ: number,
    side: CorridorSide = 'south',
): CorridorWallResult {
    const solidWalls: WallSegment[] = [];
    const glassWalls: WallSegment[] = [];
    const glassMullions: WallSegment[] = [];
    const doorFrames: WallSegment[] = [];
    const doorLeaves: DoorLeaf[] = [];

    const frontOffices = paddedOffices
        .filter(o => Math.abs((side === 'south' ? o.z1 : o.z2) - officeFrontZ) < TOLERANCE)
        .sort((a, b) => a.x1 - b.x1);
    const glassH = WALL_HEIGHT - PARTITION_SOLID_H;
    const fW = 0.05;
    const fD = WALL_THICKNESS + 0.04;
    const mullionT = 0.04;

    if (frontOffices.length === 0) {
        solidWalls.push({ position: [(bldgX1 + bldgX2) / 2, WALL_HEIGHT / 2, officeFrontZ], size: [bldgX2 - bldgX1 + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS] });
        return { solidWalls, glassWalls, glassMullions, doorFrames, doorLeaves };
    }

    const addSolidGlassSection = (start: number, end: number) => {
        const len = end - start;
        if (len < 0.02) return;
        const cx = (start + end) / 2;
        solidWalls.push({ position: [cx, PARTITION_SOLID_H / 2, officeFrontZ], size: [len, PARTITION_SOLID_H, WALL_THICKNESS] });
        glassWalls.push({ position: [cx, PARTITION_SOLID_H + glassH / 2, officeFrontZ], size: [len, glassH, 0.02] });
        glassMullions.push({ position: [cx, PARTITION_SOLID_H, officeFrontZ], size: [len, mullionT, fD] });
        glassMullions.push(
            { position: [start, PARTITION_SOLID_H + glassH / 2, officeFrontZ], size: [mullionT, glassH, fD] },
            { position: [end, PARTITION_SOLID_H + glassH / 2, officeFrontZ], size: [mullionT, glassH, fD] },
        );
    };

    let currentX = bldgX1;
    for (const office of frontOffices) {
        const officeCenterX = (office.x1 + office.x2) / 2;
        const doorL = officeCenterX - DOOR_WIDTH / 2;
        const doorR = officeCenterX + DOOR_WIDTH / 2;
        if (office.x1 > currentX + 0.05) addSolidGlassSection(currentX, office.x1);
        addSolidGlassSection(office.x1, doorL);
        addSolidGlassSection(doorR, office.x2);
        const transomH = WALL_HEIGHT - DOOR_HEIGHT;
        if (transomH > 0.02) glassWalls.push({ position: [officeCenterX, DOOR_HEIGHT + transomH / 2, officeFrontZ], size: [DOOR_WIDTH, transomH, 0.02] });
        doorFrames.push(
            { position: [doorL, DOOR_HEIGHT / 2, officeFrontZ], size: [fW, DOOR_HEIGHT, fD] },
            { position: [doorR, DOOR_HEIGHT / 2, officeFrontZ], size: [fW, DOOR_HEIGHT, fD] },
            { position: [officeCenterX, DOOR_HEIGHT, officeFrontZ], size: [DOOR_WIDTH + fW * 2, fW, fD] },
        );
        // La hoja se extiende en +X desde la bisagra. Cerrada (decorativa) debe
        // llenar el vano, así que su bisagra va siempre en el jamba izquierdo; las
        // abiertas (reales) conservan la bisagra según el lado del corredor.
        const hingeX = office.sintetico || side === 'south' ? doorL + fW / 2 : doorR - fW / 2;
        doorLeaves.push({
            hinge: [hingeX, 0, officeFrontZ],
            width: DOOR_WIDTH,
            height: DOOR_HEIGHT - 0.04,
            openRad: office.sintetico ? 0 : (side === 'south' ? 0.62 : -0.62),
        });
        currentX = office.x2;
    }
    if (bldgX2 > currentX + 0.05) addSolidGlassSection(currentX, bldgX2);
    return { solidWalls, glassWalls, glassMullions, doorFrames, doorLeaves };
}

function computeInternalWalls(offices: PaddedBounds[], bldg: BuildingBounds, glassLines: number[] = []): WallSegment[] {
    const isPerimeter = (val: number, bMin: number, bMax: number) => Math.abs(val - bMin) < TOLERANCE || Math.abs(val - bMax) < TOLERANCE;
    const esLineaVidrio = (val: number) => glassLines.some(l => Math.abs(val - l) < TOLERANCE);
    const verticals = new Map<string, { min: number; max: number }>();
    const horizontals = new Map<string, { min: number; max: number }>();
    const addSpan = (map: Map<string, { min: number; max: number }>, key: string, a: number, b: number) => {
        const ex = map.get(key);
        if (ex) { ex.min = Math.min(ex.min, a); ex.max = Math.max(ex.max, b); }
        else map.set(key, { min: a, max: b });
    };
    for (const o of offices) {
        if (!isPerimeter(o.x1, bldg.x1, bldg.x2)) addSpan(verticals, o.x1.toFixed(2), o.z1, o.z2);
        if (!isPerimeter(o.x2, bldg.x1, bldg.x2)) addSpan(verticals, o.x2.toFixed(2), o.z1, o.z2);
        if (!isPerimeter(o.z1, bldg.z1, bldg.z2) && !esLineaVidrio(o.z1)) addSpan(horizontals, o.z1.toFixed(2), o.x1, o.x2);
        if (!isPerimeter(o.z2, bldg.z1, bldg.z2) && !esLineaVidrio(o.z2)) addSpan(horizontals, o.z2.toFixed(2), o.x1, o.x2);
    }
    const walls: WallSegment[] = [];
    for (const [xStr, span] of verticals) {
        const x = parseFloat(xStr);
        walls.push({ position: [x, WALL_HEIGHT / 2, (span.min + span.max) / 2], size: [WALL_THICKNESS, WALL_HEIGHT, span.max - span.min] });
    }
    for (const [zStr, span] of horizontals) {
        const z = parseFloat(zStr);
        walls.push({ position: [(span.min + span.max) / 2, WALL_HEIGHT / 2, z], size: [span.max - span.min, WALL_HEIGHT, WALL_THICKNESS] });
    }
    return walls;
}

// ═══════════════════════════════════════════════════════════
// ═══ ENSAMBLADO ═══
// ═══════════════════════════════════════════════════════════

interface EspacioReal { espacioId: Entidad; dispositivos: { id: Entidad; tipo: string }[]; }
interface RealSpec {
    oficinaId: number; nombre: string; tipo: RoomTheme; deviceTypes: string[];
    espacios: EspacioReal[]; width: number;
}
interface DecoSpec { oficinaId: number; nombre: string; tipo: RoomTheme; prefabId: string; wCells: number; }
type RoomSpec = (RealSpec & { real: true }) | (DecoSpec & { real: false });
interface PlacedRoomSpec { spec: RoomSpec; padded: PaddedBounds; corridorSide: CorridorSide; }

const makeBounds = (oficinaId: number, nombre: string, p: PaddedBounds): OfficeBounds => ({
    oficinaId, nombre, minX: p.x1 + ROOM_PADDING, maxX: p.x2 - ROOM_PADDING, minZ: p.z1 + ROOM_PADDING, maxZ: p.z2 - ROOM_PADDING,
});

/**
 * Acomoda los espacios reales de una oficina en UNA fila centrada (la sala se
 * dimensiona para que quepan; ver `wCells`). La profundidad estándar no da para
 * varias filas de escritorio+silla sin encimar, así que una sola fila evita
 * solapes. Registra la posición de cada espacio y de sus dispositivos (encima).
 */
function layoutRealOffice(spec: RealSpec, padded: PaddedBounds, corridorSide: CorridorSide, placements: Map<Entidad, EntityPlacement>): void {
    const n = spec.espacios.length;
    const cx = (padded.x1 + padded.x2) / 2;
    const cz = (padded.z1 + padded.z2) / 2;
    const x0 = cx - (SLOT_W * (n - 1)) / 2;
    const rotDeg = facingDeg(corridorSide);

    spec.espacios.forEach((esp, i) => {
        const x = x0 + i * SLOT_W;
        placements.set(esp.espacioId, { x, z: cz, rotDeg });
        for (const disp of esp.dispositivos) placements.set(disp.id, { x, z: cz, rotDeg });
    });
}

function buildRoom(spec: RoomSpec, padded: PaddedBounds, corridorSide: CorridorSide): RoomInfo {
    return {
        oficinaId: spec.oficinaId,
        nombre: spec.nombre,
        bounds: makeBounds(spec.oficinaId, spec.nombre, padded),
        padded,
        centerX: (padded.x1 + padded.x2) / 2,
        centerZ: (padded.z1 + padded.z2) / 2,
        width: padded.x2 - padded.x1,
        depth: padded.z2 - padded.z1,
        tipo: spec.tipo,
        deviceTypes: spec.real ? spec.deviceTypes : [],
        sintetico: spec.real ? undefined : true,
        prefabId: spec.real ? undefined : spec.prefabId,
        corridorSide,
    };
}

const roomWidth = (spec: RoomSpec): number =>
    spec.real ? spec.width : spec.wCells * CELL_WIDTH;

const widthOf = (specs: RoomSpec[]): number =>
    specs.reduce((sum, s) => sum + roomWidth(s), 0);

function splitBalanced(specs: RoomSpec[], rowCount: number): RoomSpec[][] {
    const rows = Array.from({ length: rowCount }, () => [] as RoomSpec[]);
    const widths = Array.from({ length: rowCount }, () => 0);
    specs.forEach((spec) => {
        const rowIndex = widths.indexOf(Math.min(...widths));
        rows[rowIndex].push(spec);
        widths[rowIndex] += roomWidth(spec);
    });
    return rows.filter(row => row.length > 0);
}

function layoutRow(specs: RoomSpec[], z1: number, z2: number, corridorSide: CorridorSide): PlacedRoomSpec[] {
    const totalWidth = widthOf(specs);
    let cursorX = -totalWidth / 2;
    return specs.map((spec) => {
        const w = roomWidth(spec);
        const placed: PlacedRoomSpec = { spec, padded: { x1: cursorX, x2: cursorX + w, z1, z2 }, corridorSide };
        cursorX += w;
        return placed;
    });
}

/**
 * Estira las salas de cada fila para que abarquen TODO el ancho del edificio
 * (`[x1, x2]`). El cascarón es un rectángulo al ancho de la fila más ancha, así
 * que las filas angostas dejaban "bolsillos" de piso vacío en los costados. El
 * sobrante de cada fila se reparte proporcional al ancho de cada sala (las salas
 * grandes absorben más; los prefabs pequeños se inflan poco) y las salas vuelven
 * a embaldosarse contiguas desde `x1`. Muta `padded` in-place (antes de construir
 * RoomInfo/placements, para que el mobiliario se recentre en la sala ya ensanchada).
 */
function justifyRowsToWidth(placed: PlacedRoomSpec[], x1: number, x2: number): void {
    const target = x2 - x1;
    const byRow = new Map<string, PlacedRoomSpec[]>();
    for (const p of placed) {
        const key = `${p.padded.z1.toFixed(2)}|${p.padded.z2.toFixed(2)}`;
        const row = byRow.get(key);
        if (row) row.push(p); else byRow.set(key, [p]);
    }
    for (const row of byRow.values()) {
        row.sort((a, b) => a.padded.x1 - b.padded.x1);
        const totalW = row.reduce((sum, p) => sum + (p.padded.x2 - p.padded.x1), 0);
        const slack = target - totalW;
        if (slack < 0.02) continue;
        let cursorX = x1;
        for (const p of row) {
            const newW = (p.padded.x2 - p.padded.x1) + slack * ((p.padded.x2 - p.padded.x1) / totalW);
            p.padded.x1 = cursorX;
            p.padded.x2 = cursorX + newW;
            cursorX += newW;
        }
    }
}

function buildDoubleLoadedLayout(ordered: RoomSpec[]): { placed: PlacedRoomSpec[]; corridorLines: CorridorLine[]; hallways: BuildingLayout['hallways'] } {
    const [northRow = [], southRow = []] = splitBalanced(ordered, 2);
    const north = layoutRow(northRow, HALLWAY_DEPTH / 2, HALLWAY_DEPTH / 2 + CELL_DEPTH, 'south');
    const south = layoutRow(southRow, -HALLWAY_DEPTH / 2 - CELL_DEPTH, -HALLWAY_DEPTH / 2, 'north');
    const placed = [...north, ...south];
    const x1 = Math.min(...placed.map(p => p.padded.x1));
    const x2 = Math.max(...placed.map(p => p.padded.x2));
    return {
        placed,
        corridorLines: [
            { x1, x2, z: HALLWAY_DEPTH / 2, side: 'south' },
            { x1, x2, z: -HALLWAY_DEPTH / 2, side: 'north' },
        ],
        hallways: [{ x1, x2, z1: -HALLWAY_DEPTH / 2, z2: HALLWAY_DEPTH / 2 }],
    };
}

function buildGridLayout(ordered: RoomSpec[]): { placed: PlacedRoomSpec[]; corridorLines: CorridorLine[]; hallways: BuildingLayout['hallways'] } {
    const rowCount = Math.min(3, Math.max(2, Math.ceil(Math.sqrt(ordered.length))));
    const rows = splitBalanced(ordered, rowCount);
    const placed: PlacedRoomSpec[] = [];
    const corridorLines: CorridorLine[] = [];
    const hallways: BuildingLayout['hallways'] = [];
    const pairs = Math.floor(rows.length / 2);
    const hasSingle = rows.length % 2 === 1;
    const totalDepth = pairs * (CELL_DEPTH * 2 + HALLWAY_DEPTH) + (hasSingle ? CELL_DEPTH + HALLWAY_DEPTH : 0);
    let cursorZ = -totalDepth / 2;

    for (let i = 0; i < rows.length; i += 2) {
        const lowerRow = rows[i];
        const upperRow = rows[i + 1];

        if (!upperRow) {
            const rowPlaced = layoutRow(lowerRow, cursorZ + HALLWAY_DEPTH, cursorZ + HALLWAY_DEPTH + CELL_DEPTH, 'south');
            placed.push(...rowPlaced);
            const x1 = Math.min(...rowPlaced.map(p => p.padded.x1));
            const x2 = Math.max(...rowPlaced.map(p => p.padded.x2));
            corridorLines.push({ x1, x2, z: cursorZ + HALLWAY_DEPTH, side: 'south' });
            hallways.push({ x1, x2, z1: cursorZ, z2: cursorZ + HALLWAY_DEPTH });
            cursorZ += CELL_DEPTH + HALLWAY_DEPTH;
            continue;
        }

        const lowerPlaced = layoutRow(lowerRow, cursorZ, cursorZ + CELL_DEPTH, 'north');
        const upperPlaced = layoutRow(upperRow, cursorZ + CELL_DEPTH + HALLWAY_DEPTH, cursorZ + CELL_DEPTH + HALLWAY_DEPTH + CELL_DEPTH, 'south');
        placed.push(...lowerPlaced, ...upperPlaced);
        const pairPlaced = [...lowerPlaced, ...upperPlaced];
        const x1 = Math.min(...pairPlaced.map(p => p.padded.x1));
        const x2 = Math.max(...pairPlaced.map(p => p.padded.x2));
        corridorLines.push(
            { x1, x2, z: cursorZ + CELL_DEPTH, side: 'north' },
            { x1, x2, z: cursorZ + CELL_DEPTH + HALLWAY_DEPTH, side: 'south' },
        );
        hallways.push({ x1, x2, z1: cursorZ + CELL_DEPTH, z2: cursorZ + CELL_DEPTH + HALLWAY_DEPTH });
        cursorZ += CELL_DEPTH * 2 + HALLWAY_DEPTH;
    }

    return { placed, corridorLines, hallways };
}

function computeSceneLayout(builder: BuilderLike, ecs: EcsLike, zonaActual: number | null): SceneLayout {
    if (zonaActual === null || !builder) return EMPTY;
    const entidadZona = builder.obtenerEntidadZonaPorId(zonaActual);
    if (entidadZona === undefined) return EMPTY;

    const zonaNombre = builder.obtenerZonas?.()?.find(z => z.id === zonaActual)?.nombre ?? '';
    const jerarquia = builder.getSistemaJerarquia();

    // 1. Recolecta las oficinas reales con su contenido.
    const realSpecs: RealSpec[] = [];
    for (const oficinaId of jerarquia.obtenerOficinasDeZona(entidadZona)) {
        const espaciosIds = jerarquia.obtenerEspaciosDeOficina(oficinaId);
        if (espaciosIds.length === 0) continue;

        const espacios: EspacioReal[] = [];
        const deviceTypes: string[] = [];
        for (const espacioId of espaciosIds) {
            const dispositivoIds = jerarquia.obtenerDispositivosDeEspacio(espacioId);
            for (const dispId of dispositivoIds) {
                const tipo = ecs.getComponentes(dispId)?.get(DispositivoComponent)?.tipo;
                if (tipo) deviceTypes.push(String(tipo));
            }
            const dispositivos = dispositivoIds.map(id => ({
                id,
                tipo: String(ecs.getComponentes(id)?.get(DispositivoComponent)?.tipo ?? ''),
            }));
            espacios.push({ espacioId, dispositivos });
        }

        const nombre = ecs.getComponentes(oficinaId)?.get(OficinaComponent)?.nombre ?? `Oficina ${oficinaId}`;
        realSpecs.push({
            oficinaId, nombre, deviceTypes, espacios,
            tipo: inferRoomTheme(nombre, zonaNombre, deviceTypes),
            // Ancho exacto para una fila de N escritorios (+ margen a paredes),
            // sin inflar la sala a celdas completas como los prefabs decorativos.
            width: Math.max(CELL_WIDTH, espacios.length * SLOT_W + 2 * FURN_MARGIN),
        });
    }
    if (realSpecs.length === 0) return EMPTY;

    // 2. Salas decorativas (prefabs) según el arquetipo de la zona.
    const rng = mulberry32(seedFromId(zonaActual));
    const arch = chooseArchetype(dominantTheme(realSpecs.map(s => s.tipo)), rng);
    const total = rngInt(rng, arch.rooms.min, arch.rooms.max);
    const decoSpecs: DecoSpec[] = [];
    for (let i = 0; i < total; i++) {
        const prefab = getPrefab(pick(rng, arch.prefabs));
        decoSpecs.push({ oficinaId: -(i + 1), tipo: prefab.theme, prefabId: prefab.id, wCells: prefab.wCells, nombre: pick(rng, SYNTH_NOMBRES[prefab.theme]) });
    }

    // 3. Fila: mitad decorativas a la izquierda, reales al centro, resto a la derecha.
    const half = Math.floor(decoSpecs.length / 2);
    const ordered: RoomSpec[] = [
        ...decoSpecs.slice(0, half).map(d => ({ ...d, real: false as const })),
        ...realSpecs.map(r => ({ ...r, real: true as const })),
        ...decoSpecs.slice(half).map(d => ({ ...d, real: false as const })),
    ];

    // 4. Asigna X (fila centrada en el origen) y banda Z común (edificio centrado).
    const variant = pick(rng, FLOOR_PLAN_VARIANTS);
    const planned = variant === 'double-loaded'
        ? buildDoubleLoadedLayout(ordered)
        : buildGridLayout(ordered);

    // Justifica cada fila al ancho del edificio para eliminar los bolsillos de
    // piso vacío que dejaban las filas más angostas dentro del rectángulo exterior.
    const bx1 = Math.min(...planned.placed.map(p => p.padded.x1));
    const bx2 = Math.max(...planned.placed.map(p => p.padded.x2));
    justifyRowsToWidth(planned.placed, bx1, bx2);
    // Tras justificar, toda fila abarca [bx1, bx2]: pasillos y corredor también.
    for (const line of planned.corridorLines) { line.x1 = bx1; line.x2 = bx2; }
    for (const h of planned.hallways) { h.x1 = bx1; h.x2 = bx2; }

    const rooms: RoomInfo[] = [];
    const placements = new Map<Entidad, EntityPlacement>();
    for (const { spec, padded, corridorSide } of planned.placed) {
        rooms.push(buildRoom(spec, padded, corridorSide));
        if (spec.real) layoutRealOffice(spec, padded, corridorSide, placements);
    }

    // 5. Envolvente, corredor, particiones, pasillos.
    const padded = rooms.map(r => ({ ...r.padded, sintetico: !!r.sintetico }));
    const x1 = Math.min(...padded.map(o => o.x1));
    const x2 = Math.max(...padded.map(o => o.x2));
    const z1 = Math.min(...padded.map(o => o.z1), ...planned.hallways.map(h => h.z1));
    const z2 = Math.max(...padded.map(o => o.z2), ...planned.hallways.map(h => h.z2));
    const bldg: BuildingBounds = { x1, x2, z1, z2 };
    const officeBldg: BuildingBounds = {
        x1,
        x2,
        z1: Math.min(...padded.map(o => o.z1)),
        z2: Math.max(...padded.map(o => o.z2)),
    };
    const rowLines = planned.corridorLines.map(line => Number(line.z.toFixed(2)));
    const corridorWall = mergeCorridorWalls(planned.corridorLines.map(line =>
        generateCorridorWall(padded, line.x1, line.x2, line.z, line.side),
    ));
    const internalWalls = rooms.length > 1 ? computeInternalWalls(padded, officeBldg, rowLines) : [];
    const hallways = planned.hallways;

    return {
        rooms, bldg, officeBldg, officeFrontZ: rowLines[0] ?? 0, corridorWall, internalWalls, hallways,
        theme: dominantTheme(realSpecs.map(s => s.tipo)),
        placements,
    };
}

// ─── Memo por (builder, zona): el layout es estable tras la inicialización. ───
const cache = new WeakMap<object, Map<number | null, SceneLayout>>();

export function getSceneLayout(builder: BuilderLike | null | undefined, ecs: EcsLike, zonaActual: number | null): SceneLayout {
    if (!builder) return EMPTY;
    let byZona = cache.get(builder);
    if (!byZona) { byZona = new Map(); cache.set(builder, byZona); }
    const hit = byZona.get(zonaActual);
    if (hit) return hit;
    const layout = computeSceneLayout(builder, ecs, zonaActual);
    // No cachear el vacío: las entidades pueden no estar listas en el primer render.
    if (layout.rooms.length > 0) byZona.set(zonaActual, layout);
    return layout;
}
