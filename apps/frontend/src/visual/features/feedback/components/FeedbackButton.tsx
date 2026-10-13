import { useGenerateFeedback } from '../hooks/useGenerateFeedback';
import { useFeedback } from '../hooks/useFeedback';
import type { FeedbackData } from '../types/feedback.types';
import Tooltip from '../../../common/components/Tooltip';
import styles from './FeedbackButton.module.css';

interface FeedbackButtonProps {
    idEstudiante: number;
    slugEscenario: string;
    disabled?: boolean;
    onFeedbackGenerated?: (feedback: FeedbackData) => void;
}

export function FeedbackButton({ idEstudiante, slugEscenario, disabled, onFeedbackGenerated }: FeedbackButtonProps) {
    const { generateFeedback, loading } = useGenerateFeedback();
    const { habilitado, loading: checkingStatus, refetch, ultimaRetroalimentacion } = useFeedback(idEstudiante, slugEscenario);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Si quieres usar el mock para evitar llamadas reales descomenta lo siguiente:
        /*
        if (import.meta.env.DEV) {
            const mockFeedback: FeedbackData = {
                analisis: 'El estudiante muestra un patron recurrente de intentos fallidos...',
                fortaleza: 'Se observa persistencia en los intentos...',
                area_mejora: 'Es necesario reforzar la fase de enumeracion...',
                consejo: 'Antes de cada intento, dedica al menos 2 minutos a la fase de reconocimiento.',
            };
            onFeedbackGenerated?.(mockFeedback);
            return;
        }
        */

        if (!habilitado && ultimaRetroalimentacion) {
            onFeedbackGenerated?.(ultimaRetroalimentacion);
            return;
        }

        const response = await generateFeedback(idEstudiante, slugEscenario);

        if (response && response.feedback) {
            await refetch();

            if (onFeedbackGenerated) {
                onFeedbackGenerated(response.feedback);
            }
        }
    };

    // Ocultar el botón hasta saber el estado real de la retroalimentación.
    // Evita mostrar un botón deshabilitado mientras se resuelve el check-status.
    if (checkingStatus) {
        return null;
    }

    const isDisabled = loading || disabled || (!habilitado && !ultimaRetroalimentacion);

    const tooltipText = !habilitado && ultimaRetroalimentacion
        ? "Ver última retroalimentación"
        : "Generar retroalimentación con IA";

    return (
        <Tooltip text={tooltipText}>
            <button
                className={styles.feedbackButton}
                onClick={handleClick}
                disabled={isDisabled}
                aria-label={tooltipText}
            >
                {loading ? (
                    <span className={styles.spinner}></span>
                ) : (!habilitado && ultimaRetroalimentacion) ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <path d="M8 10h.01M12 10h.01M16 10h.01" />
                    </svg>
                )}
            </button>
        </Tooltip>
    );
}
