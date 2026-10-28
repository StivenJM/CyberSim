import {
	INVESTIGATED_CASE_IDS,
	INVESTIGATED_CASES,
} from '@cybersim/scenario-contract'
import { describe, expect, it } from 'vitest'

import {
	scenarioCatalog,
	validateScenarioDefinition,
} from '../src/scenarios/index.js'

describe('investigated exercise catalog', () => {
	it('publishes one manifest per canonical case', () => {
		const published = scenarioCatalog.list()
		for (const caseId of INVESTIGATED_CASE_IDS) {
			const definition = INVESTIGATED_CASES[caseId]
			const manifest = scenarioCatalog.getBySlug(definition.slug)
			expect(manifest, `missing ${definition.slug}`).toBeDefined()
			expect(manifest?.exercise?.caseId).toBe(caseId)
			expect(manifest?.exercise?.form).toBe('A')
			expect(manifest?.status).toBe('published')
			expect(manifest?.capabilities).toContain(definition.capability)
			expect(validateScenarioDefinition(manifest as never)).toEqual({
				ok: true,
				errors: [],
			})
		}
		expect(
			published.filter((manifest) => manifest.exercise !== undefined),
		).toHaveLength(INVESTIGATED_CASE_IDS.length)
	})

	it('keeps unique identities across the whole catalogue', () => {
		const all = scenarioCatalog.listAll()
		const ids = all.map((manifest) => manifest.id)
		const slugs = all.map((manifest) => manifest.slug)
		expect(new Set(ids).size).toBe(ids.length)
		expect(new Set(slugs).size).toBe(slugs.length)
	})
})
