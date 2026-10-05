import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { RoomInfo } from '../hooks/useBuildingLayout';
import { getRoomPalette } from '../config/roomThemes';

const OFFICE_FLOOR_Y = 0.02;

interface OfficeRoomProps {
    room: RoomInfo;
}

/**
 * Renderiza el piso diferenciado y la etiqueta de una oficina. Las paredes las
 * maneja OfficeWalls (edificio unificado). El color del piso y de la etiqueta
 * sale de la paleta del tema inferido para la sala.
 */
const OfficeRoom: React.FC<OfficeRoomProps> = React.memo(({ room }) => {
    const { centerX, centerZ, width, depth, tipo } = room;
    const palette = getRoomPalette(tipo);

    const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: palette.floor,
        roughness: 0.75,
        metalness: 0.04,
        // Evita z-fighting con el piso del edificio (coplanares): este dibuja encima.
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
    }), [palette.floor]);

    useEffect(() => () => floorMaterial.dispose(), [floorMaterial]);

    return (
        <group name={`office-floor-${room.oficinaId}`}>
            <mesh
                position={[centerX, OFFICE_FLOOR_Y, centerZ]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
                material={floorMaterial}
            >
                <planeGeometry args={[width - 0.06, depth - 0.06]} />
            </mesh>
        </group>
    );
});

OfficeRoom.displayName = 'OfficeRoom';

export default OfficeRoom;
