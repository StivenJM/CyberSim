import { useEffect } from 'react';
import type { FeedbackData } from '../types/feedback.types';
import Button from '../../../common/components/Button';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: FeedbackData | null;
    escenarioNombre?: string;
}

export function FeedbackModal({ isOpen, onClose, feedback, escenarioNombre }: FeedbackModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !feedback) return null;

    const formatText = (text: string) => {
        const parts = text.split(/(`[^`]+`)/g);
        return parts.map((part, i) =>
            part.startsWith('`') && part.endsWith('`')
                ? <code key={i} className={styles.inlineCode}>{part.slice(1, -1)}</code>
                : part
        );
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h2>Retroalimentación</h2>
                        {escenarioNombre && <p className={styles.subtitle}>{escenarioNombre}</p>}
                    </div>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <p className={styles.text}>{formatText(feedback.analisis)}</p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Fortalezas</h3>
                        <p className={styles.text}>{formatText(feedback.fortaleza)}</p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Áreas de Mejora</h3>
                        <p className={styles.text}>{formatText(feedback.area_mejora)}</p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Consejo</h3>
                        <p className={styles.text}>{formatText(feedback.consejo)}</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button variant="primary" onClick={onClose}>
                        Entendido
                    </Button>
                </div>
            </div>
        </div>
    );
}
