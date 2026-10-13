import styles from '../styles/BarraProgresoFases.module.css';

interface BarraProgresoFasesProps {
    totalFases: number;
    faseActual: number;
    fasesCompletadas: boolean[];
    onFaseClick: (index: number) => void;
}

export default function BarraProgresoFases({ totalFases, faseActual, fasesCompletadas, onFaseClick }: BarraProgresoFasesProps) {
    return (
        <div className={styles.barraProgreso}>
            {Array.from({ length: totalFases }).map((_, index) => {
                const esCompletada = fasesCompletadas[index];
                const esActual = index === faseActual;
                const esNavegable = esCompletada || esActual || (index > 0 && fasesCompletadas[index - 1]);

                return (
                    <div key={index} className={styles.faseItem}>
                        <button
                            type="button"
                            className={`${styles.step} ${
                                esCompletada
                                    ? styles.completada
                                    : esActual
                                    ? styles.actual
                                    : styles.futura
                            }`}
                            disabled={!esNavegable}
                            onClick={() => esNavegable && onFaseClick(index)}
                        >
                            {esCompletada && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                        {index < totalFases - 1 && (
                            <div
                                className={`${styles.linea} ${
                                    esCompletada ? styles.lineaCompletada : styles.lineaPendiente
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
