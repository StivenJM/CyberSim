import { createRequire } from 'node:module'
import {
	BIBLIOTECAVIVA_REFERENCE,
	BV_CONFIG_INITIAL,
	BV_SCHEMA,
	verifyBibliotecaViva,
} from '@cybersim/exercises'
import initSqlJs from 'sql.js'
import { describe, expect, it } from 'vitest'

import { createSqlJsPort } from '../src/visual/features/ejercicios/worker/sqljsPort'

const require = createRequire(import.meta.url)
const wasm = require.resolve('sql.js/dist/sql-wasm.wasm')

async function engine() {
	return initSqlJs({ locateFile: () => wasm })
}

describe('sql.js bench', () => {
	it('runs the declared SQLite battery on the same engine as the Worker', async () => {
		const SQL = await engine()
		const report = verifyBibliotecaViva(BV_CONFIG_INITIAL, () =>
			createSqlJsPort(SQL, BV_SCHEMA),
		)

		expect(report.B).toBe(false)
		expect(report.Q).toBe(false)
		expect(
			report.checks.find((check) => check.id === 'Q89-error')?.passed,
		).toBe(false)
	})

	it('accepts the named reference route under sql.js', async () => {
		const SQL = await engine()
		const report = verifyBibliotecaViva(BIBLIOTECAVIVA_REFERENCE, () =>
			createSqlJsPort(SQL, BV_SCHEMA),
		)

		expect(report.B).toBe(true)
		expect(report.Q).toBe(true)
		expect(report.C.C89).toBe(true)
	})

	it('keeps a fresh database per probe', async () => {
		const SQL = await engine()
		const first = createSqlJsPort(SQL, BV_SCHEMA)
		const second = createSqlJsPort(SQL, BV_SCHEMA)
		try {
			first.execute("INSERT INTO loans VALUES(1900,'S101',10,'2026-10-24')")
			expect(first.snapshot()).not.toBe(second.snapshot())
			expect(second.snapshot()).not.toContain('1900')
		} finally {
			first.close()
			second.close()
		}
	})
})
