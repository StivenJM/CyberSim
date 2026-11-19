import { NivelController } from '../../../../ecs/controllers/NivelController'
import { useProgresoEstudiante } from '../contexts/ProgresoEstudianteContext'
import styles from '../styles/CourseProgress.module.css'
import { resumenProgreso } from '../utils/progresoCurso'

const ESCENARIOS = new NivelController().getEscenarios()

export default function CourseProgress() {
	const { progresos, loading } = useProgresoEstudiante()
	const { completados, total, porcentaje } = resumenProgreso(
		ESCENARIOS,
		progresos,
	)

	return (
		<div className={styles.progress} aria-busy={loading}>
			<span className={styles.label}>Progreso del curso</span>
			<span className={styles.count}>
				{loading ? (
					<span className={styles.countSkeleton} />
				) : (
					`${completados} de ${total} escenarios (${porcentaje} %)`
				)}
			</span>
			<div
				className={styles.track}
				role="progressbar"
				aria-label="Progreso del curso"
				aria-valuemin={0}
				aria-valuemax={total}
				aria-valuenow={completados}
				aria-valuetext={`${completados} de ${total} escenarios completados`}
			>
				<span className={styles.fill} style={{ width: `${porcentaje}%` }} />
			</div>
		</div>
	)
}
