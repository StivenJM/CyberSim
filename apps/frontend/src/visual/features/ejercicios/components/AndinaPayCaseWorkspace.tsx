import {
	ANDINAPAY_ARTIFACTS,
	ANDINAPAY_ENVELOPES,
	ANDINAPAY_EVIDENCE,
	ANDINAPAY_KEYS,
	ANDINAPAY_PROPOSED_CHANGE,
	ANDINAPAY_REVISIONS,
	type AndinaPayCommand,
	type AndinaPayKeyId,
	type AndinaPayRevisionId,
	type AndinaPayState,
	applyAndinaPay,
	createAndinaPayState,
	decryptEnvelope,
	diffRevisions,
	type ExerciseReport,
	revisionById,
	searchRevision,
	verifyAndinaPay,
} from '@cybersim/exercises'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { ProgresoController } from '../../../../ecs/controllers/ProgresoController'
import { useAndinaPayAttempt } from '../hooks/useAndinaPayAttempt'
import styles from '../styles/Ejercicios.module.css'

type TabId =
	| 'expediente'
	| 'repositorio'
	| 'banco'
	| 'claves'
	| 'comprobaciones'
	| 'informe'

const TABS: readonly { readonly id: TabId; readonly label: string }[] = [
	{ id: 'expediente', label: 'Expediente' },
	{ id: 'repositorio', label: 'Repositorio' },
	{ id: 'banco', label: 'Banco criptográfico' },
	{ id: 'claves', label: 'Respuesta de claves' },
	{ id: 'comprobaciones', label: 'Comprobaciones' },
	{ id: 'informe', label: 'Informe' },
]

interface ReportFields {
	readonly occurred: string
	readonly recoverable: string
	readonly cause: string
	readonly continuity: string
	readonly limits: string
}

const EMPTY_REPORT: ReportFields = {
	occurred: '',
	recoverable: '',
	cause: '',
	continuity: '',
	limits: '',
}

interface StoredExercise {
	readonly state: AndinaPayState
	readonly startedAt: number
	readonly reportFields: ReportFields
}

export interface AndinaPayCaseWorkspaceProps {
	readonly caseId?: string
	readonly scenarioSlug?: string
	readonly scenarioRevision?: number
	readonly scenarioContentHash?: string
	readonly embedded?: boolean
	readonly onCompleted?: () => void
}

function currentStudentKey(): string {
	try {
		const user = JSON.parse(localStorage.getItem('user') ?? 'null') as {
			id_estudiante?: number
		} | null
		return String(user?.id_estudiante ?? 'anon')
	} catch {
		return 'anon'
	}
}

function storageKey(): string {
	return `cybersim:andinapay:${currentStudentKey()}:case`
}

function loadStored(): StoredExercise | null {
	try {
		const raw = localStorage.getItem(storageKey())
		if (!raw) return null
		const parsed = JSON.parse(raw) as Partial<StoredExercise>
		if (
			!parsed.state ||
			typeof parsed.state !== 'object' ||
			!('headRevision' in parsed.state) ||
			!('index' in parsed.state)
		) {
			return null
		}
		return {
			state: parsed.state,
			startedAt:
				typeof parsed.startedAt === 'number' ? parsed.startedAt : Date.now(),
			reportFields: { ...EMPTY_REPORT, ...(parsed.reportFields ?? {}) },
		}
	} catch {
		return null
	}
}

function reportText(fields: ReportFields): string {
	return [
		`Qué ocurrió: ${fields.occurred.trim()}`,
		`Datos recuperables: ${fields.recoverable.trim()}`,
		`Causa y corrección: ${fields.cause.trim()}`,
		`Continuidad verificada: ${fields.continuity.trim()}`,
		`Límites y próximos pasos: ${fields.limits.trim()}`,
	].join('\n')
}

function envelopeLabel(envelope: (typeof ANDINAPAY_ENVELOPES)[number]): string {
	return `${envelope.recordId}/${envelope.keyId}/v${envelope.version}`
}

