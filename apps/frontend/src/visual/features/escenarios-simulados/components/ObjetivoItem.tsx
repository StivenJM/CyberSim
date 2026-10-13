import GreenCheckBox from "../../../common/components/GreenCheckBox";
import styles from "../styles/ObjetivoItem.module.css";

interface ObjetivoItemProps {
    descripcion: string;
    completado: boolean;
}

export default function ObjetivoItem({ descripcion, completado }: ObjetivoItemProps) {
    return (
        <div className={styles.objetivoItem}>
            <GreenCheckBox checked={completado} />
            <p className={styles.descripcion}>{descripcion}</p>
        </div>
    );
}