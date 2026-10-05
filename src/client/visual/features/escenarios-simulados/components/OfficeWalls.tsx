import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import OfficeRoom from './OfficeRoom';
import {
    useBuildingLayout,
    WALL_HEIGHT,
    WALL_THICKNESS,
    type WallSegment,
} from '../hooks/useBuildingLayout';
import { getRoomPalette } from '../config/roomThemes';

const BUILDING_FLOOR_Y = 0.01;
const HALLWAY_FLOOR_Y = 0.012;
const BASEBOARD_H = 0.1;
const CORNICE_H = 0.06;
const FACADE_MULLION_STEP = 1.6;

// Caja de pared reutilizable. Definida a nivel de módulo (no dentro del render de
// OfficeWalls) para que su identidad de componente sea estable: si se declarara
// inline, React la trataría como un tipo nuevo en cada render y desmontaría/
// remontaría todo el subárbol de paredes al cambiar de zona.
const Box: React.FC<{
    seg: WallSegment;
    material: THREE.Material;
    castShadow?: boolean;
    receiveShadow?: boolean;
    renderOrder?: number;
}> = ({ seg, material, ...rest }) => (
    <mesh position={seg.position} material={material} {...rest}>
        <boxGeometry args={seg.size} />
    </mesh>
);

/**
 * Edificio unificado de la zona: piso, pasillo, paredes exteriores (incluida una
 * fachada acristalada frontal que cierra la caja), fachada de vidrio del corredor
 * con puertas y hojas reales, particiones internas y, por oficina, su piso y
 * etiqueta. Toda la geometría proviene de useBuildingLayout; la paleta, del tema
 * inferido para la zona. Antes era un cuarto abierto "flotando"; ahora se lee
 * como un edificio cerrado y coherente.
 */