export default function AndinaPayCaseWorkspace({
	scenarioSlug = 'andinapay-clave-expuesta',
	embedded = false,
	onCompleted,
}: AndinaPayCaseWorkspaceProps) {
	const navigate = useNavigate()
	const initial = useRef<StoredExercise | null>(null)
	if (initial.current === null) initial.current = loadStored()

	const [state, setState] = useState<AndinaPayState>(
		() => initial.current?.state ?? createAndinaPayState(),
	)
	const [active, setActive] = useState<TabId>('expediente')
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [report, setReport] = useState<ExerciseReport | null>(null)
	const [reportFields, setReportFields] = useState<ReportFields>(
		initial.current?.reportFields ?? EMPTY_REPORT,
	)
	const startedAt = useRef(initial.current?.startedAt ?? Date.now())
	const attempt = useAndinaPayAttempt()

	const sealed = state.sealedDiagnosis !== null

	useEffect(() => {
		const stored: StoredExercise = {
			state,
			startedAt: startedAt.current,
			reportFields,
		}
		localStorage.setItem(storageKey(), JSON.stringify(stored))
	}, [state, reportFields])

	const apply = useCallback(
		async (
			current: AndinaPayState,
			command: AndinaPayCommand,
		): Promise<AndinaPayState | null> => {
			const outcome = await applyAndinaPay(current, command)
			if (!outcome.ok) {
				setError(`${outcome.code}: ${outcome.detail}`)
				return null
			}
			return outcome.state
		},
		[],
	)

	const commit = useCallback(
		async (next: AndinaPayState) => {
			setState(next)
			setError(null)
			await attempt.saveRevision(next)
		},
		[attempt],
	)

	const run = useCallback(
		async (command: AndinaPayCommand) => {
			setBusy(true)
			const next = await apply(state, command)
			if (next) await commit(next)
			setBusy(false)
			return next
		},
		[apply, state, commit],
	)

	const recordEvidence = useCallback(
		async (reference: string) => {
			await run({ kind: 'record_evidence', reference })
		},
		[run],
	)

	const verify = useCallback(async () => {
		setBusy(true)
		const result = await verifyAndinaPay(state)
		setReport(result)
		setBusy(false)
	}, [state])

	const saveProgress = useCallback(async () => {
		localStorage.setItem('slug_escenario_actual', scenarioSlug)
		// El ejercicio puede ejecutarse desde el mapa o desde el apartado de
		// ejercicios; la revisión publicada del seed no siempre existe en el
		// catálogo de progreso. El cierre funcional solo necesita `terminado`.
		localStorage.removeItem('revision_escenario_actual')
		localStorage.removeItem('content_hash_escenario_actual')
		const elapsed = Math.max(
			0,
			Math.round((Date.now() - startedAt.current) / 1000),
		)
		try {
			await ProgresoController.getInstance().guardarProgresoEstudiante(
				true,
				elapsed,
				[],
				[],
			)
		} catch {
			// La partida local sigue siendo válida; el mapa se actualizará al
			// recuperar la conexión y volver a intentar el cierre.
		}
		onCompleted?.()
	}, [scenarioSlug, onCompleted])

	const reset = useCallback(() => {
		for (let index = localStorage.length - 1; index >= 0; index -= 1) {
			const key = localStorage.key(index)
			if (key?.startsWith('cybersim:andinapay:')) {
				localStorage.removeItem(key)
			}
		}
		window.location.reload()
	}, [])

	const tabs = useMemo(
		() => TABS.filter((tab) => tab.id === 'expediente' || sealed),
		[sealed],
	)

	return (
		<section
			className={
				embedded ? `${styles.section} ${styles.embedded}` : styles.section
			}
			aria-labelledby="andinapay-title"
		>
			<header className={styles.header}>
				<p className={styles.eyebrow}>CWE-321 · AndinaPay</p>
				<h1 id="andinapay-title" className={styles.title}>
					Expediente de datos
				</h1>
				<p className={styles.lead}>
					Investiga el aviso recibido por AndinaPay. Explica qué puede
					demostrarse sobre el texto legible y los registros afectados, y qué
					sigue sin saberse. La clave de una versión anterior no se corrige
					cambiando el algoritmo.
				</p>
				<p className={styles.small}>
					{attempt.attemptId
						? `Intento registrado: ${attempt.attemptId.slice(0, 8)}…`
						: 'Modo local: el intento se registrará cuando el backend esté disponible.'}
					{attempt.error ? ` · ${attempt.error}` : ''}
				</p>
			</header>

			{!sealed ? (
				<p className={styles.notice}>
					Antes de abrir las vistas de intervención, entrega un diagnóstico
					provisional con dos evidencias citadas y una predicción comprobable.
				</p>
			) : null}

			<div className={styles.tabs} role="tablist" aria-label="Vistas del caso">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={active === tab.id}
						className={
							active === tab.id
								? `${styles.tab} ${styles.tabActive}`
								: styles.tab
						}
						onClick={() => setActive(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{error ? (
				<p className={styles.notice} role="alert">
					{error}
				</p>
			) : null}

			{active === 'expediente' ? (
				<ExpedienteView
					state={state}
					claim={state.sealedDiagnosis ?? ''}
					sealed={sealed}
					busy={busy}
					onSeal={async ({ claim, cited, rival, proposedTest, scope }) => {
						setBusy(true)
						let next = state
						for (const reference of cited) {
							const withEvidence = await apply(next, {
								kind: 'record_evidence',
								reference,
							})
							if (!withEvidence) {
								setBusy(false)
								return
							}
							next = withEvidence
						}
						const text = [
							`Afirmación: ${claim.trim()}`,
							`Evidencias: ${cited.join(', ')}`,
							`Alternativa rival: ${rival.trim()}`,
							`Prueba propuesta: ${proposedTest.trim()}`,
							`Alcance/no determinado: ${scope.trim()}`,
						].join('\n')
						const diagnosed = await apply(next, {
							kind: 'submit_diagnosis',
							text,
						})
						if (!diagnosed) {
							setBusy(false)
							return
						}
						await attempt.saveDiagnosis(claim.trim(), cited)
						await commit(diagnosed)
						setBusy(false)
						setActive('repositorio')
					}}
					onEvidence={(reference) => void recordEvidence(reference)}
				/>
			) : null}

			{active === 'repositorio' ? (
				<RepositorioView
					onEvidence={(reference) => void recordEvidence(reference)}
				/>
			) : null}

			{active === 'banco' ? (
				<BancoView onEvidence={(reference) => void recordEvidence(reference)} />
			) : null}

			{active === 'claves' ? (
				<ClavesView
					state={state}
					busy={busy}
					onCommand={(command) => void run(command)}
				/>
			) : null}

			{active === 'comprobaciones' ? (
				<ComprobacionesView
					state={state}
					report={report}
					busy={busy}
					onVerify={() => void verify()}
					onCheck={(checkId) => void run({ kind: 'run_check', checkId })}
				/>
			) : null}

			{active === 'informe' ? (
				<InformeView
					state={state}
					reportFields={reportFields}
					setReportFields={setReportFields}
					busy={busy}
					onArtifact={async () => {
						setBusy(true)
						const next = await apply(state, { kind: 'submit_artifact' })
						if (!next) {
							setBusy(false)
							return
						}
						setState(next)
						const verified = await verifyAndinaPay(next)
						setReport(verified)
						await attempt.deliver(next, verified)
						setBusy(false)
					}}
					onReport={async () => {
						setBusy(true)
						const text = reportText(reportFields)
						const next = await apply(state, {
							kind: 'submit_report',
							text,
						})
						if (!next) {
							setBusy(false)
							return
						}
						setState(next)
						await attempt.recordExplanation(text)
						await saveProgress()
						setBusy(false)
					}}
					onReset={reset}
					onMap={() => navigate('/seleccion-niveles')}
					onVerify={() => void verify()}
				/>
			) : null}
		</section>
	)
}

function ExpedienteView({
	state,
	claim,
	sealed,
	busy,
	onSeal,
	onEvidence,
}: {
	readonly state: AndinaPayState
	readonly claim: string
	readonly sealed: boolean
	readonly busy: boolean
	readonly onSeal: (input: {
		readonly claim: string
		readonly cited: readonly string[]
		readonly rival: string
		readonly proposedTest: string
		readonly scope: string
	}) => Promise<void>
	readonly onEvidence: (reference: string) => void
}) {
	const [draft, setDraft] = useState({
		claim: '',
		rival: '',
		proposedTest: '',
		scope: '',
	})
	const [cited, setCited] = useState<readonly string[]>([])

	const toggle = (reference: string) => {
		setCited((current) =>
			current.includes(reference)
				? current.filter((entry) => entry !== reference)
				: [...current, reference],
		)
	}

	return (
		<div className={styles.panel}>
			<p className={styles.panelLead}>
				Abre el aviso, los logs, el inventario y las copias inmutables. Cita
				fragmentos concretos antes de sellar D1.
			</p>
			<div className={styles.grid}>
				<section aria-labelledby="a0-title">
					<h2 id="a0-title" className={styles.panelTitle}>
						Materiales A0
					</h2>
					<ul className={styles.materialList}>
						{ANDINAPAY_ARTIFACTS.map((artifact) => (
							<li key={artifact.path}>
								<code>{artifact.path}</code>{' '}
								<button
									type="button"
									className={styles.button}
									style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}
									onClick={() => onEvidence(artifact.path)}
								>
									Añadir referencia
								</button>
							</li>
						))}
						{['AP-H1', 'AP-H2', 'AP-H3'].map((revision) => (
							<li key={revision}>
								<code>{revision}</code>{' '}
								<button
									type="button"
									className={styles.button}
									style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}
									onClick={() => onEvidence(revision)}
								>
									Añadir referencia
								</button>
							</li>
						))}
					</ul>
					<p className={styles.small}>
						Evidencias registradas: {state.evidence.length}
						{state.evidence.length ? ` · ${state.evidence.join(' · ')}` : ''}
					</p>
				</section>

				<section aria-labelledby="d1-title">
					<h2 id="d1-title" className={styles.panelTitle}>
						Diagnóstico D1
					</h2>
					{sealed ? (
						<>
							<p className={styles.hint}>
								Diagnóstico sellado; no se reescribe.
							</p>
							<pre className={styles.codeBlock}>{claim}</pre>
						</>
					) : (
						<>
							<label className={styles.label} htmlFor="d1-claim">
								Afirmación provisional
							</label>
							<textarea
								id="d1-claim"
								className={styles.textarea}
								rows={3}
								value={draft.claim}
								onChange={(event) =>
									setDraft((current) => ({
										...current,
										claim: event.target.value,
									}))
								}
							/>
							<p className={styles.label}>Dos evidencias citadas</p>
							<div className={styles.checkboxRow}>
								{ANDINAPAY_EVIDENCE.map((reference) => (
									<label key={reference}>
										<input
											type="checkbox"
											checked={cited.includes(reference)}
											onChange={() => toggle(reference)}
										/>
										{reference}
									</label>
								))}
							</div>
							<label className={styles.label} htmlFor="d1-rival">
								Alternativa rival
							</label>
							<textarea
								id="d1-rival"
								className={styles.textarea}
								rows={2}
								value={draft.rival}
								onChange={(event) =>
									setDraft((current) => ({
										...current,
										rival: event.target.value,
									}))
								}
							/>
							<label className={styles.label} htmlFor="d1-test">
								Prueba propuesta
							</label>
							<textarea
								id="d1-test"
								className={styles.textarea}
								rows={2}
								value={draft.proposedTest}
								onChange={(event) =>
									setDraft((current) => ({
										...current,
										proposedTest: event.target.value,
									}))
								}
							/>
							<label className={styles.label} htmlFor="d1-scope">
								Alcance y no determinado
							</label>
							<textarea
								id="d1-scope"
								className={styles.textarea}
								rows={2}
								value={draft.scope}
								onChange={(event) =>
									setDraft((current) => ({
										...current,
										scope: event.target.value,
									}))
								}
							/>
							<button
								type="button"
								className={styles.button}
								disabled={
									busy ||
									!draft.claim.trim() ||
									!draft.rival.trim() ||
									!draft.proposedTest.trim() ||
									!draft.scope.trim() ||
									cited.length < 2
								}
								onClick={() =>
									void onSeal({
										claim: draft.claim,
										cited,
										rival: draft.rival,
										proposedTest: draft.proposedTest,
										scope: draft.scope,
									})
								}
							>
								Sellar diagnóstico D1
							</button>
							<p className={styles.small}>
								Mínimo dos evidencias; el diagnóstico no exige acertar para
								avanzar.
							</p>
						</>
					)}
				</section>
			</div>
		</div>
	)
}

