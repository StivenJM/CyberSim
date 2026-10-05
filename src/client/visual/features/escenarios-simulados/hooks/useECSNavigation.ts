import { useState, useCallback } from "react";

export function useECSNavigation() {
  const [zoomCommand, setZoomCommand] = useState<"in" | "out" | null>(null);
  const [dispositivoIndex, setDispositivoIndex] = useState(0);
  const [focusTarget, setFocusTarget] = useState<
    [number, number, number] | null
  >(null);
  // Posición del dispositivo a inspeccionar de cerca (router/switch). Cuando
  // es null la cámara vuelve a la vista general.
  const [inspectTarget, setInspectTarget] = useState<
    [number, number, number] | null
  >(null);

  const zoomIn = useCallback(() => setZoomCommand("in"), []);
  const zoomOut = useCallback(() => setZoomCommand("out"), []);
  const clearZoomCommand = useCallback(() => setZoomCommand(null), []);
  const clearFocusTarget = useCallback(() => setFocusTarget(null), []);
  const inspectDevice = useCallback(
    (pos: [number, number, number]) => setInspectTarget(pos),
    []
  );
  const clearInspect = useCallback(() => setInspectTarget(null), []);

  return {
    zoomCommand,
    dispositivoIndex,
    setDispositivoIndex,
    focusTarget,
    setFocusTarget,
    inspectTarget,
    inspectDevice,
    clearInspect,
    zoomIn,
    zoomOut,
    clearZoomCommand,
    clearFocusTarget,
  };
}
