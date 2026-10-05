import { useState, useMemo } from "react";
import styles from "../styles/ModalPhishMatic.module.css";
import { useEscenario } from "../../../common/contexts";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import type { PlantillaCorreoPhishing } from "../../../../shared/types/EscenarioTypes";
import ComboBox, { type ComboBoxOption } from "./ComboBox";

export default function ModalPhishMatic() {
    const { dispositivoSeleccionado } = useEscenario();
    const { escenarioController } = useECSSceneContext();

    const plantillas = useMemo(() => {
        return escenarioController.getPlantillasCorreo();
    }, [escenarioController]);

    const [plantillaIdx, setPlantillaIdx] = useState<number | "">("");
    const [correoDestinatario, setCorreoDestinatario] = useState("");
    const [enviado, setEnviado] = useState(false);

    const opcionesPlantilla: ComboBoxOption[] = plantillas.map((p, i) => ({
        label: p.asunto,
        value: String(i),
    }));
    const plantillaOption = opcionesPlantilla.find((o) => o.value === String(plantillaIdx)) ?? null;

    const plantillaSeleccionada: PlantillaCorreoPhishing | null =
        plantillaIdx !== "" ? plantillas[plantillaIdx] ?? null : null;

    const handleEnviar = () => {
        if (!plantillaSeleccionada || !correoDestinatario.trim() || !dispositivoSeleccionado?.nombre) return;

        escenarioController.registrarEnvioDeCorreo(
            dispositivoSeleccionado.nombre,
            correoDestinatario.trim(),
            plantillaSeleccionada.asunto
        );

        setEnviado(true);
        setTimeout(() => setEnviado(false), 3000);
    };

    const puedeEnviar = plantillaSeleccionada !== null && correoDestinatario.trim().length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.field}>
                <span className={styles.label}>Plantilla de correo</span>
                <ComboBox
                    placeholder="Seleccionar plantilla"
                    options={opcionesPlantilla}
                    value={plantillaOption}
                    onChange={(opt) => {
                        setPlantillaIdx(Number(opt.value));
                        setEnviado(false);
                    }}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="phishmatic-destinatario" className={styles.label}>Correo destinatario</label>
                <input
                    id="phishmatic-destinatario"
                    type="text"
                    className={styles.input}
                    placeholder="ejemplo@correo.com"
                    value={correoDestinatario}
                    onChange={(e) => {
                        setCorreoDestinatario(e.target.value);
                        setEnviado(false);
                    }}
                />
            </div>

            <div className={styles.preview}>
                {plantillaSeleccionada ? (
                    <>
                        <div className={styles.previewSubject}>
                            Asunto: {plantillaSeleccionada.asunto}
                        </div>
                        <div className={styles.previewBody}>
                            {plantillaSeleccionada.mensaje}
                        </div>
                    </>
                ) : (
                    <div className={styles.previewEmpty}>
                        Selecciona una plantilla para ver la vista previa del correo
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <span className={`${styles.successMsg} ${enviado ? styles.successMsgVisible : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Correo enviado exitosamente
                </span>
                <button
                    className={styles.btnSend}
                    onClick={handleEnviar}
                    disabled={!puedeEnviar}
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
