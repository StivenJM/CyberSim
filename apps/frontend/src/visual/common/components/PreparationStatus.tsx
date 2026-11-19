import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import styles from '../styles/PreparationStatus.module.css'

type Status = { state: string; components?: Record<string, string> }
export default function PreparationStatus() {
	const [status, setStatus] = useState<Status | null>(null)
	useEffect(() => {
		const poll = () =>
			fetch('/api/health/status')
				.then((r) => r.json())
				.then(setStatus)
				.catch(() => setStatus({ state: 'sin_conexion' }))
		void poll()
		const timer = setInterval(() => void poll(), 10000)
		return () => clearInterval(timer)
	}, [])
	const estado =
		typeof status?.state === 'string' ? status.state : 'sin comprobar'
	if (!import.meta.env.DEV || !status || estado === 'listo') return null
	const labels: Record<string, string> = {
		database: 'Base de datos',
		coordinator: 'Coordinación de IA',
		qdrant: 'Conocimiento',
		piper: 'Voz',
		openai: 'OpenAI',
		smtp: 'Correo',
		workflows: 'Workflows',
		drive: 'Google Drive',
		verification: 'Verificación',
		disk: 'Disco',
	}
	const states: Record<string, string> = {
		requires_configuration: 'requiere configuración',
		pending: 'pendiente',
		pending_index: 'pendiente de indexación',
		unavailable: 'no disponible',
		update_pending: 'actualización pendiente',
		configured: 'configurado',
		ready: 'disponible',
		uncertain: 'requiere reconciliación',
		paused: 'en mantenimiento',
		unknown: 'sin comprobar',
		low: 'poco espacio',
	}
	return (
		<details className={styles.chip}>
			<summary className={styles.summary}>
				<ChevronRight size={13} strokeWidth={2.5} className={styles.caret} />
				Entorno de desarrollo: {estado.replaceAll('_', ' ')}
			</summary>
			<div className={styles.panel}>
				<ul className={styles.list}>
					{Object.entries(status.components || {}).map(([key, value]) => (
						<li key={key}>
							<span>{labels[key] || key}</span>
							<span className={styles.state}>{states[value] || value}</span>
						</li>
					))}
				</ul>
				<span className={styles.hint}>
					Consulta la guía de Docker para completar la preparación.
				</span>
			</div>
		</details>
	)
}
