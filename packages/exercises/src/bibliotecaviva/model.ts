/**
 * BibliotecaViva (CWE-89) domain model.
 *
 * The student's revision is a closed set of patch controls. The verifier
 * receives those controls plus the artifacts a revision actually produced:
 * generated SQL, bound parameters and identity source. It never approves a
 * revision because a control is named `named`.
 */

import {
	applied,
	buildReport,
	type CheckResult,
	type ExerciseReport,
	type OperationResult,
	reject,
} from '../core.js'

export type SqlValue = string | number | null
export type SqlParams = readonly SqlValue[] | Readonly<Record<string, SqlValue>>

export interface SqlPort {
	query(sql: string, params?: SqlParams): readonly Record<string, unknown>[]
	execute(sql: string, params?: SqlParams): void
	snapshot(): string
	close(): void
}

export type SqlPortFactory = () => SqlPort

export const BV_SCHEMA = `
CREATE TABLE users(student_id TEXT PRIMARY KEY, display_name TEXT);
CREATE TABLE books(book_id INTEGER PRIMARY KEY, title TEXT, author TEXT);
CREATE TABLE loans(loan_id INTEGER PRIMARY KEY, student_id TEXT, book_id INTEGER, loan_date TEXT);
INSERT INTO users VALUES ('S101','Ana Demo'),('S102','Bruno Demo'),('S103','Cora Demo');
INSERT INTO books VALUES
 (10,'Redes practicas','Luz Vega'),
 (11,'SQL sin atajos','Marta O''Reilly'),
 (12,'100% redes','Equipo_A'),
 (13,'Redes avanzadas','Luz Vega');
INSERT INTO loans VALUES
 (1001,'S101',10,'2026-10-20'),
 (1002,'S101',11,'2026-10-21'),
 (1003,'S101',12,'2026-10-22'),
 (1004,'S102',10,'2026-10-20'),
 (1005,'S102',13,'2026-10-21'),
 (1006,'S103',11,'2026-10-23'),
 (1007,'S101',13,'2026-10-23');
`

export type ConstructorKind =
	| 'concat'
	| 'title_only'
	| 'named'
	| 'positional'
	| 'orm_raw'
export type ActorSource = 'session' | 'request' | 'fixed_S101' | 'none'
export type ValidationKind = 'client_only' | 'typed'
export type ErrorPolicy = 'raw' | 'public_id'
export type DbRole = 'read_write' | 'history_readonly' | 'disabled'

export interface BibliotecaVivaConfig {
	readonly constructor: ConstructorKind
	readonly actorSource: ActorSource
	readonly validation: ValidationKind
	readonly errorPolicy: ErrorPolicy
	readonly dbRole: DbRole
}

export interface SearchInput {
	readonly title?: string
	readonly author?: string
	readonly date?: string
	readonly page?: number
	readonly requestStudent?: string
}

export interface SearchRequest {
	readonly config: BibliotecaVivaConfig
	readonly input: SearchInput
	readonly principal: string | null
}

export type SearchStatus =
	| 'ok'
	| 'query_error'
	| 'validation_error'
	| 'unauthenticated'
	| 'permission_denied'
	| 'technical_error'

export interface SearchResult {
	readonly status: SearchStatus
	readonly rows: readonly number[]
	readonly sql: string | null
	readonly params: SqlParams | null
	readonly detail?: string
	readonly correlationId?: string
}

export const BV_CONFIG_INITIAL: BibliotecaVivaConfig = {
	constructor: 'concat',
	actorSource: 'session',
	validation: 'client_only',
	errorPolicy: 'raw',
	dbRole: 'read_write',
}

const REFERENCE_SELECT = `SELECT l.loan_id,l.student_id,b.title,b.author,l.loan_date
FROM loans l JOIN books b ON b.book_id=l.book_id`

function quote(value: string): string {
	return `'${value}'`
}

function actorClause(
	config: BibliotecaVivaConfig,
	input: SearchInput,
	principal: string | null,
): { clause: string | null; value: string | null } {
	switch (config.actorSource) {
		case 'session':
			return { clause: 'l.student_id', value: principal }
		case 'request':
			return {
				clause: 'l.student_id',
				value: input.requestStudent ?? principal,
			}
		case 'fixed_S101':
			return { clause: 'l.student_id', value: 'S101' }
		case 'none':
			return { clause: null, value: null }
	}
}

