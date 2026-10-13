import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Entidad } from "../../../../ecs/core/Componente";
import {
  getDispositivoHeight,
  getMuebleHeight,
  getMuebleSurfaceHeight,
} from "../config/modelConfig";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import {
  EventosPublicos,
  TipoLogGeneral,
} from "../../../../shared/types/EventosEnums";
import { RedController } from "../../../../ecs/controllers/RedController";
import { EscenarioComponent, EspacioComponent } from "../../../../ecs/components";
import { useECSLogs } from "./useECSLogs";
import { useECSTime } from "./useECSTime";
import { useECSZones } from "./useECSZones";
import { useECSNavigation } from "./useECSNavigation";
import { getSceneLayout } from "./sceneLayout";

export interface ECSSceneEntity {
  entidadId: Entidad;
  objetoConTipo: { tipo: string; [key: string]: unknown };
  position: [number, number, number];
  rotacionY: number;
  entidadCompleta: unknown;
  esInteractiva: boolean;
}

interface Transform {
  x: number;
  y: number;
  z: number;
  rotacionY: number;
}

interface ObjetoConTipo {
  tipo: string;
  [key: string]: unknown;
}

export function useECSScene() {
  const escenario = useEscenarioActual();
  const [entities, setEntities] = useState<Map<Entidad, unknown>>(new Map());
  const [presupuesto, setPresupuesto] = useState(0);

  const inicializado = useRef(false);
  const escenarioIdRef = useRef<number | null>(null);

  const escenarioController = useMemo(
    () => EscenarioController.getInstance(escenario),
    [escenario]
  );

  const redController = useMemo(
    () => RedController.getInstance(escenarioController.ecsManager),
    [escenarioController]
  );

  // --- Sub-hooks ---
  const logState = useECSLogs(escenarioController);
  const timeState = useECSTime(escenarioController);
  const zoneState = useECSZones();
  const navState = useECSNavigation();

  // Detectar cambio de escenario y resetear el estado de inicialización
  if (escenarioIdRef.current !== escenario.id) {
    escenarioIdRef.current = escenario.id;
    inicializado.current = false;
    timeState.tiempoIniciadoRef.current = false;
  }

  // --- Inicialización + suscripciones a eventos ---
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    logState.resetLogs();
    timeState.setTiempoTranscurrido(0);

    escenarioController.iniciarEscenario();
    escenarioController.ejecutarTiempo();
    escenarioController.cargarEventosEnSistema();
    escenarioController.efectuarPresupuesto();
    setEntities(escenarioController.builder.getEntidades());
    timeState.setIsPaused(escenarioController.estaTiempoPausado());
    setPresupuesto(escenarioController.getPresupuestoActual());

    const zonas = escenarioController.builder.obtenerZonas();
    zoneState.setZonasDisponibles(zonas);
    if (zonas.length > 0) {
      zoneState.setZonaActual(zonas[0].id);
      zoneState.setZoneToastName(zonas[0].nombre);
      zoneState.setShowZoneToast(true);
    }

    redController.iniciarController();
    escenarioController.iniciarTiempo();
    timeState.tiempoIniciadoRef.current = true;

    const unsubscribeLogsGeneralesActualizados = escenarioController.on(
      EventosPublicos.LOGS_GENERALES_ACTUALIZADOS,
      (data: unknown) => {
        const pausarTiempo = data as boolean;

        for (const [
          ,
          container,
        ] of escenarioController.ecsManager.getEntidades()) {
          if (container.tiene(EscenarioComponent)) {
            const escenarioComp = container.get(EscenarioComponent);
            const logsGenerales = escenarioComp?.logsGenerales || [];
            if (logsGenerales.length > 0) {
              const ultimoLog = logsGenerales[logsGenerales.length - 1];

              logState.setMostrarNuevoLog(true);
              logState.setMensajeLog(ultimoLog.mensaje);
              logState.setTiempoLog(escenarioController.tiempoTranscurrido);

              let tipoLogUI: "ataque" | "advertencia" | "completado" | "informacion" =
                "advertencia";
              let categoria = "ADVERTENCIA";

              if (ultimoLog.tipo === TipoLogGeneral.ATAQUE) {
                tipoLogUI = "ataque";
                categoria = "ATAQUE";
              } else if (ultimoLog.tipo === TipoLogGeneral.COMPLETADO) {
                tipoLogUI = "completado";
                categoria = "COMPLETADO";
              } else if (ultimoLog.tipo === TipoLogGeneral.INFORMACION) {
                tipoLogUI = "informacion";
                categoria = "INFORMACION";
              }

              logState.setTipoLog(tipoLogUI);
              logState.agregarLog(ultimoLog.mensaje, categoria);
            }
            break;
          }
        }

        if (pausarTiempo) {
          timeState.pause();
        }
      }
    );

    const unsubscribePresupuesto = escenarioController.on(
      EventosPublicos.PRESUPUESTO_ACTUALIZADO,
      (data: unknown) => {
        const d = data as { presupuesto: number };
        setPresupuesto(d.presupuesto);
      }
    );

    const unsubscribeActualizado = escenarioController.on(
      EventosPublicos.TIEMPO_ACTUALIZADO,
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        timeState.setTiempoTranscurrido(d.transcurrido);
      }
    );

    const unsubscribePausado = escenarioController.on(
      EventosPublicos.TIEMPO_PAUSADO,
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        timeState.setTiempoTranscurrido(d.transcurrido);
        timeState.setIsPaused(true);
      }
    );

    const unsubscribeReanudado = escenarioController.on(
      EventosPublicos.TIEMPO_REANUDADO,
      (data: unknown) => {
        const d = data as { transcurrido: number; pausado: boolean };
        timeState.setTiempoTranscurrido(d.transcurrido);
        timeState.setIsPaused(false);
      }
    );

    return () => {
      unsubscribeLogsGeneralesActualizados();
      unsubscribePresupuesto();
      unsubscribeActualizado();
      unsubscribePausado();
      unsubscribeReanudado();
    };
  }, [escenarioController, logState.agregarLog]);

  // --- Procesamiento de entidades (cross-cutting) ---

  const processEntities = (): ECSSceneEntity[] => {
    if (!entities) return [];

    const entidadesAMostrar =
      zoneState.zonaActual !== null
        ? escenarioController.builder.obtenerEntidadesDeZona(zoneState.zonaActual)
        : entities;

    const sistemaJerarquia = escenarioController.builder.getSistemaJerarquia();

    // Posiciones derivadas por el motor de layout (ignora las `posicion` del dato;
    // ver sceneLayout). Memoizado por (builder, zona), así que es barato por frame.
    const placements = getSceneLayout(
      escenarioController.builder,
      escenarioController.ecsManager,
      zoneState.zonaActual,
    ).placements;

    // Altura a la que se apoya un dispositivo: la superficie del mueble de su
    // espacio (mesa/rack/piso) + un ajuste fino opcional por tipo. Así la altura
    // depende del mueble y no del tipo de dispositivo.
    const calcularOffsetY = (
      entidadId: Entidad,
      objetoConTipo: ObjetoConTipo | undefined
    ): number => {
      if (!objetoConTipo) return 0;
      if (objetoConTipo.tipo === "espacio") {
        return getMuebleHeight(String(objetoConTipo.mueble ?? ""));
      }
      const espacioId = sistemaJerarquia.obtenerEspacioDeDispositivo(entidadId);
      const muebleTipo =
        espacioId != null
          ? escenarioController.ecsManager
              .getComponentes(espacioId)
              ?.get(EspacioComponent)?.mueble
          : undefined;
      return (
        getMuebleSurfaceHeight(String(muebleTipo ?? "")) +
        getDispositivoHeight(objetoConTipo.tipo)
      );
    };

    return Array.from(entidadesAMostrar.entries()).map(
      ([entidadId, entidadObjeto]): ECSSceneEntity => {
        const componentes = Array.from(
          (
            entidadObjeto as unknown as { map: Map<unknown, unknown> }
          ).map.values()
        ) as unknown[];

        const objetoConTipo = componentes.find(
          (c: unknown): c is ObjetoConTipo =>
            typeof c === "object" &&
            c !== null &&
            "tipo" in (c as Record<string, unknown>) &&
            typeof (c as Record<string, unknown>).tipo === "string"
        );

        const transform = componentes.find(
          (c: unknown): c is Transform =>
            typeof c === "object" &&
            c !== null &&
            "x" in (c as Record<string, unknown>) &&
            "y" in (c as Record<string, unknown>) &&
            "z" in (c as Record<string, unknown>) &&
            "rotacionY" in (c as Record<string, unknown>) &&
            typeof (c as Record<string, unknown>).x === "number"
        );

        const offsetY = calcularOffsetY(entidadId, objetoConTipo);
        // Posición y orientación las deriva el motor de layout (la Y la da el mueble).
        const placement = placements.get(entidadId);
        const baseX = placement ? placement.x : transform?.x ?? 0;
        const baseZ = placement ? placement.z : transform?.z ?? 0;
        const position: [number, number, number] = [baseX, offsetY, baseZ];

        const rotacionY = placement ? (placement.rotDeg * Math.PI) / 180 : 0;

        return {
          entidadId,
          objetoConTipo: objetoConTipo ?? { tipo: "desconocido" },
          position,
          rotacionY,
          entidadCompleta: entidadObjeto,
          esInteractiva: zoneState.esZonaInteractiva,
        };
      }
    );
  };

  // --- Callbacks cross-cutting ---

  const toggleConfigWorkstation = useCallback(
    (entidadWorkstation: Entidad, nombreConfig: string) => {
      escenarioController.toggleConfiguracionWorkstation(
        entidadWorkstation,
        nombreConfig
      );
    },
    [escenarioController]
  );

  const cambiarZona = useCallback(
    (nuevaZonaId: number) => {
      zoneState.setZonaActual(nuevaZonaId);
      navState.setDispositivoIndex(0);
      navState.setFocusTarget(null);
      const zona = zoneState.zonasDisponibles.find((z) => z.id === nuevaZonaId);
      if (zona) {
        zoneState.setZoneToastName(zona.nombre);
        zoneState.setShowZoneToast(true);
      }
    },
    [zoneState.zonasDisponibles]
  );

  const siguienteZona = useCallback(() => {
    if (zoneState.zonasDisponibles.length === 0 || zoneState.zonaActual === null) return;
    const currentIndex = zoneState.zonasDisponibles.findIndex((z) => z.id === zoneState.zonaActual);
    const nextIndex = (currentIndex + 1) % zoneState.zonasDisponibles.length;
    cambiarZona(zoneState.zonasDisponibles[nextIndex].id);
  }, [zoneState.zonasDisponibles, zoneState.zonaActual, cambiarZona]);

  const anteriorZona = useCallback(() => {
    if (zoneState.zonasDisponibles.length === 0 || zoneState.zonaActual === null) return;
    const currentIndex = zoneState.zonasDisponibles.findIndex((z) => z.id === zoneState.zonaActual);
    const prevIndex =
      (currentIndex - 1 + zoneState.zonasDisponibles.length) % zoneState.zonasDisponibles.length;
    cambiarZona(zoneState.zonasDisponibles[prevIndex].id);
  }, [zoneState.zonasDisponibles, zoneState.zonaActual, cambiarZona]);

   
  const getWorkstations = useCallback((): ECSSceneEntity[] => {
    return processEntities().filter((e) => e.objetoConTipo.tipo === "workstation");
  }, [entities, zoneState.zonaActual]);

  return {
    entities,
    mostrarNuevoLog: logState.mostrarNuevoLog,
    mensajeLog: logState.mensajeLog,
    tiempoLog: logState.tiempoLog,
    tipoLog: logState.tipoLog,
    logs: logState.logs,
    hasNewLog: logState.hasNewLog,
    logsPanelOpen: logState.logsPanelOpen,
    toggleLogsPanel: logState.toggleLogsPanel,
    setMostrarNuevoLog: logState.setMostrarNuevoLog,
    setMensajeLog: logState.setMensajeLog,
    escenarioController,
    redController,
    ecsManager: escenarioController.ecsManager,
    builder: escenarioController.builder,
    processEntities,
    tiempoTranscurrido: timeState.tiempoTranscurrido,
    iniciar: timeState.iniciar,
    pause: timeState.pause,
    resume: timeState.resume,
    isPaused: timeState.isPaused,
    presupuesto,
    toggleConfigWorkstation,
    zonaActual: zoneState.zonaActual,
    anteriorZona,
    zonasDisponibles: zoneState.zonasDisponibles,
    cambiarZona,
    siguienteZona,
    showZoneToast: zoneState.showZoneToast,
    zoneToastName: zoneState.zoneToastName,
    hideZoneToast: zoneState.hideZoneToast,
    zoomIn: navState.zoomIn,
    zoomOut: navState.zoomOut,
    zoomCommand: navState.zoomCommand,
    clearZoomCommand: navState.clearZoomCommand,
    dispositivoIndex: navState.dispositivoIndex,
    focusTarget: navState.focusTarget,
    clearFocusTarget: navState.clearFocusTarget,
    inspectTarget: navState.inspectTarget,
    inspectDevice: navState.inspectDevice,
    clearInspect: navState.clearInspect,
    getWorkstations,
    closeDevicePanelRef: logState.closeDevicePanelRef,
  };
}
