import React, { useMemo } from 'react';
import { useBuildingLayout } from '../hooks/useBuildingLayout';
import Model3D from './Model3D';
import { PROCEDURAL_PREFIX } from './procedural/proceduralModels';
import { mulberry32, seedFromId } from '../utils/seededRandom';
import { type PlacedProp } from '../config/roomProps';
import { getPrefab } from '../config/roomPrefabs';

/**
 * Props decorativos: amuebla SOLO las salas sintéticas según su PREFAB. Las salas
 * reales se dejan a sus dispositivos del ECS para no mezclar equipo decorativo con
 * los dispositivos interactuables (confunde al usuario). Render-only, determinista
 * (sembrado por oficina); nunca crea entidades ECS. Cada prop se dibuja con Model3D
 * igual que las entidades reales (misma caché y orientación), pero inerte (sin hover
 * ni click).
 */

const PropInstance: React.FC<{ prop: PlacedProp }> = ({ prop }) => (
  <Model3D
    modelPath={`${PROCEDURAL_PREFIX}${prop.kind}`}
    position={prop.position}
    rotation={[0, prop.rotationY, 0]}
    scale={prop.scale}
    enableHover={false}
  />
);

const SceneProps: React.FC = () => {
  const { rooms } = useBuildingLayout();

  const items = useMemo(
    () =>
      rooms.flatMap((room) => {
        if (!room.sintetico || !room.prefabId) return [];
        const rng = mulberry32(seedFromId(room.oficinaId));
        return getPrefab(room.prefabId).furnish(room, rng);
      }),
    [rooms],
  );

  if (items.length === 0) return null;

  return (
    <group name="scene-props">
      {items.map((prop) => (
        <PropInstance key={prop.id} prop={prop} />
      ))}
    </group>
  );
};

export default SceneProps;
