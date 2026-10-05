import { useMemo, useState, useEffect } from "react";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import {
  DispositivoComponent,
  WorkstationComponent,
  TransformComponent,
  RedComponent,
  ZonaComponent,
} from "../../../../ecs/components";
import { SistemaJerarquiaEscenario } from "../../../../ecs/systems/SistemaJerarquiaEscenario";
import type { Dispositivo } from "../../../../shared/types/EscenarioTypes";
import {
  EstadoAtaqueDispositivo,
  TipoDispositivo,
} from "../../../../shared/types/DeviceEnums";

export function useDispositivos() {
  const [refreshKey] = useState(0);

  useEffect(() => {
    /*
    const unsubscribeAsignada = controller.ecsManager.on(
      EventosPublicos.RED_ASIGNADA,
      () => {
        setRefreshKey((prev) => prev + 1);
      }
    );

    const unsubscribeRemovida = controller.ecsManager.on(
      EventosPublicos.RED_REMOVIDA,
      () => {
        setRefreshKey((prev) => prev + 1);
      }
    );

    return () => {
      unsubscribeAsignada();
      unsubscribeRemovida();
    };
    
    */
  }, []);

  const dispositivos = useMemo(() => {
    const controller = EscenarioController.getInstance();
    const entidades = controller.getWorkstationsYServers();

    const sistemaJerarquia = controller.ecsManager.getSistema(SistemaJerarquiaEscenario);
    const entidadesInteractivas = entidades.filter((entidad) => {
      if (!sistemaJerarquia) return true;
      const zonaEntidadId = sistemaJerarquia.obtenerZonaDeDispositivo(entidad);
      if (!zonaEntidadId) return true;
      const zonaContainer = controller.ecsManager.getComponentes(zonaEntidadId);
      const zona = zonaContainer?.get(ZonaComponent);
      return zona?.esInteractiva ?? true;
    });

    return entidadesInteractivas.map((entidad): Dispositivo => {
      const container = controller.ecsManager.getComponentes(entidad);
      if (!container) {
        return {
          id: entidad,
          entidadId: entidad,
          tipo: TipoDispositivo.OTRO,
          nombre: "Dispositivo desconocido",
          sistemaOperativo: "",
          hardware: "",
          software: "",
          estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
          activos: [],
        } as Dispositivo;
      }

      const dispComp = container.get(DispositivoComponent);
      const wsComp = container.get(WorkstationComponent);
      const transform = container.get(TransformComponent);

      const posicion = transform
        ? {
            x: transform.x,
            y: transform.y,
            z: transform.z,
            rotacionY: transform.rotacionY,
          }
        : undefined;

      const redesConectadas = (dispComp?.redes ?? [])
        .map((redEntidadId) => {
          const redContainer =
            controller.ecsManager.getComponentes(redEntidadId);
          const redComp = redContainer?.get(RedComponent);
          if (!redComp) return null;
          return {
            nombre: redComp.nombre,
            color: redComp.color,
            entidadId: redEntidadId,
          };
        })
        .filter(
          (red): red is { nombre: string; color: string; entidadId: number } =>
            red !== null
        );

      const dispositivo: Dispositivo = {
        id: entidad,
        entidadId: entidad,
        tipo: dispComp?.tipo ?? TipoDispositivo.OTRO,
        nombre: dispComp?.nombre ?? "Dispositivo sin nombre",
        sistemaOperativo: dispComp?.sistemaOperativo ?? "",
        hardware: dispComp?.hardware ?? "",
        software: "",
        posicion,
        estadoAtaque: dispComp?.estadoAtaque ?? EstadoAtaqueDispositivo.NORMAL,
        redes: redesConectadas,
        activos: [],
      };

      if (wsComp) {
        dispositivo.configuraciones = wsComp.configuraciones;
      }

      return dispositivo;
    });
  }, [refreshKey]);

  return {
    dispositivos,
  };
}
