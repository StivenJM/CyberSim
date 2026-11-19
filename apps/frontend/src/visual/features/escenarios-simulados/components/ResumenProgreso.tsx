import { BarChart3, CircleCheck, CircleDashed, CircleDot } from 'lucide-react'
import styles from '../styles/ResumenProgreso.module.css'

interface ResumenProgresoProps {
	completados: number
	enProgreso: number
	pendientes: number
	loading: boolean
}

export default function ResumenProgreso({
	completados,
	enProgreso,
	pendientes,
	loading,
}: ResumenProgresoProps) {
	const stats = [
		{
			clave: 'completados',
			valor: completados,
			etiqueta: 'Completados',
			icono: <CircleCheck size={20} strokeWidth={2} />,
			tono: styles.done,
		},
		{
			clave: 'en-progreso',
			valor: enProgreso,
			etiqueta: 'En progreso',
			icono: <CircleDot size={20} strokeWidth={2} />,
			tono: styles.active,
		},
		{
			clave: 'pendientes',
			valor: pendientes,
			etiqueta: 'Pendientes',
			icono: <CircleDashed size={20} strokeWidth={2} />,
			tono: styles.pending,
		},
	]

	return (
		<section className={styles.card} aria-labelledby="resumen-titulo">
			<h2 className={styles.head} id="resumen-titulo">
				<BarChart3 size={18} strokeWidth={2} className={styles.headIcon} />
				Resumen
			</h2>
			<div className={styles.stats} aria-busy={loading}>
				{stats.map((stat) => (
					<div key={stat.clave} className={styles.stat}>
						<span className={`${styles.statIcon} ${stat.tono}`}>
							{stat.icono}
						</span>
						<span className={styles.statValue}>
							{loading ? <span className={styles.valueSkeleton} /> : stat.valor}
						</span>
						<span className={styles.statLabel}>{stat.etiqueta}</span>
					</div>
				))}
			</div>
		</section>
	)
}
