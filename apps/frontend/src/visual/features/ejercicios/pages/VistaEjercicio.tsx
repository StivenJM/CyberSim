import {
	EXERCISE_INDEX,
	type ExerciseReport,
	runExercise,
	workspaceViews,
} from '@cybersim/exercises'
import { getInvestigatedCase } from '@cybersim/scenario-contract'
import { type KeyboardEvent, useRef, useState } from 'react'
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
	const exercise = EXERCISE_INDEX.find((entry) => entry.caseId === caseId)
	const definition = caseId ? getInvestigatedCase(caseId) : undefined

	const [sealed, setSealed] = useState(false)
	const [claim, setClaim] = useState('')
	const [active, setActive] = useState('expediente')
	const [run, setRun] = useState<RunState>({ status: 'idle' })
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

	const views = caseId
		? workspaceViews(caseId, { diagnosisSealed: sealed })
		: []
	const activeView = views.find((view) => view.id === active) ?? views[0]

	if (!exercise || !definition) {
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

	const onTabKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		if (views.length === 0) return
		let next: number | undefined
		if (event.key === 'ArrowRight') next = (index + 1) % views.length
		if (event.key === 'ArrowLeft')
			next = (index - 1 + views.length) % views.length
		if (event.key === 'Home') next = 0
		if (event.key === 'End') next = views.length - 1
		if (next === undefined) return
		event.preventDefault()
		tabRefs.current[next]?.focus()
		if (views[next].available) setActive(views[next].id)
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

			{!sealed ? (
				<p className={styles.notice}>
					Las vistas de intervención se habilitan después de sellar el
					diagnóstico D1. El expediente (A0) permanece disponible en todo
					momento.
				</p>
			) : null}

			<div className={styles.tabs} role="tablist" aria-label="Vistas del caso">
				{views.map((view, index) => {
					const selected = view.id === activeView?.id
					return (
						<button
							key={view.id}
							ref={(element) => {
								tabRefs.current[index] = element
							}}
							type="button"
							role="tab"
							id={`tab-${view.id}`}
							aria-selected={selected}
							aria-controls={`panel-${view.id}`}
							aria-disabled={!view.available}
							tabIndex={selected ? 0 : -1}
							title={view.reason ?? view.description}
							className={
								selected
									? `${styles.tab} ${styles.tabActive}`
									: view.available
										? styles.tab
										: `${styles.tab} ${styles.tabDisabled}`
							}
							onClick={() => {
								if (view.available) setActive(view.id)
							}}
							onKeyDown={(event) => onTabKeyDown(event, index)}
						>
							{view.label}
							{!view.available ? ' · D1' : ''}
						</button>
					)
				})}
			</div>

			{activeView ? (
				<div
					role="tabpanel"
					id={`panel-${activeView.id}`}
					aria-labelledby={`tab-${activeView.id}`}
					className={styles.panel}
				>
					<p className={styles.panelLead}>{activeView.description}</p>

					{activeView.id === 'expediente' ? (
						<div className={styles.grid}>
							<section aria-labelledby="materiales-title">
								<h2 id="materiales-title" className={styles.panelTitle}>
									Materiales A0
								</h2>
								<ul className={styles.materialList}>
									{definition.fixtures.map((fixture) => (
										<li key={fixture}>
											<code>{fixture}</code>
										</li>
									))}
								</ul>
								<p className={styles.hint}>
									Ayudas declaradas: {definition.aidSegments.join(' · ')}
								</p>
							</section>
							<section aria-labelledby="diagnostico-title">
								<h2 id="diagnostico-title" className={styles.panelTitle}>
									Diagnóstico D1
								</h2>
								<p className={styles.hint}>
									«Señala dónde está el problema y qué dato del expediente lo
									demuestra». Puedes declarar que no lo sabes.
								</p>
								<label className={styles.label} htmlFor="d1-claim">
									Afirmación provisional
								</label>
								<textarea
									id="d1-claim"
									className={styles.textarea}
									value={claim}
									onChange={(event) => setClaim(event.target.value)}
									rows={4}
									disabled={sealed}
								/>
								<button
									type="button"
									className={styles.button}
									disabled={sealed || claim.trim().length === 0}
									onClick={() => setSealed(true)}
								>
									{sealed ? 'Diagnóstico sellado' : 'Sellar diagnóstico D1'}
								</button>
								{sealed ? (
									<p className={styles.hint} role="status">
										Diagnóstico sellado. Las vistas de intervención están
										habilitadas y el texto no se reescribe.
									</p>
								) : null}
							</section>
						</div>
					) : null}

					{activeView.id === 'comprobaciones' ? (
						<div>
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
								{run.status === 'running' ? (
									<p>Ejecutando comprobaciones…</p>
								) : null}
								{run.status === 'unavailable' ? (
									<p className={styles.notice}>{run.reason}</p>
								) : null}
								{run.status === 'error' ? (
									<p className={styles.notice}>
										No se pudo verificar: {run.reason}
									</p>
								) : null}
								{run.status === 'done' ? (
									<ReportTable report={run.report} mode={run.mode} />
								) : null}
							</div>
						</div>
					) : null}

					{activeView.id !== 'expediente' &&
					activeView.id !== 'comprobaciones' ? (
						<div className={styles.grid}>
							<section aria-labelledby="operaciones-title">
								<h2 id="operaciones-title" className={styles.panelTitle}>
									Operaciones declaradas
								</h2>
								<ul className={styles.materialList}>
									{definition.operations.map((operation) => (
										<li key={operation}>
											<code>{operation}</code>
										</li>
									))}
								</ul>
							</section>
							<section aria-labelledby="controles-title">
								<h2 id="controles-title" className={styles.panelTitle}>
									Controles del modelo
								</h2>
								<ul className={styles.materialList}>
									{definition.controls.map((control) => (
										<li key={control}>
											<code>{control}</code>
										</li>
									))}
								</ul>
								<p className={styles.hint}>
									El banco interactivo de esta vista se conecta al modelo del
									caso en la entrega de UI correspondiente; aquí se muestra el
									repertorio cerrado que el manifiesto admite.
								</p>
							</section>
						</div>
					) : null}
				</div>
			) : null}
		</section>
	)
}

function ReportTable({
	report,
	mode,
}: {
	readonly report: ExerciseReport
	readonly mode: 'initial' | 'reference'
}) {
	return (
		<>
			<div className={styles.summaryRow}>
				<span className={report.B ? styles.chipPass : styles.chipFail}>
					Función legítima B: {report.B ? 'pasa' : 'falla'}
				</span>
				<span className={report.Q ? styles.chipPass : styles.chipFail}>
					Protección Q: {report.Q ? 'pasa' : 'falla'}
				</span>
				<span className={styles.chipNeutral}>
					Contraste C:{' '}
					{Object.entries(report.C)
						.map(([id, passed]) => `${id}=${passed ? 'sí' : 'no'}`)
						.join(' · ') || 'sin contraste'}
				</span>
				<span className={styles.chipNeutral}>
					{mode === 'initial' ? 'Estado inicial' : 'Solución de referencia'}
				</span>
			</div>
			{report.residualExposure ? (
				<p className={styles.notice}>
					La revisión deja exposición residual declarada; no se presenta como
					remediación integral.
				</p>
			) : null}
			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<caption>
						Comprobaciones ejecutadas sobre estado inerte. El verificador
						reejecuta las propiedades declaradas; no aprueba por el nombre de un
						parche.
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
						{report.checks.map((check) => (
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
	)
}
