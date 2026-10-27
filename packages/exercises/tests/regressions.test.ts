import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { describe, expect, it } from 'vitest'
import {
	createAndeanLogixState,
	dispatchAndeanLogix,
} from '../src/andeanlogix/model.js'
import {
	BV_SCHEMA,
	type DbRole,
	runSearch,
	type SqlParams,
	type SqlPort,
	verifyBibliotecaViva,
} from '../src/bibliotecaviva/model.js'
import {
	createNubeAndinaState,
	hmacHex,
	restoreSession,
} from '../src/nubeandina/model.js'
import {
	applyTalentoAndino,
	createTalentoAndinoState,
	type TaState,
	verifyTalentoAndino,
} from '../src/talentoandino/model.js'

function createPort(role: DbRole = 'read_write'): SqlPort {
	const directory = mkdtempSync(join(tmpdir(), 'bvr-'))
	const file = join(directory, 'bv.db')
	const writable = new DatabaseSync(file)
	writable.exec(BV_SCHEMA)
	writable.close()
	const db = new DatabaseSync(file, { readOnly: role === 'history_readonly' })
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
		snapshot: () => '',
		close() {
			db.close()
			rmSync(directory, { recursive: true, force: true })
		},
	}
}

const BV_REFERENCE = {
	constructor: 'named' as const,
	actorSource: 'session' as const,
	validation: 'typed' as const,
	errorPolicy: 'public_id' as const,
	dbRole: 'history_readonly' as const,
}

describe('bibliotecaViva regressions', () => {
	it('fails Q when the error policy leaks internal detail', () => {
		const report = verifyBibliotecaViva(
			{ ...BV_REFERENCE, errorPolicy: 'raw' },
			() => createPort(),
		)
		expect(report.Q).toBe(false)
		expect(
			report.checks.find((check) => check.id === 'Q89-error')?.passed,
		).toBe(false)
	})

	it('rejects non-text filters, unknown keys and out-of-domain pages before the DB', () => {
		const port = createPort()
		try {
			for (const input of [
				{ title: {} },
				{ title: ['redes'] },
				{ title: null },
				{ title: 'redes', evil: 1 },
				{ page: 0 },
				{ page: 5 },
				{ page: 555 },
			] as unknown as Parameters<typeof runSearch>[1]['input'][]) {
				for (const validation of ['typed', 'client_only'] as const) {
					const result = runSearch(port, {
						config: { ...BV_REFERENCE, validation },
						input,
						principal: 'S101',
					})
					if (result.status !== 'validation_error') {
						throw new Error(
							`${JSON.stringify(input)} con ${validation}: ${result.status}`,
						)
					}
					expect(result.sql).toBeNull()
				}
			}
		} finally {
			port.close()
		}
	})
})

describe('talentoAndino regressions', () => {
	const REFERENCE = {
		validation: 'V2' as const,
		size: 'L1' as const,
		name: 'N1' as const,
		storage: 'S1' as const,
		delivery: 'D1' as const,
		publication: 'P1' as const,
	}

	function delivered(storage: 'S0' | 'S1' | 'S2'): TaState {
		let state = createTalentoAndinoState({ ...REFERENCE, storage })
		for (const command of [
			{ kind: 'inventory' as const, action: 'quarantine' as const, id: 'LG02' },
			{ kind: 'inventory' as const, action: 'quarantine' as const, id: 'LG03' },
			{ kind: 'inventory' as const, action: 'migrate' as const, id: 'LG01' },
		]) {
			const result = applyTalentoAndino(state, command)
			if (!result.ok) throw new Error(result.code)
			state = result.state
		}
		return state
	}

	it('fails Q6 when the storage folder is public, even behind the handler', () => {
		const report = verifyTalentoAndino(delivered('S0'))
		expect(report.Q).toBe(false)
		expect(report.checks.find((check) => check.id === 'TA-Q6')?.passed).toBe(
			false,
		)
		expect(verifyTalentoAndino(delivered('S2')).Q).toBe(true)
	})
})

describe('andeanLogix regressions', () => {
	it('rejects an operation outside the catalogue and an unknown network', () => {
		const state = createAndeanLogixState()
		const unknownAction = dispatchAndeanLogix(state, {
			action: 'delete' as never,
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
		})
		expect(unknownAction).toMatchObject({
			status: 422,
			reason: 'not_supported',
			changed: false,
			reachedHandler: false,
		})

		const unknownNetwork = dispatchAndeanLogix(state, {
			action: 'cancel',
			method: 'POST',
			network: 'wan' as never,
			actor: 'dispatcher',
			payload: { reason: 'Prueba autorizada' },
		})
		expect(unknownNetwork).toMatchObject({
			status: 503,
			reason: 'connection_blocked',
			changed: false,
		})
		expect(state.shipments[0].status).toBe('in_transit')
	})
})

describe('nubeAndina regressions', () => {
	it('rejects an unknown document field as a schema error', async () => {
		const document = {
			type: 'WorkspaceSession',
			owner: 'org-7',
			expiresAt: '2026-10-20T11:00:00Z',
			filters: { track: 'security', pageSize: 20 },
			template: 'basic',
			preferences: { theme: 'dark' },
			extensions: [],
			extra: 'no admitido',
		}
		const json = JSON.stringify(document)
		const payload = btoa(json)
		const tag = await hmacHex(payload)
		const outcome = await restoreSession(
			createNubeAndinaState('N3', 'staged'),
			{
				kind: 'blob',
				payload,
				tag,
			},
		)
		expect(outcome.status).toBe('rejected')
		expect(outcome.reason).toBe('unknown_field')
	})
})
