import type { RoomTheme } from '../hooks/sceneLayout';

/**
 * Paleta y parámetros de ambiente por tipo de sala. El tema se infiere en
 * useBuildingLayout a partir del nombre de la oficina/zona y los dispositivos;
 * aquí se traduce a colores y luz para que cada escenario tenga identidad propia
 * sin tocar el schema del escenario.
 */
export interface RoomPalette {
    wall: string;          // muros
    floor: string;         // piso de la oficina
    accent: string;        // rodapié / detalles
    rug: string;           // alfombra (si aplica)
    plantFoliage: string;  // follaje de plantas decorativas
    light: string;         // tinte de las luminarias de techo
    lightIntensity: number;
}

/** Ambiente global de la zona: cielo, suelo exterior, edificios vecinos y luz. */
export interface ZoneAmbience {
    background: string;       // color de fondo / cielo
    ground: string;           // suelo exterior (campus / calle)
    neighbor: string;         // edificios vecinos
    ambientIntensity: number; // luz ambiente
    keyIntensity: number;     // luz direccional principal
    keyColor: string;
    isNight: boolean;
}

const ROOM_PALETTES: Record<RoomTheme, RoomPalette> = {
    office: {
        wall: '#eceae6', floor: '#cdb89a', accent: '#9c8f7e',
        rug: '#6f8aa3', plantFoliage: '#4f7a4a', light: '#fff6e8', lightIntensity: 1.0,
    },
    legal: {
        wall: '#e7ded0', floor: '#7c5436', accent: '#5c3f28',
        rug: '#7d2c2c', plantFoliage: '#3f6b3a', light: '#ffeccb', lightIntensity: 0.95,
    },
    classroom: {
        wall: '#eef0f1', floor: '#b9c2c7', accent: '#8a949a',
        rug: '#5a7d8c', plantFoliage: '#4f7a4a', light: '#f4f8ff', lightIntensity: 1.1,
    },
    datacenter: {
        wall: '#3a4048', floor: '#2c3138', accent: '#1d2127',
        rug: '#23272e', plantFoliage: '#3f6b3a', light: '#cfe6ff', lightIntensity: 0.85,
    },
    home: {
        wall: '#e9e0d4', floor: '#a9794f', accent: '#7d5c3c',
        rug: '#9c5b46', plantFoliage: '#4f7a4a', light: '#ffe7c2', lightIntensity: 0.9,
    },
    hacker: {
        wall: '#23262e', floor: '#1a1c22', accent: '#0f1116',
        rug: '#15171d', plantFoliage: '#2f6b4a', light: '#7fd0ff', lightIntensity: 0.7,
    },
};

const ZONE_AMBIENCES: Record<RoomTheme, ZoneAmbience> = {
    office: {
        background: '#cfe0ec', ground: '#9aa68f', neighbor: '#b9c2c9',
        ambientIntensity: 0.55, keyIntensity: 1.5, keyColor: '#fff4e2', isNight: false,
    },
    legal: {
        background: '#c6d2dc', ground: '#8f9483', neighbor: '#aeb2b6',
        ambientIntensity: 0.5, keyIntensity: 1.45, keyColor: '#fff0d8', isNight: false,
    },
    classroom: {
        background: '#d4e4ef', ground: '#9aa68f', neighbor: '#c2cbd1',
        ambientIntensity: 0.6, keyIntensity: 1.55, keyColor: '#fbfdff', isNight: false,
    },
    datacenter: {
        background: '#0e1218', ground: '#15191f', neighbor: '#1b2026',
        ambientIntensity: 0.35, keyIntensity: 0.7, keyColor: '#cfe6ff', isNight: true,
    },
    home: {
        background: '#b9cad6', ground: '#8f9483', neighbor: '#a9b0b4',
        ambientIntensity: 0.5, keyIntensity: 1.3, keyColor: '#ffe9cb', isNight: false,
    },
    hacker: {
        background: '#08090d', ground: '#0d0f14', neighbor: '#14171e',
        ambientIntensity: 0.28, keyIntensity: 0.5, keyColor: '#9fb8ff', isNight: true,
    },
};

export const getRoomPalette = (tema: RoomTheme): RoomPalette =>
    ROOM_PALETTES[tema] ?? ROOM_PALETTES.office;

export const getZoneAmbience = (tema: RoomTheme): ZoneAmbience =>
    ZONE_AMBIENCES[tema] ?? ZONE_AMBIENCES.office;
