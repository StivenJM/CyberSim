import { useMemo } from "react";
import type { Edge } from "@xyflow/react";
import type { TopologiaNode } from "../types/redTypes";
import {
  generarNodos,
  generarAristas,
  type Topologia,
  type LayoutConfig,
} from "../utils/topologiaLayout";

export function useTopologiaLayout(
  topologia: Topologia,
  layoutConfig?: Partial<LayoutConfig>
) {
  const nodes: TopologiaNode[] = useMemo(
    () => generarNodos(topologia, layoutConfig),
    [topologia, layoutConfig]
  );

  const edges: Edge[] = useMemo(() => generarAristas(topologia), [topologia]);

  return { nodes, edges };
}