const OfficeWalls: React.FC = () => {
    const { rooms, bldg, corridorWall, internalWalls, hallways, theme } = useBuildingLayout();
    const palette = getRoomPalette(theme);

    // ═══ MATERIALES (tematizados + con disposal) ═══
    const mats = useMemo(() => ({
        wall: new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.9, metalness: 0.02 }),
        partition: new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.92, metalness: 0.02 }),
        buildingFloor: new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.9, metalness: 0.02 }),
        corridorFloor: new THREE.MeshStandardMaterial({
            color: palette.floor, roughness: 0.35, metalness: 0.06,
            polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
        }),
        frame: new THREE.MeshStandardMaterial({ color: '#3c4046', roughness: 0.35, metalness: 0.7 }),
        glass: new THREE.MeshPhysicalMaterial({
            color: theme === 'hacker' || theme === 'datacenter' ? '#1f2b33' : '#cfe2ec',
            transparent: true, opacity: 0.22, roughness: 0.06, metalness: 0,
            envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false,
        }),
        doorLeaf: new THREE.MeshStandardMaterial({
            color: theme === 'legal' || theme === 'home' ? '#6e4a2c' : '#c9ccd2',
            roughness: 0.55, metalness: theme === 'legal' || theme === 'home' ? 0.1 : 0.3,
        }),
        handle: new THREE.MeshStandardMaterial({ color: '#cfd3d8', roughness: 0.2, metalness: 0.95 }),
        baseboard: new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.6, metalness: 0.1 }),
        cornice: new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.7, metalness: 0.05 }),
    }), [palette.wall, palette.accent, palette.floor, theme]);

    useEffect(() => () => { Object.values(mats).forEach(m => m.dispose()); }, [mats]);

    // Fachada frontal acristalada: posición de los montantes verticales.
    const facadeMullions = useMemo(() => {
        if (!bldg) return [];
        const xs: number[] = [];
        const n = Math.max(1, Math.round((bldg.x2 - bldg.x1) / FACADE_MULLION_STEP));
        for (let i = 1; i < n; i++) xs.push(bldg.x1 + ((bldg.x2 - bldg.x1) * i) / n);
        return xs;
    }, [bldg]);

    if (!bldg) return null;

    const w = bldg.x2 - bldg.x1;
    const d = bldg.z2 - bldg.z1;
    const cx = (bldg.x1 + bldg.x2) / 2;
    const cz = (bldg.z1 + bldg.z2) / 2;
    const hh = WALL_HEIGHT / 2;

    return (
        <group name="building">
            {/* ═══ PISO DEL EDIFICIO ═══ */}
            <mesh position={[cx, BUILDING_FLOOR_Y, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mats.buildingFloor}>
                <planeGeometry args={[w, d]} />
            </mesh>

            {/* ═══ PISOS DE PASILLO (uno por fila de salas) ═══ */}
            {hallways.map((h, i) => (
                <mesh
                    key={`hall-${i}`}
                    position={[(h.x1 + h.x2) / 2, HALLWAY_FLOOR_Y, (h.z1 + h.z2) / 2]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                    material={mats.corridorFloor}
                >
                    <planeGeometry args={[h.x2 - h.x1 - 0.02, h.z2 - h.z1 - 0.02]} />
                </mesh>
            ))}

            {/* ═══ PAREDES EXTERIORES ═══ */}
            {/* Trasera */}
            <mesh position={[cx, hh, bldg.z2]} material={mats.wall} castShadow receiveShadow>
                <boxGeometry args={[w + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
            </mesh>
            {/* Izquierda */}
            <mesh position={[bldg.x1, hh, cz]} material={mats.wall} castShadow receiveShadow>
                <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, d + WALL_THICKNESS]} />
            </mesh>
            {/* Derecha */}
            <mesh position={[bldg.x2, hh, cz]} material={mats.wall} castShadow receiveShadow>
                <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, d + WALL_THICKNESS]} />
            </mesh>

            {/* ═══ FACHADA FRONTAL ACRISTALADA (cierra la caja sin tapar la vista) ═══ */}
            {/* Vidrio de fachada */}
            <mesh position={[cx, hh, bldg.z1]} material={mats.glass} renderOrder={1}>
                <boxGeometry args={[w, WALL_HEIGHT, 0.02]} />
            </mesh>
            {/* Zócalo y dintel de la fachada */}
            <mesh position={[cx, 0.18, bldg.z1]} material={mats.frame}>
                <boxGeometry args={[w + WALL_THICKNESS, 0.36, WALL_THICKNESS + 0.04]} />
            </mesh>
            <mesh position={[cx, WALL_HEIGHT - 0.09, bldg.z1]} material={mats.frame}>
                <boxGeometry args={[w + WALL_THICKNESS, 0.18, WALL_THICKNESS + 0.04]} />
            </mesh>
            {/* Postes de esquina */}
            <mesh position={[bldg.x1, hh, bldg.z1]} material={mats.frame}>
                <boxGeometry args={[0.1, WALL_HEIGHT, 0.1]} />
            </mesh>
            <mesh position={[bldg.x2, hh, bldg.z1]} material={mats.frame}>
                <boxGeometry args={[0.1, WALL_HEIGHT, 0.1]} />
            </mesh>
            {/* Montantes verticales de la fachada */}
            {facadeMullions.map((x, i) => (
                <mesh key={`fm-${i}`} position={[x, hh, bldg.z1]} material={mats.frame}>
                    <boxGeometry args={[0.05, WALL_HEIGHT - 0.4, 0.06]} />
                </mesh>
            ))}

            {/* ═══ CORNISA SUPERIOR ═══ */}
            <mesh position={[cx, WALL_HEIGHT, bldg.z2]} material={mats.cornice}>
                <boxGeometry args={[w + WALL_THICKNESS * 3, CORNICE_H, WALL_THICKNESS + 0.08]} />
            </mesh>
            <mesh position={[bldg.x1, WALL_HEIGHT, cz]} material={mats.cornice}>
                <boxGeometry args={[WALL_THICKNESS + 0.08, CORNICE_H, d + WALL_THICKNESS * 3]} />
            </mesh>
            <mesh position={[bldg.x2, WALL_HEIGHT, cz]} material={mats.cornice}>
                <boxGeometry args={[WALL_THICKNESS + 0.08, CORNICE_H, d + WALL_THICKNESS * 3]} />
            </mesh>
            <mesh position={[cx, WALL_HEIGHT, bldg.z1]} material={mats.cornice}>
                <boxGeometry args={[w + WALL_THICKNESS * 3, CORNICE_H, WALL_THICKNESS + 0.08]} />
            </mesh>

            {/* ═══ RODAPIÉ INTERIOR ═══ */}
            <mesh position={[cx, BASEBOARD_H / 2, bldg.z2 - WALL_THICKNESS / 2 - 0.01]} material={mats.baseboard}>
                <boxGeometry args={[w, BASEBOARD_H, 0.04]} />
            </mesh>
            <mesh position={[bldg.x1 + WALL_THICKNESS / 2 + 0.01, BASEBOARD_H / 2, cz]} material={mats.baseboard}>
                <boxGeometry args={[0.04, BASEBOARD_H, d]} />
            </mesh>
            <mesh position={[bldg.x2 - WALL_THICKNESS / 2 - 0.01, BASEBOARD_H / 2, cz]} material={mats.baseboard}>
                <boxGeometry args={[0.04, BASEBOARD_H, d]} />
            </mesh>

            {/* ═══ PARED CORREDOR-OFICINA (SÓLIDO + VIDRIO + MARCOS + HOJAS) ═══ */}
            {corridorWall?.solidWalls.map((seg, i) => (
                <Box key={`cw-s-${i}`} seg={seg} material={mats.wall} castShadow receiveShadow />
            ))}
            {corridorWall?.glassWalls.map((seg, i) => (
                <Box key={`cw-g-${i}`} seg={seg} material={mats.glass} renderOrder={1} />
            ))}
            {corridorWall?.glassMullions.map((seg, i) => (
                <Box key={`cw-m-${i}`} seg={seg} material={mats.frame} />
            ))}
            {corridorWall?.doorFrames.map((seg, i) => (
                <Box key={`cw-f-${i}`} seg={seg} material={mats.frame} />
            ))}
            {corridorWall?.doorLeaves.map((leaf, i) => (
                <group key={`cw-l-${i}`} position={leaf.hinge} rotation={[0, leaf.openRad, 0]}>
                    <mesh position={[leaf.width / 2, leaf.height / 2 + 0.02, 0]} material={mats.doorLeaf} castShadow>
                        <boxGeometry args={[leaf.width, leaf.height, 0.05]} />
                    </mesh>
                    {/* Manija */}
                    <mesh position={[leaf.width - 0.12, leaf.height / 2, 0.05]} material={mats.handle}>
                        <boxGeometry args={[0.04, 0.16, 0.04]} />
                    </mesh>
                </group>
            ))}

            {/* ═══ PAREDES INTERNAS ═══ */}
            {internalWalls.map((seg, i) => (
                <Box key={`iw-${i}`} seg={seg} material={mats.partition} castShadow receiveShadow />
            ))}

            {/* ═══ PISOS Y ETIQUETAS POR OFICINA ═══ */}
            {rooms.map((room) => (
                <OfficeRoom key={`office-${room.oficinaId}`} room={room} />
            ))}
        </group>
    );
};

export default OfficeWalls;
