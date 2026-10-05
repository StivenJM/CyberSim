import { useState } from "react";
import styles from "../styles/ModalSocialSearcher.module.css";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { useOSTheme } from "../context/OSThemeContext";
import type { InfoPersonaEncontrada } from "../../../../shared/types/EscenarioTypes";
import ComboBox, { type ComboBoxOption } from "./ComboBox";

export default function ModalSocialSearcher() {
    const { escenarioController, zonasDisponibles } = useECSSceneContext();
    const isLinux = useOSTheme() === "linux";
    const [zonaSeleccionada, setZonaSeleccionada] = useState<number | "">("");
    const [resultados, setResultados] = useState<InfoPersonaEncontrada[]>([]);
    const [buscado, setBuscado] = useState(false);

    const opcionesZona: ComboBoxOption[] = zonasDisponibles.map((zona) => ({
        label: zona.nombre,
        value: String(zona.id),
    }));
    const zonaOption = opcionesZona.find((o) => o.value === String(zonaSeleccionada)) ?? null;

    const handleBuscar = () => {
        if (zonaSeleccionada === "") return;

        const entidadZona = escenarioController.builder.obtenerEntidadZonaPorId(zonaSeleccionada);
        if (entidadZona === undefined) return;

        const personas = escenarioController.getInfoPersonasPorEmpresa(entidadZona);
        setResultados(personas ?? []);
        setBuscado(true);

        escenarioController.registrarEjecucionAplicacion("Company Social-Searcher");
    };

    const getInitials = (nombre: string) => {
        const parts = nombre.split(" ");
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : nombre.slice(0, 2).toUpperCase();
    };

    const getBadgeClass = (nivel: string) => {
        switch (nivel) {
            case "Alta": return styles.badgeAlta;
            case "Media": return styles.badgeMedia;
            case "Baja": return styles.badgeBaja;
            default: return styles.badgeMedia;
        }
    };

    return (
        <div className={`${styles.container} ${isLinux ? styles.linux : ""}`}>
            <div className={styles.toolbar}>
                <ComboBox
                    className={styles.comboField}
                    placeholder="Seleccionar zona"
                    options={opcionesZona}
                    value={zonaOption}
                    onChange={(opt) => {
                        setZonaSeleccionada(Number(opt.value));
                        setBuscado(false);
                    }}
                />
                <button
                    className={styles.btnSearch}
                    onClick={handleBuscar}
                    disabled={zonaSeleccionada === ""}
                >
                    Buscar
                </button>
            </div>

            {buscado ? (
                resultados.length > 0 ? (
                    <div className={styles.resultsList}>
                        {resultados.map((persona, i) => (
                            <div key={i} className={styles.personRow}>
                                <div className={styles.avatar}>
                                    {getInitials(persona.nombre)}
                                </div>
                                <div className={styles.personInfo}>
                                    <span className={styles.personName}>{persona.nombre}</span>
                                    <span className={styles.personEmail}>{persona.correo}</span>
                                </div>
                                <span className={`${styles.badge} ${getBadgeClass(persona.nivelConcienciaSeguridad)}`}>
                                    Conciencia de seguridad: {persona.nivelConcienciaSeguridad}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        No se encontraron personas en esta empresa
                    </div>
                )
            ) : (
                <div className={styles.emptyState}>
                    Selecciona una empresa y presiona Buscar
                </div>
            )}
        </div>
    );
}
