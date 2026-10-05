import { ZoomIn, ZoomOut } from "lucide-react";
import styles from "../styles/Controles3D.module.css";
import { useECSSceneContext } from "../context/ECSSceneContext";
import Tooltip from "../../../common/components/Tooltip";
import SiguienteZonaIcon from "../../../common/icons/SiguienteZonaIcon";
import AnteriorZonaIcon from "../../../common/icons/AnteriorZonaIcon";

export default function Controles3D() {
    const {
        siguienteZona, anteriorZona,
        zoomIn, zoomOut,
    } = useECSSceneContext();

    return (
        <aside className={styles.controles3D} aria-label="Controles de vista 3D">
            <div className={styles.group}>
                <Tooltip text="Zona anterior" position="right">
                    <button type="button" onClick={anteriorZona} aria-label="Zona anterior">
                        <AnteriorZonaIcon size={18} />
                    </button>
                </Tooltip>
                <div className={styles.divider} />
                <Tooltip text="Siguiente zona" position="right">
                    <button type="button" onClick={siguienteZona} aria-label="Siguiente zona">
                        <SiguienteZonaIcon size={18} />
                    </button>
                </Tooltip>
            </div>

            <div className={styles.group}>
                <Tooltip text="Acercar" position="right">
                    <button type="button" onClick={zoomIn} aria-label="Acercar">
                        <ZoomIn size={18} strokeWidth={1.5} />
                    </button>
                </Tooltip>
                <div className={styles.divider} />
                <Tooltip text="Alejar" position="right">
                    <button type="button" onClick={zoomOut} aria-label="Alejar">
                        <ZoomOut size={18} strokeWidth={1.5} />
                    </button>
                </Tooltip>
            </div>
        </aside>
    );
}