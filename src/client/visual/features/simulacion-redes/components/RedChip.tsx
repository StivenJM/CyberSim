import styles from "../styles/RedChip.module.css";

export default function RedChip({
    nombre,
    color,
    activado = true
}: {
    nombre: string;
    color: string;
    activado?: boolean
}) {
    return (
        <div className={`${styles.redChipContainer} ${activado ? '' : styles.redChipDesactivado}`}>
            <div
                className={styles.colorDot}
                style={{
                    backgroundColor: color,
                    boxShadow: `0 0 4px ${color}`
                }}
            />
            <span className={styles.redNombre}>{nombre}</span>
        </div>
    );
}