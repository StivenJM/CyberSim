import { useMemo, useState, useEffect } from "react";
import type { Entidad } from "../../../../ecs/core/Componente";
import {
  DispositivoComponent,
  RedComponent,
  ZonaComponent,
} from "../../../../ecs/components";
import type {
  Topologia,
  NodoTopologia,
  ZonaTopologia,
} from "../utils/topologiaLayout";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import { EventosPublicos } from "../../../../shared/types/EventosEnums";
import type { ECSManager } from "../../../../ecs/core/ECSManager";
import type { EscenarioBuilder } from "../../../../ecs/utils/EscenarioBuilder";

/**
 * Crea un mapa de todas las redes disponibles en el ECS
 */
function crearMapaRedes(ecsManager: ECSManager) {
  const redesMap = new Map<Entidad, { nombre: string; color: string }>();

  for (const [entidadId, container] of ecsManager.getEntidades()) {
    const redComponent = container.get(RedComponent);
    if (redComponent) {
      redesMap.set(entidadId, {
        nombre: redComponent.nombre,
        color: redComponent.color,
      });
    }
  }

  return redesMap;
}

/**
 * Crea un nodo de topología a partir de un dispositivo
 */
function crearNodoDispositivo(
  dispEntidadId: Entidad,
  dispositivoComponent: DispositivoComponent,
  redesMap: Map<Entidad, { nombre: string; color: string }>
): NodoTopologia {
  const redesDispositivo = dispositivoComponent.redes
    .map((redEntidad) => redesMap.get(redEntidad))
    .filter(
      (red): red is { nombre: string; color: string } => red !== undefined
    );

  return {
    id: `disp-${dispEntidadId}`,
    nombre: dispositivoComponent.nombre,
    tipo: dispositivoComponent.tipo,
    redes: redesDispositivo,
    entidadId: dispEntidadId,
  };
}

/**
 * Obtiene todos los nodos (dispositivos) de una zona
 */
function obtenerNodosDeZona(
  zonaId: number,
  builder: EscenarioBuilder,
  redesMap: Map<Entidad, { nombre: string; color: string }>
): NodoTopologia[] {
  const nodos: NodoTopologia[] = [];
  const dispositivosZona = builder.obtenerEntidadesDeZona(zonaId);

  for (const [dispEntidadId, dispContainer] of dispositivosZona) {
    const dispositivoComponent = dispContainer.get(DispositivoComponent);

    // Los dispositivos decorativos se ven en 3D pero no son parte del nivel.
    if (dispositivoComponent && !dispositivoComponent.decorativo) {
      const nodo = crearNodoDispositivo(
        dispEntidadId,
        dispositivoComponent,
        redesMap
      );
      nodos.push(nodo);
    }
  }

  return nodos;
}

/**
 * Construye la topología completa extrayendo todas las zonas y sus dispositivos
 */
function construirTopologia(
  ecsManager: ECSManager,
  builder: EscenarioBuilder
): Topologia {
  const zonas: ZonaTopologia[] = [];
  const redesMap = crearMapaRedes(ecsManager);

  for (const [entidadId, container] of ecsManager.getEntidades()) {
    const zonaComponent = container.get(ZonaComponent);

    if (zonaComponent) {
      const nodos = obtenerNodosDeZona(zonaComponent.id, builder, redesMap);

      zonas.push({
        id: `zona-${zonaComponent.id}`,
        nombre: zonaComponent.nombre,
        nodos,
        entidadZona: entidadId,
      });
    }
  }

  return { zonas };
}

/**
 * Extrae la lista de todas las redes disponibles en el ECS
 */
function extraerRedesDisponibles(
  ecsManager: ECSManager
): Array<{ nombre: string; color: string }> {
  const redes: Array<{ nombre: string; color: string }> = [];

  for (const [, container] of ecsManager.getEntidades()) {
    const redComponent = container.get(RedComponent);
    if (redComponent) {
      redes.push({
        nombre: redComponent.nombre,
        color: redComponent.color,
      });
    }
  }

  return redes;
}

export function useTopologiaData() {
  const escenarioController = EscenarioController.getInstance();
  const ecsManager = escenarioController.ecsManager;
  const builder = escenarioController.builder;
  const [refreshKey, setRefreshKey] = useState(0);

  // Suscripción a eventos de red para refrescar la vista
  useEffect(() => {
    const incrementarRefresh = () => setRefreshKey((prev) => prev + 1);

    const unsubscribeAsignada = ecsManager.on(
      EventosPublicos.RED_ASIGNADA,
      incrementarRefresh
    );
    const unsubscribeRemovida = ecsManager.on(
      EventosPublicos.RED_REMOVIDA,
      incrementarRefresh
    );

    return () => {
      unsubscribeAsignada();
      unsubscribeRemovida();
    };
  }, [ecsManager]);

  // Construcción de la topología completa
  const topologia: Topologia = useMemo(
    () => construirTopologia(ecsManager, builder),
    [ecsManager, builder, refreshKey]
  );

  // Lista de redes disponibles
  const redesDisponibles = useMemo(
    () => extraerRedesDisponibles(ecsManager),
    [ecsManager, refreshKey]
  );

  return { topologia, redesDisponibles, ecsManager };
}
