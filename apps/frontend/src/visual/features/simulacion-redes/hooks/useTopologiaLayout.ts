import type { Edge } from '@xyflow/react'
import { useMemo } from 'react'
import type { TopologiaNode } from '../types/redTypes'
import {
	generarAristas,
	generarNodos,
	type LayoutConfig,
	type Topologia,
} from '../utils/topologiaLayout'

export function useTopologiaLayout(
	topologia: Topologia,
	layoutConfig?: Partial<LayoutConfig>,
) {
	const nodes: TopologiaNode[] = useMemo(
		() => generarNodos(topologia, layoutConfig),
		[topologia, layoutConfig],
	)

	const edges: Edge[] = useMemo(() => generarAristas(topologia), [topologia])

	return { nodes, edges }
}
