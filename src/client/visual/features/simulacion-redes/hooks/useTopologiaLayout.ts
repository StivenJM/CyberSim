import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
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
  const nodes: Node[] = useMemo(
    () => generarNodos(topologia, layoutConfig),
    [topologia, layoutConfig]
  );

  const edges: Edge[] = useMemo(() => generarAristas(topologia), [topologia]);

  return { nodes, edges };
}
