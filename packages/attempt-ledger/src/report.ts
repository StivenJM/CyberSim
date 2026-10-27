import type {
	AttemptAdjudication,
	AttemptRecord,
	AttemptTest,
	RubricDimension,
	RubricLevel,
} from '@cybersim/scenario-contract'

export type DimensionStatus =
	| 'assessed'
	| 'no_attempt'
	| 'technical_error'
	| 'requires_review'
	| 'not_presented'

export interface DimensionProfile {
	readonly dimension: RubricDimension
	readonly status: DimensionStatus
	readonly level: RubricLevel | null
	readonly evidence: readonly string[]
	readonly aidSegments: readonly string[]
}

export interface AutomaticFacts {
	readonly B: boolean
	readonly Q: boolean
	readonly C: Readonly<Record<string, boolean>>
}

export interface ReportDisagreement {
	readonly dimension: RubricDimension
	readonly humanLevel: RubricLevel
	readonly automatic: string
	readonly detail: string
}

export interface AidTimelineEntry {
	readonly segmentId: string
	readonly level: string
	readonly revealedAt: string
	/** `before-delivery` means the aid was exposed while the attempt was still open. */
	readonly timing: 'before-delivery' | 'after-delivery'
}

export interface AttemptReport {
	readonly attemptId: string
	readonly caseId: string
	readonly form: string
	readonly dimensions: readonly DimensionProfile[]
	readonly automatic: AutomaticFacts | null
	readonly humanAdjudications: readonly AttemptAdjudication[]
	readonly disagreements: readonly ReportDisagreement[]
	readonly aidTimeline: readonly AidTimelineEntry[]
	readonly studentTests: readonly AttemptTest[]
	/** Teacher battery: never attributed to the student's chosen evidence. */
	readonly teacherTests: readonly AttemptTest[]
	readonly originalTexts: readonly {
		readonly promptId: string
		readonly text: string
		readonly recordedAt: string
	}[]
	readonly limits: readonly string[]
}

const DIMENSIONS: readonly RubricDimension[] = ['D1', 'D2', 'D3', 'D4']

const TECHNICAL = new Set([
	'timeout',
	'worker-exhausted',
	'crash',
	'persistence-failure',
])

export const REPORT_LIMITS: readonly string[] = [
	'Los niveles son ordinales por dimensión y segmento de ayuda: no se promedian ni producen un total.',
	'La evaluación ocurre en el cliente; no es arbitraje anti-manipulación ni seguridad frente al dueño del navegador.',
	'La batería docente se conserva aparte y nunca se atribuye a las pruebas elegidas por el alumno.',
	'NE, error técnico y omisión con oportunidad no equivalen a desconocimiento ni a cero automático.',
	'El informe conserva el texto original y la adjudicación registrada; no corrige la historia.',
]

function evidenceFor(
	record: AttemptRecord,
	dimension: RubricDimension,
): string[] {
	switch (dimension) {
		case 'D1':
			return record.diagnosis
				? [
						`diagnosis:${record.diagnosis.frontierId}`,
						...record.diagnosis.citedArtifactIds.map(
							(artifact) => `artifact:${artifact}`,
						),
					]
				: []
		case 'D2':
			return record.explanations.map(
				(explanation) => `explanation:${explanation.promptId}`,
			)
		case 'D3':
			return [
				...record.revisions.map(
					(revision) => `revision:${revision.revision}:${revision.diffHash}`,
				),
				...(record.delivery
					? [
							`delivery:${record.delivery.revision}:${record.delivery.teacherBatteryId}`,
						]
					: []),
			]
		case 'D4':
			return record.tests
				.filter((test) => test.source === 'student')
				.map(
					(test) =>
						`test:${test.testId}:${test.outcome}:${test.fixtureId ?? 'none'}`,
				)
	}
}

