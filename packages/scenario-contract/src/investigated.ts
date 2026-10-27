import type {
	ScenarioCapability,
	ScenarioEnvironmentProfile,
	ScenarioValidationResult,
} from './index.js'

/**
 * Closed registry for the five investigated exercises (conjunto 2.0).
 *
 * Every identifier here is a literal from its specification file. The registry
 * exists so a manifest, a view or a verifier cannot reference an operation,
 * fixture or battery that the ficha never defined. Unknown identifiers are a
 * validation error, never a free-form string.
 */

export const INVESTIGATED_CASE_IDS = [
	'cwe-321-andinapay',
	'cwe-89-bibliotecaviva',
	'cwe-434-talentoandino',
	'cwe-306-andeanlogix',
	'cwe-502-nubeandina',
] as const

export const INVESTIGATED_CWES = [
	'CWE-321',
	'CWE-89',
	'CWE-434',
	'CWE-306',
	'CWE-502',
] as const

export const EXERCISE_FORMS = ['A', 'B'] as const

export const AID_LEVELS = ['A0', 'A1', 'A2', 'A3'] as const
export const RUBRIC_DIMENSIONS = ['D1', 'D2', 'D3', 'D4'] as const
export const RUBRIC_LEVELS = ['0', '1', '2', '3', 'NE'] as const

export type InvestigatedCaseId = (typeof INVESTIGATED_CASE_IDS)[number]
export type InvestigatedCwe = (typeof INVESTIGATED_CWES)[number]
export type ExerciseForm = (typeof EXERCISE_FORMS)[number]
export type AidLevel = (typeof AID_LEVELS)[number]
export type RubricDimension = (typeof RUBRIC_DIMENSIONS)[number]
export type RubricLevel = (typeof RUBRIC_LEVELS)[number]

export interface InvestigatedCaseDefinition {
	readonly id: InvestigatedCaseId
	readonly cwe: InvestigatedCwe
	readonly slug: string
	readonly capability: ScenarioCapability
	readonly environmentProfile: ScenarioEnvironmentProfile
	readonly operations: readonly string[]
	readonly controls: readonly string[]
	readonly verifiers: readonly string[]
	readonly fixtures: readonly string[]
	readonly aidSegments: readonly string[]
	readonly rubricDimensions: readonly RubricDimension[]
}

const ANDINAPAY: InvestigatedCaseDefinition = {
	id: 'cwe-321-andinapay',
	cwe: 'CWE-321',
	slug: 'andinapay-clave-expuesta',
	capability: 'crypto-key-rotation',
	environmentProfile: 'office-3d',
	operations: [
		'record_evidence',
		'submit_diagnosis',
		'stage_key',
		'set_key_source',
		'rekey_records',
		'commit_recovery',
		'retire_key_early',
		'restore_key_for_recovery',
		'configure_prevention',
		'run_check',
		'submit_artifact',
		'submit_report',
	],
	controls: [
		'writerKey',
		'appPaymentSource',
		'externalReaderPolicy',
		'migrationWorkerPolicy',
		'keyExportPolicy',
		'scannerScope',
		'recoveryPolicy',
	],
	verifiers: ['B1', 'B2', 'Q1', 'Q2', 'Q3', 'C1', 'C2', 'C3', 'C4', 'C5'],
	fixtures: [
		'AP-H1',
		'AP-H2',
		'AP-H3',
		'K1',
		'K2',
		'KI',
		'R01',
		'R02',
		'R03',
		'R04',
		'envelope-AP-R01-K1',
		'envelope-AP-R02-K1',
		'envelope-AP-R03-KI',
		'envelope-AP-R04-K1',
		'envelope-AP-R01-K2',
		'envelope-AP-R02-K2',
		'envelope-AP-R04-K2',
		'logs/application.log',
		'logs/monitoring.txt',
		'recovery/policy.txt',
	],
	aidSegments: ['A0', 'A1', 'A2a', 'A2b', 'A3'],
	rubricDimensions: ['D1', 'D2', 'D3', 'D4'],
}

