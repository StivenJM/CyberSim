import styles from "../styles/TarjetaZonaActual.module.css";
import { useECSSceneContext } from "../context/ECSSceneContext";

export default function TarjetaZonaActual({ visible }: { visible: boolean }) {
    const { zonaActual, zonasDisponibles } = useECSSceneContext();

    const zona = zonasDisponibles.find((z) => z.id === zonaActual);

    if (!visible || !zona) return null;

    return (
        <div className={styles.contenedor}>
            <h3 className={styles.titulo}>{zona.nombre}</h3>
        </div>
    );
}
