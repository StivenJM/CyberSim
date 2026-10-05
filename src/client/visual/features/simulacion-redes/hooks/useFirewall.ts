import { useMemo, useCallback, useState } from "react";
import type { Entidad } from "../../../../ecs/core/Componente";
import { RedController } from "../../../../ecs/controllers/RedController";
import type { TipoProtocolo } from "../../../../shared/types/TrafficEnums";
import {
  DireccionTrafico,
  AccionFirewall,
} from "../../../../shared/types/FirewallTypes";
import { RouterComponent, RedComponent } from "../../../../ecs/components";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { useEscenario } from "../../../common/contexts/EscenarioContext";
import type { RedInfo } from "../types/redTypes";

export function useFirewall() {
  const { entidadSeleccionadaId } = useEscenario();
  const { ecsManager } = useECSSceneContext();

  const [version, setVersion] = useState(0);

  const entidadRouter = entidadSeleccionadaId;

  const redController = useMemo(() => {
    if (!ecsManager) return null;
    return RedController.getInstance(ecsManager);
  }, [ecsManager]);

  const logsFirewall = useMemo(() => {
    if (!entidadRouter) return [];

    const routerComponent = ecsManager
      .getComponentes(entidadRouter)
      ?.get(RouterComponent);
    return routerComponent?.logsTrafico || [];
  }, [entidadRouter, ecsManager, version]);

  const redesRouter = useMemo((): RedInfo[] => {
    if (!entidadRouter || !redController) return [];
    const redesEntidades = redController.obtenerRedesDeRouter(entidadRouter);

    return redesEntidades.map((entidadRed) => {
      const container = ecsManager.getComponentes(entidadRed);
      const redComp = container?.get(RedComponent);

      return {
        nombre: redComp?.nombre || `Red ${entidadRed}`,
        color: redComp?.color || "#808080",
        entidadId: entidadRed,
      };
    });
  }, [entidadRouter, redController, ecsManager]);

  const toggleRegla = useCallback(
    (
      entidadRed: Entidad,
      protocolo: TipoProtocolo,
      direccion: DireccionTrafico
    ) => {
      if (!redController || !entidadRouter) {
        return;
      }

      const estaBloqueadoActualmente =
        redController.estaProtocoloBloqueadoEnRed(
          entidadRouter,
          entidadRed,
          protocolo,
          direccion
        );

      if (estaBloqueadoActualmente) {
        redController.eliminarReglaFirewall(
          entidadRouter,
          entidadRed,
          protocolo,
          direccion
        );
      } else {
        redController.agregarReglaFirewall(
          entidadRouter,
          entidadRed,
          protocolo,
          AccionFirewall.DENEGAR,
          direccion
        );
      }

      setVersion((v) => v + 1);
    },
    [redController, entidadRouter]
  );

  const estaBloqueado = useCallback(
    (
      protocolo: TipoProtocolo,
      direccion: DireccionTrafico,
      entidadRed: Entidad
    ): boolean => {
      if (!redController || !entidadRouter) return false;
      return redController.estaProtocoloBloqueadoEnRed(
        entidadRouter,
        entidadRed,
        protocolo,
        direccion
      );
    },
    [redController, entidadRouter, version]
  );

  const [estadoBotones, setEstadoBotones] = useState<Record<string, boolean>>(
    {}
  );

  const toggleTodosServicios = useCallback(
    (
      entidadRouter: Entidad,
      entidadRed: Entidad,
      direccion: DireccionTrafico
    ) => {
      if (!redController) return;

      const key = `${entidadRed}-${direccion}`;
      const estaEnModoBloquear = !estadoBotones[key];

      if (estaEnModoBloquear) {
        redController.bloquearProtocolosEnRed(
          entidadRouter,
          entidadRed,
          direccion
        );
      } else {
        redController.permitirProtocolosEnRed(
          entidadRouter,
          entidadRed,
          direccion
        );
      }

      setEstadoBotones((prev) => ({ ...prev, [key]: estaEnModoBloquear }));
      setVersion((v) => v + 1);
    },
    [redController, estadoBotones]
  );

  const obtenerTextoBoton = useCallback(
    (entidadRed: Entidad, direccion: DireccionTrafico): string => {
      const key = `${entidadRed}-${direccion}`;
      return estadoBotones[key] ? "Permitir todos" : "Bloquear todos";
    },
    [estadoBotones]
  );

  return {
    redesRouter,
    toggleRegla,
    toggleTodosServicios,
    estaBloqueado,
    obtenerTextoBoton,
    logsFirewall,
  };
}