const BIBLIOTECAVIVA: InvestigatedCaseDefinition = {
	id: 'cwe-89-bibliotecaviva',
	cwe: 'CWE-89',
	slug: 'bibliotecaviva-consultas-seguras',
	capability: 'sql-query-binding',
	environmentProfile: 'office-3d',
	operations: [
		'open_expedient',
		'open_source',
		'save_revision',
		'run_search',
		'compare_executions',
		'run_permission_probe',
		'submit_freeze',
	],
	controls: [
		'constructor',
		'actorSource',
		'validation',
		'errorPolicy',
		'dbRole',
	],
	verifiers: [
		'BV01',
		'BV02',
		'BV03',
		'BV04',
		'BV05',
		'BV06',
		'BV07',
		'BV08',
		'BV09',
		'BV10',
		'BV11',
		'BV12',
		'BV13',
		'BV14',
		'BV15',
		'BV16',
		'BV-C',
		'B89',
		'Q89',
		'C89',
	],
	fixtures: [
		'BV-REQ',
		'BV-CODE-H',
		'BV-CODE-SAFE',
		'BV-SCHEMA',
		'BV-CONFIG',
		'BV-LOG-17',
		'BV-LOG-18',
		'BV-REPORT',
		'users-S101-S103',
		'books-10-13',
		'loans-1001-1007',
	],
	aidSegments: ['A0', 'A1', 'A2', 'A3'],
	rubricDimensions: ['D1', 'D2', 'D3', 'D4'],
}

const TALENTOANDINO: InvestigatedCaseDefinition = {
	id: 'cwe-434-talentoandino',
	cwe: 'CWE-434',
	slug: 'talentoandino-cargas-seguras',
	capability: 'file-admission',
	environmentProfile: 'office-3d',
	operations: [
		'open_materials',
		'save_revision',
		'run_upload_check',
		'classify_object',
		'quarantine_object',
		'migrate_object',
		'submit_report',
	],
	controls: [
		'validationLevel',
		'sizeLimit',
		'namePolicy',
		'storagePolicy',
		'deliveryPolicy',
		'publicationPolicy',
	],
	verifiers: [
		'TA-B1',
		'TA-B2',
		'TA-Q1',
		'TA-Q2',
		'TA-Q3',
		'TA-Q4',
		'TA-Q5',
		'TA-Q6',
		'TA-C1',
	],
	fixtures: [
		...Array.from(
			{ length: 13 },
			(_, index) => `T${String(index + 1).padStart(2, '0')}`,
		),
		'LG01',
		'LG02',
		'LG03',
		'TA-REQ-0',
		'TA-UI-0',
		'TA-CODE-0',
		'TA-CONF-0',
		'TA-LOG-0',
		'TA-LOG-1',
		'TA-INV-0',
	],
	aidSegments: ['A0', 'A1', 'A2', 'A3'],
	rubricDimensions: ['D1', 'D2', 'D3', 'D4'],
}

const ANDEANLOGIX: InvestigatedCaseDefinition = {
	id: 'cwe-306-andeanlogix',
	cwe: 'CWE-306',
	slug: 'andeanlogix-funciones-criticas',
	capability: 'authorization-matrix',
	environmentProfile: 'office-3d',
	operations: [
		'inspect',
		'submit_diagnosis',
		'save_revision',
		'configure_guard',
		'configure_maintenance_bypass',
		'configure_admin_ingress',
		'configure_admin_service',
		'configure_public_tracking',
		'execute_request',
		'write_report',
	],
	controls: [
		'guard',
		'maintenanceBypass',
		'adminIngress',
		'adminService',
		'publicTracking',
	],
	verifiers: ['B306', 'Q306', 'C306', 'M306', 'F306', 'P306', 'U306'],
	fixtures: [
		'SH-301',
		'SH-302',
		'DR-7',
		'DR-8',
		'R1',
		'R2',
		'R3',
		'routes-before.txt',
		'ui-login.txt',
		'sessions.json',
		'admin-policy.json',
		'network.conf',
		'maintenance.conf',
		'incident-access.log',
		'incident-shipments.json',
	],
	aidSegments: ['A0', 'A1', 'A2', 'A3'],
	rubricDimensions: ['D1', 'D2', 'D3', 'D4'],
}

