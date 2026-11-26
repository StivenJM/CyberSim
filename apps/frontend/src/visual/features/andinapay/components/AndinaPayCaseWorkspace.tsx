import {
	ANDINAPAY_ARTIFACTS,
	ANDINAPAY_ENVELOPES,
	ANDINAPAY_KEYS,
	ANDINAPAY_REVISIONS,
	type AndinaPayCommand,
	type AndinaPayKeyId,
	type AndinaPayRevisionId,
	type AndinaPayState,
	applyAndinaPay,
	createAndinaPayState,
	decryptEnvelope,
	type RepositoryFile,
	revisionById,
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

import type { TipoLogGeneral } from '../../../../shared/types/EventosEnums'
import { useAndinaPayAttempt } from '../hooks/useAndinaPayAttempt'
import styles from '../styles/AndinaPay.module.css'

interface StoredExercise {
	readonly state: AndinaPayState
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
		}
	} catch {
		return null
	}
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
	readonly onStepDone?: () => void
}

interface AndinaPayContextValue {
	readonly state: AndinaPayState
	readonly recordEvidence: (reference: string) => Promise<void>
	readonly completeFase1: () => void
	readonly stepDone: () => void
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
	bridge,
}: {
	readonly children: ReactNode
	readonly bridge?: AndinaPayBridge
}) {
	const initial = useRef<StoredExercise | null>(null)
	if (initial.current === null) initial.current = loadStored()

	const [state, setState] = useState<AndinaPayState>(
		() => initial.current?.state ?? createAndinaPayState(),
	)
	const fase1Completada = useRef(false)
	const attempt = useAndinaPayAttempt()

	useEffect(() => {
		const stored: StoredExercise = { state }
		localStorage.setItem(andinaPayStorageKey(), JSON.stringify(stored))
	}, [state])

	const apply = useCallback(
		async (
			current: AndinaPayState,
			command: AndinaPayCommand,
		): Promise<AndinaPayState | null> => {
			const outcome = await applyAndinaPay(current, command)
			return outcome.ok ? outcome.state : null
		},
		[],
	)

	const commit = useCallback(
		async (next: AndinaPayState) => {
			setState(next)
			await attempt.saveRevision(next)
		},
		[attempt],
	)

	const run = useCallback(
		async (command: AndinaPayCommand) => {
			const next = await apply(state, command)
			if (next) await commit(next)
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

	const stepDone = useCallback(() => {
		bridge?.onStepDone?.()
	}, [bridge])

	const completeFase1 = useCallback(() => {
		if (fase1Completada.current) return
		fase1Completada.current = true
		localStorage.setItem(andinaPayFase1Key(), '1')
		bridge?.onObjective?.(
			1,
			'Leer el aviso y adjuntar la versión H1 al expediente',
		)
		bridge?.onStepDone?.()
	}, [bridge])

	const value = useMemo<AndinaPayContextValue>(
		() => ({
			state,
			recordEvidence,
			completeFase1,
			stepDone,
		}),
		[state, recordEvidence, completeFase1, stepDone],
	)

	return (
		<AndinaPayContext.Provider value={value}>
			{children}
		</AndinaPayContext.Provider>
	)
}

function WindowPanel({ children }: { readonly children: ReactNode }) {
	return <div className={styles.windowPanel}>{children}</div>
}

export function AndinaPayExpedienteWindow({
	requestedMaterial,
}: {
	readonly requestedMaterial?: { readonly reference: string }
}) {
	const ctx = useAndinaPay()
	return (
		<WindowPanel>
			<ExpedienteView
				requestedMaterial={requestedMaterial}
				state={ctx.state}
				onEvidence={(reference) => void ctx.recordEvidence(reference)}
				onLocateKey={ctx.completeFase1}
				onStepDone={ctx.stepDone}
			/>
		</WindowPanel>
	)
}

export function AndinaPayRepositorioWindow() {
	return (
		<WindowPanel>
			<RepositorioView />
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

const FILE_BADGES: Record<string, { label: string; color: string }> = {
	ts: { label: 'TS', color: '#3b82f6' },
	tsx: { label: 'TX', color: '#3b82f6' },
	json: { label: '{ }', color: '#eab308' },
	csv: { label: 'CSV', color: '#22c55e' },
	log: { label: 'LOG', color: '#94a3b8' },
	txt: { label: 'TXT', color: '#94a3b8' },
	md: { label: 'MD', color: '#38bdf8' },
	yml: { label: 'YML', color: '#ef4444' },
	yaml: { label: 'YML', color: '#ef4444' },
}

function fileBadge(name: string): { label: string; color: string } {
	if (name === '.env' || name === '.env.example') {
		return { label: 'ENV', color: '#eab308' }
	}
	if (name === '.gitignore' || name === '.gitattributes') {
		return { label: 'GIT', color: '#f97316' }
	}
	const dot = name.lastIndexOf('.')
	const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
	return (
		FILE_BADGES[ext] ?? {
			label: (ext ? ext.slice(0, 3) : 'FILE').toUpperCase(),
			color: '#94a3b8',
		}
	)
}

function VsFolder() {
	return (
		<svg
			className={styles.vscodeFolderIcon}
			width="14"
			height="14"
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M1.5 3.5h4l1 1.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5Z"
				fill="currentColor"
				opacity="0.45"
			/>
		</svg>
	)
}

/** Líneas de un material: artefacto A0, archivo del repo actual o revisión. */
function materialLines(reference: string): readonly string[] {
	const artifact = ANDINAPAY_ARTIFACTS.find((entry) => entry.path === reference)
	if (artifact) return artifact.lines
	const current = revisionById('AP-H3')
	const file = current?.files.find((entry) => entry.path === reference)
	if (file) return file.lines
	const revision = revisionById(reference as AndinaPayRevisionId)
	if (revision) {
		return revision.files.flatMap((item) => [
			`// ${item.path}`,
			...item.lines,
			'',
		])
	}
	return []
}

function ExpedienteView({
	requestedMaterial,
	state,
	onEvidence,
	onLocateKey,
	onStepDone,
}: {
	readonly requestedMaterial?: { readonly reference: string }
	readonly state: AndinaPayState
	readonly onEvidence: (reference: string) => void
	readonly onLocateKey?: () => void
	readonly onStepDone?: () => void
}) {
	const [selected, setSelected] = useState(
		requestedMaterial?.reference ?? 'incident/notice.txt',
	)
	const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
	const lines = materialLines(selected)
	const stepDoneRef = useRef(onStepDone)
	stepDoneRef.current = onStepDone

	useEffect(() => {
		if (requestedMaterial) setSelected(requestedMaterial.reference)
	}, [requestedMaterial])

	useEffect(() => {
		if (selected !== 'incident/notice.txt') return
		markAndinaPayNoticeRead()
		stepDoneRef.current?.()
	}, [selected])

	const toggleFolder = (folder: string) => {
		setCollapsed((prev) => {
			const next = new Set(prev)
			if (next.has(folder)) {
				next.delete(folder)
			} else {
				next.add(folder)
			}
			return next
		})
	}

	const folders = useMemo(() => {
		const current = revisionById('AP-H3')
		const entries = [
			...ANDINAPAY_ARTIFACTS.map((artifact) => ({
				path: artifact.path,
				lines: artifact.lines,
			})),
			...(current?.files.map((file) => ({
				path: file.path,
				lines: file.lines,
			})) ?? []),
		]
		const groups = new Map<
			string,
			{ path: string; lines: readonly string[] }[]
		>()
		for (const file of entries) {
			const folder = file.path.split('/').slice(0, -1).join('/')
			const bucket = groups.get(folder)
			if (bucket) {
				bucket.push(file)
			} else {
				groups.set(folder, [file])
			}
		}
		return [...groups.entries()].sort(([a], [b]) => {
			if (!a) return -1
			if (!b) return 1
			return a.localeCompare(b)
		})
	}, [])

	const isRevision =
		selected === 'AP-H1' || selected === 'AP-H2' || selected === 'AP-H3'
	const cited = state.evidence.includes(selected)
	const canAttach =
		ANDINAPAY_ARTIFACTS.some((artifact) => artifact.path === selected) ||
		isRevision
	const language = isRevision
		? 'TypeScript'
		: selected.endsWith('.ts')
			? 'TypeScript'
			: selected.endsWith('.json')
				? 'JSON'
				: selected.endsWith('.csv')
					? 'CSV'
					: selected.endsWith('.md')
						? 'Markdown'
						: 'Plain Text'

	const attach = () => {
		onEvidence(selected)
		if (selected === 'AP-H1') onLocateKey?.()
	}

	return (
		<div className={styles.toolShell}>
			<div className={styles.vscode}>
				<aside
					className={styles.vscodeActivityBar}
					aria-label="Barra de actividad"
				>
					<button
						type="button"
						className={styles.vscodeActivityActive}
						title="Explorador"
						aria-label="Explorador"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M8 3h5.5L17 6.5V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
								fill="currentColor"
							/>
							<path
								d="M4 7h3.5v14H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
								fill="currentColor"
								opacity="0.5"
							/>
						</svg>
					</button>
					<button
						type="button"
						className={styles.vscodeActivity}
						title="Buscar"
						aria-label="Buscar"
					>
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<circle
								cx="10.5"
								cy="10.5"
								r="5.5"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
							<path
								d="m15 15 4.5 4.5"
								stroke="currentColor"
								strokeWidth="1.3"
								strokeLinecap="round"
							/>
						</svg>
					</button>
					<button
						type="button"
						className={styles.vscodeActivity}
						title="Control de código fuente"
						aria-label="Control de código fuente"
					>
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<circle
								cx="6.5"
								cy="5.5"
								r="2"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
							<circle
								cx="6.5"
								cy="18.5"
								r="2"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
							<circle
								cx="17"
								cy="9"
								r="2"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
							<path
								d="M6.5 7.5v9M17 11c-4 0-6.5-1.4-7.5-3M17 7c-4 0-6.5 1.4-7.5 3"
								stroke="currentColor"
								strokeWidth="1.3"
								strokeLinecap="round"
							/>
						</svg>
					</button>
					<button
						type="button"
						className={styles.vscodeActivity}
						title="Ejecutar y depurar"
						aria-label="Ejecutar y depurar"
					>
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M8 5v14l11-7L8 5Z"
								stroke="currentColor"
								strokeWidth="1.3"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button
						type="button"
						className={styles.vscodeActivity}
						title="Extensiones"
						aria-label="Extensiones"
					>
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<rect
								x="4"
								y="4"
								width="6.5"
								height="6.5"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
							<rect
								x="13.5"
								y="4"
								width="6.5"
								height="6.5"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
							<rect
								x="4"
								y="13.5"
								width="6.5"
								height="6.5"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
							<rect
								x="13.5"
								y="13.5"
								width="6.5"
								height="6.5"
								stroke="currentColor"
								strokeWidth="1.3"
							/>
						</svg>
					</button>
				</aside>

				<aside className={styles.vscodeSidebar}>
					<div className={styles.vscodeSidebarHead}>
						<span className={styles.vscodeSidebarTitle}>Explorador</span>
						<span className={styles.vscodeSidebarActions} aria-hidden="true">
							<svg
								width="14"
								height="14"
								viewBox="0 0 16 16"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M8 3v10M3 8h10"
									stroke="currentColor"
									strokeWidth="1.3"
									strokeLinecap="round"
								/>
							</svg>
							<svg
								width="14"
								height="14"
								viewBox="0 0 16 16"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M2 4.5h4l1 1.5h7v7.5H2V4.5Z"
									stroke="currentColor"
									strokeWidth="1.1"
									strokeLinejoin="round"
								/>
							</svg>
							<svg
								width="14"
								height="14"
								viewBox="0 0 16 16"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M13 8a5 5 0 1 1-1.5-3.5"
									stroke="currentColor"
									strokeWidth="1.2"
									strokeLinecap="round"
								/>
								<path
									d="M13 2v3h-3"
									stroke="currentColor"
									strokeWidth="1.2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					</div>

					<button
						type="button"
						className={styles.vscodeRoot}
						onClick={() => toggleFolder('__root__')}
					>
						<span className={styles.vscodeChevron}>
							{collapsed.has('__root__') ? '▸' : '▾'}
						</span>
						<VsFolder />
						<span className={styles.vscodeRootName}>EXPEDIENTE-ANDINAPAY</span>
					</button>

					{!collapsed.has('__root__') ? (
						<div className={styles.vscodeTree}>
							{folders.map(([folder, entries]) => {
								const isCollapsed = collapsed.has(folder)
								const fileButtons = entries.map((file) => {
									const name = file.path.split('/').pop() ?? file.path
									const badge = fileBadge(name)
									return (
										<button
											key={file.path}
											type="button"
											className={
												selected === file.path
													? `${styles.vscodeFile} ${styles.vscodeFileActive}`
													: styles.vscodeFile
											}
											aria-current={selected === file.path ? 'true' : undefined}
											onClick={() => setSelected(file.path)}
										>
											<span
												className={styles.vscodeFileBadge}
												style={{
													color: badge.color,
													borderColor: badge.color,
												}}
												aria-hidden="true"
											>
												{badge.label}
											</span>
											<span className={styles.vscodeFileName}>{name}</span>
										</button>
									)
								})

								if (!folder) {
									return (
										<div key="__rootfiles" className={styles.vscodeFileList}>
											{fileButtons}
										</div>
									)
								}

								return (
									<div key={folder}>
										<button
											type="button"
											className={styles.vscodeFolderRow}
											onClick={() => toggleFolder(folder)}
										>
											<span className={styles.vscodeChevron}>
												{isCollapsed ? '▸' : '▾'}
											</span>
											<VsFolder />
											<span className={styles.vscodeFolderName}>{folder}</span>
										</button>
										{!isCollapsed ? (
											<div className={styles.vscodeFolderFiles}>
												{fileButtons}
											</div>
										) : null}
									</div>
								)
							})}
						</div>
					) : null}

					<p className={styles.vscodeEvidence}>
						Evidencias citadas: {state.evidence.length}
					</p>
				</aside>

				<div className={styles.vscodeEditor}>
					<div className={styles.vscodeTabs}>
						<span className={styles.vscodeTabActive}>
							{selected.split('/').pop() ?? selected}
						</span>
					</div>
					<p className={styles.vscodeBreadcrumb}>
						EXPEDIENTE-ANDINAPAY <span aria-hidden="true">›</span>{' '}
						{selected.split('/').join(' › ')}
					</p>
					<section
						className={styles.vscodeCode}
						aria-label={`Contenido de ${selected}`}
					>
						{lines.map((line, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: las líneas son posicionales y estáticas por material.
								key={`${selected}-${index}`}
								className={styles.codeLine}
							>
								<span className={styles.lineNumber}>{index + 1}</span>
								<span>{line || '\u00a0'}</span>
							</div>
						))}
					</section>
					<div className={styles.vscodeStatusbar}>
						<span>UTF-8</span>
						<span>{language}</span>
						<span>Ln {lines.length}</span>
						<span className={styles.vscodeStatusSpacer} />
						<button
							type="button"
							className={styles.vscodeAttach}
							disabled={cited || !canAttach}
							onClick={attach}
						>
							{cited
								? 'Adjuntado al expediente'
								: !canAttach
									? 'Solo lectura'
									: selected === 'AP-H1'
										? 'Adjuntar H1 al expediente'
										: 'Adjuntar al expediente'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
function RepositorioView() {
	const [revision, setRevision] = useState<AndinaPayRevisionId>('AP-H3')
	const [selectedPath, setSelectedPath] = useState('src/config.ts')
	const [branchOpen, setBranchOpen] = useState(false)
	const branchRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!branchOpen) return
		const onPointerDown = (event: PointerEvent) => {
			if (
				branchRef.current &&
				!branchRef.current.contains(event.target as Node)
			) {
				setBranchOpen(false)
			}
		}
		document.addEventListener('pointerdown', onPointerDown)
		return () => document.removeEventListener('pointerdown', onPointerDown)
	}, [branchOpen])

	const current = revisionById(revision)
	const selected =
		current?.files.find((file) => file.path === selectedPath) ??
		current?.files[0]
	const shortId = revision.replace('AP-', '').toLowerCase()

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

	const switchRevision = (next: AndinaPayRevisionId) => {
		setRevision(next)
		const files = revisionById(next)?.files ?? []
		if (!files.some((file) => file.path === selectedPath)) {
			setSelectedPath(
				files.find((file) => file.path === 'src/config.ts')?.path ??
					files[0]?.path ??
					'',
			)
		}
	}

	return (
		<div className={styles.toolShell}>
			<div className={styles.ide}>
				<header className={styles.ideHeader}>
					<img
						className={styles.ideRepoIcon}
						src="/assets/pictures/github-icon.webp"
						alt=""
						width={16}
						height={16}
					/>
					<span className={styles.ideRepoOwner}>andinapay</span>
					<span className={styles.ideRepoSlash}>/</span>
					<span className={styles.ideRepoName}>api</span>
					<span className={styles.ideRepoVisibility}>Private</span>
				</header>
				<nav
					className={styles.ideNavTabs}
					aria-label="Secciones del repositorio"
				>
					<span className={styles.ideNavTabActive}>Code</span>
					<span className={styles.ideNavTab}>Issues</span>
					<span className={styles.ideNavTab}>Pull requests</span>
					<span className={styles.ideNavTab}>Actions</span>
				</nav>

				<div className={styles.ideBody}>
					<aside className={styles.ideSidebar}>
						<p className={styles.ideSidebarTitle}>Files</p>
						<div className={styles.ideBranchRow} ref={branchRef}>
							<svg
								width="14"
								height="14"
								viewBox="0 0 16 16"
								fill="none"
								aria-hidden="true"
							>
								<circle
									cx="4.5"
									cy="3.5"
									r="1.5"
									stroke="currentColor"
									strokeWidth="1.1"
								/>
								<circle
									cx="4.5"
									cy="12.5"
									r="1.5"
									stroke="currentColor"
									strokeWidth="1.1"
								/>
								<circle
									cx="11"
									cy="6"
									r="1.5"
									stroke="currentColor"
									strokeWidth="1.1"
								/>
								<path
									d="M4.5 5v6M11 7.5c-2.8 0-4-1-4.5-2M11 4.5c-2.8 0-4 1-4.5 2"
									stroke="currentColor"
									strokeWidth="1.1"
									strokeLinecap="round"
								/>
							</svg>
							<button
								type="button"
								className={styles.ideBranchButton}
								onClick={() => setBranchOpen((open) => !open)}
								aria-haspopup="listbox"
								aria-expanded={branchOpen}
							>
								<span className={styles.ideBranchCurrent}>
									{revision === 'AP-H3' ? 'main' : revision.replace('AP-', 'H')}
								</span>
								<svg
									width="10"
									height="10"
									viewBox="0 0 16 16"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="m4 6 4 4 4-4"
										stroke="currentColor"
										strokeWidth="1.6"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>

							{branchOpen ? (
								<div className={styles.ideBranchMenu} role="listbox">
									<p className={styles.ideBranchGroup}>Rama</p>
									<button
										type="button"
										className={
											revision === 'AP-H3'
												? `${styles.ideBranchItem} ${styles.ideBranchItemActive}`
												: styles.ideBranchItem
										}
										role="option"
										aria-selected={revision === 'AP-H3'}
										onClick={() => {
											switchRevision('AP-H3')
											setBranchOpen(false)
										}}
									>
										<svg
											width="12"
											height="12"
											viewBox="0 0 16 16"
											fill="none"
											aria-hidden="true"
										>
											<circle
												cx="4.5"
												cy="3.5"
												r="1.5"
												stroke="currentColor"
												strokeWidth="1.1"
											/>
											<circle
												cx="4.5"
												cy="12.5"
												r="1.5"
												stroke="currentColor"
												strokeWidth="1.1"
											/>
											<circle
												cx="11"
												cy="6"
												r="1.5"
												stroke="currentColor"
												strokeWidth="1.1"
											/>
											<path
												d="M4.5 5v6M11 7.5c-2.8 0-4-1-4.5-2M11 4.5c-2.8 0-4 1-4.5 2"
												stroke="currentColor"
												strokeWidth="1.1"
												strokeLinecap="round"
											/>
										</svg>
										<span className={styles.ideBranchName}>main</span>
									</button>

									<p className={styles.ideBranchGroup}>Historial</p>
									{[...ANDINAPAY_REVISIONS]
										.reverse()
										.filter((entry) => entry.id !== 'AP-H3')
										.map((entry) => (
											<button
												key={entry.id}
												type="button"
												className={
													revision === entry.id
														? `${styles.ideBranchItem} ${styles.ideBranchItemActive}`
														: styles.ideBranchItem
												}
												role="option"
												aria-selected={revision === entry.id}
												onClick={() => {
													switchRevision(entry.id)
													setBranchOpen(false)
												}}
											>
												<span className={styles.ideCommitMessage}>
													{entry.message}
												</span>
												<code className={styles.ideCommitHash}>
													{entry.hash}
												</code>
											</button>
										))}
								</div>
							) : null}
						</div>

						<ul className={styles.ideTree}>
							{folders.map(([folder, entries]) => (
								<li key={folder || 'root'}>
									{folder ? (
										<p className={styles.ideFolder}>{folder}/</p>
									) : null}
									<ul className={styles.ideTreeFiles}>
										{entries.map((file) => {
											const name = file.path.split('/').pop() ?? file.path
											const dot = name.lastIndexOf('.')
											const extension = dot > 0 ? name.slice(dot + 1) : ''
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
															{extension
																? extension.slice(0, 2).toUpperCase()
																: name.slice(1, 2).toUpperCase()}
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
					</aside>

					<div className={styles.ideMain}>
						<div className={styles.ideRepoCard}>
							<span className={styles.ideRepoAvatar} aria-hidden="true">
								A
							</span>
							<span className={styles.ideRepoCommitMsg}>
								{current?.message}
							</span>
							<code className={styles.ideRepoHash}>{shortId}</code>
							<span className={styles.ideRepoDate}>{current?.date}</span>
						</div>

						<div className={styles.ideFileHeader}>
							<span className={styles.ideFileHeaderName}>
								{selected
									? (selected.path.split('/').pop() ?? selected.path)
									: 'Sin archivo'}
							</span>
							<span className={styles.ideFileHeaderMeta}>
								{selected?.lines.length ?? 0} líneas
							</span>
						</div>
						<p className={styles.ideBreadcrumb}>
							andinapay / {selected?.path.split('/').join(' / ')}
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
									<span>{line || '\u00a0'}</span>
								</div>
							))}
						</section>
						<div className={styles.ideStatusbar}>
							<span>
								{revision === 'AP-H3' ? 'main' : revision.replace('AP-', 'H')}
							</span>
							<span>
								{shortId} · {current?.date}
							</span>
							<span>{selected?.lines.length ?? 0} líneas</span>
							<span>
								{selected?.path.endsWith('.ts')
									? 'TypeScript'
									: selected?.path.endsWith('.json')
										? 'JSON'
										: 'Plain Text'}{' '}
								· UTF-8
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
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