function RepositorioView({
	onEvidence,
}: {
	readonly onEvidence: (reference: string) => void
}) {
	const [revision, setRevision] = useState<AndinaPayRevisionId>('AP-H1')
	const [selectedPath, setSelectedPath] = useState('src/crypto-config.ts')
	const [query, setQuery] = useState('')
	const [diffFrom, setDiffFrom] = useState<AndinaPayRevisionId>('AP-H1')
	const [diffTo, setDiffTo] = useState<AndinaPayRevisionId>('AP-H2')
	const [diff, setDiff] = useState<
		readonly ReturnType<typeof diffRevisions>[number][]
	>([])

	const current = revisionById(revision)
	const selected =
		current?.files.find((file) => file.path === selectedPath) ??
		current?.files[0]
	const matches = useMemo(
		() => searchRevision(revision, query),
		[revision, query],
	)

	return (
		<div className={styles.panel}>
			<p className={styles.panelLead}>
				Tres revisiones lineales. La literal de la clave desaparece de HEAD,
				pero la aplicación sigue resolviendo el mismo identificador: la ausencia
				actual no prueba que la clave se haya rotado.
			</p>

			<div className={styles.inline} style={{ marginBottom: '0.75rem' }}>
				<label className={styles.label} htmlFor="repo-revision">
					Revisión
				</label>
				<select
					id="repo-revision"
					className={styles.select}
					style={{ width: 'auto' }}
					value={revision}
					onChange={(event) => {
						const next = event.target.value as AndinaPayRevisionId
						setRevision(next)
						setSelectedPath(revisionById(next)?.files[0]?.path ?? '')
					}}
				>
					{ANDINAPAY_REVISIONS.map((entry) => (
						<option key={entry.id} value={entry.id}>
							{entry.id} · {entry.date} · {entry.message}
						</option>
					))}
				</select>
				<button
					type="button"
					className={styles.button}
					onClick={() => onEvidence(revision)}
				>
					Añadir referencia {revision}
				</button>
			</div>

			<div className={styles.split}>
				<ul className={styles.fileList} aria-label="Archivos de la revisión">
					{current?.files.map((file) => (
						<li key={file.path}>
							<button
								type="button"
								className={
									file.path === selected?.path
										? `${styles.fileButton} ${styles.fileButtonActive}`
										: styles.fileButton
								}
								onClick={() => setSelectedPath(file.path)}
							>
								{file.path}
							</button>
						</li>
					))}
				</ul>
				<pre className={styles.codeBlock}>
					{selected?.lines.map((line, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: repository lines are positional and static per revision.
						<div key={`${selected.path}-${index}`} className={styles.codeLine}>
							<span className={styles.lineNumber}>{index + 1}</span>
							<span>{line}</span>
						</div>
					))}
				</pre>
			</div>

			<div className={styles.searchRow} style={{ marginTop: '1rem' }}>
				<input
					className={styles.searchInput}
					placeholder="Búsqueda literal (por ejemplo KEY_HEX)"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					aria-label="Búsqueda literal en el repositorio"
				/>
				<span className={styles.badge}>
					{matches.length} coincidencia{matches.length === 1 ? '' : 's'}
				</span>
			</div>
			{matches.length ? (
				<ul className={styles.materialList}>
					{matches.map((match) => (
						<li key={`${match.path}-${match.line}`}>
							<code>
								{match.path}:{match.line}
							</code>{' '}
							{highlight(match.text, query)}
						</li>
					))}
				</ul>
			) : null}

			<div className={styles.inline} style={{ marginTop: '1rem' }}>
				<label className={styles.label} htmlFor="diff-from">
					Desde
				</label>
				<select
					id="diff-from"
					className={styles.select}
					style={{ width: 'auto' }}
					value={diffFrom}
					onChange={(event) =>
						setDiffFrom(event.target.value as AndinaPayRevisionId)
					}
				>
					{ANDINAPAY_REVISIONS.map((entry) => (
						<option key={entry.id} value={entry.id}>
							{entry.id}
						</option>
					))}
				</select>
				<label className={styles.label} htmlFor="diff-to">
					Hasta
				</label>
				<select
					id="diff-to"
					className={styles.select}
					style={{ width: 'auto' }}
					value={diffTo}
					onChange={(event) =>
						setDiffTo(event.target.value as AndinaPayRevisionId)
					}
				>
					{ANDINAPAY_REVISIONS.map((entry) => (
						<option key={entry.id} value={entry.id}>
							{entry.id}
						</option>
					))}
				</select>
				<button
					type="button"
					className={styles.button}
					onClick={() => setDiff(diffRevisions(diffFrom, diffTo))}
				>
					Ver diferencias
				</button>
			</div>
			{diff.length ? (
				<div style={{ marginTop: '0.75rem' }}>
					{diff.map((entry) => (
						<div key={entry.path} className={styles.statusCard}>
							<strong>{entry.path}</strong>
							{entry.removed.map((line) => (
								<div key={`removed-${line}`} className={styles.fail}>
									− {line}
								</div>
							))}
							{entry.added.map((line) => (
								<div key={`added-${line}`} className={styles.pass}>
									+ {line}
								</div>
							))}
						</div>
					))}
				</div>
			) : null}

			<div className={styles.footerNotice}>
				Cambio propuesto para revisión:{' '}
				<code>{ANDINAPAY_PROPOSED_CHANGE.path}</code> contiene la misma
				asignación de <code>KEY_HEX</code>. Un escaneo que solo mira HEAD no lo
				detecta; la prevención debe cubrir historial y cambios nuevos.
			</div>
		</div>
	)
}

