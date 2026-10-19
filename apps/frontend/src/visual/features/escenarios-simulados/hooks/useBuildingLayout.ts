import { useMemo } from 'react'
import { useECSSceneContext } from '../context/ECSSceneContext'
import { type BuildingLayout, getSceneLayout } from './sceneLayout'

// Re-exporta tipos y constantes del motor de layout para los consumidores
// existentes (OfficeWalls, SceneDressing, OfficeRoom, etc.).
export type {
	BuildingBounds,
	BuildingLayout,
	CorridorWallResult,
	DoorLeaf,
	EntityPlacement,
	OfficeBounds,
	PaddedBounds,
	RoomInfo,
	RoomTheme,
	SceneLayout,
	WallSegment,
} from './sceneLayout'
export {
	CEILING_Y,
	DOOR_HEIGHT,
	DOOR_WIDTH,
	HALLWAY_DEPTH,
	PARTITION_SOLID_H,
	ROOM_PADDING,
	WALL_HEIGHT,
	WALL_THICKNESS,
} from './sceneLayout'

/**
 * Geometría del edificio (footprints de salas, envolvente, corredor, particiones)
 * derivada por el motor de layout. Fuente única para OfficeWalls, SceneDressing y
 * la iluminación. El posicionamiento de las entidades reales lo deriva el mismo
 * motor (ver sceneLayout) y lo consume el renderer.
 */
export function useBuildingLayout(): BuildingLayout {
	const { builder, ecsManager, zonaActual } = useECSSceneContext()
	return useMemo(
		() => getSceneLayout(builder, ecsManager, zonaActual),
		[builder, ecsManager, zonaActual],
	)
}
