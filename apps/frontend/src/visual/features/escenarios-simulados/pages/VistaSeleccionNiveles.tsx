import { useMemo } from 'react'
import { NivelController } from '../../../../ecs/controllers/NivelController'
import { useEstudianteGrupo } from '../../admin-docente-y-estudiante/contexts/EstudianteGrupoContext'
import AgentMalvadoUI from '../../agent-malvado/presentation/components/AgentMalvadoUI'
import Leaderboard from '../components/Leaderboard'
import LevelSelectionMenuList from '../components/LevelSelectionMenuList'
import ResumenProgreso from '../components/ResumenProgreso'
import { useProgresoEstudiante } from '../contexts/ProgresoEstudianteContext'
import { useLeaderboard } from '../hooks/useLeaderboard'
import styles from '../styles/VistaSeleccionNiveles.module.css'
import { resumenProgreso } from '../utils/progresoCurso'

function getStudentId(): number | null {
	try {
		const userStr = localStorage.getItem('user')
		if (!userStr) return null
		const user = JSON.parse(userStr)
		return user.id_estudiante ?? null
	} catch {
		return null
	}
}

export default function VistaSeleccionNiveles() {
	const idEstudiante = getStudentId()
	const { grupo, loading: grupoLoading } = useEstudianteGrupo()
	const { progresos, loading: progresoLoading } = useProgresoEstudiante()
	const {
		entries,
		loading: leaderboardLoading,
		error,
	} = useLeaderboard(grupo?.id_curso ?? null)

	const escenarios = useMemo(() => new NivelController().getEscenarios(), [])
	const resumen = resumenProgreso(escenarios, progresos)

	return (
		<div className={styles.main}>
			<h1 className={styles.screenTitle}>Selección de niveles</h1>
			<div className={styles.pathArea}>
				<LevelSelectionMenuList />
			</div>
			<aside className={styles.sidebar}>
				<ResumenProgreso
					completados={resumen.completados}
					enProgreso={resumen.enProgreso}
					pendientes={resumen.pendientes}
					loading={progresoLoading}
				/>
				<Leaderboard
					entries={entries}
					groupName={grupo?.nombre ?? null}
					loading={grupoLoading || leaderboardLoading}
					error={error}
					currentStudentId={idEstudiante}
				/>
				<AgentMalvadoUI />
			</aside>
		</div>
	)
}
