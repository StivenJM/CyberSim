import {
	ANDINAPAY_ARTIFACTS,
	ANDINAPAY_ENVELOPES,
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
	type RepositoryFile,
	revisionById,
	searchRevision,
	verifyAndinaPay,
} from '@cybersim/exercises'
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { useNavigate } from 'react-router'

import { ProgresoController } from '../../../../ecs/controllers/ProgresoController'
import type { TipoLogGeneral } from '../../../../shared/types/EventosEnums'
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

export function andinaPayStorageKey(): string {
	return `cybersim:andinapay:${currentStudentKey()}:case`
}

export function andinaPayFase1Key(): string {
	return `cybersim:andinapay:${currentStudentKey()}:fase1`
}

export function andinaPayNoticeKey(): string {
	return `cybersim:andinapay:${currentStudentKey()}:notice`
}

export function markAndinaPayNoticeRead(): void {
	try {
		localStorage.setItem(andinaPayNoticeKey(), '1')
	} catch {
		// Storage unavailable: the case stays playable without the hint.
	}
}

export function isAndinaPayNoticeRead(): boolean {
	try {
		return localStorage.getItem(andinaPayNoticeKey()) === '1'
	} catch {
		return false
	}
}

export function readAndinaPayState(): AndinaPayState | null {
	return loadStored()?.state ?? null
}

