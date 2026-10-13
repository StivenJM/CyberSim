import { useState, useEffect, useCallback, useMemo } from "react";
import type { SoftwareApp } from "../../../../shared/types/EscenarioTypes";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import { DispositivoComponent } from "../../../../ecs/components";
import type { Entidad } from "../../../../ecs/core/Componente";

export function useAppsDispositivo(entidadDispositivo: Entidad | undefined) {
  const [appsInstaladas, setAppsInstaladas] = useState<SoftwareApp[]>([]);
  const [appsDisponibles, setAppsDisponibles] = useState<SoftwareApp[]>([]);

  const escenarioController = useMemo(() => {
    return EscenarioController.getInstance();
  }, []);

  const leerEstadoECS = useCallback(() => {
    if (!entidadDispositivo) {
      return { apps: [], disponibles: [] };
    }

    const dispositivo =
      escenarioController.ecsManager.getComponentes(entidadDispositivo);
    const apps = dispositivo?.get(DispositivoComponent)?.apps ?? [];
    const disponibles =
      escenarioController.getAppsDisponiblesPorDispositivo(entidadDispositivo) ?? [];

    return { apps: [...apps], disponibles: [...disponibles] };
  }, [entidadDispositivo, escenarioController]);

  const actualizarEstado = useCallback(() => {
    const { apps, disponibles } = leerEstadoECS();
    setAppsInstaladas(apps);
    setAppsDisponibles(disponibles);
  }, [leerEstadoECS]);

  useEffect(() => {
    actualizarEstado();
  }, [actualizarEstado]);

  const comprarApp = useCallback(
    (nombreApp: string) => {
      if (!entidadDispositivo) return;

      try {
        escenarioController.comprarApp(entidadDispositivo, nombreApp);
        actualizarEstado();
      } catch (error) {
        console.error("Error al comprar app:", error);
      }
    },
    [entidadDispositivo, escenarioController, actualizarEstado]
  );

  const desinstalarApp = useCallback(
    (nombreApp: string) => {
      if (!entidadDispositivo) return;

      try {
        escenarioController.desinstalarApp(entidadDispositivo, nombreApp);
        actualizarEstado();
      } catch (error) {
        console.error("Error al desinstalar app:", error);
      }
    },
    [entidadDispositivo, escenarioController, actualizarEstado]
  );

  return {
    appsInstaladas,
    appsDisponibles,
    comprarApp,
    desinstalarApp,
  };
}
