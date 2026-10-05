import { useAgentMalvado } from '../context/AgentMalvadoContext';
import { Bot, Sparkles, Play, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScenarioBuilder } from '../hooks/useScenarioBuilder';
import Button from '../../../../common/components/Button';
import styles from './AgentMalvadoUI.module.css';

export default function AgentMalvadoUI() {
    const { isGenerating, generatedScenario, error, generateDynamicLevel, clearScenario } = useAgentMalvado();
    const { buildAndPlay } = useScenarioBuilder();

    const handleGenerate = () => generateDynamicLevel();
    const handlePlay = () => buildAndPlay();

    const scenario = generatedScenario as Record<string, string> | null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
        >
            {!generatedScenario && !error && (
                <Button
                    variant="ai"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <Bot size={14} /> : <Sparkles size={14} />}
                    style={{ width: '100%' }}
                >
                    {isGenerating ? 'Creando nivel...' : 'Generar nivel personalizado con IA'}
                </Button>
            )}

            {error && (
                <div id="gen-error" className={styles.errorContainer}>
                    <div className={styles.errorMessage}>
                        <AlertTriangle size={14} className={styles.errorIcon} />
                        <span>{String(error)}</span>
                    </div>
                    <button onClick={handleGenerate} className={styles.buttonSmall}>
                        Reintentar
                    </button>
                </div>
            )}

            {scenario && !isGenerating && (
                <div id="gen-success" className={styles.successContainer}>
                    <div className={styles.scenarioCard}>
                        <h3 className={styles.scenarioTitle}>¡Nivel de práctica listo!</h3>
                        <div className={styles.scenarioName}>
                            {scenario.titulo ?? 'Operación Clasificada'}
                        </div>
                    </div>

                    <div className={styles.actionsRow}>
                        <Button variant="success" onClick={handlePlay} icon={<Play size={14} />}>
                            Jugar
                        </Button>
                        <Button variant="secondary" onClick={clearScenario}>
                            Descartar
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
