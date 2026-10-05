import { useModal } from '../../../common/contexts/ModalContext';
import { EscenarioController } from '../../../../ecs/controllers/EscenarioController';
import styles from '../styles/ModalResultadoFase.module.css';

interface ModalResultadoFaseProps {
    tipo: 'fallo' | 'exito';
    mensaje: string;
}

export default function ModalResultadoFase({ tipo, mensaje }: ModalResultadoFaseProps) {
    const { closeModal } = useModal();

    const handleReintentar = () => {
        closeModal();
        EscenarioController.reset();
        window.location.href = '/';
    };

    return (
        <div className={styles.modalContainer}>
            <div className={styles.iconContainer}>
                {tipo === 'exito' ? (
                    <div className={`${styles.icon} ${styles.iconExito}`}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                ) : (
                    <div className={`${styles.icon} ${styles.iconFallo}`}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                )}
            </div>

            <h2 className={styles.titulo}>
                {tipo === 'exito' ? '¡Felicitaciones!' : 'Fase No Completada'}
            </h2>

            <p className={styles.mensaje}>{mensaje}</p>

            <div className={styles.botonesContainer}>
                <button className={styles.btnReintentar} onClick={handleReintentar}>
                    {tipo === 'exito' ? 'Jugar otro nivel' : 'Ir a la selección de niveles'}
                </button>
            </div>
        </div>
    );
}
