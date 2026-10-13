import { useMemo } from 'react';
import { useECSSceneContext } from '../context/ECSSceneContext';
import { getSceneLayout, type BuildingLayout } from './sceneLayout';

// Re-exporta tipos y constantes del motor de layout para los consumidores
// existentes (OfficeWalls, SceneDressing, OfficeRoom, etc.).
export type {
    RoomTheme, OfficeBounds, PaddedBounds, RoomInfo, WallSegment, DoorLeaf,
    CorridorWallResult, BuildingBounds, BuildingLayout, EntityPlacement, SceneLayout,
} from './sceneLayout';
export {
    WALL_HEIGHT, WALL_THICKNESS, CEILING_Y, HALLWAY_DEPTH, DOOR_WIDTH, DOOR_HEIGHT,
    PARTITION_SOLID_H, ROOM_PADDING,
} from './sceneLayout';

/**
 * Geometría del edificio (footprints de salas, envolvente, corredor, particiones)
 * derivada por el motor de layout. Fuente única para OfficeWalls, SceneDressing y
 * la iluminación. El posicionamiento de las entidades reales lo deriva el mismo
 * motor (ver sceneLayout) y lo consume el renderer.
 */
export function useBuildingLayout(): BuildingLayout {
    const { builder, ecsManager, zonaActual } = useECSSceneContext();
    return useMemo(
        () => getSceneLayout(builder, ecsManager, zonaActual),
        [builder, ecsManager, zonaActual],
    );
}