function highlight(text: string, query: string) {
	const needle = query.trim()
	if (!needle) return text
	const index = text.toLowerCase().indexOf(needle.toLowerCase())
	if (index < 0) return text
	return (
		<>
			{text.slice(0, index)}
			<span className={styles.match}>
				{text.slice(index, index + needle.length)}
			</span>
			{text.slice(index + needle.length)}
		</>
	)
}

function BancoView({
	onEvidence,
}: {
	readonly onEvidence: (reference: string) => void
}) {
	const [index, setIndex] = useState(0)
	const [keyId, setKeyId] = useState<AndinaPayKeyId>('legacy-demo')
	const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
		null,
	)
	const envelope = ANDINAPAY_ENVELOPES[index]

	const decrypt = async () => {
		const decision = await decryptEnvelope(envelope, ANDINAPAY_KEYS[keyId])
		setResult(
			decision.ok
				? { ok: true, text: decision.plaintext }
				: { ok: false, text: decision.code },
		)
	}

	return (
		<div className={styles.panel}>
			<p className={styles.panelLead}>
				AES-256-GCM real sobre los siete envelopes públicos. Selecciona un
				envelope y una clave candidata; la autenticación se verifica antes de
				entregar cualquier texto.
			</p>
			<div className={styles.fieldGrid}>
				<label className={styles.label} htmlFor="bench-envelope">
					Envelope
					<select
						id="bench-envelope"
						className={styles.select}
						value={index}
						onChange={(event) => {
							setIndex(Number(event.target.value))
							setResult(null)
						}}
					>
						{ANDINAPAY_ENVELOPES.map((entry, position) => (
							<option key={envelopeLabel(entry)} value={position}>
								{envelopeLabel(entry)}
							</option>
						))}
					</select>
				</label>
				<label className={styles.label} htmlFor="bench-key">
					Clave candidata
					<select
						id="bench-key"
						className={styles.select}
						value={keyId}
						onChange={(event) => {
							setKeyId(event.target.value as AndinaPayKeyId)
							setResult(null)
						}}
					>
						{Object.keys(ANDINAPAY_KEYS).map((key) => (
							<option key={key} value={key}>
								{key}
							</option>
						))}
					</select>
				</label>
			</div>
			<div className={styles.statusGrid} style={{ marginTop: '1rem' }}>
				<div className={styles.statusCard}>
					<strong>IV</strong>
					<code>{envelope.ivHex}</code>
				</div>
				<div className={styles.statusCard}>
					<strong>AAD</strong>
					<code>{envelope.aadUtf8}</code>
				</div>
				<div className={styles.statusCard}>
					<strong>Tag</strong>
					<code>{envelope.tagHex}</code>
				</div>
			</div>
			<pre className={styles.codeBlock}>{envelope.ciphertextHex}</pre>
			<div className={styles.actions}>
				<button
					type="button"
					className={styles.button}
					onClick={() => void decrypt()}
				>
					Descifrar
				</button>
				<button
					type="button"
					className={styles.button}
					onClick={() => onEvidence(envelopeLabel(envelope))}
				>
					Añadir referencia
				</button>
			</div>
			{result ? (
				<div className={styles.statusCard}>
					<strong>{result.ok ? 'Plaintext' : 'Resultado'}</strong>
					<pre className={styles.codeBlock} style={{ marginTop: '0.5rem' }}>
						{result.text}
					</pre>
				</div>
			) : null}
			<p className={styles.small}>
				Los registros R01 y R02 se leen con K1; R03 usa KI. La clave K2 no se
				muestra en el repositorio ni en los logs del modelo.
			</p>
		</div>
	)
}

