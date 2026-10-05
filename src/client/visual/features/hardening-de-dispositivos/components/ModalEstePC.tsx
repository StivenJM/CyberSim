import { useEscenario } from "../../../common/contexts";
import styles from "../styles/ModalEstePC.module.css";
import { useOSTheme } from "../context/OSThemeContext";

function DeviceIcon() {
    return (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="8" width="48" height="36" rx="3" />
            <line x1="32" y1="44" x2="32" y2="52" />
            <line x1="20" y1="52" x2="44" y2="52" />
            <rect x="12" y="12" width="40" height="28" rx="1" fill="rgba(96,205,255,0.08)" stroke="none" />
        </svg>
    );
}

export default function ModalEstePC() {
    const { dispositivoSeleccionado } = useEscenario();
    const isLinux = useOSTheme() === "linux";
    const rootClass = `${styles.container} ${isLinux ? styles.linux : ""}`;

    if (!dispositivoSeleccionado) {
        return (
            <div className={rootClass}>
                <div className={styles.emptyState}>No hay dispositivo seleccionado</div>
            </div>
        );
    }

    const redes = dispositivoSeleccionado.redes ?? [];

    const nombreEquipo = (dispositivoSeleccionado.nombre || "pc").replace(/\s+/g, "-");

    return (
        <div className={rootClass}>
            <div className={styles.headerCard}>
                <div className={styles.headerIcon}>
                    <DeviceIcon />
                </div>
                <div className={styles.headerInfo}>
                    <span className={styles.headerName}>{nombreEquipo}</span>
                    <span className={styles.headerHardware}>{dispositivoSeleccionado.hardware || dispositivoSeleccionado.tipo}</span>
                </div>
            </div>

            <h3 className={styles.sectionTitle}>Especificaciones del dispositivo</h3>
            <div className={styles.specCard}>
                <div className={styles.specRow}>
                    <span className={styles.specLabel}>Tipo</span>
                    <span className={styles.specValue}>{dispositivoSeleccionado.tipo}</span>
                </div>
                <div className={styles.specRow}>
                    <span className={styles.specLabel}>Sistema operativo</span>
                    <span className={styles.specValue}>{dispositivoSeleccionado.sistemaOperativo ?? "No especificado"}</span>
                </div>
            </div>

            {redes.length > 0 && (
                <>
                    <h3 className={styles.sectionTitle}>Redes conectadas</h3>
                    <div className={styles.specCard}>
                        {redes.map(red => (
                            <div key={red.nombre} className={styles.specRow}>
                                <span className={styles.specLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className={styles.networkDot} style={{ backgroundColor: red.color }} />
                                    {red.nombre}
                                </span>
                                <span className={styles.specValue}>Conectado</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
