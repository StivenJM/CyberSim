import styles from "../styles/TarjetaEntidadSeleccionada.module.css";
import { useEscenario } from "../../../common/contexts";

export default function TarjetaEntidadSeleccionada({ visible }: { visible: boolean }) {
    const { dispositivoSeleccionado } = useEscenario();

    if (!visible || !dispositivoSeleccionado) return null;

    return (
        <div className={styles.contenedor}>
          
                <h3 className={styles.titulo}>{dispositivoSeleccionado.nombre}</h3>
            

        </div>
    );
}
