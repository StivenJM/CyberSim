import { computeScenarioContentHash } from './index.js'
import {
	AID_LEVELS,
	type AidLevel,
	EXERCISE_FORMS,
	type ExerciseForm,
	INVESTIGATED_CASE_IDS,
	type InvestigatedCaseId,
	RUBRIC_DIMENSIONS,
	RUBRIC_LEVELS,
	type RubricDimension,
	type RubricLevel,
} from './investigated.js'

export const ATTEMPT_SCHEMA_VERSION = 1 as const
export const ATTEMPT_PROGRESS_KIND = 'attempt-evidence' as const

export const ATTEMPT_STATUSES = [
	'in-progress',
	'paused',
	'delivered',
	'technical-incident',
	'practice',
] as const

export const ATTEMPT_OPERATION_KINDS = [
	'create',
	'save-diagnosis',
	'save-revision',
	'run-test',
	'reveal-aid',
	'deliver',
	'record-explanation',
	'adjudicate',
	'record-incident',
	'pause',
	'resume',
	'reset',
] as const

export const EVIDENCE_SOURCES = ['student', 'teacher'] as const
export const EVIDENCE_OUTCOMES = [
	'pass',
	'fail',
	'not-attempted',
	'technical-error',
	'requires-review',
] as const
export const ADJUDICATION_KINDS = [
	'automatic',
	'human',
	'second-review',
] as const
export const INCIDENT_KINDS = [
	'timeout',
	'worker-exhausted',
	'crash',
	'persistence-failure',
	'rejected-input',
	'other',
] as const

export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number]
export type AttemptOperationKind = (typeof ATTEMPT_OPERATION_KINDS)[number]
export type EvidenceSource = (typeof EVIDENCE_SOURCES)[number]
export type EvidenceOutcome = (typeof EVIDENCE_OUTCOMES)[number]
export type AdjudicationKind = (typeof ADJUDICATION_KINDS)[number]
export type IncidentKind = (typeof INCIDENT_KINDS)[number]

export interface AttemptVersionSet {
	readonly task: string
	readonly form: ExerciseForm
	readonly fixtures: string
	readonly engine: string
	readonly verifier: string
	readonly rubric: string
	readonly aids: string
}

export interface AppliedOperation {
	readonly operationId: string
	readonly sequence: number
	readonly kind: AttemptOperationKind
	readonly expectedRevision: number
	readonly revisionAfter: number
	readonly payloadHash: string
	readonly appliedAt?: string
}

export interface SealedDiagnosis {
	readonly frontierId: string
	readonly citedArtifactIds: readonly string[]
	readonly claim: string
	readonly sealedAt: string
	readonly sealedBeforeMenu: true
}

export interface AttemptRevision {
	readonly revision: number
	readonly savedAt: string
	readonly diffHash: string
}

export interface AttemptTest {
	readonly testId: string
	readonly source: EvidenceSource
	readonly outcome: EvidenceOutcome
	readonly fixtureId?: string
	readonly expectedRevision?: number
}

export interface AidSegment {
	readonly segmentId: string
	readonly level: AidLevel
	readonly revealedAt: string
}

export interface AttemptDelivery {
	readonly deliveredAt: string
	readonly revision: number
	readonly evidenceHash: string
	readonly teacherBatteryId: string
}

export interface AttemptExplanation {
	readonly promptId: string
	readonly recordedAt: string
	readonly text: string
}

export interface AttemptAdjudication {
	readonly dimension: RubricDimension
	readonly level: RubricLevel
	readonly kind: AdjudicationKind
	readonly evidenceRefs: readonly string[]
	readonly note?: string
}

export interface AttemptIncident {
	readonly incidentId: string
	readonly kind: IncidentKind
	readonly detail: string
	readonly occurredAt: string
}

export interface AttemptRecord {
	readonly schemaVersion: typeof ATTEMPT_SCHEMA_VERSION
	readonly progressKind: typeof ATTEMPT_PROGRESS_KIND
	readonly attemptId: string
	readonly caseId: InvestigatedCaseId
	readonly actor: { readonly pseudonym: string }
	readonly versions: AttemptVersionSet
	readonly versionHash: string
	readonly status: AttemptStatus
	readonly sequence: number
	readonly createdAt: string
	readonly operations: readonly AppliedOperation[]
	readonly diagnosis?: SealedDiagnosis
	readonly revisions: readonly AttemptRevision[]
	readonly tests: readonly AttemptTest[]
	readonly aids: readonly AidSegment[]
	readonly delivery?: AttemptDelivery
	readonly explanations: readonly AttemptExplanation[]
	readonly adjudication: readonly AttemptAdjudication[]
	readonly incidents: readonly AttemptIncident[]
	readonly contentHash: string
}

