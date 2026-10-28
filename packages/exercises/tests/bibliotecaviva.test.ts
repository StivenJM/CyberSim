import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { describe, expect, it } from 'vitest'

import {
	applyBibliotecaViva,
	BV_CONFIG_INITIAL,
	BV_SCHEMA,
	buildHistoryQuery,
	createBibliotecaVivaState,
	type DbRole,
	runSearch,
	type SqlParams,
	type SqlPort,
	verifyBibliotecaViva,
} from '../src/bibliotecaviva/model.js'

function createPort(role: DbRole = 'read_write'): SqlPort {
	const directory = mkdtempSync(join(tmpdir(), 'bv-'))
	const file = join(directory, 'bv.db')
	const writable = new DatabaseSync(file)
	writable.exec(BV_SCHEMA)
	writable.close()

	const db = new DatabaseSync(file, { readOnly: role === 'history_readonly' })
	const rows = () => {
		const loans = db.prepare('SELECT * FROM loans ORDER BY loan_id').all()
		const books = db.prepare('SELECT * FROM books ORDER BY book_id').all()
		const users = db.prepare('SELECT * FROM users ORDER BY student_id').all()
		return JSON.stringify({ loans, books, users })
	}

	return {
		query(sql: string, params?: SqlParams) {
			const statement = db.prepare(sql)
			if (params === undefined) return statement.all()
			return Array.isArray(params)
				? statement.all(...(params as never[]))
				: statement.all(params as Record<string, never>)
		},
		execute(sql: string, params?: SqlParams) {
			const statement = db.prepare(sql)
			if (params === undefined) statement.run()
			else if (Array.isArray(params)) statement.run(...(params as never[]))
			else statement.run(params as Record<string, never>)
		},
		snapshot: rows,
		close() {
			db.close()
			rmSync(directory, { recursive: true, force: true })
		},
	}
}

const REFERENCE = {
	constructor: 'named' as const,
	actorSource: 'session' as const,
	validation: 'typed' as const,
	errorPolicy: 'public_id' as const,
	dbRole: 'history_readonly' as const,
}

describe('bibliotecaViva query construction', () => {
	it('keeps the reference safe query bound for every value', () => {
		const built = buildHistoryQuery(REFERENCE, { title: 'redes' }, 'S101')
		expect(built.interpolated).toEqual([])
		expect(built.sql).toContain(':title')
		expect(built.sql).not.toContain("'redes'")
		expect(built.params).toMatchObject({ title: 'redes', actor: 'S101' })
	})

	it('interpolates values in the vulnerable constructors, including orm_raw', () => {
		for (const kind of ['concat', 'orm_raw'] as const) {
			const built = buildHistoryQuery(
				{ ...REFERENCE, constructor: kind },
				{ title: "')) > 0 OR 1=1 --" },
				'S101',
			)
			expect(built.interpolated.length).toBeGreaterThan(0)
			expect(built.sql).toContain('OR 1=1')
		}
		const titleOnly = buildHistoryQuery(
			{ ...REFERENCE, constructor: 'title_only' },
			{ title: "O'Reilly", author: "O'Reilly" },
			'S101',
		)
		expect(titleOnly.params).toMatchObject({ title: "O'Reilly" })
		expect(titleOnly.interpolated).toContain("O'Reilly")
	})

	it('does not bind the owner when actor_source is none', () => {
		const built = buildHistoryQuery(
			{ ...REFERENCE, actorSource: 'none' },
			{},
			'S101',
		)
		expect(built.sql).not.toContain('AND l.student_id=')
	})
})

