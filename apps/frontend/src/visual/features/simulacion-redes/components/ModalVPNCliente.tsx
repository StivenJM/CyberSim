import { useEffect, useState } from "react";
import styles from "../styles/ModalVPN.module.css";
import { TipoProteccionVPN } from "../../../../shared/types/DeviceEnums";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { useEscenario } from "../../../common/contexts";
import type { PerfilClienteVPN } from "../../../../shared/types/EscenarioTypes";
import TrashIcon from "../../../common/icons/TrashIcon";
import { ZonaComponent } from "../../../../ecs/components/ZonaComponent";
import { DispositivoComponent } from "../../../../ecs/components";
import ComputadoraIcon from "../../../common/icons/ComputadoraIcon";
import ComboBox, { type ComboBoxOption } from "../../hardening-de-dispositivos/components/ComboBox";

const OPCIONES_PROTECCION: ComboBoxOption[] = [
    { label: "Encriptar y Autenticar", value: TipoProteccionVPN.EA },
    { label: "Solo Autenticar", value: TipoProteccionVPN.A },
    { label: "Ninguna", value: TipoProteccionVPN.N },
    { label: "Bloquear", value: TipoProteccionVPN.B },
];

export default function ModalVPNCliente() {
    const [proteccion, setProteccion] = useState<ComboBoxOption | null>(null);
    const [dominioRemoto, setDominioRemoto] = useState<ComboBoxOption | null>(null);
    const [hostRemoto, setHostRemoto] = useState<ComboBoxOption | null>(null);

    const [configuraciones, setConfiguraciones] = useState<Array<PerfilClienteVPN>>([]);
    const [dominioRemotoOpciones, setDominioRemotoOpciones] = useState<Array<ComboBoxOption>>([]);
    const [hostRemotoOpciones, setHostRemotoOpciones] = useState<Array<ComboBoxOption>>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const isFormularioCompleto = proteccion && dominioRemoto && hostRemoto;

    const { redController } = useECSSceneContext();
    const { entidadSeleccionadaId } = useEscenario();

    function eliminarPerfilClienteVPN(indiceEnTabla: number) {
        redController.removerPerfilClienteVPN(entidadSeleccionadaId!, indiceEnTabla);
        const perfilesActualizados = redController.getPerfilesClienteVPN(entidadSeleccionadaId!);
        if (perfilesActualizados) {
            setConfiguraciones([...perfilesActualizados]);
        }
    }

    useEffect(() => {
        const perfiles = redController.getPerfilesClienteVPN(entidadSeleccionadaId!);
        if (perfiles) {
            setConfiguraciones(perfiles);
        }

        const dominiosRemotos = redController.getDominiosRemotos(entidadSeleccionadaId!);
        if (dominiosRemotos) {
            const opciones = dominiosRemotos
                .map((entidad) => {
                    const zonaComponent = redController.ecsManager.getComponentes(entidad)?.get(ZonaComponent);
                    return zonaComponent
                        ? { label: zonaComponent.dominio, value: entidad.toString() }
                        : null;
                })
                .filter((opcion): opcion is ComboBoxOption => opcion !== null);
            setDominioRemotoOpciones(opciones);
        }
    }, []);

    useEffect(() => {
        if (!dominioRemoto?.value) {
            setHostRemotoOpciones([]);
            return;
        }

        setErrorMessage("");

        const entidadZona = parseInt(dominioRemoto.value);
        const hosts = redController.getDispositivosPorZona(entidadZona);

        if (hosts) {
            const opcionesHosts = hosts
                .map((entidad) => {
                    const dispositivoComponent = redController.ecsManager.getComponentes(entidad)?.get(DispositivoComponent);
                    return dispositivoComponent
                        ? { label: dispositivoComponent.nombre, value: entidad.toString() }
                        : null;
                })
                .filter((opcion): opcion is ComboBoxOption => opcion !== null);
            setHostRemotoOpciones(opcionesHosts);
        }
    }, [dominioRemoto, redController]);

    useEffect(() => {
        setErrorMessage("");
    }, [proteccion, hostRemoto]);

    const agregarConfiguracion = () => {
        if (isFormularioCompleto) {
            const configExistente = configuraciones.some(
                (config) =>
                    config.proteccion === proteccion!.value &&
                    config.dominioRemoto === dominioRemoto!.value &&
                    config.hostRemoto === hostRemoto!.value
            );

            if (configExistente) {
                setErrorMessage("Esta configuración ya existe.");
                return;
            }

            redController.agregarPerfilClienteVPN(
                entidadSeleccionadaId!,
                {
                    proteccion: proteccion!.value as TipoProteccionVPN,
                    dominioRemoto: dominioRemoto!.label,
                    hostRemoto: hostRemoto!.label,
                }
            );

            setProteccion(null);
            setDominioRemoto(null);
            setHostRemoto(null);
            setErrorMessage("");

            const perfilesActualizados = redController.getPerfilesClienteVPN(entidadSeleccionadaId!);
            if (perfilesActualizados) {
                setConfiguraciones(perfilesActualizados);
            }
        }
    };

    return (
        <div className={styles.modalVPNContainer}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Nuevo Perfil</h3>

                <div className={styles.formHorizontal}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Protección</label>
                        <ComboBox
                            options={OPCIONES_PROTECCION}
                            placeholder="Seleccionar"
                            value={proteccion}
                            onChange={setProteccion}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Dominio remoto</label>
                        <ComboBox
                            options={dominioRemotoOpciones}
                            placeholder="Seleccionar"
                            value={dominioRemoto}
                            onChange={setDominioRemoto}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Host remoto</label>
                        <ComboBox
                            options={hostRemotoOpciones}
                            placeholder="Seleccionar"
                            value={hostRemoto}
                            onChange={setHostRemoto}
                        />
                    </div>
                    <button
                        className={styles.addButton}
                        onClick={agregarConfiguracion}
                        disabled={!isFormularioCompleto}
                    >
                        Añadir
                    </button>
                </div>
                {errorMessage && (
                    <div className={styles.errorMessage}>{errorMessage}</div>
                )}
            </div>
            <p className={styles.nota}>
                Como cliente VPN, este dispositivo se conectará a un dominio remoto específico.
                Define el nivel de protección y los destinos de conexión.
            </p>
            <div>
                <h3 className={styles.sectionTitle}>Perfiles Activos</h3>
                {configuraciones.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No hay configuraciones agregadas</p>
                    </div>
                ) : (
                    <div className={styles.listaConfiguraciones}>
                        {configuraciones.map((config, index) => (
                            <ConfiguracionVpnCliente
                                key={index}
                                index={index}
                                proteccion={config.proteccion}
                                dominioRemoto={config.dominioRemoto}
                                hostRemoto={config.hostRemoto}
                                redController={redController}
                                onEliminar={eliminarPerfilClienteVPN}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ConfiguracionVpnClienteProps extends PerfilClienteVPN {
    index: number;
    redController: ReturnType<typeof useECSSceneContext>["redController"];
    onEliminar: (index: number) => void;
}

function ConfiguracionVpnCliente({ index, proteccion, dominioRemoto, hostRemoto, redController, onEliminar }: ConfiguracionVpnClienteProps) {
    const entidadZona = parseInt(dominioRemoto);
    const zonaComponent = redController.ecsManager.getComponentes(entidadZona)?.get(ZonaComponent);
    const nombreDominio = zonaComponent?.dominio || dominioRemoto;

    const entidadHost = parseInt(hostRemoto);
    const dispositivoComponent = redController.ecsManager.getComponentes(entidadHost)?.get(DispositivoComponent);
    const nombreHost = dispositivoComponent?.nombre || hostRemoto;

    return (
        <div className={styles.configuracionItem}>
            <div className={styles.dispositivoRemotoIcon}>
                <ComputadoraIcon size={16} />
            </div>
            <div className={styles.configuracionDetalles}>
                <div className={styles.configuracionField}>
                    <span className={styles.configLabel}>Protección</span>
                    <span className={styles.configValue}>{proteccion}</span>
                </div>
                <div className={styles.configuracionField}>
                    <span className={styles.configLabel}>Dominio remoto</span>
                    <span className={styles.configValue}>{nombreDominio}</span>
                </div>
                <div className={styles.configuracionField}>
                    <span className={styles.configLabel}>Host remoto</span>
                    <span className={styles.configValue}>{nombreHost}</span>
                </div>
            </div>
            <button
                className={styles.deleteButton}
                title="Eliminar configuración"
                onClick={() => onEliminar(index)}
            >
                <TrashIcon size={16} />
            </button>
        </div>
    );
}
