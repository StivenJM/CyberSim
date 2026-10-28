import { EXERCISE_INDEX } from '@cybersim/exercises'
import { Link } from 'react-router'

import styles from '../styles/Ejercicios.module.css'

export default function VistaEjercicios() {
	return (
		<section className={styles.section} aria-labelledby="ejercicios-title">
			<header className={styles.header}>
				<Link to="/" className={styles.backLink}>
					← Volver a la oficina
				</Link>
				<p className={styles.eyebrow}>Conjunto 2.0</p>
				<h1 id="ejercicios-title" className={styles.title}>
					Ejercicios
				</h1>
				<p className={styles.lead}>
					Cinco casos investigados con modelo de dominio y verificador propios.
					Cada caso declara sus comprobaciones B/Q/C sobre estado inerte:
					ninguna suma de indicadores verdes acredita conocimiento.
				</p>
			</header>

			<ul className={styles.list}>
				{EXERCISE_INDEX.map((exercise) => (
					<li key={exercise.caseId} className={styles.card}>
						<Link
							to={`/ejercicios/${exercise.caseId}`}
							className={styles.cardLink}
						>
							<span className={styles.cwe}>{exercise.cwe}</span>
							<span className={styles.cardTitle}>{exercise.title}</span>
							<span className={styles.cardSummary}>{exercise.summary}</span>
							<span
								className={
									exercise.runtime === 'browser'
										? styles.badgeOk
										: styles.badgePending
								}
							>
								{exercise.runtime === 'browser'
									? 'Verificable en el navegador'
									: 'Banco SQL en Worker'}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	)
}
