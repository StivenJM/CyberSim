import { useEffect, useState } from "react";
import ComboBox from "../../../common/components/ComboBox";
import styles from "../styles/ModalVPN.module.css";
import { TipoDispositivo, TipoProteccionVPN } from "../../../../shared/types/DeviceEnums";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { useEscenario } from "../../../common/contexts";
import type { PerfilVPNGateway } from "../../../../shared/types/EscenarioTypes";
import TrashIcon from "../../../common/icons/TrashIcon";
import { ZonaComponent } from "../../../../ecs/components/ZonaComponent";
import { DispositivoComponent, RedComponent } from "../../../../ecs/components";
import ComputadoraIcon from "../../../common/icons/ComputadoraIcon";

type OptionItem = { label: string; value: string };

// No cambiar estos valores, deben coincidir con 
// el enum TipoProteccionVPN
const OPCIONES_PROTECCION = [
  { label: "EA", value: TipoProteccionVPN.EA },
  { label: "A", value: TipoProteccionVPN.A },
  { label: "N", value: TipoProteccionVPN.N },
  { label: "B", value: TipoProteccionVPN.B },
]

export default function ModalVPN() {
  const [lanLocal, setLanLocal] = useState<OptionItem | null>(null);
  const [hostLan, setHostLan] = useState<OptionItem | null>(null);
  const [proteccion, setProteccion] = useState<OptionItem | null>(null);
  const [dominioRemoto, setDominioRemoto] = useState<OptionItem | null>(null);
  const [hostRemoto, setHostRemoto] = useState<OptionItem | null>(null);

  const [configuraciones, setConfiguraciones] = useState<Array<PerfilVPNGateway>>([]);
  const [lanLocalOpciones, setLanLocalOpciones] = useState<Array<OptionItem>>([]);
  const [hostLanOpciones, setHostLanOpciones] = useState<Array<OptionItem>>([]);
  const [dominioRemotoOpciones, setDominioRemotoOpciones] = useState<Array<OptionItem>>([]);
  const [hostRemotoOpciones, setHostRemotoOpciones] = useState<Array<OptionItem>>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isPrimeraParteCompleta = lanLocal && dominioRemoto;
  const isFormularioCompleto = lanLocal && hostLan && proteccion && dominioRemoto && hostRemoto;

  const { redController } = useECSSceneContext();
  const { entidadSeleccionadaId } = useEscenario();

  function eliminarPerfilVPNGateway(indiceEnTabla: number) {
    redController.removerPerfilVPNGateway(entidadSeleccionadaId!, indiceEnTabla);

    const perfilesActualizados = redController.getPerfilesVPNGateway(entidadSeleccionadaId!);
    if (perfilesActualizados) {
      setConfiguraciones([...perfilesActualizados]);
    }
  }

  useEffect(() => {
    const perfiles = redController.getPerfilesVPNGateway(entidadSeleccionadaId!);
    if (perfiles) {
      setConfiguraciones(perfiles);
    }

    // Obtener LANs locales (zonas del gateway actual)

    const redesLocalesEntidades = redController.ecsManager.getComponentes(entidadSeleccionadaId!)?.get(DispositivoComponent)!.redes;

    if (redesLocalesEntidades) {
      const opciones = redesLocalesEntidades
        .map((redEntidad) => {
          const redComponent = redController.ecsManager.getComponentes(redEntidad)?.get(RedComponent);
          if (redComponent?.nombre != "Internet") {
            return redComponent
              ? { label: redComponent.nombre, value: redEntidad.toString() }
              : null;
          }
          return null;
        })
        .filter((opcion): opcion is OptionItem => opcion !== null);
      setLanLocalOpciones(opciones);
    }

    // Obtener dominios remotos
    const dominiosRemotos = redController.getDominiosRemotos(entidadSeleccionadaId!);
    if (dominiosRemotos) {
      const opciones = dominiosRemotos
        .map((entidad) => {
          const zonaComponent = redController.ecsManager.getComponentes(entidad)?.get(ZonaComponent);
          return zonaComponent
            ? { label: zonaComponent.dominio, value: entidad.toString() }
            : null;
        })
        .filter((opcion): opcion is OptionItem => opcion !== null);
      setDominioRemotoOpciones(opciones);
    }
  }, []);

  useEffect(() => {
    if (!lanLocal?.value) {
      setHostLanOpciones([]);
      return;
    }

    const hosts = redController.obtenerDispositivosPorRed(parseInt(lanLocal.value));
    if (hosts) {
      const opcionesHosts = hosts
        .map((entidad) => {
          const dispositivoComponent = redController.ecsManager.getComponentes(entidad)?.get(DispositivoComponent);
          if (dispositivoComponent?.tipo === TipoDispositivo.WORKSTATION || dispositivoComponent?.tipo === TipoDispositivo.SERVER) {
            return dispositivoComponent
              ? { label: dispositivoComponent.nombre, value: entidad.toString() }
              : null;
          }
          return null;
        })
        .filter((opcion): opcion is OptionItem => opcion !== null);
      setHostLanOpciones(opcionesHosts);
    }
  }, [lanLocal, redController]);

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
        .filter((opcion): opcion is OptionItem => opcion !== null);
      setHostRemotoOpciones(opcionesHosts);
    }
  }, [dominioRemoto, redController]);

  useEffect(() => {
    setErrorMessage("");
  }, [lanLocal, hostLan, proteccion, hostRemoto]);

  const agregarConfiguracion = () => {
    if (isFormularioCompleto) {
      const configExistente = configuraciones.some(
        (config) =>
          config.lanLocal === lanLocal!.label &&
          config.hostLan === hostLan!.label &&
          config.proteccion === proteccion!.value &&
          config.dominioRemoto === dominioRemoto!.label &&
          config.hostRemoto === hostRemoto!.label
      );

      if (configExistente) {
        setErrorMessage("Esta configuración ya existe.");
        return;
      }

      redController.agregarPerfilVPNGateway(
        entidadSeleccionadaId!,
        {
          lanLocal: lanLocal.label,
          hostLan: hostLan!.label,
          proteccion: proteccion!.value as TipoProteccionVPN,
          dominioRemoto: dominioRemoto!.label,
          hostRemoto: hostRemoto!.label
        }
      );

      setLanLocal(null);
      setHostLan(null);
      setProteccion(null);
      setDominioRemoto(null);
      setHostRemoto(null);
      setErrorMessage("");

      const perfilesActualizados = redController.getPerfilesVPNGateway(entidadSeleccionadaId!);
      if (perfilesActualizados) {
        setConfiguraciones(perfilesActualizados);
      }
    }
  };

  return (
    <div className={styles.modalVPNContainer}>
      <p className={styles.nota}>
        Como gateway VPN, define las conexiones entre hosts de tus LANs y destinos externos.
      </p>
      <div className={styles.formContainer}>
        <div className={styles.primeraParte}>
          <div className={styles.inputGroup}>
            <p className={styles.label}>LAN Local</p>
            <ComboBox
              items={lanLocalOpciones}
              placeholder="Seleccionar"
              value={lanLocal}
              onChange={setLanLocal}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />
          </div>
          <div className={styles.inputGroup}>
            <p className={styles.label}>Dominio Remoto</p>
            <ComboBox
              items={dominioRemotoOpciones}
              placeholder="Seleccionar"
              value={dominioRemoto}
              onChange={setDominioRemoto}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />
          </div>
        </div>
        <div
          className={`${styles.segundaParte} ${isPrimeraParteCompleta ? styles.visible : styles.hidden
            }`}
        >
          <div className={styles.inputGroup}>
            <p className={styles.label}>Protección</p>
            <ComboBox
              items={OPCIONES_PROTECCION}
              placeholder="Seleccionar"
              value={proteccion}
              onChange={setProteccion}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />
          </div>
          <div className={styles.inputGroup}>
            <p className={styles.label}>Host en LAN</p>
            <ComboBox
              items={hostLanOpciones}
              placeholder="Seleccionar"
              value={hostLan}
              onChange={setHostLan}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />
          </div>
          <div className={styles.inputGroup}>
            <p className={styles.label}>Host remoto</p>
            <ComboBox
              items={hostRemotoOpciones}
              placeholder="Seleccionar"
              value={hostRemoto}
              onChange={setHostRemoto}
              getKey={(item) => item.value}
              getLabel={(item) => item.label}
            />
          </div>
          <button onClick={agregarConfiguracion} disabled={!isFormularioCompleto}>
            +
          </button>
        </div>
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
      <h3>Configuraciones Agregadas</h3>
      <div className={styles.listaConfiguraciones}>
        {configuraciones.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay configuraciones agregadas</p>
          </div>
        ) : (
          <>
            {configuraciones.map((config, index) => (
              <ConfiguracionVpnGateway
                key={index}
                index={index}
                lanLocal={config.lanLocal}
                hostLan={config.hostLan}
                proteccion={config.proteccion}
                dominioRemoto={config.dominioRemoto}
                hostRemoto={config.hostRemoto}
                redController={redController}
                onEliminar={eliminarPerfilVPNGateway}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

interface ConfiguracionVpnGatewayProps extends PerfilVPNGateway {
  index: number;
  redController: ReturnType<typeof useECSSceneContext>["redController"];
  onEliminar: (index: number) => void;
}

function ConfiguracionVpnGateway({
  index,
  lanLocal,
  hostLan,
  proteccion,
  dominioRemoto,
  hostRemoto,
  redController,
  onEliminar
}: ConfiguracionVpnGatewayProps) {

  const entidadLanLocal = parseInt(lanLocal);
  const zonaLocalComponent = redController.ecsManager.getComponentes(entidadLanLocal)?.get(ZonaComponent);
  const nombreLanLocal = zonaLocalComponent?.nombre || zonaLocalComponent?.dominio || lanLocal;

  const entidadHostLan = parseInt(hostLan);
  const dispositivoLanComponent = redController.ecsManager.getComponentes(entidadHostLan)?.get(DispositivoComponent);
  const nombreHostLan = dispositivoLanComponent?.nombre || hostLan;

  const entidadZonaRemota = parseInt(dominioRemoto);
  const zonaRemotaComponent = redController.ecsManager.getComponentes(entidadZonaRemota)?.get(ZonaComponent);
  const nombreDominioRemoto = zonaRemotaComponent?.dominio || dominioRemoto;

  const entidadHostRemoto = parseInt(hostRemoto);
  const dispositivoRemotoComponent = redController.ecsManager.getComponentes(entidadHostRemoto)?.get(DispositivoComponent);
  const nombreHostRemoto = dispositivoRemotoComponent?.nombre || hostRemoto;

  return (
    <div className={styles.configuracionItem}>
      <div className={styles.dispositivoLocalIcon}>
        <ComputadoraIcon size={16} />
      </div>
      <div className={styles.configuracionDetalles}>
        <div className={styles.configuracionField}>
          <span className={styles.configLabel}>{nombreLanLocal}</span>
          <span className={styles.configValue}>{nombreHostLan}</span>
        </div>
        <div className={styles.configuracionField} style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
          <span className={styles.configLabel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M16.15 13H5q-.425 0-.712-.288T4 12t.288-.712T5 11h11.15L13.3 8.15q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L19.3 11.3q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.575 4.575q-.3.3-.712.288t-.713-.313q-.275-.3-.288-.7t.288-.7z" />
            </svg>
          </span>
          <span className={styles.configValue} style={{ marginTop: "-5px" }}>{proteccion}</span>
        </div>
        <div className={styles.configuracionField} style={{ textAlign: "right" }}>
          <span className={styles.configLabel}>{nombreDominioRemoto}</span>
          <span className={styles.configValue}>{nombreHostRemoto}</span>
        </div>
      </div>
      <div className={styles.dispositivoRemotoIcon}>
        <ComputadoraIcon size={16} />
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
