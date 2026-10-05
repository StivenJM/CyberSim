import { useState, useRef, useCallback } from "react";
import type { EscenarioController } from "../../../../ecs/controllers/EscenarioController";

export interface LogEntry {
  time: string;
  content: string;
  category: string;
}

function formatearTiempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const segs = Math.floor(segundos % 60);
  return `${minutos.toString().padStart(2, "0")}:${segs
    .toString()
    .padStart(2, "0")}`;
}

export function useECSLogs(escenarioController: EscenarioController) {
  const [mostrarNuevoLog, setMostrarNuevoLog] = useState(false);
  const [mensajeLog, setMensajeLog] = useState("");
  const [tiempoLog, setTiempoLog] = useState(0);
  const [tipoLog, setTipoLog] = useState<
    "ataque" | "advertencia" | "completado" | "informacion"
  >("advertencia");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsPanelOpen, setLogsPanelOpen] = useState(false);
  const [hasNewLog, setHasNewLog] = useState(false);

  const lastSeenCountRef = useRef(0);
  const closeDevicePanelRef = useRef<(() => void) | null>(null);

  const agregarLog = useCallback(
    (content: string, category: string) => {
      const tiempo = escenarioController.tiempoTranscurrido;
      const nuevoLog = {
        time: formatearTiempo(tiempo),
        content,
        category,
      };
      setLogs((prev) => [...prev, nuevoLog]);
      if (!logsPanelOpen) {
        setHasNewLog(true);
      }
    },
    [escenarioController]
  );

  const toggleLogsPanel = useCallback(
    (isOpen: boolean) => {
      setLogsPanelOpen(isOpen);
      if (isOpen) {
        setHasNewLog(false);
        lastSeenCountRef.current = logs.length;
        closeDevicePanelRef.current?.();
      }
    },
    [logs.length]
  );

  const resetLogs = useCallback(() => {
    setLogs([]);
    setMostrarNuevoLog(false);
    lastSeenCountRef.current = 0;
  }, []);

  return {
    mostrarNuevoLog,
    mensajeLog,
    tiempoLog,
    tipoLog,
    logs,
    hasNewLog,
    logsPanelOpen,
    setMostrarNuevoLog,
    setMensajeLog,
    setTiempoLog,
    setTipoLog,
    agregarLog,
    toggleLogsPanel,
    resetLogs,
    closeDevicePanelRef,
  };
}
