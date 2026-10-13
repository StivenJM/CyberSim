import { useEffect, useState } from 'react';
import styles from '../styles/ZoneToast.module.css';

interface ZoneToastProps {
    zoneName: string;
    show: boolean;
    onHide: () => void;
}

/**
 * Componente Toast que muestra el nombre de la zona actual
 * y desaparece después de un tiempo
 */
const ZoneToast: React.FC<ZoneToastProps> = ({ zoneName, show, onHide }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onHide, 300);
            }, 1500); // mostrar por 2.5 segundos

            return () => clearTimeout(timer);
        }
    }, [show, onHide, zoneName]);

    if (!show && !isVisible) return null;

    return (
        <div className={`${styles.toast} ${isVisible ? styles.show : styles.hide}`} role="status" aria-live="polite">
            {zoneName}
        </div>
    );
};

export default ZoneToast;
