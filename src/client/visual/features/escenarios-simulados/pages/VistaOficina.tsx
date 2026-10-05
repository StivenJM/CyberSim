import styles from "../styles/VistaOficina.module.css"
import Escena3D from "../components/Escena3D"
import TarjetaEntidadSeleccionada from "../components/TarjetaEntidadSeleccionada";
import TarjetaZonaActual from "../components/TarjetaZonaActual";
import { useEscenario } from "../../../common/contexts";
import { useScreenTransition } from "../../../common/contexts/ScreenTransitionContext";
import MonitorDesktopOverlay from "../../../common/components/MonitorDesktopOverlay";
import { useECSSceneContext } from "../context/ECSSceneContext";
import { useZonaKeyboardNav } from "../hooks/useZonaKeyboardNav";

import { useEffect, useRef } from "react";
function VistaOficina() {
  const { dispositivoSeleccionado, setDispositivoSeleccionado } = useEscenario();
  const { desktopMode, pendingZoom, consumePendingZoom, startZoom, exitDesktopMode } = useScreenTransition();
  const { zonaActual, siguienteZona, anteriorZona } = useECSSceneContext();
  const zonaAnteriorRef = useRef(zonaActual);

  // ArrowLeft / ArrowRight navegan entre zonas; deshabilitado dentro del overlay de monitor.
  useZonaKeyboardNav({ onPrev: anteriorZona, onNext: siguienteZona, enabled: !desktopMode });

  useEffect(() => {
    setDispositivoSeleccionado(null);
  }, []);

  useEffect(() => {
    if (zonaAnteriorRef.current !== zonaActual && desktopMode) {
      exitDesktopMode();
    }
    zonaAnteriorRef.current = zonaActual;
  }, [zonaActual, desktopMode, exitDesktopMode]);

  // Handle pending zoom from Sidebar navigation
  useEffect(() => {
    if (pendingZoom) {
      startZoom(pendingZoom.position, pendingZoom.rotationY);
      consumePendingZoom();
    }
  }, [pendingZoom, startZoom, consumePendingZoom]);

  return (
    <div className={styles.contenedor}>
      <Escena3D />
      {!desktopMode && <TarjetaEntidadSeleccionada visible={!!dispositivoSeleccionado} />}
      {!desktopMode && <TarjetaZonaActual visible={true} />}
      <MonitorDesktopOverlay />
    </div>
  )
}

export default VistaOficina;
