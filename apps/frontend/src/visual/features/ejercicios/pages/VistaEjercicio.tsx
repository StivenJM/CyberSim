import {
	EXERCISE_INDEX,
	type ExerciseReport,
	runExercise,
} from '@cybersim/exercises'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import styles from '../styles/Ejercicios.module.css'

type RunState =
	| { readonly status: 'idle' }
	| { readonly status: 'running'; readonly mode: 'initial' | 'reference' }
	| {
			readonly status: 'done'
			readonly mode: 'initial' | 'reference'
			readonly report: ExerciseReport
	  }
	| { readonly status: 'unavailable'; readonly reason: string }
	| { readonly status: 'error'; readonly reason: string }

export default function VistaEjercicio() {
	const { caseId } = useParams<{ caseId: string }>()
	const [run, setRun] = useState<RunState>({ status: 'idle' })
	const exercise = EXERCISE_INDEX.find((entry) => entry.caseId === caseId)

	if (!exercise) {
		return (
			<section className={styles.section}>
				<p>Este ejercicio no existe en el catálogo.</p>
				<Link to="/ejercicios" className={styles.backLink}>
					Volver a Ejercicios
				</Link>
			</section>
		)
	}

	const execute = async (mode: 'initial' | 'reference') => {
		setRun({ status: 'running', mode })
		try {
			const result = await runExercise(exercise.caseId, mode)
			setRun(
				result.kind === 'ok'
					? { status: 'done', mode, report: result.report }
					: { status: 'unavailable', reason: result.reason },
			)
		} catch (error) {
			setRun({
				status: 'error',
				reason: error instanceof Error ? error.message : 'Fallo técnico',
			})
		}
	}

	return (
		<section className={styles.section} aria-labelledby="ejercicio-title">
			<Link to="/ejercicios" className={styles.backLink}>
				← Ejercicios
			</Link>
			<header className={styles.header}>
				<p className={styles.eyebrow}>{exercise.cwe}</p>
				<h1 id="ejercicio-title" className={styles.title}>
					{exercise.title}
				</h1>
				<p className={styles.lead}>{exercise.summary}</p>
			</header>

			<div className={styles.actions}>
				<button
					type="button"
					className={styles.button}
					onClick={() => void execute('initial')}
					disabled={run.status === 'running'}
				>
					Verificar estado inicial
				</button>
				<button
					type="button"
					className={styles.button}
					onClick={() => void execute('reference')}
					disabled={run.status === 'running'}
				>
					Verificar solución de referencia
				</button>
			</div>

			<div aria-live="polite">
				{run.status === 'running' ? <p>Ejecutando comprobaciones…</p> : null}

				{run.status === 'unavailable' ? (
					<p className={styles.notice}>{run.reason}</p>
				) : null}

				{run.status === 'error' ? (
					<p className={styles.notice}>No se pudo verificar: {run.reason}</p>
				) : null}

				{run.status === 'done' ? (
					<>
						<div className={styles.summaryRow}>
							<span
								className={run.report.B ? styles.chipPass : styles.chipFail}
							>
								Función legítima B: {run.report.B ? 'pasa' : 'falla'}
							</span>
							<span
								className={run.report.Q ? styles.chipPass : styles.chipFail}
							>
								Protección Q: {run.report.Q ? 'pasa' : 'falla'}
							</span>
							<span className={styles.chipNeutral}>
								Contraste C:{' '}
								{Object.entries(run.report.C)
									.map(([id, passed]) => `${id}=${passed ? 'sí' : 'no'}`)
									.join(' · ') || 'sin contraste'}
							</span>
							<span className={styles.chipNeutral}>
								{run.mode === 'initial'
									? 'Estado inicial'
									: 'Solución de referencia'}
							</span>
						</div>
						{run.report.residualExposure ? (
							<p className={styles.notice}>
								La revisión deja exposición residual declarada; no se presenta
								como remediación integral.
							</p>
						) : null}
						<div className={styles.tableWrapper}>
							<table className={styles.table}>
								<caption>
									Comprobaciones ejecutadas sobre estado inerte. El verificador
									reejecuta las propiedades declaradas; no aprueba por el nombre
									de un parche.
								</caption>
								<thead>
									<tr>
										<th scope="col">ID</th>
										<th scope="col">Tipo</th>
										<th scope="col">Propiedad</th>
										<th scope="col">Resultado</th>
										<th scope="col">Evidencia</th>
									</tr>
								</thead>
								<tbody>
									{run.report.checks.map((check) => (
										<tr key={check.id}>
											<td>{check.id}</td>
											<td>{check.kind}</td>
											<td>{check.property}</td>
											<td className={check.passed ? styles.pass : styles.fail}>
												{check.passed ? 'pasa' : 'falla'}
											</td>
											<td>{check.evidence}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>
				) : null}
			</div>
		</section>
	)
}
