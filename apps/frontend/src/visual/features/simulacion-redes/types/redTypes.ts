import type { Node } from '@xyflow/react'
import type { Entidad } from '../../../../ecs/core/Componente'
import type { TipoDispositivo } from '../../../../shared/types/DeviceEnums'

interface DeviceNodeData extends Record<string, unknown> {
	label: string
	tipo: TipoDispositivo | 'Internet'
	redes?: { nombre: string; color: string }[]
	entidadId?: Entidad
	conectado?: boolean
}

interface GroupNodeData extends Record<string, unknown> {
	label: string
}

export type DeviceFlowNode = Node<DeviceNodeData, 'device'>
export type GroupFlowNode = Node<GroupNodeData, 'group'>
export type TopologiaNode = DeviceFlowNode | GroupFlowNode

/**
 * Representación UI de una red del ECS.
 * `estaActiva` solo aplica en el contexto de un dispositivo: indica si ese
 * dispositivo está conectado a la red. En otros contextos (ej. listado
 * de redes de un router) el campo se omite.
 */
export interface RedInfo {
	entidadId: Entidad
	nombre: string
	color: string
	estaActiva?: boolean
}
