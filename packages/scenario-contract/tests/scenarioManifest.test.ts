import { describe, expect, it } from 'vitest'

import {
	computeScenarioContentHash,
	createScenarioManifest,
	SCENARIO_SCHEMA_VERSION,
	validateScenarioEnvelope,
} from '../src/index.js'

const definition = {
	id: 1,
	slug: 'secure-office',
	titulo: 'Secure office',
	categoria: 'Network security',
	descripcion: 'Protect the office network.',
	zonas: [],
	fases: [{ id: 1, nombre: 'Inspect the network' }],
	eventos: [],
	ataques: [],
	accionesEsperadas: [],
}

describe('scenario manifest contract', () => {
	it('computes the canonical SHA-256 fingerprint', () => {
		expect(computeScenarioContentHash('abc')).toBe(
			'sha256:6cc43f858fbb763301637b5af970e2a46b46f461f27e5a0f41e009c59b827b25',
		)
	})

	it('creates a reproducible published manifest', () => {
		const manifest = createScenarioManifest(definition, {
			revision: 3,
			status: 'published',
			capabilities: ['network-traffic', 'firewall'],
			environment: { profile: 'office-3d', version: '1' },
			engineVersion: '1',
			assetCatalogVersion: '1',
			seed: 42,
		})

		expect(manifest.schemaVersion).toBe(SCENARIO_SCHEMA_VERSION)
		expect(manifest.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/)
		expect(validateScenarioEnvelope(manifest)).toEqual({ ok: true, errors: [] })
	})

	it('rejects unsupported capabilities and environment profiles', () => {
		const result = validateScenarioEnvelope({
			...definition,
			schemaVersion: 1,
			revision: 1,
			status: 'published',
			capabilities: ['spreadsheet-training'],
			environment: { profile: 'generic-content', version: '1' },
			engineVersion: '1',
			assetCatalogVersion: '1',
			seed: 1,
			contentHash: `sha256:${'0'.repeat(64)}`,
		})

		expect(result.ok).toBe(false)
		expect(result.errors).toContain(
			'capabilities[0]: unsupported cybersecurity capability "spreadsheet-training"',
		)
		expect(result.errors).toContain(
			'environment.profile: unsupported environment profile "generic-content"',
		)
	})

	it('rejects mutable revisions and malformed identities', () => {
		const result = validateScenarioEnvelope({
			...definition,
			slug: 'Not Valid',
			schemaVersion: 99,
			revision: 0,
			status: 'published',
			capabilities: [],
			environment: { profile: 'office-3d', version: '1' },
			engineVersion: '1',
			assetCatalogVersion: '1',
			seed: 1,
			contentHash: 'invalid',
		})

		expect(result.ok).toBe(false)
		expect(result.errors).toEqual(
			expect.arrayContaining([
				'slug: must use lowercase kebab-case',
				'schemaVersion: unsupported version 99',
				'revision: must be a positive integer',
				'contentHash: must use the sha256:<64 hex characters> format',
			]),
		)
	})
})
