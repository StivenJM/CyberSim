import { INVESTIGATED_CASE_IDS } from '@cybersim/scenario-contract'
import { describe, expect, it } from 'vitest'

import { type AdapterResult, adapterFor } from '../src/adapters.js'

function ok(result: AdapterResult): unknown {
	if (!result.ok) throw new Error(result.error)
	return result.state
}

describe('exercise bench adapters', () => {
	it('exposes an adapter for every canonical case', () => {
		for (const caseId of INVESTIGATED_CASE_IDS) {
			expect(adapterFor(caseId)?.caseId).toBe(caseId)
		}
		expect(adapterFor('cwe-999')).toBeUndefined()
	})

	it('drives AndinaPay through the declared recovery actions', async () => {
		const adapter = adapterFor('cwe-321-andinapay')
		if (!adapter) throw new Error('missing adapter')
		let state = adapter.initialState()
		for (const action of adapter.actions) {
			state = ok(await action.apply(state))
		}
		const verification = await adapter.verify(state)
		if (verification.kind !== 'ok') throw new Error('unavailable')
		expect(verification.report.B).toBe(true)
		expect(verification.report.Q).toBe(true)
	})

	it('drives TalentoAndino from policy to a contained delivery', async () => {
		const adapter = adapterFor('cwe-434-talentoandino')
		if (!adapter) throw new Error('missing adapter')
		let state = adapter.initialState()
		const wanted: Readonly<Record<string, string>> = {
			validation: 'V2',
			size: 'L1',
			name: 'N1',
			storage: 'S1',
			delivery: 'D1',
			publication: 'P1',
		}
		for (const control of adapter.controls) {
			state = ok(control.apply(state, wanted[control.id]))
		}
		for (const action of adapter.actions) {
			state = ok(await action.apply(state))
		}
		const verification = await adapter.verify(state)
		if (verification.kind !== 'ok') throw new Error('unavailable')
		expect(verification.report.B).toBe(true)
		expect(verification.report.Q).toBe(true)
		expect(verification.report.C['TA-C1']).toBe(true)
	})

	it('drives AndeanLogix to B, Q and C', async () => {
		const adapter = adapterFor('cwe-306-andeanlogix')
		if (!adapter) throw new Error('missing adapter')
		let state = adapter.initialState()
		const wanted: Readonly<Record<string, string>> = {
			guard: 'server_roles',
			maintenanceBypass: 'false',
			adminIngress: 'ops_only',
			adminService: 'true',
			publicTracking: 'true',
		}
		for (const control of adapter.controls) {
			state = ok(control.apply(state, wanted[control.id]))
		}
		const verification = await adapter.verify(state)
		if (verification.kind !== 'ok') throw new Error('unavailable')
		expect(verification.report.B).toBe(true)
		expect(verification.report.Q).toBe(true)
		expect(verification.report.C.C306).toBe(true)
	})

	it('drives NubeAndina to N6 with staged publication', async () => {
		const adapter = adapterFor('cwe-502-nubeandina')
		if (!adapter) throw new Error('missing adapter')
		let state = adapter.initialState()
		for (const control of adapter.controls) {
			state = ok(control.apply(state, control.id === 'diff' ? 'N6' : 'staged'))
		}
		const verification = await adapter.verify(state)
		if (verification.kind !== 'ok') throw new Error('unavailable')
		expect(verification.report.B).toBe(true)
		expect(verification.report.Q).toBe(true)
		expect(verification.report.C['NA-C1']).toBe(true)
	})

	it('keeps the SQL case configurable but declares its bench unavailable', async () => {
		const adapter = adapterFor('cwe-89-bibliotecaviva')
		if (!adapter) throw new Error('missing adapter')
		let state = adapter.initialState()
		for (const control of adapter.controls) {
			state = ok(control.apply(state, control.options[0].value))
		}
		expect(await adapter.verify(state)).toMatchObject({ kind: 'unavailable' })
	})

	it('reports a rejected control without mutating the state', () => {
		const adapter = adapterFor('cwe-306-andeanlogix')
		if (!adapter) throw new Error('missing adapter')
		const guard = adapter.controls.find((control) => control.id === 'guard')
		if (!guard) throw new Error('missing control')
		const state = adapter.initialState()
		expect(guard.apply(state, 'login_button')).toMatchObject({ ok: false })
		expect(guard.current(state)).toBe('ui_only')
	})
})
