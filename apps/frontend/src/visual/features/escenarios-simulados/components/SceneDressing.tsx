import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
    useBuildingLayout,
    CEILING_Y,
    type RoomInfo,
    type BuildingBounds,
} from '../hooks/useBuildingLayout';
import { getRoomPalette, getZoneAmbience } from '../config/roomThemes';
import { mulberry32, seedFromId } from '../utils/seededRandom';

// ═══════════════════════════════════════════════════════════
// ═══ DECORADO POR SALA ═══
// ═══════════════════════════════════════════════════════════

const conPlantas = (tipo: RoomInfo['tipo']) =>
    tipo === 'office' || tipo === 'legal' || tipo === 'home' || tipo === 'classroom';
const conAlfombra = (tipo: RoomInfo['tipo']) =>
    tipo === 'office' || tipo === 'legal' || tipo === 'home';
// Solo una fracción de las salas elegibles lleva plantas (determinista por sala).
const conPlantasEnSala = (room: RoomInfo) =>
    conPlantas(room.tipo) && mulberry32(seedFromId(room.oficinaId) ^ 0x9e3779b9)() < 0.4;

/**
 * Viste una oficina con luz interior, luminaria de techo, alfombra y plantas según
 * el tema inferido. Render-only: nunca toca el ECS ni la vista de topología.
 */
const RoomDecor: React.FC<{ room: RoomInfo }> = React.memo(({ room }) => {
    const { padded, centerX, centerZ, width, depth, tipo } = room;
    const palette = getRoomPalette(tipo);

    const mats = useMemo(() => ({
        rug: new THREE.MeshStandardMaterial({
            color: palette.rug, roughness: 0.95, metalness: 0,
            polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6,
        }),
        pot: new THREE.MeshStandardMaterial({ color: '#8a6a4a', roughness: 0.8 }),
        foliage: new THREE.MeshStandardMaterial({ color: palette.plantFoliage, roughness: 0.85 }),
    }), [palette.rug, palette.plantFoliage]);

    useEffect(() => () => { Object.values(mats).forEach(m => m.dispose()); }, [mats]);

    // Esquinas para plantas (inset desde el padding).
    const inset = 0.55;
    const corners: [number, number][] = [
        [padded.x1 + inset, padded.z2 - inset],
        [padded.x2 - inset, padded.z2 - inset],
    ];

    return (
        <group name={`decor-${room.oficinaId}`}>
            {/* Luz interior cálida/fría según tema (sin sombras, barata). Las salas
                sintéticas la omiten para acotar el número de luces: se apoyan en la
                luz ambiente/direccional global. */}
            {!room.sintetico && (
                <pointLight
                    position={[centerX, CEILING_Y - 0.35, centerZ]}
                    color={palette.light}
                    intensity={palette.lightIntensity}
                    distance={Math.max(width, depth) * 1.8}
                    decay={2}
                />
            )}

            {/* Alfombra bajo el área de escritorios */}
            {conAlfombra(tipo) && (
                <mesh position={[centerX, 0.025, centerZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mats.rug}>
                    <planeGeometry args={[width * 0.62, depth * 0.55]} />
                </mesh>
            )}

            {/* Plantas en esquinas (solo en algunas salas) */}
            {conPlantasEnSala(room) && corners.map(([x, z], i) => (
                <group key={`plant-${i}`} position={[x, 0, z]}>
                    <mesh position={[0, 0.18, 0]} material={mats.pot} castShadow>
                        <cylinderGeometry args={[0.16, 0.12, 0.36, 10]} />
                    </mesh>
                    <mesh position={[0, 0.62, 0]} material={mats.foliage} castShadow>
                        <icosahedronGeometry args={[0.32, 1]} />
                    </mesh>
                </group>
            ))}
        </group>
    );
});
RoomDecor.displayName = 'RoomDecor';

// ═══════════════════════════════════════════════════════════
// ═══ SHELLS DE CONTEXTO (entorno alrededor del edificio) ═══
// ═══════════════════════════════════════════════════════════

const ContextShells: React.FC<{ bldg: BuildingBounds; theme: RoomInfo['tipo'] }> = ({ bldg, theme }) => {
    const amb = getZoneAmbience(theme);

    const groundMat = useMemo(
        () => new THREE.MeshStandardMaterial({ color: amb.ground, roughness: 0.97, metalness: 0 }),
        [amb.ground],
    );

    useEffect(() => () => groundMat.dispose(), [groundMat]);

    const cx = (bldg.x1 + bldg.x2) / 2;
    const cz = (bldg.z1 + bldg.z2) / 2;

    return (
        <group name="context-shells">
            {/* Suelo exterior amplio (campus / calle). Sin edificios vecinos: el
                horizonte se difumina con la niebla hacia el color del cielo. */}
            <mesh position={[cx, -0.05, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={groundMat}>
                <planeGeometry args={[200, 200]} />
            </mesh>
        </group>
    );
};

// ═══════════════════════════════════════════════════════════
// ═══ COMPONENTE PRINCIPAL ═══
// ═══════════════════════════════════════════════════════════

/**
 * Capa de ambientación de la escena: cielo/niebla, suelo exterior, edificios
 * vecinos y decorado interior por sala. Es puramente visual y vive en el render;
 * no crea entidades ECS, por lo que nunca aparece en la vista de redes/topología.
 */
const SceneDressing: React.FC = () => {
    const { rooms, bldg, theme } = useBuildingLayout();
    const amb = getZoneAmbience(theme);

    if (!bldg) return null;

    const cx = (bldg.x1 + bldg.x2) / 2;
    const cz = (bldg.z1 + bldg.z2) / 2;
    const ext = Math.max(bldg.x2 - bldg.x1, bldg.z2 - bldg.z1) * 0.85 + 5;

    return (
        <>
            {/* Cielo y niebla (oculta los bordes lejanos y da profundidad) */}
            <color attach="background" args={[amb.background]} />
            <fog attach="fog" args={[amb.background, 30, 95]} />

            {/* Luz principal tematizada, con sombras y frustum ajustado al edificio */}
            <ambientLight intensity={amb.ambientIntensity} color={amb.background} />
            <directionalLight
                position={[cx + ext * 0.7, ext * 1.5, cz + ext]}
                intensity={amb.keyIntensity}
                color={amb.keyColor}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0004}
                shadow-normalBias={0.025}
                shadow-camera-near={0.5}
                shadow-camera-far={ext * 4}
                shadow-camera-left={-ext}
                shadow-camera-right={ext}
                shadow-camera-top={ext}
                shadow-camera-bottom={-ext}
            />

            <ContextShells bldg={bldg} theme={theme} />

            {rooms.map((room) => (
                <RoomDecor key={`decor-${room.oficinaId}`} room={room} />
            ))}
        </>
    );
};

export default SceneDressing;
