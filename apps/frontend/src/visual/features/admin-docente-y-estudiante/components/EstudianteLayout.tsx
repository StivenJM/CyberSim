import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import CourseProgress from '../../escenarios-simulados/components/CourseProgress'
import { ProgresoEstudianteProvider } from '../../escenarios-simulados/contexts/ProgresoEstudianteContext'
import { EstudianteGrupoProvider } from '../contexts/EstudianteGrupoContext'
import styles from '../styles/EstudianteLayout.module.css'
import UserMenu from './UserMenu'

export default function EstudianteLayout() {
	const navigate = useNavigate()
	const location = useLocation()
	const enMapaDeNiveles = location.pathname === '/seleccion-niveles'

	return (
		<EstudianteGrupoProvider>
			<ProgresoEstudianteProvider>
				<motion.div
					className={styles.page}
					data-screen={enMapaDeNiveles ? 'niveles' : undefined}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
				>
					<header className={styles.header}>
						<button
							type="button"
							className={styles.brand}
							onClick={() => navigate('/seleccion-niveles')}
						>
							<img
								src="/assets/pictures/computer_logo.webp"
								alt=""
								width={34}
								height={34}
							/>
							<span className={styles.wordmark}>CyberSim</span>
						</button>

						<div className={styles.headerCenter}>
							{enMapaDeNiveles && <CourseProgress />}
						</div>

						<div className={styles.headerUser}>
							<UserMenu
								items={[
									{
										icon: <User size={16} />,
										label: 'Mi Perfil',
										onClick: () => navigate('/perfil'),
									},
								]}
							/>
						</div>
					</header>

					<main className={styles.content}>
						<div
							className={`${styles.contentInner} ${enMapaDeNiveles ? styles.contentFull : ''}`}
						>
							<Outlet />
						</div>
					</main>
				</motion.div>
			</ProgresoEstudianteProvider>
		</EstudianteGrupoProvider>
	)
}
