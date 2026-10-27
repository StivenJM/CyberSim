import { describe, expect, it } from 'vitest'

import {
	applyNubeAndina,
	base64,
	createNubeAndinaState,
	documentById,
	hmacHex,
	ND_DOCUMENTS,
	ND_HMAC_KEY_HEX,
	restoreSession,
	sha256Document,
	verifyNubeAndina,
} from '../src/nubeandina/model.js'

const PUBLISHED: Readonly<Record<string, { bytes: number; sha: string }>> = {
	S01: {
		bytes: 189,
		sha: '88fb6894936a3923d7f6527cb6cc75c183b41d18f4ac90d4fe071e3a71c74633',
	},
	S02: {
		bytes: 188,
		sha: 'e8dc1e1ab9b6ee382dfa22d0ba95cd4d7ff618cd00620af7c4813e77473f5211',
	},
	S03: {
		bytes: 88,
		sha: 'bde8a3870e4d514f520f04147afb7045a375667255a16ef45f74c09063208be5',
	},
	S04: {
		bytes: 261,
		sha: '3b320235b6192835e05a453517cc8a9eb9d833d62db630a091dac6e1b6fb7cf5',
	},
	S05: {
		bytes: 204,
		sha: '1b7f722813d74b4342f870e82027637165846d91ec3cebfdb96f349e84701723',
	},
	S06: {
		bytes: 189,
		sha: '23901c02928f646e0b85aefc6a769eb194c05999cf47cd838991f60d4a096902',
	},
	S07: {
		bytes: 2699,
		sha: '948f4e3bfaf29db33e03c0fd6b6b4822cb84c9ddb8a618948fcfa4219bab8bfa',
	},
}

describe('nubeAndina fixtures', () => {
	it('reproduces the published bytes, SHA-256 and HMAC of S01–S07', async () => {
		for (const [id, expected] of Object.entries(PUBLISHED)) {
			const document = documentById(id)
			if (!document) throw new Error(`missing ${id}`)
			expect(new TextEncoder().encode(document.json).length).toBe(
				expected.bytes,
			)
			expect(await sha256Document(id)).toBe(expected.sha)
			expect(await hmacHex(base64(document.json))).toBe(document.tag)
		}
	})

	it('keeps the S08 tag as the published adversarial value', async () => {
		const s08 = documentById('S08')
		if (!s08) throw new Error('missing S08')
		const valid = await hmacHex(base64(s08.json))
		expect(valid).toBe(documentById('S01')?.tag)
		expect(s08.tag).not.toBe(valid)
		const flipped = Number.parseInt(valid.slice(0, 2), 16) ^ 1
		expect(s08.tag.slice(0, 2)).toBe(flipped.toString(16).padStart(2, '0'))
		expect(s08.tag.slice(2)).toBe(valid.slice(2))
	})

	it('uses a public 32-byte laboratory HMAC key', () => {
		expect(ND_HMAC_KEY_HEX).toBe('a1'.repeat(32))
		expect(ND_DOCUMENTS).toHaveLength(8)
	})
})

describe('nubeAndina exercise', () => {
	it('starts restoring data while accepting invalid authenticators and hooks', async () => {
		const report = await verifyNubeAndina(createNubeAndinaState('N0', 'eager'))

		expect(report.B).toBe(true)
		expect(report.Q).toBe(false)
		expect(report.C['NA-C1']).toBe(false)
	})

	it('reaches B, Q and C with N3, N4 or N6 and staged publication', async () => {
		for (const diff of ['N3', 'N4', 'N6'] as const) {
			const report = await verifyNubeAndina(
				createNubeAndinaState(diff, 'staged'),
			)
			if (!report.B || !report.Q || !report.C['NA-C1']) {
				throw new Error(
					`${diff}: ${report.checks
						.filter((check) => !check.passed)
						.map((check) => `${check.id}=${check.evidence}`)
						.join(' | ')}`,
				)
			}
			expect(report.residualExposure).toBe(false)
		}
	})

	it('fails Q for N1, N2, N5 and also for eager publication', async () => {
		for (const diff of ['N1', 'N2', 'N5'] as const) {
			expect(
				(await verifyNubeAndina(createNubeAndinaState(diff, 'staged'))).Q,
			).toBe(false)
		}
		const eager = await verifyNubeAndina(createNubeAndinaState('N3', 'eager'))
		expect(eager.B).toBe(true)
		expect(eager.Q).toBe(true)
		expect(eager.C['NA-C1']).toBe(false)
		expect(eager.residualExposure).toBe(true)
	})

	it('keeps the root-type check of N2 while S04 remains dangerous', async () => {
		const report = await verifyNubeAndina(createNubeAndinaState('N2', 'staged'))
		expect(report.checks.find((check) => check.id === 'NA-Q1')?.passed).toBe(
			true,
		)
		expect(report.checks.find((check) => check.id === 'NA-Q2')?.passed).toBe(
			false,
		)
	})

	it('rejects a handle with a trailing space instead of normalizing it', async () => {
		const state = createNubeAndinaState('N4', 'staged')
		const outcome = await restoreSession(state, {
			kind: 'handle',
			handle: 'SID-7-A ',
		})
		expect(outcome.status).toBe('rejected')
		expect(outcome.reason).toBe('invalid_handle')
	})

	it('rejects S07 by size before rebuilding', async () => {
		const document = documentById('S07')
		if (!document) throw new Error('missing S07')
		const outcome = await restoreSession(
			createNubeAndinaState('N3', 'staged'),
			{
				kind: 'blob',
				payload: base64(document.json),
				tag: document.tag,
			},
		)
		expect(outcome.status).toBe('rejected')
		expect(outcome.reason).toBe('size')
		expect(outcome.state.published.restarts).toBe(0)
	})

	it('accepts an unknown diff only through the closed catalogue', () => {
		expect(
			applyNubeAndina(createNubeAndinaState(), {
				kind: 'select_diff',
				diff: 'N9' as never,
			}),
		).toMatchObject({ ok: false, code: 'CONFIGURATION_REJECTED' })
		expect(
			applyNubeAndina(createNubeAndinaState(), {
				kind: 'select_commit',
				commit: 'staged',
			}),
		).toMatchObject({ ok: true })
	})
})
