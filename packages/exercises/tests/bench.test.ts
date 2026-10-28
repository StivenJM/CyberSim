import { describe, expect, it } from 'vitest'

import {
	BENCH_DEFAULT_TIMEOUT_MS,
	benchIncident,
	runInBench,
} from '../src/bench.js'

describe('test bench budget', () => {
	it('returns the value when the work finishes inside the budget', async () => {
		const outcome = await runInBench(async () => 'ok', { timeoutMs: 500 })
		expect(outcome.status).toBe('ok')
		if (outcome.status !== 'ok') return
		expect(outcome.value).toBe('ok')
	})

	it('turns a timeout into a technical incident, not a domain rejection', async () => {
		const outcome = await runInBench(
			() =>
				new Promise<string>((resolve) => {
					setTimeout(() => resolve('late'), 200)
				}),
			{ timeoutMs: 10 },
		)
		expect(outcome).toMatchObject({
			status: 'technical_error',
			code: 'BENCH_TIMEOUT',
		})
		if (outcome.status !== 'technical_error') return
		expect(outcome.detail).toContain('10 ms')
		expect(outcome.detail).not.toMatch(/ataque|bloquead|segur/i)
	})

	it('turns a crash into a technical incident with its cause', async () => {
		const outcome = await runInBench(async () => {
			throw new Error('worker terminated')
		})
		expect(outcome).toMatchObject({
			status: 'technical_error',
			code: 'BENCH_CRASH',
			detail: 'worker terminated',
		})
	})

	it('maps the failure to a typed attempt incident', async () => {
		const outcome = await runInBench(
			() =>
				new Promise<string>((resolve) => {
					setTimeout(() => resolve('late'), 200)
				}),
			{ timeoutMs: 5 },
		)
		if (outcome.status !== 'technical_error')
			throw new Error('expected failure')
		expect(
			benchIncident(outcome, 'bench-1', '2026-10-28T10:00:00.000Z'),
		).toEqual({
			incidentId: 'bench-1',
			kind: 'timeout',
			detail: 'El banco superó el presupuesto de 5 ms.',
			occurredAt: '2026-10-28T10:00:00.000Z',
		})
	})

	it('uses the declared default budget', () => {
		expect(BENCH_DEFAULT_TIMEOUT_MS).toBe(2000)
	})
})
