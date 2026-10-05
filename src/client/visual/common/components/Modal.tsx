import { useModal } from '../contexts/ModalContext';
import style from '../styles/Modal.module.css';
/**
 * Componente contenedor del modal
 * Se renderiza en el root de la aplicación y muestra el contenido dinámico
 */
export default function Modal() {
    const { isOpen, modalContent, modalTitle, dismissible, showHeader, closeModal } = useModal();

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (dismissible) {
            closeModal();
        }
    };

    return (
        <>
            <div className={style.modalOverlay} onClick={handleOverlayClick} aria-hidden="true" />
            <div className={style.modalContainer} role="dialog" aria-modal="true" aria-labelledby={modalTitle ? 'modal-title' : undefined}>
                {showHeader && (
                    <div className={style.modalHeader}>
                        {modalTitle && <h2 id="modal-title" className={style.modalTitle}>{modalTitle}</h2>}
                        {dismissible && (
                            <button className={style.modalCloseButton} onClick={closeModal} aria-label="Cerrar modal">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                <div className={style.modalContent}>
                    {modalContent}
                </div>
            </div>
        </>
    );
}
