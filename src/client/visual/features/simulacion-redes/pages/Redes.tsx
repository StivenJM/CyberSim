import styles from "../styles/Redes.module.css";
import VistaTopologica from "../components/VistaTopologica";
import PageTransition from "../../../common/components/PageTransition";

export default function Redes() {
    return (
        <PageTransition>
            <div className={styles.contenedor}>
                <VistaTopologica />
            </div>
        </PageTransition>
    );
}