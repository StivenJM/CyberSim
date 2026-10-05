import { useECSSceneContext } from "../context/ECSSceneContext";
import styles from "../styles/TarjetaLogNuevo.module.css";
import { useEffect } from "react";
import { obtenerColorCategoria, obtenerIconoCategoria } from '../utils/getCategoryDetails';
import { LogCategory } from '../../../../shared/types/LogCategory';

export default function TarjetaLogNuevo() {
    const { mostrarNuevoLog, setMostrarNuevoLog, setMensajeLog, mensajeLog, tipoLog, tiempoLog } = useECSSceneContext();

    useEffect(() => {
        if (!mostrarNuevoLog) return;

        const timer = setTimeout(() => {
            // ocultar la tarjeta y limpiar el mensaje después de 4 segundos
            setMostrarNuevoLog(false);
            setMensajeLog("");
        }, 4000);

        return () => clearTimeout(timer);
    }, [mostrarNuevoLog, setMostrarNuevoLog, setMensajeLog]);

    if (!mostrarNuevoLog) {
        return null;
    }

    const formatearTiempo = (segundos: number): string => {
        const minutos = Math.floor(segundos / 60);
        const segs = Math.floor(segundos % 60);
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    // Mapear el tipo a categorías de log
    const tipoToCategory: Record<string, LogCategory> = {
        ataque: LogCategory.ATAQUE,
        advertencia: LogCategory.ADVERTENCIA,
        completado: LogCategory.COMPLETADO,
        informacion: LogCategory.INFORMACION,
    };

    const category = tipoToCategory[tipoLog];
    const color = obtenerColorCategoria(category);
    const icon = obtenerIconoCategoria(category);

    return (
        <article className={styles.logItem} style={{ borderLeft: `2px solid ${color}` }}>
            <div className={styles.logItemTime} style={{ color }}>
                {icon}
                <time>{formatearTiempo(tiempoLog)}</time>
            </div>
            <p>{mensajeLog}</p>
        </article>
    );
}