export interface BuiltQuery {
	readonly sql: string
	readonly params: SqlParams | null
	/** Values interpolated into the text instead of being bound. */
	readonly interpolated: readonly string[]
}

export function buildHistoryQuery(
	config: BibliotecaVivaConfig,
	input: SearchInput,
	principal: string,
): BuiltQuery {
	const title = input.title ?? ''
	const author = input.author ?? ''
	const date = input.date ?? ''
	const actor = actorClause(config, input, principal)
	const values = { actor: actor.value ?? '', title, author, date }

	if (config.constructor === 'named' || config.constructor === 'positional') {
		const parts: string[] = [REFERENCE_SELECT, 'WHERE 1=1']
		const params: SqlValue[] = []
		const named: Record<string, SqlValue> = {}
		const bind = (name: string, value: SqlValue) => {
			if (config.constructor === 'named') {
				named[name] = value
				return `:${name}`
			}
			params.push(value)
			return '?'
		}
		if (actor.clause) {
			parts.push(`AND ${actor.clause}=${bind('actor', values.actor)}`)
		}
		parts.push(`AND instr(lower(b.title),lower(${bind('title', title)})) > 0`)
		parts.push(
			`AND instr(lower(b.author),lower(${bind('author', author)})) > 0`,
		)
		parts.push(
			`AND (${bind('date_a', date)} = '' OR l.loan_date=${bind('date_b', date)})`,
		)
		parts.push('ORDER BY l.loan_id LIMIT 2 OFFSET :offset')
		if (config.constructor === 'named') {
			named.offset = (Math.max(1, input.page ?? 1) - 1) * 2
			return {
				sql: parts.join('\n').replace('OFFSET :offset', 'OFFSET :offset'),
				params: named,
				interpolated: [],
			}
		}
		params.push((Math.max(1, input.page ?? 1) - 1) * 2)
		return {
			sql: parts.join('\n').replace('OFFSET :offset', 'OFFSET ?'),
			params,
			interpolated: [],
		}
	}

	const interpolated: string[] = []
	const literal = (value: string) => {
		interpolated.push(value)
		return quote(value)
	}

	const parts: string[] = [REFERENCE_SELECT, 'WHERE 1=1']
	if (actor.clause) {
		parts.push(`AND ${actor.clause}=${literal(values.actor)}`)
	}
	if (config.constructor === 'title_only') {
		parts.push('AND instr(lower(b.title),lower(:title)) > 0')
		parts.push(`AND instr(lower(b.author),lower(${literal(author)})) > 0`)
		parts.push(`AND (${literal(date)} = '' OR l.loan_date=${literal(date)})`)
		parts.push('ORDER BY l.loan_id LIMIT 2 OFFSET :offset')
		return {
			sql: parts.join('\n'),
			params: { title, offset: (Math.max(1, input.page ?? 1) - 1) * 2 },
			interpolated,
		}
	}

	parts.push(`AND instr(lower(b.title),lower(${literal(title)})) > 0`)
	parts.push(`AND instr(lower(b.author),lower(${literal(author)})) > 0`)
	parts.push(`AND (${literal(date)} = '' OR l.loan_date=${literal(date)})`)
	parts.push(
		`ORDER BY l.loan_id LIMIT 2 OFFSET ${(Math.max(1, input.page ?? 1) - 1) * 2}`,
	)
	return { sql: parts.join('\n'), params: null, interpolated }
}

const ALLOWED_INPUT_KEYS = new Set([
	'title',
	'author',
	'date',
	'page',
	'requestStudent',
])

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Boundary validation that never depends on the policy: an out-of-domain
 * value is rejected before any database access, including pages outside 1–4
 * and non-text filters. `client_only` only skips the calendar/length checks
 * that the ficha attributes to the form.
 */
