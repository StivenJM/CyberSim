import { motion } from 'framer-motion'
import {
	Check,
	Cloud,
	Compass,
	Crosshair,
	Database,
	Fingerprint,
	KeyRound,
	Layers,
	type LucideIcon,
	Network,
	Play,
	ShieldAlert,
	ShieldCheck,
	Upload,
	X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { NivelController } from '../../../../ecs/controllers/NivelController'
import type {
	Escenario,
	EscenarioPreview,
} from '../../../../shared/types/EscenarioTypes'
import { useSelectedLevel } from '../../../common/contexts/SelectedLevelContext'
import { useProgresoEstudiante } from '../contexts/ProgresoEstudianteContext'
import styles from '../styles/VistaSeleccionNiveles.module.css'
import { type EstadoNivel, estadoDeEscenario } from '../utils/progresoCurso'

interface GrupoRecorrido {
	titulo: string
	icono: LucideIcon
	escenarios: EscenarioPreview[]
}

interface Step extends EscenarioPreview {
	estado: EstadoNivel
}

interface Segment {
	d: string
	walked: boolean
}

// Desplazamiento horizontal por paso: un vaivén suave que da al recorrido su
// curva sin separar demasiado las etiquetas de su nodo.
const STEP_SHIFT = [0, 24, 0, -24]
const shiftFor = (index: number): number =>
	STEP_SHIFT[index % STEP_SHIFT.length]

// Amplitud lateral del arco de cada tramo. Cada segmento se abomba hacia un
// lado y el siguiente hacia el otro, formando una serpentina alrededor de la
// columna de nodos. Más grande = más sinuoso.
const SWAY = 50

// Orden de aparición de los escenarios según el capítulo del catálogo; lo
// desconocido queda al final. No se muestra: solo fija la secuencia del recorrido.
const CATEGORY_ORDER = [
	'Cap. 1 — Introducción',
	'Cap. 2 — Criptografía',
	'Cap. 3 — Autenticación',
	'Cap. 4 — Seguridad de Redes',
	'Cap. 5 — Administración de Riesgos',
	'Cap. 6 — Tendencias Actuales',
]

// El recorrido se agrupa en dos bloques fijos: los cinco primeros escenarios y
// el resto. `hasta` es la posición final (exclusiva) dentro del recorrido.
const GRUPOS: Array<{
	titulo: string
	icono: LucideIcon
	hasta?: number
}> = [
	{
		titulo: 'Seguridad de sistemas y redes',
		icono: Network,
		hasta: 5,
	},
	{
		titulo: 'Mitigación de vulnerabilidades',
		icono: ShieldCheck,
	},
]

const SCENARIO_ICONS: Record<string, LucideIcon> = {
	tutorial: Compass,
	amenazas: ShieldAlert,
	criptografia: KeyRound,
	'control-acceso': Fingerprint,
	'andinapay-clave-expuesta': KeyRound,
	'bibliotecaviva-consultas-seguras': Database,
	'talentoandino-cargas-seguras': Upload,
	'andeanlogix-funciones-criticas': ShieldCheck,
	'nubeandina-sesiones-no-confiables': Cloud,
	'hacking-etico': Crosshair,
}

// Línea corta de cada ejercicio para el nodo del recorrido (máx. 4 palabras).
// La descripción completa sigue viviendo en el panel del paso.
const RESUMEN_POR_SLUG: Record<string, string> = {
	tutorial: 'Aprende los tres pilares',
	amenazas: 'Bloquea accesos no autorizados',
	criptografia: 'Verifica firmas y cifra',
	'control-acceso': 'Protege laboratorios de investigación',
	'hacking-etico': 'Aplica ingeniería social',
	'andinapay-clave-expuesta': 'Recupera la clave expuesta',
	'bibliotecaviva-consultas-seguras': 'Blinda consultas del historial',
	'talentoandino-cargas-seguras': 'Admisión segura de archivos',
	'andeanlogix-funciones-criticas': 'Corrige permisos administrativos',
	'nubeandina-sesiones-no-confiables': 'Restauración segura de sesiones',
}

// Título de una sola palabra por nodo. El título completo sigue en el panel.
const TITULO_POR_SLUG: Record<string, string> = {
	tutorial: 'Protección',
	amenazas: 'Amenazas',
	criptografia: 'Criptografía',
	'control-acceso': 'Accesos',
	'hacking-etico': 'Intrusión',
	'andinapay-clave-expuesta': 'Claves',
	'bibliotecaviva-consultas-seguras': 'Consultas',
	'talentoandino-cargas-seguras': 'Archivos',
	'andeanlogix-funciones-criticas': 'Permisos',
	'nubeandina-sesiones-no-confiables': 'Sesiones',
}

const ESTADO_LABEL: Record<EstadoNivel, string> = {
	done: 'Completado',
	active: 'En progreso',
	available: 'Disponible',
}

function scenarioIcon(slug: string): LucideIcon {
	return SCENARIO_ICONS[slug] ?? Layers
}

function countByState(steps: Step[], estado: EstadoNivel): number {
	return steps.filter((step) => step.estado === estado).length
}

// El estado "cerrado" vive en el módulo, no en React: sobrevive a navegar entre
// pantallas dentro de la SPA, y solo un recargo real (F5) lo reinicia.
let panelDismissed = false

export default function LevelSelectionMenuList() {
	const { progresos, loading, error, refetch } = useProgresoEstudiante()
	const [openId, setOpenId] = useState<number | null | undefined>(undefined)
	// Una vez cerrado el panel, no vuelve hasta recargar la página.
	const [dismissed, setDismissed] = useState(panelDismissed)
	const [segments, setSegments] = useState<Segment[]>([])
	const containerRef = useRef<HTMLDivElement>(null)
	const nodeRefs = useRef(new Map<number, HTMLSpanElement>())
	const navigate = useNavigate()
	const { setSelectedEscenario } = useSelectedLevel()
	const nivelController = useMemo(() => new NivelController(), [])

	const escenarios = useMemo(
		() => nivelController.getEscenarios(),
		[nivelController],
	)

	// Orden estable del recorrido: capítulo del catálogo y, dentro de él, por id.
	const escenariosOrdenados = useMemo(() => {
		const rank = (categoria: string | undefined) => {
			const index = CATEGORY_ORDER.indexOf(categoria ?? '')
			return index === -1 ? CATEGORY_ORDER.length : index
		}
		return [...escenarios].sort(
			(a, b) => rank(a.categoria) - rank(b.categoria) || a.id - b.id,
		)
	}, [escenarios])

	const groups: GrupoRecorrido[] = useMemo(() => {
		let desde = 0
		return GRUPOS.map((grupo) => {
			const hasta = grupo.hasta ?? escenariosOrdenados.length
			const escenariosDelGrupo = escenariosOrdenados.slice(desde, hasta)
			desde = hasta
			return {
				titulo: grupo.titulo,
				icono: grupo.icono,
				escenarios: escenariosDelGrupo,
			}
		}).filter((grupo) => grupo.escenarios.length > 0)
	}, [escenariosOrdenados])

	const steps: Step[] = useMemo(
		() =>
			groups.flatMap((group) =>
				group.escenarios.map((escenario) => ({
					...escenario,
					estado: estadoDeEscenario(escenario.slug, progresos),
				})),
			),
		[groups, progresos],
	)

	// Siguiente paso: retomar lo que quedó a medias antes de empezar algo nuevo.
	const suggestedId = useMemo(() => {
		const started = steps.find((step) => step.estado === 'active')
		const candidate = started ?? steps.find((step) => step.estado !== 'done')
		return candidate?.id ?? null
	}, [steps])

	// undefined = seguir la sugerencia, null = el estudiante la cerró, número = elección propia.
	// Mientras llega el progreso no se anticipa ninguna selección: la sugerencia
	// depende de datos que todavía no existen.
	const activeId =
		loading || dismissed ? null : openId === undefined ? suggestedId : openId
	const activeStep = steps.find((step) => step.id === activeId) ?? null

	const layoutKey = steps.map((step) => step.id).join(',')
	const stateKey = steps.map((step) => `${step.id}:${step.estado}`).join(',')

	// El trazado se dibuja midiendo los nodos ya renderizados: así la curva
	// sigue al nodo real en cualquier ancho y no depende de cálculos paralelos.
	// layoutKey/stateKey/activeId describen qué se midió, no se leen dentro.
	useEffect(() => {
		const measure = () => {
			const container = containerRef.current
			if (!container) return
			const box = container.getBoundingClientRect()
			const points = steps.flatMap((step) => {
				const element = nodeRefs.current.get(step.id)
				if (!element) return []
				const rect = element.getBoundingClientRect()
				return [
					{
						estado: step.estado,
						x: rect.left + rect.width / 2 - box.left,
						y: rect.top + rect.height / 2 - box.top,
					},
				]
			})

			const nextSegments: Segment[] = []
			for (let i = 0; i < points.length - 1; i++) {
				const from = points[i]
				const to = points[i + 1]
				if (!from || !to) continue
				const middle = (from.y + to.y) / 2
				// Cada tramo se abomba hacia un lado (alternando) para que el
				// camino serpente en vez de bajar en diagonal.
				const sway = SWAY * (i % 2 === 0 ? 1 : -1)
				nextSegments.push({
					d: `M ${from.x} ${from.y} C ${from.x + sway} ${middle}, ${from.x + sway} ${middle}, ${to.x} ${to.y}`,
					walked: from.estado === 'done',
				})
			}
			setSegments(nextSegments)
		}

		measure()
		const observer = new ResizeObserver(measure)
		if (containerRef.current) observer.observe(containerRef.current)
		window.addEventListener('resize', measure)
		return () => {
			observer.disconnect()
			window.removeEventListener('resize', measure)
		}
	}, [layoutKey, stateKey, activeId])

	// El panel ya no se cierra al pulsar fuera ni con Escape: se queda visible
	// hasta que el estudiante lo cierra explícitamente con el botón ✕.
	// Cualquier escenario publicado se puede iniciar en cualquier orden. El
	// progreso previo solo cambia la etiqueta del nodo, no el acceso.
	const handleSelectLevel = (escenario: EscenarioPreview) => {
		const escenarioCompleto = nivelController.cargarEscenario(
			escenario.id,
		) as Escenario
		if (escenarioCompleto) {
			localStorage.setItem('slug_escenario_actual', escenario.slug)
			localStorage.setItem(
				'revision_escenario_actual',
				String(escenarioCompleto.revision),
			)
			localStorage.setItem(
				'content_hash_escenario_actual',
				escenarioCompleto.contentHash,
			)
			setSelectedEscenario(escenarioCompleto)
			navigate('/')
		}
	}

	const actionLabel = (estado: EstadoNivel): string => {
		if (estado === 'done') return 'Repetir'
		if (estado === 'active') return 'Continuar'
		return 'Empezar'
	}

	return (
		<div className={styles.pathColumn}>
			{error && (
				<div className={styles.progressError} role="status">
					<span>
						{error}. Los estados del recorrido pueden estar incompletos.
					</span>
					<button type="button" onClick={() => void refetch()}>
						Reintentar
					</button>
				</div>
			)}

			<div className={styles.path} ref={containerRef} aria-busy={loading}>
				<svg className={styles.connector} aria-hidden="true">
					{segments.map((segment, index) => (
						<path
							// biome-ignore lint/suspicious/noArrayIndexKey: los tramos solo se identifican por su posición en el recorrido.
							key={index}
							d={segment.d}
							className={
								segment.walked ? styles.segmentWalked : styles.segmentNext
							}
						/>
					))}
				</svg>

				{groups.map((group, groupIndex) => {
					const groupSteps = steps.filter((step) =>
						group.escenarios.some((escenario) => escenario.id === step.id),
					)
					const completados = countByState(groupSteps, 'done')
					const GroupIcon = group.icono

					return (
						<motion.section
							key={group.titulo}
							className={styles.group}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.35, delay: groupIndex * 0.04 }}
						>
							<aside className={styles.groupRail}>
								<div className={styles.chapterCard}>
									<div className={styles.chapterHead}>
										<GroupIcon
											size={17}
											strokeWidth={1.75}
											className={styles.chapterIcon}
										/>
										<span className={styles.chapterTitle}>{group.titulo}</span>
									</div>
									<span className={styles.chapterMeta}>
										{loading ? (
											<span className={styles.metaSkeleton} />
										) : (
											`${completados} de ${group.escenarios.length} completados`
										)}
									</span>
								</div>
							</aside>

							<div className={styles.nodes}>
								{group.escenarios.map((escenario, escenarioIndex) => {
									const step = groupSteps.find(
										(item) => item.id === escenario.id,
									) ?? {
										...escenario,
										estado: 'available' as EstadoNivel,
									}
									const stepIndex = steps.findIndex(
										(item) => item.id === escenario.id,
									)
									const isActive = activeId === escenario.id
									const isCurrent =
										escenario.id === suggestedId && step.estado === 'available'
									// El primer nodo de cada bloque marca dónde empieza la sección.
									const isSectionStart = escenarioIndex === 0
									const StepIcon = scenarioIcon(escenario.slug)

									return (
										<div
											key={escenario.id}
											className={styles.step}
											data-state={step.estado}
											data-current={isCurrent || undefined}
											data-section-start={isSectionStart || undefined}
											data-open={isActive || undefined}
											style={{
												transform: `translateX(${shiftFor(stepIndex)}px)`,
											}}
										>
											<button
												type="button"
												className={styles.stepButton}
												aria-label={`${escenario.titulo} — ${ESTADO_LABEL[step.estado]}`}
												aria-expanded={isActive}
												onClick={(event) => {
													event.stopPropagation()
													// Cerrado de forma definitiva: no se reabre hasta recargar.
													if (!dismissed) setOpenId(escenario.id)
												}}
											>
												<span
													className={styles.node}
													ref={(element) => {
														if (element)
															nodeRefs.current.set(escenario.id, element)
														else nodeRefs.current.delete(escenario.id)
													}}
												>
													<StepIcon size={24} strokeWidth={1.75} />
													{step.estado === 'done' && (
														<span className={styles.doneBadge}>
															<Check size={12} strokeWidth={3.5} />
														</span>
													)}
												</span>
												<span className={styles.stepText}>
													<span className={styles.stepHeading}>
														<span className={styles.stepNumber}>
															{stepIndex + 1}.
														</span>
														<span className={styles.stepTitle}>
															{TITULO_POR_SLUG[escenario.slug] ??
																escenario.titulo}
														</span>
													</span>
													{/* La descripción queda visible también con el paso abierto: el panel es absoluto. */}
													<span className={styles.stepDesc}>
														{RESUMEN_POR_SLUG[escenario.slug] ??
															escenario.descripcion}
													</span>
												</span>
											</button>

											{isActive && activeStep && (
												<div className={styles.detail}>
													<button
														type="button"
														className={styles.detailClose}
														aria-label="Cerrar panel"
														onClick={(event) => {
															event.stopPropagation()
															panelDismissed = true
															setDismissed(true)
															setOpenId(null)
														}}
													>
														<X size={16} strokeWidth={2.25} />
													</button>
													<div className={styles.detailHead}>
														<span className={styles.detailIcon}>
															<StepIcon size={17} strokeWidth={2} />
														</span>
														<span className={styles.detailTitle}>
															{activeStep.titulo}
														</span>
													</div>
													<p className={styles.detailDesc}>
														{activeStep.descripcion}
													</p>
													<button
														type="button"
														className={styles.detailAction}
														onClick={(event) => {
															event.stopPropagation()
															handleSelectLevel(activeStep)
														}}
													>
														<Play size={15} fill="currentColor" />
														{actionLabel(activeStep.estado)}
													</button>
												</div>
											)}
										</div>
									)
								})}
							</div>
						</motion.section>
					)
				})}
			</div>
		</div>
	)
}