describe('bibliotecaViva exercise', () => {
	it('starts broken for a legitimate surname and failing protection', () => {
		const report = verifyBibliotecaViva(BV_CONFIG_INITIAL, () => createPort())

		expect(report.B).toBe(false)
		expect(report.Q).toBe(false)
		expect(report.C.C89).toBe(true)
	})

	it('accepts the named reference route', () => {
		const report = verifyBibliotecaViva(REFERENCE, () => createPort())
		expect(report.B).toBe(true)
		expect(report.Q).toBe(true)
		expect(report.C.C89).toBe(true)
		expect(report.residualExposure).toBe(false)
	})

	it('accepts the positional route with the same properties', () => {
		const report = verifyBibliotecaViva(
			{ ...REFERENCE, constructor: 'positional' },
			() => createPort(),
		)
		expect(report.Q).toBe(true)
	})

	it.each([
		['title_only', { ...REFERENCE, constructor: 'title_only' as const }],
		['orm_raw', { ...REFERENCE, constructor: 'orm_raw' as const }],
		[
			'identidad por request',
			{ ...REFERENCE, actorSource: 'request' as const },
		],
		[
			'validación solo cliente',
			{ ...REFERENCE, validation: 'client_only' as const },
		],
		['rol de escritura', { ...REFERENCE, dbRole: 'read_write' as const }],
		[
			'error crudo con escritura',
			{
				...REFERENCE,
				errorPolicy: 'raw' as const,
				dbRole: 'read_write' as const,
			},
		],
	])('fails Q for %s', (_name, config) => {
		expect(verifyBibliotecaViva(config, () => createPort()).Q).toBe(false)
	})

	it('fails the legitimate function with a disabled account', () => {
		const report = verifyBibliotecaViva(
			{ ...REFERENCE, dbRole: 'disabled' },
			() => createPort(),
		)
		expect(report.B).toBe(false)
	})

	it('detects a hardcoded S101 even when the core battery passes', () => {
		const report = verifyBibliotecaViva(
			{ ...REFERENCE, actorSource: 'fixed_S101' },
			() => createPort(),
		)
		expect(report.B).toBe(true)
		expect(report.C.C89).toBe(false)
		expect(report.residualExposure).toBe(true)
	})

	it('rejects an invalid date before touching the database', () => {
		const port = createPort()
		try {
			const result = runSearch(port, {
				config: REFERENCE,
				input: { date: '2026-02-30' },
				principal: 'S101',
			})
			expect(result.status).toBe('validation_error')
			expect(result.sql).toBeNull()
		} finally {
			port.close()
		}
	})

	it('hides internal detail under public_id but keeps it for the authorized inspector', () => {
		const brokenPort: SqlPort = {
			query() {
				throw new Error('SQLITE_IOERR; loans; /lab/bv.db')
			},
			execute() {},
			snapshot: () => '',
			close() {},
		}
		const hidden = runSearch(brokenPort, {
			config: REFERENCE,
			input: {},
			principal: 'S101',
		})
		expect(hidden.status).toBe('query_error')
		expect(hidden.correlationId).toBe('BV-E14')
		expect(hidden.detail).toBeUndefined()

		const raw = runSearch(brokenPort, {
			config: { ...REFERENCE, errorPolicy: 'raw' },
			input: {},
			principal: 'S101',
		})
		expect(raw.detail).toContain('SQLITE_IOERR')
	})

	it('keeps the physical write denied on a read-only connection', () => {
		const port = createPort('history_readonly')
		try {
			expect(() =>
				port.execute("INSERT INTO loans VALUES(1900,'S101',10,'2026-10-24')"),
			).toThrow()
		} finally {
			port.close()
		}
	})

	it('rejects an unsupported control value without changing the revision', () => {
		const state = createBibliotecaVivaState()
		const rejected = applyBibliotecaViva(state, {
			kind: 'set_control',
			control: 'constructor',
			value: 'string_concatenation_v2',
		})
		expect(rejected).toMatchObject({
			ok: false,
			code: 'CONFIGURATION_REJECTED',
		})
		const accepted = applyBibliotecaViva(state, {
			kind: 'set_control',
			control: 'constructor',
			value: 'named',
		})
		expect(accepted.ok && accepted.state.config.constructor).toBe('named')
		expect(state.config.constructor).toBe('concat')
	})
})