export function validateSearchBoundary(
	input: SearchInput,
): { ok: true } | { ok: false; detail: string } {
	if (!isPlainRecord(input)) {
		return { ok: false, detail: 'input: debe ser un objeto' }
	}
	for (const key of Object.keys(input)) {
		if (!ALLOWED_INPUT_KEYS.has(key)) {
			return { ok: false, detail: `${key}: campo no admitido` }
		}
	}
	for (const field of ['title', 'author', 'date', 'requestStudent'] as const) {
		const value = input[field]
		if (value !== undefined && typeof value !== 'string') {
			return { ok: false, detail: `${field}: debe ser texto` }
		}
	}
	if (input.page !== undefined) {
		if (
			typeof input.page !== 'number' ||
			!Number.isInteger(input.page) ||
			input.page < 1 ||
			input.page > 4
		) {
			return { ok: false, detail: 'page: debe ser 1–4' }
		}
	}
	return { ok: true }
}

function isValidCalendarDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
	const [year, month, day] = value.split('-').map(Number)
	const date = new Date(Date.UTC(year, month - 1, day))
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	)
}

export function validateSearchInput(
	input: SearchInput,
): { ok: true } | { ok: false; detail: string } {
	const boundary = validateSearchBoundary(input)
	if (!boundary.ok) return boundary
	const title = input.title ?? ''
	const author = input.author ?? ''
	const date = input.date ?? ''
	if ([...title].length > 80)
		return { ok: false, detail: 'title: máximo 80 caracteres' }
	if ([...author].length > 80) {
		return { ok: false, detail: 'author: máximo 80 caracteres' }
	}
	if (date !== '' && !isValidCalendarDate(date)) {
		return { ok: false, detail: 'date: formato o calendario no válido' }
	}
	return { ok: true }
}

function deniedTable(sql: string, role: DbRole): boolean {
	if (role !== 'history_readonly') return false
	const normalized = sql.trim().toLowerCase()
	const allowed =
		normalized.startsWith('select') &&
		(/\bfrom\s+loans\b/.test(normalized) ||
			/\bfrom\s+books\b/.test(normalized) ||
			/\bjoin\s+books\b/.test(normalized))
	return !allowed
}

export function runSearch(port: SqlPort, request: SearchRequest): SearchResult {
	const { config, input, principal } = request
	if (principal === null) {
		return { status: 'unauthenticated', rows: [], sql: null, params: null }
	}
	const validation =
		config.validation === 'typed'
			? validateSearchInput(input)
			: validateSearchBoundary(input)
	if (!validation.ok) {
		return {
			status: 'validation_error',
			rows: [],
			sql: null,
			params: null,
			detail: validation.detail,
		}
	}
	if (config.dbRole === 'disabled') {
		return {
			status: 'permission_denied',
			rows: [],
			sql: null,
			params: null,
		}
	}

	const built = buildHistoryQuery(config, input, principal)
	if (new TextEncoder().encode(built.sql).length > 4096) {
		return {
			status: 'technical_error',
			rows: [],
			sql: built.sql,
			params: built.params,
			detail: 'sql: supera 4096 bytes generados',
		}
	}
	if (deniedTable(built.sql, config.dbRole)) {
		return {
			status: 'permission_denied',
			rows: [],
			sql: built.sql,
			params: built.params,
		}
	}

	try {
		const rows = port.query(built.sql, built.params ?? undefined)
		return {
			status: 'ok',
			rows: rows.map((row) => Number(row.loan_id)),
			sql: built.sql,
			params: built.params,
		}
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error)
		if (config.errorPolicy === 'public_id') {
			return {
				status: 'query_error',
				rows: [],
				sql: built.sql,
				params: built.params,
				correlationId: 'BV-E14',
			}
		}
		return {
			status: 'query_error',
			rows: [],
			sql: built.sql,
			params: built.params,
			detail,
		}
	}
}

export function runWriteProbe(port: SqlPort, role: DbRole): SearchStatus {
	if (role !== 'read_write') return 'permission_denied'
	try {
		port.execute("INSERT INTO loans VALUES(1900,'S101',10,'2026-10-24')")
		return 'ok'
	} catch {
		return 'permission_denied'
	}
}

export function runUsersProbe(port: SqlPort, role: DbRole): SearchStatus {
	if (role !== 'read_write') return 'permission_denied'
	try {
		port.query('SELECT student_id, display_name FROM users')
		return 'ok'
	} catch {
		return 'permission_denied'
	}
}