const NUBEANDINA: InvestigatedCaseDefinition = {
	id: 'cwe-502-nubeandina',
	cwe: 'CWE-502',
	slug: 'nubeandina-sesiones-no-confiables',
	capability: 'session-restore',
	environmentProfile: 'office-3d',
	operations: [
		'open_documents',
		'trace_flow',
		'compare_logs',
		'rehearse_document',
		'save_revision',
		'select_commit',
		'propose_dependency_policy',
		'send_report',
	],
	controls: ['diff', 'commit'],
	verifiers: [
		'NA-B1',
		'NA-B2',
		'NA-Q1',
		'NA-Q2',
		'NA-Q3',
		'NA-Q4',
		'NA-Q5',
		'NA-Q6',
		'NA-C1',
	],
	fixtures: [
		'S01',
		'S02',
		'S03',
		'S04',
		'S05',
		'S06',
		'S07',
		'S08',
		'SID-7-A',
		'SID-7-B',
		'SID-8-A',
		'SID-7-OLD',
		'BLOB-S03',
		'BLOB-S04',
		'NA-CODE-0',
		'NA-LOG-0',
		'NA-LOG-1',
		'NA-DEP-0',
		'NA-ADV-0',
		'NA-README-0',
	],
	aidSegments: ['A0', 'A1', 'A2', 'A3'],
	rubricDimensions: ['D1', 'D2', 'D3', 'D4'],
}

export const INVESTIGATED_CASES: Readonly<
	Record<InvestigatedCaseId, InvestigatedCaseDefinition>
> = {
	'cwe-321-andinapay': ANDINAPAY,
	'cwe-89-bibliotecaviva': BIBLIOTECAVIVA,
	'cwe-434-talentoandino': TALENTOANDINO,
	'cwe-306-andeanlogix': ANDEANLOGIX,
	'cwe-502-nubeandina': NUBEANDINA,
}

export interface InvestigatedCaseExtension {
	readonly caseId: InvestigatedCaseId
	readonly form: ExerciseForm
	readonly operations?: readonly string[]
	readonly verifiers?: readonly string[]
	readonly fixtures?: readonly string[]
}

export function getInvestigatedCase(
	caseId: string,
): InvestigatedCaseDefinition | undefined {
	return INVESTIGATED_CASES[caseId as InvestigatedCaseId]
}

const caseIdSet = new Set<string>(INVESTIGATED_CASE_IDS)
const formSet = new Set<string>(EXERCISE_FORMS)

function closedListErrors(
	value: unknown,
	field: string,
	allowed: readonly string[],
	errors: string[],
): void {
	if (value === undefined) return
	if (!Array.isArray(value)) {
		errors.push(`exercise.${field}: must be an array`)
		return
	}
	const allowedSet = new Set<string>(allowed)
	const seen = new Set<string>()
	value.forEach((entry, index) => {
		if (typeof entry !== 'string' || !allowedSet.has(entry)) {
			errors.push(
				`exercise.${field}[${index}]: unsupported identifier "${String(entry)}"`,
			)
			return
		}
		if (seen.has(entry)) {
			errors.push(
				`exercise.${field}[${index}]: duplicate identifier "${entry}"`,
			)
		}
		seen.add(entry)
	})
}

/**
 * Validates a manifest's investigated-case extension.
 *
 * The extension may only narrow the case's own closed lists; it can never add
 * an operation, verifier or fixture that the ficha did not define.
 */
export function validateInvestigatedCaseExtension(
	value: unknown,
): ScenarioValidationResult {
	const errors: string[] = []
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return { ok: false, errors: ['exercise: must be an object'] }
	}

	const extension = value as Record<string, unknown>
	for (const key of Object.keys(extension)) {
		if (
			!['caseId', 'form', 'operations', 'verifiers', 'fixtures'].includes(key)
		) {
			errors.push(`exercise.${key}: unknown field`)
		}
	}

	const defined =
		typeof extension.caseId === 'string'
			? getInvestigatedCase(extension.caseId)
			: undefined
	if (
		typeof extension.caseId !== 'string' ||
		!caseIdSet.has(extension.caseId)
	) {
		errors.push(
			`exercise.caseId: unsupported investigated case "${String(extension.caseId)}"`,
		)
		return { ok: false, errors }
	}
	if (typeof extension.form !== 'string' || !formSet.has(extension.form)) {
		errors.push(`exercise.form: unsupported form "${String(extension.form)}"`)
	}
	if (!defined) {
		return { ok: false, errors }
	}

	closedListErrors(
		extension.operations,
		'operations',
		defined.operations,
		errors,
	)
	closedListErrors(extension.verifiers, 'verifiers', defined.verifiers, errors)
	closedListErrors(extension.fixtures, 'fixtures', defined.fixtures, errors)

	return { ok: errors.length === 0, errors }
}

export function caseExtensionCapability(
	caseId: string,
): ScenarioCapability | undefined {
	return getInvestigatedCase(caseId)?.capability
}
