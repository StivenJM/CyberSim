import { describe, expect, it } from 'vitest'

import {
	AL_CONFIG_INITIAL,
	type AlConfig,
	applyAndeanLogix,
	createAndeanLogixState,
	dispatchAndeanLogix,
	verifyAndeanLogix,
} from '../src/andeanlogix/model.js'

const REFERENCE: AlConfig = {
	guard: 'server_roles',
	maintenanceBypass: false,
	adminIngress: 'ops_only',
	adminService: true,
	publicTracking: true,
}

function unwrap<T extends { ok: boolean }>(result: T): T {
	if (!result.ok) throw new Error('rejected')
	return result
}

describe('andeanLogix exercise', () => {
	it('starts with the legitimate function working and the matrix broken', () => {
		const report = verifyAndeanLogix(createAndeanLogixState())

		expect(report.B).toBe(true)
		expect(report.Q).toBe(false)
		expect(report.C.C306).toBe(false)
	})

	it('reaches B, Q and C with server_roles and the mandated configuration', () => {
		const report = verifyAndeanLogix(createAndeanLogixState(REFERENCE))

		expect(report.B).toBe(true)
		expect(report.Q).toBe(true)
		expect(report.C.C306).toBe(true)
		expect(report.residualExposure).toBe(false)
		for (const check of report.checks) {
			if (!check.passed) throw new Error(`${check.id}: ${check.evidence}`)
		}
	})

	it('accepts public ingress for B and Q but reports residual exposure', () => {
		const report = verifyAndeanLogix(
			createAndeanLogixState({ ...REFERENCE, adminIngress: 'public_and_ops' }),
		)
		expect(report.B).toBe(true)
		expect(report.Q).toBe(true)
		expect(report.C.C306).toBe(false)
		expect(report.residualExposure).toBe(true)
	})

	it('fails Q for ui_only, cancel_only, session_only and request_roles', () => {
		for (const guard of [
			'ui_only',
			'cancel_only',
			'session_only',
			'request_roles',
		] as const) {
			expect(
				verifyAndeanLogix(createAndeanLogixState({ ...REFERENCE, guard })).Q,
			).toBe(false)
		}
	})

	it('fails Q when the maintenance bypass stays enabled', () => {
		const report = verifyAndeanLogix(
			createAndeanLogixState({ ...REFERENCE, maintenanceBypass: true }),
		)
		expect(report.Q).toBe(false)
	})

	it('fails B when the legitimate operator is locked out', () => {
		for (const config of [
			{ ...REFERENCE, adminIngress: 'closed' as const },
			{ ...REFERENCE, adminService: false },
			{ ...REFERENCE, publicTracking: false },
		]) {
			expect(verifyAndeanLogix(createAndeanLogixState(config)).B).toBe(false)
		}
	})

	it('returns 405 for GET on administrative functions without mutating', () => {
		const state = createAndeanLogixState(REFERENCE)
		const decision = dispatchAndeanLogix(state, {
			action: 'cancel',
			method: 'GET',
			network: 'ops',
			actor: 'dispatcher',
		})
		expect(decision.status).toBe(405)
		expect(decision.changed).toBe(false)
		expect(decision.state.shipments[0].status).toBe('in_transit')
	})

	it('keeps a rejection free of business mutation', () => {
		const state = createAndeanLogixState(REFERENCE)
		const before = JSON.stringify({
			shipments: state.shipments,
			drivers: state.drivers,
		})
		const decision = dispatchAndeanLogix(state, {
			action: 'cancel',
			method: 'POST',
			network: 'ops',
			actor: 'customer',
			payload: { reason: 'Prueba autorizada' },
		})
		expect(decision.status).toBe(403)
		expect(
			JSON.stringify({
				shipments: decision.state.shipments,
				drivers: decision.state.drivers,
			}),
		).toBe(before)
	})

	it('returns 409 when cancel or reassign repeats an already settled state', () => {
		let state = createAndeanLogixState(REFERENCE)
		state = unwrap(
			applyAndeanLogix(state, { kind: 'set_maintenance', value: false }),
		).state
		const first = dispatchAndeanLogix(state, {
			action: 'cancel',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			payload: { reason: 'Prueba autorizada' },
		})
		expect(first.status).toBe(200)
		const again = dispatchAndeanLogix(first.state, {
			action: 'cancel',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			payload: { reason: 'Prueba autorizada' },
		})
		expect(again.status).toBe(409)

		const same = dispatchAndeanLogix(createAndeanLogixState(REFERENCE), {
			action: 'reassign',
			method: 'POST',
			network: 'ops',
			actor: 'dispatcher',
			payload: { route: 'R2' },
		})
		expect(same.status).toBe(409)
	})

	it('rejects an unsupported configuration value', () => {
		expect(
			applyAndeanLogix(createAndeanLogixState(), {
				kind: 'configure',
				field: 'guard',
				value: 'login_button',
			}),
		).toMatchObject({ ok: false, code: 'CONFIGURATION_REJECTED' })
	})

	it('keeps the documented initial configuration', () => {
		expect(AL_CONFIG_INITIAL).toEqual({
			guard: 'ui_only',
			maintenanceBypass: true,
			adminIngress: 'public_and_ops',
			adminService: true,
			publicTracking: true,
		})
	})
})