function rowsEqual(
	actual: readonly number[],
	expected: readonly number[],
): boolean {
	return (
		actual.length === expected.length &&
		actual.every((value, index) => value === expected[index])
	)
}

interface Probe {
	readonly input: SearchInput
	readonly expected: readonly number[]
}

const B_PROBES: readonly { id: string; probe: Probe }[] = [
	{ id: 'BV01', probe: { input: { title: 'redes' }, expected: [1001, 1003] } },
	{ id: 'BV02', probe: { input: { author: "O'Reilly" }, expected: [1002] } },
	{ id: 'BV03', probe: { input: { title: '%' }, expected: [1003] } },
	{ id: 'BV04', probe: { input: { author: 'Equipo_' }, expected: [1003] } },
	{ id: 'BV05', probe: { input: { title: 'zzz' }, expected: [] } },
	{ id: 'BV06', probe: { input: { date: '2026-10-21' }, expected: [1002] } },
	{ id: 'BV10', probe: { input: { page: 2 }, expected: [1003, 1007] } },
]

const CONTRAST = "')) > 0 OR 1=1 --"

export function verifyBibliotecaViva(
	config: BibliotecaVivaConfig,
	createPort: SqlPortFactory,
): ExerciseReport {
	const checks: CheckResult[] = []
	const run = (input: SearchInput, principal = 'S101') => {
		const port = createPort()
		try {
			return runSearch(port, { config, input, principal })
		} finally {
			port.close?.()
		}
	}
	const runWithSnapshot = (input: SearchInput, principal = 'S101') => {
		const port = createPort()
		try {
			const before = port.snapshot()
			const result = runSearch(port, { config, input, principal })
			const after = port.snapshot()
			return { result, unchanged: before === after }
		} finally {
			port.close?.()
		}
	}

	const bFailures = B_PROBES.filter(({ probe }) => {
		const { result } = runWithSnapshot(probe.input)
		return result.status !== 'ok' || !rowsEqual(result.rows, probe.expected)
	})
	checks.push({
		id: 'B89',
		kind: 'B',
		property:
			'Las búsquedas legítimas BV01–BV06/BV10 conservan filas, campos y paginación.',
		passed: bFailures.length === 0,
		evidence:
			bFailures.length === 0
				? 'BV01–BV06 y BV10 exactos'
				: `fallan ${bFailures.map((entry) => entry.id).join(',')}`,
	})

	const q1 = runWithSnapshot({ title: CONTRAST, page: 2 })
	const q2 = runWithSnapshot({ author: CONTRAST, page: 2 })
	const q3 = run({ date: '2026-02-30' })
	const q4 = run({ title: 'a'.repeat(81) })
	const q5 = run({ requestStudent: 'S102' })
	const q6 = run({}, 'S101')
	const missingPrincipal = createPort()
	const q7 = (() => {
		try {
			return runSearch(missingPrincipal, {
				config,
				input: {},
				principal: null,
			})
		} finally {
			missingPrincipal.close?.()
		}
	})()
	const q8 = (() => {
		const port = createPort()
		try {
			return runWriteProbe(port, config.dbRole)
		} finally {
			port.close?.()
		}
	})()
	const q9 = (() => {
		const port = createPort()
		try {
			return runUsersProbe(port, config.dbRole)
		} finally {
			port.close?.()
		}
	})()

	checks.push({
		id: 'Q89',
		kind: 'Q',
		property:
			'Los filtros no cambian la estructura de la consulta, la identidad viene de la sesión y los privilegios son mínimos.',
		passed:
			q1.result.status === 'ok' &&
			q1.result.rows.length === 0 &&
			q1.unchanged &&
			q2.result.status === 'ok' &&
			q2.result.rows.length === 0 &&
			q2.unchanged &&
			q3.status === 'validation_error' &&
			q4.status === 'validation_error' &&
			q5.status === 'ok' &&
			rowsEqual(q5.rows, [1001, 1002]) &&
			q6.status === 'ok' &&
			q7.status === 'unauthenticated' &&
			q8 === 'permission_denied' &&
			q9 === 'permission_denied',
		evidence: [
			`contraste-title=${q1.result.status}/${q1.result.rows.join(',') || 'vacío'}`,
			`contraste-author=${q2.result.status}/${q2.result.rows.join(',') || 'vacío'}`,
			`fecha=${q3.status}`,
			`81=${q4.status}`,
			`request_student=${q5.status}/${q5.rows.join(',')}`,
			`sin-sesión=${q7.status}`,
			`write-probe=${q8}`,
			`users-probe=${q9}`,
		].join('; '),
	})

	const brokenPort: SqlPort = {
		query() {
			throw new Error('SQLITE_IOERR; loans; /lab/bv.db')
		},
		execute() {},
		snapshot: () => '',
		close() {},
	}
	const hidden = runSearch(brokenPort, {
		config: { ...config, errorPolicy: 'public_id' },
		input: {},
		principal: 'S101',
	})
	checks.push({
		id: 'Q89-error',
		kind: 'Q',
		property:
			'El error público no expone detalle interno; el detalle queda en el inspector autorizado.',
		passed:
			config.errorPolicy === 'public_id' &&
			hidden.status === 'query_error' &&
			hidden.detail === undefined &&
			hidden.correlationId === 'BV-E14',
		evidence: `policy=${config.errorPolicy}; hidden=${hidden.status}/${hidden.correlationId ?? 'sin correlación'}`,
	})

	const c = run({}, 'S102')
	checks.push({
		id: 'C89',
		kind: 'C',
		property:
			'El principal S102 obtiene sus propios préstamos, no los de S101.',
		passed: c.status === 'ok' && rowsEqual(c.rows, [1004, 1005]),
		evidence: `${c.status}/${c.rows.join(',') || 'vacío'}`,
	})

	return buildReport('cwe-89-bibliotecaviva', checks, ['C89'])
}

