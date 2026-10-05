import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import styles from '../styles/Sidebar.module.css';
import NavigationLink from './Navigation';
import Tooltip from './Tooltip';
import DevicesIcon from '../icons/DevicesIcon';
import OfficeIcon from '../icons/OfficeIcon';
import RedesIcon from '../icons/RedesIcon';
import EstrellaPartidaIcon from '../icons/EstrellaPartidaIcon';
import EstrellasIcon from '../icons/EstrellasIcon';
import { formatearTiempo } from '../utils/formatearTiempo';
import { useECSSceneContext } from '../../features/escenarios-simulados/context/ECSSceneContext';
import { useChatContext } from '../../features/chat/context/ChatContext';
import ChatContainer from '../../features/chat/components/ChatContainer';
import { useScreenTransition } from '../contexts/ScreenTransitionContext';
import { useEscenario } from '../contexts';
import { EscenarioController } from '../../../ecs/controllers/EscenarioController';
import Button from './Button';

const Sidebar: React.FC = () => {
    const { pause, resume, isPaused, tiempoTranscurrido, processEntities } = useECSSceneContext();
    const { isChatOpen, toggleChat } = useChatContext();
    const { startZoom, isZooming, desktopMode, requestZoomToDevice, exitDesktopMode } = useScreenTransition();
    const { entidadSeleccionadaId } = useEscenario();
    const location = useLocation();
    const navigate = useNavigate();
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const handleDispositivosClick = () => {
        if (isZooming || desktopMode) return;

        const entities = processEntities();
        let target: { position: [number, number, number]; rotationY: number } | null = null;

        // Try selected entity (if it's a workstation accesible)
        if (entidadSeleccionadaId != null) {
            const selected = entities.find(
                e => e.entidadId === entidadSeleccionadaId &&
                    e.objetoConTipo.tipo?.toUpperCase() === 'WORKSTATION' &&
                    e.esInteractiva
            );
            if (selected) {
                target = { position: selected.position, rotationY: selected.rotacionY };
            }
        }

        // Fallback: first interactive workstation in current zone. Las zonas no
        // interactivas no dan acceso a sus dispositivos desde este botón.
        if (!target) {
            const firstWorkstation = entities.find(
                e => e.objetoConTipo.tipo?.toUpperCase() === 'WORKSTATION' &&
                    e.esInteractiva
            );
            if (firstWorkstation) {
                target = { position: firstWorkstation.position, rotationY: firstWorkstation.rotacionY };
            }
        }

        if (!target) return;

        if (location.pathname === '/') {
            startZoom(target.position, target.rotationY);
        } else {
            requestZoomToDevice(target.position, target.rotationY);
            navigate('/');
        }
    };

    const handleExitClick = () => {
        setShowExitConfirm(true);
    };

    const handleConfirmExit = () => {
        setShowExitConfirm(false);
        EscenarioController.reset();
        navigate('/seleccion-niveles');
    };

    const handleCancelExit = () => {
        setShowExitConfirm(false);
    };

    return (
        <>
            {showExitConfirm && (
                <>
                    <div className={styles.exitOverlay} onClick={handleCancelExit} />
                    <div className={styles.exitDialog}>
                        <p className={styles.exitDialogText}>
                            ¿Estás seguro de que deseas salir? Todo el progreso del escenario actual se perderá y tendrás que comenzar de nuevo.
                        </p>
                        <div className={styles.exitDialogActions}>
                            <Button variant="secondary" onClick={handleCancelExit}>
                                Cancelar
                            </Button>
                            <Button variant="danger" onClick={handleConfirmExit}>
                                Salir del escenario
                            </Button>
                        </div>
                    </div>
                </>
            )}
            <div className={styles.dockWrapper}>
                <nav className={styles.dock} data-tour="dock">
                    <div className={styles.navSection}>
                        {desktopMode && !isZooming ? (
                            <Tooltip text="Oficina" position="right">
                                <button
                                    className={styles.dockItem}
                                    onClick={exitDesktopMode}
                                    aria-label="Oficina"
                                >
                                    <OfficeIcon size={20} />
                                </button>
                            </Tooltip>
                        ) : (
                            <NavigationLink icon={<OfficeIcon size={20} />} label="Oficina" to="/" forceInactive={desktopMode || isZooming} data-tour="dock-oficina" tooltipPosition="right" />
                        )}
                        <Tooltip text="Dispositivos" position="right">
                            <button
                                className={`${styles.dockItem} ${desktopMode || isZooming ? styles.active : ''}`}
                                onClick={handleDispositivosClick}
                                data-tour="dock-dispositivos"
                                aria-label="Dispositivos"
                            >
                                <DevicesIcon size={20} />
                            </button>
                        </Tooltip>
                        <NavigationLink icon={<RedesIcon size={20} />} label="Redes" to="/redes" data-tour="dock-redes" tooltipPosition="right" />
                        <NavigationLink icon={<EstrellaPartidaIcon size={20} />} label="Partida" to="/fases-partida" data-tour="dock-partida" tooltipPosition="right" />
                    </div>

                    <div className={styles.spacer} />

                    <div className={styles.controlsSection}>
                        <div className={styles.tiempoDisplay} data-tour="dock-tiempo">
                            {formatearTiempo(tiempoTranscurrido)}
                        </div>

                        <Tooltip text={isPaused ? 'Reanudar' : 'Pausar'} position="right">
                            <button
                                className={styles.controlBtn}
                                onClick={() => { if (isPaused) resume(); else pause(); }}
                                data-tour="dock-pausa"
                                aria-label={isPaused ? 'Reanudar animacion' : 'Pausar animacion'}
                            >
                                {isPaused ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M16 19q-.825 0-1.412-.587T14 17V7q0-.825.588-1.412T16 5t1.413.588T18 7v10q0 .825-.587 1.413T16 19m-8 0q-.825 0-1.412-.587T6 17V7q0-.825.588-1.412T8 5t1.413.588T10 7v10q0 .825-.587 1.413T8 19" />
                                    </svg>
                                )}
                            </button>
                        </Tooltip>

                        <div className={styles.chatWrapper}>
                            <Tooltip text="Chatbot" position="right">
                                <button
                                    className={`${styles.chatBtn} ${isChatOpen ? styles.chatActive : ''}`}
                                    onClick={() => toggleChat()}
                                    aria-label={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
                                    data-chat-toggle="true"
                                >
                                    <EstrellasIcon size={20} />
                                </button>
                            </Tooltip>
                            <ChatContainer
                                isOpen={isChatOpen}
                            />
                        </div>
                    </div>
                </nav>
                <div className={styles.exitWrapper}>
                    <Tooltip text="Salir" position="right">
                        <button className={styles.exitBtn} onClick={handleExitClick} aria-label="Salir">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </Tooltip>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
