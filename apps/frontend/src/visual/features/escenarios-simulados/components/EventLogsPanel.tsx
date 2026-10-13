import React from 'react';
import styles from '../styles/EventLogsPanel.module.css';
import { obtenerColorCategoria, obtenerIconoCategoria } from '../utils/getCategoryDetails';
import { useECSSceneContext } from '../context/ECSSceneContext';
import { LogCategory } from '../../../../shared/types/LogCategory';

const LogItem = (log: { time: string; content: string; category: string }) => (
    <article className={styles.logItem} style={{ borderLeft: `2px solid ${obtenerColorCategoria(log.category as LogCategory)}` }}>
        <div className={styles.logItemTime} style={{ color: obtenerColorCategoria(log.category as LogCategory) }}>
            {obtenerIconoCategoria(log.category as LogCategory)}
            <time>{log.time}</time>
        </div>
        <p>{log.content}</p>
    </article>
);

const EventLogsPanel: React.FC = () => {
    const { logs, hasNewLog, logsPanelOpen, toggleLogsPanel } = useECSSceneContext();

    const handleToggle = () => {
        toggleLogsPanel(!logsPanelOpen);
    };

    return (
        <>
            <aside
                className={`${styles.logsPanel} ${!logsPanelOpen ? styles.hidden : ''}`}
                aria-label="Panel de registros de eventos"
                aria-hidden={!logsPanelOpen}
                data-tour="logs-panel"
            >
                <header className={styles.logsHeader}>
                    <h2 className={styles.logsTitle}>Logs</h2>
                    <button
                        className={styles.toggleButton}
                        onClick={handleToggle}
                        aria-label="Cerrar panel de registros"
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 9h1m4 0h3m-8 4h5M8 4h10a3 3 0 0 1 3 3v8c0 .577-.163 1.116-.445 1.573M18 18h-5l-5 3v-3H6a3 3 0 0 1-3-3V7c0-1.085.576-2.036 1.439-2.562M3 3l18 18" /></svg>
                    </button>
                </header>
                <section className={styles.logsContent} aria-label="Lista de eventos registrados">
                    {logs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 9h8m-8 4h6m1 5h-2l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3" />
                            </svg>
                            <p className={styles.emptyStateText}>No hay eventos registrados</p>
                            <span className={styles.emptyStateSubtext}>Los eventos aparecerán aquí cuando ocurran</span>
                        </div>
                    ) : (
                        logs.map((log, index: number) => (
                            <LogItem key={index} {...log} />
                        ))
                    )}
                </section>
            </aside>

            {!logsPanelOpen && (
                <button
                    className={styles.toggleButtonCollapsed}
                    onClick={handleToggle}
                    aria-label="Abrir panel de registros"
                    type="button"
                    data-tour="logs-open"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 9h8m-8 4h6m1 5h-2l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5.5M19 16v3m0 3v.01" /></svg>
                    {hasNewLog && <span className={styles.newLogIndicator} />}
                </button>
            )}
        </>
    );
};

export default EventLogsPanel;
