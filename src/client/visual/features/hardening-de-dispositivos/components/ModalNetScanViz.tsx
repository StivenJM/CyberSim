import { useState } from "react";
import styles from "../styles/ModalNetScanViz.module.css";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import type { InfoDispositivoEscaneado } from "../../../../shared/types/EscenarioTypes";
import ComboBox, { type ComboBoxOption } from "./ComboBox";

export default function ModalNetScanViz() {
    const { escenarioController, redController, zonasDisponibles } = useECSSceneContext();
    const [zonaSeleccionada, setZonaSeleccionada] = useState<number | "">("");
    const [resultados, setResultados] = useState<InfoDispositivoEscaneado[]>([]);
    const [escaneado, setEscaneado] = useState(false);

    const opcionesZona: ComboBoxOption[] = zonasDisponibles.map((zona) => ({
        label: zona.dominio,
        value: String(zona.id),
    }));
    const zonaOption = opcionesZona.find((o) => o.value === String(zonaSeleccionada)) ?? null;

    const handleEscanear = () => {
        if (zonaSeleccionada === "") return;

        const entidadZona = escenarioController.builder.obtenerEntidadZonaPorId(zonaSeleccionada);
        if (entidadZona === undefined) return;

        const dispositivos = redController.getEscaneoDispositivosDominio(entidadZona);
        setResultados(dispositivos ?? []);
        setEscaneado(true);

        escenarioController.registrarEjecucionAplicacion("Net-Scan Viz");
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <ComboBox
                    className={styles.select}
                    placeholder="Seleccionar dominio..."
                    options={opcionesZona}
                    value={zonaOption}
                    onChange={(opt) => {
                        setZonaSeleccionada(Number(opt.value));
                        setEscaneado(false);
                    }}
                />
                <button
                    className={styles.btnScan}
                    onClick={handleEscanear}
                    disabled={zonaSeleccionada === ""}
                >
                    Escanear
                </button>
            </div>

            {escaneado ? (
                resultados.length > 0 ? (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Dispositivo</th>
                                    <th>Sistema Operativo</th>
                                    <th>Encargado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map((disp, i) => (
                                    <tr key={i}>
                                        <td>{disp.nombre}</td>
                                        <td>{disp.sistOp}</td>
                                        <td>{disp.encargado ?? "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        No se encontraron dispositivos en este dominio
                    </div>
                )
            ) : (
                <div className={styles.emptyState}>
                    Selecciona un dominio y presiona Escanear
                </div>
            )}
        </div>
    );
}