export interface AttemptValidationResult {
	ok: boolean
	errors: string[]
}

export interface AttemptCompatibility {
	compatible: boolean
	reason?: keyof AttemptVersionSet
	detail?: string
}

export interface CreateAttemptRecordInput {
	attemptId: string
	caseId: string
	actorPseudonym: string
	versions: AttemptVersionSet
	createdAt?: string
}

const caseIdSet = new Set<string>(INVESTIGATED_CASE_IDS)
const formSet = new Set<string>(EXERCISE_FORMS)
const statusSet = new Set<string>(ATTEMPT_STATUSES)
const operationKindSet = new Set<string>(ATTEMPT_OPERATION_KINDS)
const sourceSet = new Set<string>(EVIDENCE_SOURCES)
const outcomeSet = new Set<string>(EVIDENCE_OUTCOMES)
const aidLevelSet = new Set<string>(AID_LEVELS)
const dimensionSet = new Set<string>(RUBRIC_DIMENSIONS)
const levelSet = new Set<string>(RUBRIC_LEVELS)
const adjudicationKindSet = new Set<string>(ADJUDICATION_KINDS)
const incidentKindSet = new Set<string>(INCIDENT_KINDS)

const ATTEMPT_FIELDS = new Set([
	'schemaVersion',
	'progressKind',
	'attemptId',
	'caseId',
	'actor',
	'versions',
	'versionHash',
	'status',
	'sequence',
	'createdAt',
	'operations',
	'diagnosis',
	'revisions',
	'tests',
	'aids',
	'delivery',
	'explanations',
	'adjudication',
	'incidents',
	'contentHash',
])

const VERSION_FIELDS = new Set([
	'task',
	'form',
	'fixtures',
	'engine',
	'verifier',
	'rubric',
	'aids',
])

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0
}

function isHash(value: unknown): value is string {
	return typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value)
}

