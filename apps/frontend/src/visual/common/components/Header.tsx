import type React from 'react'
import ChatLauncher from '../../features/chat/components/ChatLauncher'
import { useECSSceneContext } from '../../features/escenarios-simulados/context/ECSSceneContext'
import { useEscenarioActual } from '../contexts/EscenarioContext'
import DevicesIcon from '../icons/DevicesIcon'
import EstrellaPartidaIcon from '../icons/EstrellaPartidaIcon'
import OfficeIcon from '../icons/OfficeIcon'
import RedesIcon from '../icons/RedesIcon'
import styles from '../styles/Header.module.css'
import NavigationLink from './Navigation'

const Header: React.FC = () => {
	const escenario = useEscenarioActual()
	const { avanzar, haySiguiente } = useECSSceneContext()

	return (
		<header className={styles.header}>
			<div className={styles.titleContainer}>
				<h1 className={styles.title}>{escenario.titulo}</h1>
				<nav className={styles.nav}>
					<NavigationLink icon={<OfficeIcon />} label="Oficina" to="/" />
					<NavigationLink
						icon={<DevicesIcon />}
						label="Dispositivos"
						to="/dispositivos"
					/>
					<NavigationLink icon={<RedesIcon />} label="Redes" to="/redes" />
					<NavigationLink
						icon={<EstrellaPartidaIcon />}
						label="Partida"
						to="/fases-partida"
					/>
				</nav>
				<div className={styles.rightSideSection}>
					<button
						type="button"
						className={styles.nextButton}
						onClick={avanzar}
						disabled={!haySiguiente}
						aria-label="Siguiente paso"
					>
						Siguiente
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m9 18 6-6-6-6"
							/>
						</svg>
					</button>
					<ChatLauncher />
				</div>
			</div>
		</header>
	)
}

export default Header
