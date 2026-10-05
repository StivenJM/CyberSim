import { useState, useRef, useCallback } from "react";
import type { EscenarioController } from "../../../../ecs/controllers/EscenarioController";

export function useECSTime(escenarioController: EscenarioController) {
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tiempoIniciadoRef = useRef(false);

  const iniciar = useCallback(() => {
    if (tiempoIniciadoRef.current) return;
    escenarioController.iniciarTiempo();
    tiempoIniciadoRef.current = true;
    setIsPaused(escenarioController.estaTiempoPausado());
  }, [escenarioController]);

  const pause = useCallback(() => {
    escenarioController.pausarTiempo();
    setIsPaused(true);
  }, [escenarioController]);

  const resume = useCallback(() => {
    escenarioController.reanudarTiempo();
    setIsPaused(false);
  }, [escenarioController]);

  return {
    tiempoTranscurrido,
    setTiempoTranscurrido,
    isPaused,
    setIsPaused,
    tiempoIniciadoRef,
    iniciar,
    pause,
    resume,
  };
}