function ClavesView({
	state,
	busy,
	onCommand,
}: {
	readonly state: AndinaPayState
	readonly busy: boolean
	readonly onCommand: (command: AndinaPayCommand) => void
}) {
	const [keySource, setKeySource] = useState<
		'restricted-key-service' | 'restricted-runtime-file'
	>('restricted-key-service')
	const [preventionScope, setPreventionScope] = useState<
		'head-only' | 'history-and-new-diff'
	>('head-only')
	const [preventionPolicy, setPreventionPolicy] = useState<
		'silent-bypass' | 'review-required'
	>('silent-bypass')

	return (
		<div className={styles.panel}>
			<p className={styles.panelLead}>
				Configura la custodia y migra los registros sin perder la lectura
				legítima. Primero prepara K2; retirar K1 antes de migrar rompe la
				función legítima.
			</p>

			<div className={styles.statusGrid}>
				<div className={styles.statusCard}>
					<strong>Índice actual</strong>
					{Object.entries(state.index).map(([record, ref]) => (
						<div key={record}>
							{record}: {ref.keyId}/v{ref.version}
						</div>
					))}
				</div>
				<div className={styles.statusCard}>
					<strong>Custodia</strong>
					<div>Fuente: {state.keySource ?? 'sin configurar'}</div>
					<div>Writer: {state.writerKey}</div>
					<div>App payments: {state.appPaymentsKey}</div>
				</div>
				<div className={styles.statusCard}>
					<strong>Staged</strong>
					<div>
						{state.staged
							? Object.entries(state.staged)
									.map(
										([record, ref]) =>
											`${record}:${ref?.keyId}/v${ref?.version}`,
									)
									.join(' · ')
							: 'sin filas preparadas'}
					</div>
					<div>
						K2:{' '}
						{state.stagedKeys.includes('recovery-v2')
							? 'preparada'
							: 'no preparada'}
					</div>
					<div>Retiradas: {state.retiredKeys.join(', ') || 'ninguna'}</div>
				</div>
				<div className={styles.statusCard}>
					<strong>Prevención</strong>
					<div>Alcance: {state.prevention.scope}</div>
					<div>Excepciones: {state.prevention.exceptionPolicy}</div>
				</div>
			</div>

			<div className={styles.actions}>
				<button
					type="button"
					className={styles.button}
					disabled={busy}
					onClick={() => onCommand({ kind: 'stage_key', keyId: 'recovery-v2' })}
				>
					Preparar K2 para migración
				</button>
				<button
					type="button"
					className={styles.button}
					disabled={busy}
					onClick={() =>
						onCommand({ kind: 'rekey_records', records: ['R01', 'R02'] })
					}
				>
					Recifrar R01 y R02 en staged
				</button>
				<button
					type="button"
					className={styles.button}
					disabled={busy}
					onClick={() => onCommand({ kind: 'commit_recovery' })}
				>
					Publicar recuperación
				</button>
			</div>

			<div className={styles.fieldGrid}>
				<label className={styles.label} htmlFor="key-source">
					Fuente de clave restringida
					<select
						id="key-source"
						className={styles.select}
						value={keySource}
						onChange={(event) =>
							setKeySource(
								event.target.value as
									| 'restricted-key-service'
									| 'restricted-runtime-file',
							)
						}
					>
						<option value="restricted-key-service">
							restricted-key-service
						</option>
						<option value="restricted-runtime-file">
							restricted-runtime-file
						</option>
					</select>
				</label>
				<div className={styles.inline} style={{ alignItems: 'end' }}>
					<button
						type="button"
						className={styles.button}
						disabled={busy}
						onClick={() =>
							onCommand({ kind: 'set_key_source', source: keySource })
						}
					>
						Fijar fuente de clave
					</button>
				</div>
			</div>

			<div className={styles.fieldGrid} style={{ marginTop: '0.75rem' }}>
				<label className={styles.label} htmlFor="prevention-scope">
					Alcance del escaneo
					<select
						id="prevention-scope"
						className={styles.select}
						value={preventionScope}
						onChange={(event) =>
							setPreventionScope(
								event.target.value as 'head-only' | 'history-and-new-diff',
							)
						}
					>
						<option value="head-only">head-only</option>
						<option value="history-and-new-diff">history-and-new-diff</option>
					</select>
				</label>
				<label className={styles.label} htmlFor="prevention-policy">
					Política de excepciones
					<select
						id="prevention-policy"
						className={styles.select}
						value={preventionPolicy}
						onChange={(event) =>
							setPreventionPolicy(
								event.target.value as 'silent-bypass' | 'review-required',
							)
						}
					>
						<option value="silent-bypass">silent-bypass</option>
						<option value="review-required">review-required</option>
					</select>
				</label>
				<div className={styles.inline} style={{ alignItems: 'end' }}>
					<button
						type="button"
						className={styles.button}
						disabled={busy}
						onClick={() =>
							onCommand({
								kind: 'configure_prevention',
								scope: preventionScope,
								exceptionPolicy: preventionPolicy,
							})
						}
					>
						Configurar prevención
					</button>
				</div>
			</div>

			<div className={styles.actions} style={{ marginTop: '1.25rem' }}>
				<button
					type="button"
					className={styles.button}
					disabled={busy}
					onClick={() =>
						onCommand({ kind: 'retire_key_early', keyId: 'legacy-demo' })
					}
				>
					Contraprueba: retirar K1 temprano
				</button>
				<button
					type="button"
					className={styles.button}
					disabled={busy}
					onClick={() =>
						onCommand({
							kind: 'restore_key_for_recovery',
							keyId: 'legacy-demo',
						})
					}
				>
					Restaurar K1 para recuperación
				</button>
			</div>
			<p className={styles.small}>
				Retirar K1 antes de migrar deja R01/R02 ilegibles: la contraprueba
				existe para observar el fallo, no para declarar éxito.
			</p>
		</div>
	)
}

