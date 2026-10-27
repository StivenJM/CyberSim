import { EXERCISE_INDEX, runExercise } from '@cybersim/exercises'
import { INVESTIGATED_CASE_IDS } from '@cybersim/scenario-contract'
import { describe, expect, it } from 'vitest'

describe('exercises section', () => {
	it('lists exactly the five canonical investigated cases', () => {
		expect(EXERCISE_INDEX.map((entry) => entry.caseId)).toEqual([
			...INVESTIGATED_CASE_IDS,
		])
		for (const entry of EXERCISE_INDEX) {
			expect(entry.title.trim().length).toBeGreaterThan(0)
			expect(entry.summary.trim().length).toBeGreaterThan(0)
		}
	})

	it('verifies the initial state and the reference solution of every browser case', async () => {
		for (const entry of EXERCISE_INDEX) {
			const initial = await runExercise(entry.caseId, 'initial')
			const reference = await runExercise(entry.caseId, 'reference')

			if (entry.runtime === 'worker') {
				expect(initial.kind).toBe('unavailable')
				expect(reference.kind).toBe('unavailable')
				continue
			}

			if (initial.kind !== 'ok' || reference.kind !== 'ok') {
				throw new Error(`${entry.caseId}: el verificador no está disponible`)
			}
			expect(reference.report.B).toBe(true)
			expect(reference.report.Q).toBe(true)
			expect(reference.report.residualExposure).toBe(false)
			expect(initial.report.Q).toBe(false)
			expect(initial.report.checks.length).toBeGreaterThan(0)
		}
	})

	it('keeps the SQL bank explicitly unavailable instead of faking it', async () => {
		const result = await runExercise('cwe-89-bibliotecaviva', 'initial')
		expect(result.kind).toBe('unavailable')
		if (result.kind !== 'unavailable') return
		expect(result.reason).toContain('SQLite')
	})
})
