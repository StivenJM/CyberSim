import { useState, useMemo, useCallback } from "react";

export interface ZonaInfo {
  id: number;
  nombre: string;
  dominio: string;
  esInteractiva: boolean;
}

export function useECSZones() {
  const [zonaActual, setZonaActual] = useState<number | null>(null);
  const [zonasDisponibles, setZonasDisponibles] = useState<ZonaInfo[]>([]);
  const [showZoneToast, setShowZoneToast] = useState(false);
  const [zoneToastName, setZoneToastName] = useState("");

  const esZonaInteractiva = useMemo(() => {
    if (zonaActual === null) return true;
    const zona = zonasDisponibles.find((z) => z.id === zonaActual);
    return zona?.esInteractiva ?? true;
  }, [zonaActual, zonasDisponibles]);

  const hideZoneToast = useCallback(() => {
    setShowZoneToast(false);
  }, []);

  return {
    zonaActual,
    setZonaActual,
    zonasDisponibles,
    setZonasDisponibles,
    showZoneToast,
    setShowZoneToast,
    zoneToastName,
    setZoneToastName,
    esZonaInteractiva,
    hideZoneToast,
  };
}