function ComprobacionesView({
	state,
	report,
	busy,
	onVerify,
	onCheck,
}: {
	readonly state: AndinaPayState
	readonly report: ExerciseReport | null
	readonly busy: boolean
	readonly onVerify: () => void
	readonly onCheck: (checkId: string) => void
}) {
	return (
		<div className={styles.panel}>
			<p className={styles.panelLead}>
				Las comprobaciones devuelven hechos y procedencia, no la solución. El
				éxito técnico es B && Q; el contraste C informa límites y exposición
				residual.
			</p>
			<div className={styles.actions}>
				<button
					type="button"
					className={styles.button}
					disabled={busy}
					onClick={onVerify}
				>
					Verificar estado actual
				</button>
				{['B1', 'B2', 'Q1', 'Q2', 'Q3', 'C1', 'C2', 'C3', 'C4', 'C5'].map(
					(checkId) => (
						<button
							key={checkId}
							type="button"
							className={styles.button}
							disabled={busy}
							onClick={() => onCheck(checkId)}
						>
							Ejecutar {checkId}
						</button>
					),
				)}
			</div>
			{report ? <ReportTable report={report} /> : null}
			{state.checks.length ? (
				<p className={styles.small}>
					Ejecuciones puntuales:{' '}
					{state.checks
						.map(
							(check) => `${check.checkId}=${check.passed ? 'pasa' : 'falla'}`,
						)
						.join(' · ')}
				</p>
			) : null}
		</div>
	)
}