function isIsoDate(value: unknown): value is string {
	return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function checkClosedFields(
	value: Record<string, unknown>,
	allowed: Set<string>,
	path: string,
	errors: string[],
): void {
	for (const key of Object.keys(value)) {
		if (!allowed.has(key)) {
			errors.push(`${path}${key}: unknown field`)
		}
	}
}

export function computeAttemptContentHash(value: unknown): string {
	return computeScenarioContentHash(value)
}

export function createAttemptRecord(
	input: CreateAttemptRecordInput,
): AttemptRecord {
	const candidate = {
		schemaVersion: ATTEMPT_SCHEMA_VERSION,
		progressKind: ATTEMPT_PROGRESS_KIND,
		attemptId: input.attemptId,
		caseId: input.caseId as InvestigatedCaseId,
		actor: { pseudonym: input.actorPseudonym },
		versions: input.versions,
		versionHash: computeAttemptContentHash(input.versions),
		status: 'in-progress' as const,
		sequence: 0,
		createdAt: input.createdAt ?? new Date().toISOString(),
		operations: [] as readonly AppliedOperation[],
		revisions: [] as readonly AttemptRevision[],
		tests: [] as readonly AttemptTest[],
		aids: [] as readonly AidSegment[],
		explanations: [] as readonly AttemptExplanation[],
		adjudication: [] as readonly AttemptAdjudication[],
		incidents: [] as readonly AttemptIncident[],
	}
	return { ...candidate, contentHash: computeAttemptContentHash(candidate) }
}

function validateVersions(value: unknown, errors: string[]): void {
	if (!isRecord(value)) {
		errors.push('versions: must be an object')
		return
	}
	checkClosedFields(value, VERSION_FIELDS, 'versions.', errors)
	for (const field of [
		'task',
		'fixtures',
		'engine',
		'verifier',
		'rubric',
		'aids',
	]) {
		if (!isNonEmptyString(value[field])) {
			errors.push(`versions.${field}: must be a non-empty string`)
		}
	}
	if (typeof value.form !== 'string' || !formSet.has(value.form)) {
		errors.push(`versions.form: unsupported form "${String(value.form)}"`)
	}
}

function validateOperations(value: unknown, errors: string[]): void {
	if (!Array.isArray(value)) {
		errors.push('operations: must be an array')
		return
	}
	const seen = new Set<string>()
	value.forEach((operation, index) => {
		if (!isRecord(operation)) {
			errors.push(`operations[${index}]: must be an object`)
			return
		}
		const operationId = operation.operationId
		if (!isNonEmptyString(operationId)) {
			errors.push(
				`operations[${index}].operationId: must be a non-empty string`,
			)
		} else if (seen.has(operationId)) {
			errors.push(
				`operations[${index}]: duplicate operationId "${operationId}"`,
			)
		} else {
			seen.add(operationId)
		}
		if (
			typeof operation.kind !== 'string' ||
			!operationKindSet.has(operation.kind)
		) {
			errors.push(
				`operations[${index}].kind: unsupported operation "${String(operation.kind)}"`,
			)
		}
		if (
			!Number.isInteger(operation.sequence) ||
			Number(operation.sequence) !== index + 1
		) {
			errors.push(
				`operations[${index}].sequence: expected ${index + 1}, received ${String(operation.sequence)}`,
			)
		}
		for (const field of ['expectedRevision', 'revisionAfter'] as const) {
			if (!Number.isInteger(operation[field]) || Number(operation[field]) < 0) {
				errors.push(
					`operations[${index}].${field}: must be a non-negative integer`,
				)
			}
		}
		if (!isHash(operation.payloadHash)) {
			errors.push(`operations[${index}].payloadHash: must use sha256:<64 hex>`)
		}
	})
}

function validateDiagnosis(value: unknown, errors: string[]): void {
	if (!isRecord(value)) {
		errors.push('diagnosis: must be an object')
		return
	}
	if (!isNonEmptyString(value.frontierId)) {
		errors.push('diagnosis.frontierId: must be a non-empty string')
	}
	if (!Array.isArray(value.citedArtifactIds)) {
		errors.push('diagnosis.citedArtifactIds: must be an array')
	} else if (value.citedArtifactIds.some((id) => !isNonEmptyString(id))) {
		errors.push('diagnosis.citedArtifactIds: entries must be non-empty strings')
	}
	if (!isNonEmptyString(value.claim)) {
		errors.push('diagnosis.claim: must be a non-empty string')
	}
	if (!isIsoDate(value.sealedAt)) {
		errors.push('diagnosis.sealedAt: must be an ISO date')
	}
	if (value.sealedBeforeMenu !== true) {
		errors.push('diagnosis.sealedBeforeMenu: must be true')
	}
}

function validateDuplicateNumbers(
	value: unknown,
	field: string,
	path: string,
	errors: string[],
): void {
	if (!Array.isArray(value)) {
		errors.push(`${path}: must be an array`)
		return
	}
	const seen = new Set<number>()
	value.forEach((entry, index) => {
		if (!isRecord(entry)) {
			errors.push(`${path}[${index}]: must be an object`)
			return
		}
		const raw = entry[field]
		if (!Number.isInteger(raw) || Number(raw) <= 0) {
			errors.push(`${path}[${index}].${field}: must be a positive integer`)
			return
		}
		const number = Number(raw)
		if (seen.has(number)) {
			errors.push(`${path}[${index}]: duplicate ${field} ${number}`)
		}
		seen.add(number)
		if (path === 'revisions' && !isIsoDate(entry.savedAt)) {
			errors.push(`revisions[${index}].savedAt: must be an ISO date`)
		}
		if (path === 'revisions' && !isHash(entry.diffHash)) {
			errors.push(`revisions[${index}].diffHash: must use sha256:<64 hex>`)
		}
	})
}

function validateTests(value: unknown, errors: string[]): void {
	if (!Array.isArray(value)) {
		errors.push('tests: must be an array')
		return
	}
	const seen = new Set<string>()
	value.forEach((entry, index) => {
		if (!isRecord(entry)) {
			errors.push(`tests[${index}]: must be an object`)
			return
		}
		if (!isNonEmptyString(entry.testId)) {
			errors.push(`tests[${index}].testId: must be a non-empty string`)
		} else if (seen.has(entry.testId)) {
			errors.push(`tests[${index}]: duplicate testId "${entry.testId}"`)
		} else {
			seen.add(entry.testId)
		}
		if (typeof entry.source !== 'string' || !sourceSet.has(entry.source)) {
			errors.push(
				`tests[${index}].source: unsupported source "${String(entry.source)}"`,
			)
		}
		if (typeof entry.outcome !== 'string' || !outcomeSet.has(entry.outcome)) {
			errors.push(
				`tests[${index}].outcome: unsupported outcome "${String(entry.outcome)}"`,
			)
		}
	})
}

function validateAids(value: unknown, errors: string[]): void {
	if (!Array.isArray(value)) {
		errors.push('aids: must be an array')
		return
	}
	const seen = new Set<string>()
	value.forEach((entry, index) => {
		if (!isRecord(entry)) {
			errors.push(`aids[${index}]: must be an object`)
			return
		}
		if (!isNonEmptyString(entry.segmentId)) {
			errors.push(`aids[${index}].segmentId: must be a non-empty string`)
		} else if (seen.has(entry.segmentId)) {
			errors.push(`aids[${index}]: duplicate segmentId "${entry.segmentId}"`)
		} else {
			seen.add(entry.segmentId)
		}
		if (typeof entry.level !== 'string' || !aidLevelSet.has(entry.level)) {
			errors.push(
				`aids[${index}].level: unsupported aid level "${String(entry.level)}"`,
			)
		}
		if (!isIsoDate(entry.revealedAt)) {
			errors.push(`aids[${index}].revealedAt: must be an ISO date`)
		}
	})
}

function validateDelivery(
	value: unknown,
	revisionNumbers: Set<number>,
	errors: string[],
): void {
	if (!isRecord(value)) {
		errors.push('delivery: must be an object')
		return
	}
	if (!isIsoDate(value.deliveredAt)) {
		errors.push('delivery.deliveredAt: must be an ISO date')
	}
	if (
		!Number.isInteger(value.revision) ||
		!revisionNumbers.has(Number(value.revision))
	) {
		errors.push(`delivery.revision: unknown revision ${String(value.revision)}`)
	}
	if (!isHash(value.evidenceHash)) {
		errors.push('delivery.evidenceHash: must use sha256:<64 hex>')
	}
	if (!isNonEmptyString(value.teacherBatteryId)) {
		errors.push('delivery.teacherBatteryId: must be a non-empty string')
	}
}

function validateExplanations(value: unknown, errors: string[]): void {
	if (!Array.isArray(value)) {
		errors.push('explanations: must be an array')
		return
	}
	value.forEach((entry, index) => {
		if (!isRecord(entry)) {
			errors.push(`explanations[${index}]: must be an object`)
			return
		}
		if (!isNonEmptyString(entry.promptId)) {
			errors.push(`explanations[${index}].promptId: must be a non-empty string`)
		}
		if (!isIsoDate(entry.recordedAt)) {
			errors.push(`explanations[${index}].recordedAt: must be an ISO date`)
		}
		if (typeof entry.text !== 'string') {
			errors.push(`explanations[${index}].text: must be a string`)
		}
	})
}

function validateAdjudication(value: unknown, errors: string[]): void {
	if (!Array.isArray(value)) {
		errors.push('adjudication: must be an array')
		return
	}
	value.forEach((entry, index) => {
		if (!isRecord(entry)) {
			errors.push(`adjudication[${index}]: must be an object`)
			return
		}
		if (
			typeof entry.dimension !== 'string' ||
			!dimensionSet.has(entry.dimension)
		) {
			errors.push(
				`adjudication[${index}].dimension: unsupported dimension "${String(entry.dimension)}"`,
			)
		}
		if (typeof entry.level !== 'string' || !levelSet.has(entry.level)) {
			errors.push(
				`adjudication[${index}].level: unsupported rubric level "${String(entry.level)}"`,
			)
		}
		if (
			typeof entry.kind !== 'string' ||
			!adjudicationKindSet.has(entry.kind)
		) {
			errors.push(
				`adjudication[${index}].kind: unsupported adjudication "${String(entry.kind)}"`,
			)
		}
		if (!Array.isArray(entry.evidenceRefs)) {
			errors.push(`adjudication[${index}].evidenceRefs: must be an array`)
		}
	})
}

function validateIncidents(value: unknown, errors: string[]): void {
	if (!Array.isArray(value)) {
		errors.push('incidents: must be an array')
		return
	}
	const seen = new Set<string>()
	value.forEach((entry, index) => {
		if (!isRecord(entry)) {
			errors.push(`incidents[${index}]: must be an object`)
			return
		}
		if (!isNonEmptyString(entry.incidentId)) {
			errors.push(`incidents[${index}].incidentId: must be a non-empty string`)
		} else if (seen.has(entry.incidentId)) {
			errors.push(
				`incidents[${index}]: duplicate incidentId "${entry.incidentId}"`,
			)
		} else {
			seen.add(entry.incidentId)
		}
		if (typeof entry.kind !== 'string' || !incidentKindSet.has(entry.kind)) {
			errors.push(
				`incidents[${index}].kind: unsupported incident "${String(entry.kind)}"`,
			)
		}
		if (!isIsoDate(entry.occurredAt)) {
			errors.push(`incidents[${index}].occurredAt: must be an ISO date`)
		}
	})
}

export function validateAttemptRecord(value: unknown): AttemptValidationResult {
	if (!isRecord(value)) {
		return { ok: false, errors: ['attempt: must be an object'] }
	}
	if (value.schemaVersion !== ATTEMPT_SCHEMA_VERSION) {
		return {
			ok: false,
			errors: [
				`schemaVersion: unsupported version ${String(value.schemaVersion)}`,
			],
		}
	}

	const errors: string[] = []
	checkClosedFields(value, ATTEMPT_FIELDS, '', errors)

	if (value.progressKind !== ATTEMPT_PROGRESS_KIND) {
		errors.push(
			`progressKind: must be "${ATTEMPT_PROGRESS_KIND}", received "${String(value.progressKind)}"`,
		)
	}
	if (!isNonEmptyString(value.attemptId)) {
		errors.push('attemptId: must be a non-empty string')
	}
	if (typeof value.caseId !== 'string' || !caseIdSet.has(value.caseId)) {
		errors.push(
			`caseId: unsupported investigated case "${String(value.caseId)}"`,
		)
	}
	if (!isRecord(value.actor) || !isNonEmptyString(value.actor.pseudonym)) {
		errors.push('actor.pseudonym: must be a non-empty string')
	}
	validateVersions(value.versions, errors)
	if (!isHash(value.versionHash)) {
		errors.push('versionHash: must use sha256:<64 hex>')
	} else if (
		isRecord(value.versions) &&
		value.versionHash !== computeAttemptContentHash(value.versions)
	) {
		errors.push('versionHash: does not match the version set')
	}
	if (typeof value.status !== 'string' || !statusSet.has(value.status)) {
		errors.push(`status: unsupported status "${String(value.status)}"`)
	}
	if (!Number.isInteger(value.sequence) || Number(value.sequence) < 0) {
		errors.push('sequence: must be a non-negative integer')
	}
	if (!isIsoDate(value.createdAt)) {
		errors.push('createdAt: must be an ISO date')
	}

	validateOperations(value.operations, errors)
	if (Array.isArray(value.operations)) {
		if (
			Number.isInteger(value.sequence) &&
			value.sequence !== value.operations.length
		) {
			errors.push(
				`sequence: expected ${value.operations.length} to match the operation log`,
			)
		}
	}

	if (value.diagnosis !== undefined) {
		validateDiagnosis(value.diagnosis, errors)
	}

	validateDuplicateNumbers(value.revisions, 'revision', 'revisions', errors)
	const revisionNumbers = new Set<number>()
	if (Array.isArray(value.revisions)) {
		for (const revision of value.revisions) {
			if (isRecord(revision) && Number.isInteger(revision.revision)) {
				revisionNumbers.add(Number(revision.revision))
			}
		}
	}

	validateTests(value.tests, errors)
	validateAids(value.aids, errors)
	validateExplanations(value.explanations, errors)
	validateAdjudication(value.adjudication, errors)
	validateIncidents(value.incidents, errors)

	if (value.delivery !== undefined) {
		if (value.diagnosis === undefined) {
			errors.push('delivery: requires a sealed diagnosis before delivery')
		}
		validateDelivery(value.delivery, revisionNumbers, errors)
	}
	if (value.status === 'delivered' && value.delivery === undefined) {
		errors.push('status: delivered requires a delivery record')
	}

	if (!isHash(value.contentHash)) {
		errors.push('contentHash: must use sha256:<64 hex>')
	} else if (value.contentHash !== computeAttemptContentHash(value)) {
		errors.push('contentHash: does not match the attempt content')
	}

	return { ok: errors.length === 0, errors }
}

const VERSION_KEYS: ReadonlyArray<keyof AttemptVersionSet> = [
	'task',
	'form',
	'fixtures',
	'engine',
	'verifier',
	'rubric',
	'aids',
]

export function isAttemptCompatible(
	record: Pick<AttemptRecord, 'versions'>,
	expected: AttemptVersionSet,
): AttemptCompatibility {
	for (const key of VERSION_KEYS) {
		if (record.versions[key] !== expected[key]) {
			return {
				compatible: false,
				reason: key,
				detail: `record was produced with ${key} "${record.versions[key]}", interpreter expects "${expected[key]}"`,
			}
		}
	}
	return { compatible: true }
}
