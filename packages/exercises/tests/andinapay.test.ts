import { describe, expect, it } from 'vitest'
import { decryptEnvelope } from '../src/andinapay/crypto.js'
import {
	ANDINAPAY_ENVELOPES,
	ANDINAPAY_KEYS,
	ANDINAPAY_PLAINTEXT,
	envelopeFor,
} from '../src/andinapay/fixtures.js'
import {
	type AndinaPayState,
	applyAndinaPay,
	createAndinaPayState,
	readRecord,
	verifyAndinaPay,
} from '../src/andinapay/model.js'

async function recovered(): Promise<AndinaPayState> {
	let state = createAndinaPayState()
	state = unwrap(
		await applyAndinaPay(state, {
			kind: 'submit_diagnosis',
			text: 'La clave de una versión anterior cifró R01 y R02.',
		}),
	)
	state = unwrap(
		await applyAndinaPay(state, { kind: 'stage_key', keyId: 'recovery-v2' }),
	)
	state = unwrap(
		await applyAndinaPay(state, {
			kind: 'set_key_source',
			source: 'restricted-key-service',
		}),
	)
	state = unwrap(
		await applyAndinaPay(state, {
			kind: 'rekey_records',
			records: ['R01', 'R02'],
		}),
	)
	state = unwrap(await applyAndinaPay(state, { kind: 'commit_recovery' }))
	return state
}

function unwrap(
	result: Awaited<ReturnType<typeof applyAndinaPay>>,
): AndinaPayState {
	if (!result.ok) throw new Error(`${result.code}: ${result.detail}`)
	return result.state
}

describe('andinaPay fixtures', () => {
	it('decrypts the seven published envelopes with ciphertext||tag', async () => {
		expect(ANDINAPAY_ENVELOPES).toHaveLength(7)
		for (const envelope of ANDINAPAY_ENVELOPES) {
			const decision = await decryptEnvelope(
				envelope,
				ANDINAPAY_KEYS[envelope.keyId],
			)
			expect(decision).toEqual({
				ok: true,
				plaintext: ANDINAPAY_PLAINTEXT[envelope.recordId],
			})
		}
	})

	it('rejects a wrong key without returning partial plaintext', async () => {
		const envelope = envelopeFor('R01', 'legacy-demo', 1)
		if (!envelope) throw new Error('missing fixture')
		const decision = await decryptEnvelope(
			envelope,
			ANDINAPAY_KEYS['recovery-v2'],
		)
		expect(decision).toEqual({
			ok: false,
			code: 'AUTHENTICATION_FAILED',
			detail: 'AUTHENTICATION_FAILED',
		})
	})

	it('rejects an altered tag and a malformed envelope', async () => {
		const envelope = envelopeFor('R01', 'legacy-demo', 1)
		if (!envelope) throw new Error('missing fixture')
		const flipped = {
			...envelope,
			tagHex: `00${envelope.tagHex.slice(2)}`,
		}
		expect(
			(await decryptEnvelope(flipped, ANDINAPAY_KEYS['legacy-demo'])).ok,
		).toBe(false)
		expect(
			await decryptEnvelope(
				{ ...envelope, ivHex: 'x' },
				ANDINAPAY_KEYS['legacy-demo'],
			),
		).toMatchObject({ ok: false, code: 'INVALID_ENVELOPE' })
	})
})

describe('andinaPay exercise', () => {
	it('starts with the legitimate function working and the protection failing', async () => {
		const report = await verifyAndinaPay(createAndinaPayState())

		expect(report.B).toBe(true)
		expect(report.Q).toBe(false)
		expect(report.C.C1).toBe(true)
		expect(report.C.C2).toBe(true)
		expect(report.C.C3).toBe(true)
		expect(report.C.C4).toBe(false)
	})

	it('reaches B and Q through the declared recovery route', async () => {
		const report = await verifyAndinaPay(await recovered())

		expect(report.B).toBe(true)
		expect(report.Q).toBe(true)
		expect(report.C.C4).toBe(false)
		expect(report.residualExposure).toBe(true)
	})

	it('fails the legitimate function when K1 is retired before migrating', async () => {
		const state = unwrap(
			await applyAndinaPay(createAndinaPayState(), {
				kind: 'retire_key_early',
				keyId: 'legacy-demo',
			}),
		)
		const read = await readRecord(state, 'R01')
		expect(read).toEqual({ ok: false, code: 'KEY_RETIRED' })
		expect((await verifyAndinaPay(state)).B).toBe(false)
	})

	it('restores K1 only while the recovery is unpublished', async () => {
		const retired = unwrap(
			await applyAndinaPay(createAndinaPayState(), {
				kind: 'retire_key_early',
				keyId: 'legacy-demo',
			}),
		)
		const restored = unwrap(
			await applyAndinaPay(retired, {
				kind: 'restore_key_for_recovery',
				keyId: 'legacy-demo',
			}),
		)
		expect((await readRecord(restored, 'R01')).ok).toBe(true)

		const commit = await applyAndinaPay(await recovered(), {
			kind: 'restore_key_for_recovery',
			keyId: 'legacy-demo',
		})
		expect(commit).toMatchObject({
			ok: false,
			code: 'RECOVERY_ALREADY_COMMITTED',
		})
	})

	it('does not publish an incomplete recovery', async () => {
		const before = createAndinaPayState()
		const outcome = await applyAndinaPay(before, { kind: 'commit_recovery' })

		expect(outcome).toMatchObject({ ok: false, code: 'MIGRATION_INCOMPLETE' })
		expect(JSON.stringify(before)).toBe(JSON.stringify(createAndinaPayState()))
	})

	it('rejects an unknown key, an unknown check and an empty diagnosis', async () => {
		const state = createAndinaPayState()
		expect(
			await applyAndinaPay(state, { kind: 'stage_key', keyId: 'invented' }),
		).toMatchObject({ ok: false, code: 'UNKNOWN_KEY' })
		expect(
			await applyAndinaPay(state, { kind: 'run_check', checkId: 'Z9' }),
		).toMatchObject({ ok: false, code: 'UNKNOWN_CHECK' })
		expect(
			await applyAndinaPay(state, { kind: 'submit_diagnosis', text: '   ' }),
		).toMatchObject({ ok: false, code: 'DIAGNOSIS_REQUIRED' })
	})

	it('requires a prior artifact before the report and freezes the delivery', async () => {
		const state = createAndinaPayState()
		expect(
			await applyAndinaPay(state, { kind: 'submit_report', text: 'Informe.' }),
		).toMatchObject({ ok: false, code: 'ARTIFACT_NOT_SUBMITTED' })

		const diagnosed = unwrap(
			await applyAndinaPay(state, {
				kind: 'submit_diagnosis',
				text: 'Diagnóstico provisional.',
			}),
		)
		const delivered = unwrap(
			await applyAndinaPay(diagnosed, { kind: 'submit_artifact' }),
		)
		expect(
			await applyAndinaPay(delivered, {
				kind: 'configure_prevention',
				scope: 'history-and-new-diff',
				exceptionPolicy: 'review-required',
			}),
		).toMatchObject({ ok: false, code: 'ARTIFACT_FROZEN' })
		const report = await applyAndinaPay(delivered, {
			kind: 'submit_report',
			text: 'Informe final.',
		})
		expect(report.ok).toBe(true)
	})

	it('runs a single declared check and records its result', async () => {
		const state = unwrap(
			await applyAndinaPay(createAndinaPayState(), {
				kind: 'run_check',
				checkId: 'Q1',
			}),
		)
		expect(state.checks).toEqual([{ checkId: 'Q1', passed: false }])
	})
})
