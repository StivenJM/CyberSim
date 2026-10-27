import { describe, expect, it } from 'vitest'

import {
	applyTalentoAndino,
	createTalentoAndinoState,
	TA_POLICY_INITIAL,
	type TaPolicy,
	type TaState,
	verifyTalentoAndino,
} from '../src/talentoandino/model.js'

const REFERENCE: TaPolicy = {
	validation: 'V2',
	size: 'L1',
	name: 'N1',
	storage: 'S1',
	delivery: 'D1',
	publication: 'P1',
}

function delivered(policy: TaPolicy = REFERENCE): TaState {
	let state = createTalentoAndinoState(policy)
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

describe('talentoAndino exercise', () => {
	it('starts accepting dangerous and oversized uploads', () => {
		const report = verifyTalentoAndino(createTalentoAndinoState())

		expect(report.B).toBe(true)
		expect(report.Q).toBe(false)
		expect(report.C['TA-C1']).toBe(false)
	})

	it('reaches B, Q and C with V2/L1/N1 and a contained delivery', () => {
		const report = verifyTalentoAndino(delivered())

		expect(report.B).toBe(true)
		expect(report.Q).toBe(true)
		expect(report.C['TA-C1']).toBe(true)
		expect(report.residualExposure).toBe(false)
		for (const check of report.checks) {
			if (!check.passed) throw new Error(`${check.id}: ${check.evidence}`)
		}
	})

	it('accepts either S1 or S2 as containment', () => {
		expect(
			verifyTalentoAndino(delivered({ ...REFERENCE, storage: 'S2' })).Q,
		).toBe(true)
	})

	it('fails Q when only extension and declared MIME are checked', () => {
		const report = verifyTalentoAndino(
			delivered({ ...REFERENCE, validation: 'V1' }),
		)
		expect(report.Q).toBe(false)
	})

	it('fails Q without server-side size limits', () => {
		const report = verifyTalentoAndino(delivered({ ...REFERENCE, size: 'L0' }))
		expect(report.Q).toBe(false)
	})

	it('fails Q with the original name as path', () => {
		const report = verifyTalentoAndino(delivered({ ...REFERENCE, name: 'N0' }))
		expect(report.Q).toBe(false)
	})

	it('fails Q when the handler can be bypassed by a public origin', () => {
		const report = verifyTalentoAndino(
			delivered({ ...REFERENCE, storage: 'S0', delivery: 'D0' }),
		)
		expect(report.Q).toBe(false)
	})

	it('fails C and reports residual exposure with provisional publication', () => {
		const report = verifyTalentoAndino(
			delivered({ ...REFERENCE, publication: 'P0' }),
		)
		expect(report.C['TA-C1']).toBe(false)
		expect(report.residualExposure).toBe(true)
	})

	it('destroys the legitimate function by quarantining everything', () => {
		let state = createTalentoAndinoState(REFERENCE)
		for (const id of ['LG01', 'LG02', 'LG03']) {
			const result = applyTalentoAndino(state, {
				kind: 'inventory',
				action: 'quarantine',
				id,
			})
			if (result.ok) state = result.state
		}
		expect(verifyTalentoAndino(state).B).toBe(false)
	})

	it('rejects an unsupported policy value and an unknown fixture', () => {
		const state = createTalentoAndinoState()
		expect(
			applyTalentoAndino(state, {
				kind: 'configure',
				field: 'validation',
				value: 'V9',
			}),
		).toMatchObject({ ok: false, code: 'CONFIGURATION_REJECTED' })
		expect(
			applyTalentoAndino(state, { kind: 'receive', fixtureId: 'T99' }),
		).toMatchObject({ ok: false, code: 'UNSUPPORTED_INPUT' })
	})

	it('assigns chronological handles independently from internal names', () => {
		let state = createTalentoAndinoState(REFERENCE)
		const first = applyTalentoAndino(state, {
			kind: 'receive',
			fixtureId: 'T01',
		})
		if (!first.ok) throw new Error(first.code)
		state = first.state
		const second = applyTalentoAndino(state, {
			kind: 'receive',
			fixtureId: 'T02',
		})
		if (!second.ok) throw new Error(second.code)
		expect(second.state.pending.map((entry) => entry.handle)).toEqual([
			'TA-PENDING-1',
			'TA-PENDING-2',
		])
		expect(second.state.nextInternalId).toBe(100)
	})

	it('keeps the legacy inventory when the delivered policy is applied', () => {
		const report = verifyTalentoAndino(delivered())
		expect(report.checks.find((check) => check.id === 'TA-B2')?.passed).toBe(
			true,
		)
	})

	it('uses the initial policy as the documented start', () => {
		expect(TA_POLICY_INITIAL).toEqual({
			validation: 'V0',
			size: 'L0',
			name: 'N0',
			storage: 'S0',
			delivery: 'D0',
			publication: 'P0',
		})
	})
})