function ReportTable({ report }: { readonly report: ExerciseReport }) {
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
						.join(' · ')}
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
						Comprobaciones ejecutadas sobre el estado del banco. El verificador
						reejecuta las propiedades declaradas.
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

function InformeView({
	state,
	reportFields,
	setReportFields,
	busy,
	onArtifact,
	onReport,
	onReset,
	onMap,
	onVerify,
}: {
	readonly state: AndinaPayState
	readonly reportFields: ReportFields
	readonly setReportFields: (next: ReportFields) => void
	readonly busy: boolean
	readonly onArtifact: () => Promise<void>
	readonly onReport: () => Promise<void>
	readonly onReset: () => void
	readonly onMap: () => void
	readonly onVerify: () => void
}) {
	const complete = Object.values(reportFields).every((value) => value.trim())

	return (
		<div className={styles.panel}>
			<p className={styles.panelLead}>
				Informe no técnico de cinco campos. Primero entrega el artefacto; la
				entrega congela controles y pruebas. Después se habilita el informe
				final.
			</p>

			<div className={styles.fieldGrid}>
				<label className={styles.label} htmlFor="report-occurred">
					Qué ocurrió según los materiales
					<textarea
						id="report-occurred"
						className={styles.textarea}
						rows={3}
						value={reportFields.occurred}
						onChange={(event) =>
							setReportFields({ ...reportFields, occurred: event.target.value })
						}
					/>
				</label>
				<label className={styles.label} htmlFor="report-recoverable">
					Qué datos se demostraron recuperables
					<textarea
						id="report-recoverable"
						className={styles.textarea}
						rows={3}
						value={reportFields.recoverable}
						onChange={(event) =>
							setReportFields({
								...reportFields,
								recoverable: event.target.value,
							})
						}
					/>
				</label>
				<label className={styles.label} htmlFor="report-cause">
					Causa y corrección
					<textarea
						id="report-cause"
						className={styles.textarea}
						rows={3}
						value={reportFields.cause}
						onChange={(event) =>
							setReportFields({ ...reportFields, cause: event.target.value })
						}
					/>
				</label>
				<label className={styles.label} htmlFor="report-continuity">
					Continuidad verificada
					<textarea
						id="report-continuity"
						className={styles.textarea}
						rows={3}
						value={reportFields.continuity}
						onChange={(event) =>
							setReportFields({
								...reportFields,
								continuity: event.target.value,
							})
						}
					/>
				</label>
				<label className={styles.label} htmlFor="report-limits">
					Límites y próximos pasos
					<textarea
						id="report-limits"
						className={styles.textarea}
						rows={3}
						value={reportFields.limits}
						onChange={(event) =>
							setReportFields({ ...reportFields, limits: event.target.value })
						}
					/>
				</label>
			</div>

			<div className={styles.actions}>
				<button
					type="button"
					className={styles.button}
					disabled={
						busy || state.sealedDiagnosis === null || state.artifactSubmitted
					}
					onClick={() => void onArtifact()}
				>
					{state.artifactSubmitted
						? 'Artefacto entregado'
						: 'Entregar artefacto'}
				</button>
				<button
					type="button"
					className={styles.button}
					disabled={
						busy ||
						!state.artifactSubmitted ||
						state.reportSubmitted ||
						!complete
					}
					onClick={() => void onReport()}
				>
					{state.reportSubmitted ? 'Informe enviado' : 'Enviar informe'}
				</button>
				<button type="button" className={styles.button} onClick={onVerify}>
					Verificar antes de entregar
				</button>
			</div>

			{state.artifactSubmitted ? (
				<p className={styles.hint}>
					Entrega técnica congelada. Los controles y las pruebas ya no se
					editan.
				</p>
			) : null}

			{state.reportSubmitted ? (
				<div className={styles.footerNotice}>
					<strong>Caso completado.</strong> La copia histórica R01/v1 sigue
					siendo legible con K1: la exposición residual está declarada y el
					vector de fuga no se conoce. El nodo del mapa se marcará como
					completado al guardar el progreso.
					<div className={styles.actions}>
						<button type="button" className={styles.button} onClick={onMap}>
							Volver al mapa
						</button>
						<button type="button" className={styles.button} onClick={onReset}>
							Reiniciar caso
						</button>
					</div>
				</div>
			) : null}
		</div>
	)
}