export type BibliotecaVivaCommand =
	| {
			readonly kind: 'set_control'
			readonly control: keyof BibliotecaVivaConfig
			readonly value: string
	  }
	| { readonly kind: 'save_revision' }

export interface BibliotecaVivaState {
	readonly config: BibliotecaVivaConfig
	readonly revision: number
	readonly savedConfigs: readonly BibliotecaVivaConfig[]
}

export const CONSTRUCTOR_VALUES: readonly ConstructorKind[] = [
	'concat',
	'title_only',
	'named',
	'positional',
	'orm_raw',
]
export const ACTOR_VALUES: readonly ActorSource[] = [
	'session',
	'request',
	'fixed_S101',
	'none',
]
export const VALIDATION_VALUES: readonly ValidationKind[] = [
	'client_only',
	'typed',
]
export const ERROR_VALUES: readonly ErrorPolicy[] = ['raw', 'public_id']
export const ROLE_VALUES: readonly DbRole[] = [
	'read_write',
	'history_readonly',
	'disabled',
]

export function createBibliotecaVivaState(): BibliotecaVivaState {
	return { config: BV_CONFIG_INITIAL, revision: 0, savedConfigs: [] }
}

export function applyBibliotecaViva(
	state: BibliotecaVivaState,
	command: BibliotecaVivaCommand,
): OperationResult<BibliotecaVivaState> {
	if (command.kind === 'save_revision') {
		return applied(
			{
				...state,
				revision: state.revision + 1,
				savedConfigs: [...state.savedConfigs, state.config],
			},
			`revision:${state.revision + 1}`,
		)
	}

	const allowed: readonly string[] =
		command.control === 'constructor'
			? CONSTRUCTOR_VALUES
			: command.control === 'actorSource'
				? ACTOR_VALUES
				: command.control === 'validation'
					? VALIDATION_VALUES
					: command.control === 'errorPolicy'
						? ERROR_VALUES
						: ROLE_VALUES
	if (!allowed.includes(command.value)) {
		return reject(
			'CONFIGURATION_REJECTED',
			`Valor no admitido para ${command.control}: ${command.value}`,
		)
	}
	return applied(
		{
			...state,
			config: { ...state.config, [command.control]: command.value },
		},
		`control:${command.control}=${command.value}`,
	)
}