function statusFor(
	record: AttemptRecord,
	dimension: RubricDimension,
	evidence: readonly string[],
): DimensionStatus {
	const adjudicated = record.adjudication.some(
		(entry) => entry.dimension === dimension,
	)
	if (adjudicated) return 'assessed'
	if (
		record.incidents.some((incident) => TECHNICAL.has(incident.kind)) &&
		evidence.length === 0
	) {
		return 'technical_error'
	}
	if (evidence.length === 0) {
		return record.delivery ? 'not_presented' : 'no_attempt'
	}
	return 'requires_review'
}

function dominantLevel(
	record: AttemptRecord,
	dimension: RubricDimension,
): RubricLevel | null {
	const entries = record.adjudication.filter(
		(entry) => entry.dimension === dimension,
	)
	const last = entries.at(-1)
	return last ? last.level : null
}

function disagreementsFor(
	record: AttemptRecord,
	automatic: AutomaticFacts | null,
): ReportDisagreement[] {
	if (!automatic) return []
	const out: ReportDisagreement[] = []
	for (const entry of record.adjudication) {
		if (entry.dimension === 'D3' && !automatic.Q && Number(entry.level) >= 2) {
			out.push({
				dimension: 'D3',
				humanLevel: entry.level,
				automatic: 'Q=false',
				detail:
					'La adjudicación humana atribuye una intervención suficiente mientras la batería automática declara Q falso; ambas se conservan.',
			})
		}
		if (
			entry.dimension === 'D4' &&
			Number(entry.level) >= 2 &&
			!record.tests.some((test) => test.source === 'student')
		) {
			out.push({
				dimension: 'D4',
				humanLevel: entry.level,
				automatic: 'sin pruebas elegidas',
				detail:
					'No hay pruebas elegidas por el alumno que sostengan la verificación atribuida.',
			})
		}
	}
	return out
}

export function buildAttemptReport(
	record: AttemptRecord,
	automatic: AutomaticFacts | null = null,
): AttemptReport {
	const dimensions: DimensionProfile[] = DIMENSIONS.map((dimension) => {
		const evidence = evidenceFor(record, dimension)
		return {
			dimension,
			status: statusFor(record, dimension, evidence),
			level: dominantLevel(record, dimension),
			evidence,
			aidSegments: record.aids
				.filter(
					(aid) =>
						aid.level === 'A1' || aid.level === 'A2' || aid.level === 'A3',
				)
				.map((aid) => aid.segmentId),
		}
	})

	const deliveredAt = record.delivery?.deliveredAt
	const aidTimeline: AidTimelineEntry[] = record.aids.map((aid) => ({
		segmentId: aid.segmentId,
		level: aid.level,
		revealedAt: aid.revealedAt,
		timing:
			deliveredAt && aid.revealedAt > deliveredAt
				? 'after-delivery'
				: 'before-delivery',
	}))

	return {
		attemptId: record.attemptId,
		caseId: record.caseId,
		form: record.versions.form,
		dimensions,
		automatic,
		humanAdjudications: record.adjudication,
		disagreements: disagreementsFor(record, automatic),
		aidTimeline,
		studentTests: record.tests.filter((test) => test.source === 'student'),
		teacherTests: record.tests.filter((test) => test.source === 'teacher'),
		originalTexts: record.explanations.map((explanation) => ({
			promptId: explanation.promptId,
			text: explanation.text,
			recordedAt: explanation.recordedAt,
		})),
		limits: REPORT_LIMITS,
	}
}

const AGGREGATE_KEYS = ['total', 'score', 'percentage', 'grade', 'average']

function hasAggregate(value: unknown, depth = 0): boolean {
	if (depth > 8 || value === null || typeof value !== 'object') return false
	if (Array.isArray(value)) {
		return value.some((entry) => hasAggregate(entry, depth + 1))
	}
	for (const [key, entry] of Object.entries(value)) {
		if (AGGREGATE_KEYS.includes(key.toLowerCase())) return true
		if (hasAggregate(entry, depth + 1)) return true
	}
	return false
}

/** Percentages, totals and letter grades are deliberately absent. */
export function reportHasAggregateScore(report: AttemptReport): boolean {
	return hasAggregate(report)
}
