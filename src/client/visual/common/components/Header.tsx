import React from 'react';
import styles from '../styles/Header.module.css';
import NavigationLink from './Navigation';
import DevicesIcon from '../icons/DevicesIcon';
import OfficeIcon from '../icons/OfficeIcon';
import { useEscenarioActual } from '../contexts/EscenarioContext';
import { formatearTiempo } from '../utils/formatearTiempo';
import { useECSSceneContext } from '../../features/escenarios-simulados/context/ECSSceneContext';
import ChatLauncher from '../../features/chat/components/ChatLauncher';
import RedesIcon from '../icons/RedesIcon';
import EstrellaPartidaIcon from '../icons/EstrellaPartidaIcon';

const Header: React.FC = () => {
    const escenario = useEscenarioActual();
    const { pause, resume, isPaused, tiempoTranscurrido } = useECSSceneContext();

    return (
        <header className={styles.header}>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>{escenario.titulo}</h1>
                <nav className={styles.nav}>
                    <NavigationLink icon={<OfficeIcon />} label="Oficina" to="/" />
                    <NavigationLink icon={<DevicesIcon />} label="Dispositivos" to="/dispositivos" />
                    <NavigationLink icon={<RedesIcon />} label="Redes" to="/redes" />
                    <NavigationLink icon={<EstrellaPartidaIcon />} label="Partida" to="/fases-partida" />
                </nav>
                <div className={styles.rightSideSection}>
                    <span aria-label='Estado de la animación'>
                        {formatearTiempo(tiempoTranscurrido)}
                    </span>
                    <button onClick={() => { if (isPaused) resume(); else pause(); }} aria-label={isPaused ? 'Reanudar animación' : 'Pausar animación'} >
                        {isPaused ? 'Reanudar' : 'Pausar'}
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
                    <ChatLauncher />
                </div>
            </div>
           
        </header >
    );
};

export default Header;