function loadStored(): StoredExercise | null {
	try {
		const raw = localStorage.getItem(andinaPayStorageKey())
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

export interface AndinaPayBridge {
	readonly onObjective?: (faseId: number, descripcion: string) => void
	readonly onLog?: (
		mensaje: string,
		pausarTiempo?: boolean,
		tipo?: TipoLogGeneral,
	) => void
}

interface AndinaPayContextValue {
	readonly state: AndinaPayState
	readonly sealed: boolean
	readonly busy: boolean
	readonly error: string | null
	readonly report: ExerciseReport | null
	readonly reportFields: ReportFields
	readonly setReportFields: (next: ReportFields) => void
	readonly run: (command: AndinaPayCommand) => Promise<AndinaPayState | null>
	readonly recordEvidence: (reference: string) => Promise<void>
	readonly verify: () => Promise<void>
	readonly sealDiagnosis: (input: {
		readonly claim: string
		readonly cited: readonly string[]
		readonly rival: string
		readonly proposedTest: string
		readonly scope: string
	}) => Promise<boolean>
	readonly submitArtifact: () => Promise<void>
	readonly submitReport: () => Promise<void>
	readonly completeFase1: () => void
	readonly reset: () => void
}

const AndinaPayContext = createContext<AndinaPayContextValue | undefined>(
	undefined,
)

function useAndinaPay(): AndinaPayContextValue {
	const context = useContext(AndinaPayContext)
	if (!context) {
		throw new Error('useAndinaPay debe usarse dentro de AndinaPayProvider')
	}
	return context
}

export function AndinaPayProvider({
	children,
	scenarioSlug = 'andinapay-clave-expuesta',
	bridge,
	onCompleted,
}: {
	readonly children: ReactNode
	readonly scenarioSlug?: string
	readonly bridge?: AndinaPayBridge
	readonly onCompleted?: () => void
}) {
	const initial = useRef<StoredExercise | null>(null)
	if (initial.current === null) initial.current = loadStored()

	const [state, setState] = useState<AndinaPayState>(
		() => initial.current?.state ?? createAndinaPayState(),
	)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [report, setReport] = useState<ExerciseReport | null>(null)
	const [reportFields, setReportFields] = useState<ReportFields>(
		initial.current?.reportFields ?? EMPTY_REPORT,
	)
	const startedAt = useRef(initial.current?.startedAt ?? Date.now())
	const fase1Completada = useRef(false)
	const attempt = useAndinaPayAttempt()

	const sealed = state.sealedDiagnosis !== null

	useEffect(() => {
		const stored: StoredExercise = {
			state,
			startedAt: startedAt.current,
			reportFields,
		}
		localStorage.setItem(andinaPayStorageKey(), JSON.stringify(stored))
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
			if (next && command.kind === 'commit_recovery') {
				bridge?.onObjective?.(
					3,
					'Migrar R01/R02 a recovery-v2 y retirar legacy-demo',
				)
				bridge?.onLog?.(
					'Recuperación publicada; legacy-demo retirada del servicio.',
				)
			}
			return next
		},
		[apply, state, commit, bridge],
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

	const completeFase1 = useCallback(() => {
		if (fase1Completada.current) return
		fase1Completada.current = true
		localStorage.setItem(andinaPayFase1Key(), '1')
		bridge?.onObjective?.(
			1,
			'Leer el aviso y adjuntar la versión H1 al expediente',
		)
	}, [bridge])

	const sealDiagnosis = useCallback(
		async ({
			claim,
			cited,
			rival,
			proposedTest,
			scope,
		}: {
			readonly claim: string
			readonly cited: readonly string[]
			readonly rival: string
			readonly proposedTest: string
			readonly scope: string
		}) => {
			setBusy(true)
			let next = state
			for (const reference of cited) {
				const withEvidence = await apply(next, {
					kind: 'record_evidence',
					reference,
				})
				if (!withEvidence) {
					setBusy(false)
					return false
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
				return false
			}
			await attempt.saveDiagnosis(claim.trim(), cited)
			await commit(diagnosed)
			setBusy(false)
			bridge?.onObjective?.(
				2,
				'Sellar el diagnóstico provisional con dos evidencias',
			)
			bridge?.onLog?.(
				'Diagnóstico D1 sellado; vistas de intervención habilitadas.',
			)
			return true
		},
		[state, apply, attempt, commit, bridge],
	)

	const saveProgress = useCallback(async () => {
		localStorage.setItem('slug_escenario_actual', scenarioSlug)
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

	const submitArtifact = useCallback(async () => {
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
		bridge?.onLog?.('Artefacto entregado; controles y pruebas congelados.')
		setBusy(false)
	}, [state, apply, attempt, bridge])

	const submitReport = useCallback(async () => {
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
		bridge?.onObjective?.(4, 'Verificar B/Q/C y enviar el informe')
		bridge?.onLog?.('Informe enviado; caso completado.', true)
		await saveProgress()
		setBusy(false)
	}, [state, apply, attempt, reportFields, bridge, saveProgress])

	const reset = useCallback(() => {
		for (let index = localStorage.length - 1; index >= 0; index -= 1) {
			const key = localStorage.key(index)
			if (key?.startsWith('cybersim:andinapay:')) {
				localStorage.removeItem(key)
			}
		}
		window.location.reload()
	}, [])

	const value = useMemo<AndinaPayContextValue>(
		() => ({
			state,
			sealed,
			busy,
			error,
			report,
			reportFields,
			setReportFields,
			run,
			recordEvidence,
			verify,
			sealDiagnosis,
			submitArtifact,
			submitReport,
			completeFase1,
			reset,
		}),
		[
			state,
			sealed,
			busy,
			error,
			report,
			reportFields,
			run,
			recordEvidence,
			verify,
			sealDiagnosis,
			submitArtifact,
			submitReport,
			completeFase1,
			reset,
		],
	)

	return (
		<AndinaPayContext.Provider value={value}>
			{children}
		</AndinaPayContext.Provider>
	)
}

function AndinaPayTabs({
	embedded = false,
	onMap,
}: {
	readonly embedded?: boolean
	readonly onMap?: () => void
}) {
	const ctx = useAndinaPay()
	const [active, setActive] = useState<TabId>('expediente')
	const tabs = useMemo(
		() => TABS.filter((tab) => tab.id === 'expediente' || ctx.sealed),
		[ctx.sealed],
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
			</header>

			{!ctx.sealed ? (
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

			{ctx.error ? (
				<p className={styles.notice} role="alert">
					{ctx.error}
				</p>
			) : null}

			{active === 'expediente' ? (
				<ExpedienteView
					state={ctx.state}
					claim={ctx.state.sealedDiagnosis ?? ''}
					sealed={ctx.sealed}
					busy={ctx.busy}
					onSeal={async (input) => {
						const ok = await ctx.sealDiagnosis(input)
						if (ok) setActive('repositorio')
					}}
					onEvidence={(reference) => void ctx.recordEvidence(reference)}
					onLocateKey={ctx.completeFase1}
				/>
			) : null}

			{active === 'repositorio' ? (
				<RepositorioView
					onEvidence={(reference) => void ctx.recordEvidence(reference)}
					onLocateKey={ctx.completeFase1}
				/>
			) : null}

			{active === 'banco' ? (
				<BancoView
					onEvidence={(reference) => void ctx.recordEvidence(reference)}
				/>
			) : null}

			{active === 'claves' ? (
				<ClavesView
					state={ctx.state}
					busy={ctx.busy}
					onCommand={(command) => void ctx.run(command)}
				/>
			) : null}

			{active === 'comprobaciones' ? (
				<ComprobacionesView
					state={ctx.state}
					report={ctx.report}
					busy={ctx.busy}
					onVerify={() => void ctx.verify()}
					onCheck={(checkId) => void ctx.run({ kind: 'run_check', checkId })}
				/>
			) : null}

			{active === 'informe' ? (
				<InformeView
					state={ctx.state}
					reportFields={ctx.reportFields}
					setReportFields={ctx.setReportFields}
					busy={ctx.busy}
					onArtifact={ctx.submitArtifact}
					onReport={ctx.submitReport}
					onReset={ctx.reset}
					onMap={onMap}
					onVerify={() => void ctx.verify()}
				/>
			) : null}
		</section>
	)
}

export default function AndinaPayCaseWorkspace({
	scenarioSlug = 'andinapay-clave-expuesta',
	embedded = false,
	onCompleted,
}: AndinaPayCaseWorkspaceProps) {
	const navigate = useNavigate()
	return (
		<AndinaPayProvider scenarioSlug={scenarioSlug} onCompleted={onCompleted}>
			<AndinaPayTabs
				embedded={embedded}
				onMap={() => navigate('/seleccion-niveles')}
			/>
		</AndinaPayProvider>
	)
}

function WindowPanel({ children }: { readonly children: ReactNode }) {
	return <div className={styles.windowPanel}>{children}</div>
}

export function AndinaPayExpedienteWindow() {
	const ctx = useAndinaPay()
	return (
		<WindowPanel>
			<ExpedienteView
				state={ctx.state}
				claim={ctx.state.sealedDiagnosis ?? ''}
				sealed={ctx.sealed}
				busy={ctx.busy}
				onSeal={async (input) => {
					await ctx.sealDiagnosis(input)
				}}
				onEvidence={(reference) => void ctx.recordEvidence(reference)}
				onLocateKey={ctx.completeFase1}
			/>
		</WindowPanel>
	)
}

export function AndinaPayRepositorioWindow() {
	const ctx = useAndinaPay()
	return (
		<WindowPanel>
			<RepositorioView
				onEvidence={(reference) => void ctx.recordEvidence(reference)}
				onLocateKey={ctx.completeFase1}
			/>
		</WindowPanel>
	)
}

export function AndinaPayBancoWindow() {
	const ctx = useAndinaPay()
	return (
		<WindowPanel>
			<BancoView
				onEvidence={(reference) => void ctx.recordEvidence(reference)}
			/>
		</WindowPanel>
	)
}

export function AndinaPayClavesWindow() {
	const ctx = useAndinaPay()
	return (
		<WindowPanel>
			<ClavesView
				state={ctx.state}
				busy={ctx.busy}
				onCommand={(command) => void ctx.run(command)}
			/>
		</WindowPanel>
	)
}

export function AndinaPayComprobacionesWindow() {
	const ctx = useAndinaPay()
	return (
		<WindowPanel>
			<ComprobacionesView
				state={ctx.state}
				report={ctx.report}
				busy={ctx.busy}
				onVerify={() => void ctx.verify()}
				onCheck={(checkId) => void ctx.run({ kind: 'run_check', checkId })}
			/>
		</WindowPanel>
	)
}

export function AndinaPayInformeWindow() {
	const ctx = useAndinaPay()
	return (
		<WindowPanel>
			<InformeView
				state={ctx.state}
				reportFields={ctx.reportFields}
				setReportFields={ctx.setReportFields}
				busy={ctx.busy}
				onArtifact={ctx.submitArtifact}
				onReport={ctx.submitReport}
				onReset={ctx.reset}
				onVerify={() => void ctx.verify()}
			/>
		</WindowPanel>
	)
}
function displayRef(reference: string): string {
	switch (reference) {
		case 'AP-H1':
			return 'Versión H1 (histórica)'
		case 'AP-H2':
			return 'Versión H2 (literal retirado)'
		case 'AP-H3':
			return 'Versión H3 (actual)'
		default:
			return reference
	}
}

function revisionTag(reference: string): string {
	switch (reference) {
		case 'AP-H1':
			return 'histórica'
		case 'AP-H2':
			return 'literal retirado'
		case 'AP-H3':
			return 'actual'
		default:
			return reference
	}
}

const EVIDENCE_GROUPS: readonly {
	readonly label: string
	readonly refs: readonly string[]
}[] = [
	{ label: 'Repositorio', refs: ['AP-H1', 'AP-H2', 'AP-H3'] },
	{
		label: 'Datos y logs',
		refs: [
			'logs/application.log',
			'keys/inventory.csv',
			'data/current-index.csv',
			'data/partial-v1.json',
		],
	},
	{
		label: 'Aviso y custodia',
		refs: ['incident/notice.txt', 'recovery/policy.txt'],
	},
	{
		label: 'Envelopes',
		refs: [
			'R01/K1/v1',
			'R02/K1/v1',
			'R03/KI/v1',
			'R04/K1/v1',
			'R01/K2/v2',
			'R02/K2/v2',
			'R04/K2/v2',
		],
	},
]

function artifactContent(reference: string): string {
	const artifact = ANDINAPAY_ARTIFACTS.find((entry) => entry.path === reference)
	if (artifact) return artifact.lines.join('\n')
	if (reference === 'AP-H1' || reference === 'AP-H2' || reference === 'AP-H3') {
		const revision = revisionById(reference)
		if (revision) {
			return revision.files
				.map(
					(file) =>
						`${file.path}\n${file.lines
							.map((line, index) => `${index + 1}  ${line}`)
							.join('\n')}`,
				)
				.join('\n\n')
		}
	}
	return 'Selecciona un material de la lista para leerlo.'
}

function ExpedienteView({
	state,
	claim,
	sealed,
	busy,
	onSeal,
	onEvidence,
	onLocateKey,
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
	readonly onLocateKey?: () => void
}) {
	const [draft, setDraft] = useState({
		claim: '',
		rival: '',
		proposedTest: '',
		scope: '',
	})
	const [cited, setCited] = useState<readonly string[]>([])
	const [selected, setSelected] = useState('incident/notice.txt')
	const content = artifactContent(selected)

	useEffect(() => {
		markAndinaPayNoticeRead()
	}, [])

	const openArtifact = (reference: string) => {
		setSelected(reference)
	}

	const toggle = (reference: string) => {
		setCited((current) =>
			current.includes(reference)
				? current.filter((entry) => entry !== reference)
				: [...current, reference],
		)
	}

	return (
		<div className={styles.panel}>
			<header className={styles.incidentHeader}>
				<p className={styles.eyebrow}>Aviso recibido · 08:30</p>
				<h2 className={styles.panelTitle}>Expediente de datos</h2>
				<p className={styles.small}>
					Origen: canal de soporte · no autenticado. Revisa los materiales y
					registra el hallazgo en el repositorio.
				</p>
			</header>

			<div className={styles.grid}>
				<section aria-labelledby="a0-title">
					<h2 id="a0-title" className={styles.panelTitle}>
						Materiales A0
					</h2>
					<ul className={styles.artifactList}>
						{ANDINAPAY_ARTIFACTS.map((artifact) => (
							<li key={artifact.path}>
								<button
									type="button"
									className={
										selected === artifact.path
											? `${styles.artifactButton} ${styles.artifactButtonActive}`
											: styles.artifactButton
									}
									onClick={() => openArtifact(artifact.path)}
								>
									{artifact.path}
								</button>
							</li>
						))}
						{(['AP-H1', 'AP-H2', 'AP-H3'] as const).map((revision) => (
							<li key={revision}>
								<button
									type="button"
									className={
										selected === revision
											? `${styles.artifactButton} ${styles.artifactButtonActive}`
											: styles.artifactButton
									}
									onClick={() => openArtifact(revision)}
								>
									{displayRef(revision)}
								</button>
							</li>
						))}
					</ul>
					<p className={styles.small}>
						Evidencias citadas: {state.evidence.length}
						{state.evidence.length ? ` · ${state.evidence.join(' · ')}` : ''}
					</p>
				</section>

				<section aria-labelledby="reader-title">
					<h2 id="reader-title" className={styles.panelTitle}>
						{displayRef(selected)}
					</h2>
					<pre className={styles.codeBlock}>{content}</pre>
					<button
						type="button"
						className={styles.button}
						onClick={() => {
							onEvidence(selected)
							if (selected === 'AP-H1') onLocateKey?.()
						}}
					>
						Citar esta evidencia
					</button>
				</section>
			</div>

			<section aria-labelledby="d1-title" style={{ marginTop: '1.25rem' }}>
				<h2 id="d1-title" className={styles.panelTitle}>
					Diagnóstico D1
				</h2>
				{sealed ? (
					<>
						<p className={styles.hint}>Diagnóstico sellado; no se reescribe.</p>
						<pre className={styles.codeBlock}>{claim}</pre>
					</>
				) : (
					<>
						<p className={styles.hint}>
							No necesitas acertar para avanzar. D1 pide: qué encontraste, dos
							evidencias, una explicación rival, una prueba y lo que sigue sin
							saberse.
						</p>
						<label className={styles.label} htmlFor="d1-claim">
							1. ¿Qué encontraste?
						</label>
						<textarea
							id="d1-claim"
							className={styles.textarea}
							rows={3}
							placeholder="Ej.: La clave legacy-demo de la versión H1 cifra R01 y R02; la versión H3 eliminó el literal pero no rotó la clave."
							value={draft.claim}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									claim: event.target.value,
								}))
							}
						/>
						<p className={styles.label}>2. Elige dos evidencias</p>
						<div className={styles.evidenceGroups}>
							{EVIDENCE_GROUPS.map((group) => (
								<div key={group.label} className={styles.evidenceGroup}>
									<strong>{group.label}</strong>
									<div className={styles.checkboxRow}>
										{group.refs.map((reference) => (
											<label key={reference}>
												<input
													type="checkbox"
													checked={cited.includes(reference)}
													onChange={() => toggle(reference)}
												/>
												{displayRef(reference)}
											</label>
										))}
									</div>
								</div>
							))}
						</div>
						<label className={styles.label} htmlFor="d1-rival">
							3. ¿Qué otra explicación descartas?
						</label>
						<textarea
							id="d1-rival"
							className={styles.textarea}
							rows={2}
							placeholder="Ej.: El identificador público merchant-demo-17 no explica el descifrado."
							value={draft.rival}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									rival: event.target.value,
								}))
							}
						/>
						<label className={styles.label} htmlFor="d1-test">
							4. ¿Qué prueba propondrías?
						</label>
						<textarea
							id="d1-test"
							className={styles.textarea}
							rows={2}
							placeholder="Ej.: Descifrar R01 con legacy-demo y comprobar que R03 falla con la misma clave."
							value={draft.proposedTest}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									proposedTest: event.target.value,
								}))
							}
						/>
						<label className={styles.label} htmlFor="d1-scope">
							5. ¿Qué sigue sin saberse?
						</label>
						<textarea
							id="d1-scope"
							className={styles.textarea}
							rows={2}
							placeholder="Ej.: Se demuestra la lectura de R01/R02; no se conoce el vector de fuga ni quién usó la clave."
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
					</>
				)}
			</section>
		</div>
	)
}
function RepositorioView({
	onEvidence,
	onLocateKey,
}: {
	readonly onEvidence: (reference: string) => void
	readonly onLocateKey?: () => void
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
	const shortId = revision.replace('AP-', '')
	const matches = useMemo(
		() => searchRevision(revision, query),
		[revision, query],
	)
	const folders = useMemo(() => {
		const groups = new Map<string, RepositoryFile[]>()
		for (const file of current?.files ?? []) {
			const folder = file.path.split('/').slice(0, -1).join('/')
			const bucket = groups.get(folder)
			if (bucket) {
				bucket.push(file)
			} else {
				groups.set(folder, [file])
			}
		}
		return [...groups.entries()]
	}, [current])

	return (
		<div className={styles.panel}>
			<div className={styles.ide}>
				<div className={styles.ideTitlebar}>
					<span className={styles.ideDots} aria-hidden="true">
						<span />
						<span />
						<span />
					</span>
					<span className={styles.ideTitle}>
						andinapay — {selected?.path ?? 'repositorio'} —{' '}
						{displayRef(revision)}
					</span>
				</div>

				<div className={styles.ideBody}>
					<aside className={styles.ideSidebar}>
						<p className={styles.ideSidebarTitle}>Explorador</p>
						<p className={styles.ideRepo}>andinapay</p>
						<ul className={styles.ideTree}>
							{folders.map(([folder, entries]) => (
								<li key={folder || 'root'}>
									{folder ? (
										<p className={styles.ideFolder}>{folder}/</p>
									) : null}
									<ul className={styles.ideTreeFiles}>
										{entries.map((file) => {
											const name = file.path.split('/').pop() ?? file.path
											const extension = name.includes('.')
												? (name.split('.').pop() ?? '')
												: ''
											return (
												<li key={file.path}>
													<button
														type="button"
														className={
															file.path === selected?.path
																? `${styles.ideFile} ${styles.ideFileActive}`
																: styles.ideFile
														}
														aria-current={
															file.path === selected?.path ? 'true' : undefined
														}
														onClick={() => setSelectedPath(file.path)}
													>
														<span
															className={styles.ideFileIcon}
															data-ext={extension}
															aria-hidden="true"
														>
															{extension.slice(0, 2).toUpperCase()}
														</span>
														{name}
													</button>
												</li>
											)
										})}
									</ul>
								</li>
							))}
						</ul>

						<p className={styles.ideSidebarTitle}>Historial</p>
						<ol className={styles.ideHistory}>
							{[...ANDINAPAY_REVISIONS].reverse().map((entry) => (
								<li key={entry.id}>
									<button
										type="button"
										className={
											entry.id === revision
												? `${styles.ideCommit} ${styles.ideCommitActive}`
												: styles.ideCommit
										}
										onClick={() => {
											setRevision(entry.id)
											setSelectedPath(entry.files[0]?.path ?? '')
										}}
									>
										<span className={styles.ideCommitDot} aria-hidden="true" />
										<span className={styles.ideCommitBody}>
											<span className={styles.ideCommitHead}>
												<code>{entry.id.replace('AP-', '')}</code>
												<span>{entry.message}</span>
											</span>
											<span className={styles.ideCommitMeta}>
												{entry.date} · {revisionTag(entry.id)}
											</span>
										</span>
									</button>
								</li>
							))}
						</ol>

						<button
							type="button"
							className={styles.ideEvidence}
							onClick={() => {
								onEvidence(revision)
								if (revision === 'AP-H1') onLocateKey?.()
							}}
						>
							+ Adjuntar {displayRef(revision)} al expediente
						</button>
					</aside>

					<div className={styles.ideMain}>
						<div className={styles.ideTabs}>
							<span className={styles.ideTabActive}>
								{selected
									? (selected.path.split('/').pop() ?? selected.path)
									: 'Sin archivo'}
								<span className={styles.ideTabBadge}>{shortId}</span>
							</span>
						</div>
						<p className={styles.ideBreadcrumb}>
							andinapay <span aria-hidden="true">›</span>{' '}
							{selected?.path.split('/').join(' › ')}
						</p>
						<section
							className={styles.ideCode}
							aria-label={`Contenido de ${selected?.path ?? 'la revisión'}`}
						>
							{selected?.lines.map((line, index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: repository lines are positional and static per revision.
									key={`${selected.path}-${index}`}
									className={styles.codeLine}
								>
									<span className={styles.lineNumber}>{index + 1}</span>
									<span>{query.trim() ? highlight(line, query) : line}</span>
								</div>
							))}
						</section>
						<div className={styles.ideStatusbar}>
							<span>main</span>
							<span>
								{shortId} · {current?.date}
							</span>
							<span>{selected?.lines.length ?? 0} líneas</span>
							<span>
								{selected?.path.endsWith('.ts') ? 'TypeScript' : 'Plain Text'} ·
								UTF-8
							</span>
						</div>
					</div>
				</div>
			</div>

			<section className={styles.idePanel}>
				<p className={styles.idePanelTitle}>Buscar en el historial</p>
				<div className={styles.searchRow}>
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
					<ul className={styles.ideResults}>
						{matches.map((match) => (
							<li key={`${match.path}-${match.line}`}>
								<button
									type="button"
									className={styles.ideResult}
									onClick={() => setSelectedPath(match.path)}
								>
									<span className={styles.ideResultPath}>
										{match.path}:{match.line}
									</span>
									<code>{highlight(match.text, query)}</code>
								</button>
							</li>
						))}
					</ul>
				) : null}
			</section>

			<section className={styles.idePanel}>
				<p className={styles.idePanelTitle}>Comparar revisiones</p>
				<div className={styles.inline}>
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
								{displayRef(entry.id)}
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
								{displayRef(entry.id)}
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
					<div className={styles.ideDiff}>
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
			</section>

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
	readonly onMap?: () => void
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
						{onMap ? (
							<button type="button" className={styles.button} onClick={onMap}>
								Volver al mapa
							</button>
						) : null}
						<button type="button" className={styles.button} onClick={onReset}>
							Reiniciar caso
						</button>
					</div>
				</div>
			) : null}
		</div>
	)
}
