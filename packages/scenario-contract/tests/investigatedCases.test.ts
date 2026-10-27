import { describe, expect, it } from 'vitest'

import {
	createScenarioManifest,
	INVESTIGATED_CASE_IDS,
	INVESTIGATED_CASES,
	SCENARIO_CAPABILITIES,
	validateInvestigatedCaseExtension,
	validateScenarioEnvelope,
} from '../src/index.js'

const definition = {
	id: 9,
	slug: 'andinapay-clave-expuesta',
	titulo: 'Clave expuesta en AndinaPay',
	categoria: 'Criptografía aplicada',
	descripcion: 'Reparar la custodia de claves sin perder la copia histórica.',
	zonas: [],
	fases: [{ id: 1, nombre: 'Diagnóstico' }],
	eventos: [],
	ataques: [],
	accionesEsperadas: [],
}

describe('investigated case registry', () => {
	it('keeps the previous capability defaults intact', () => {
		expect(SCENARIO_CAPABILITIES).toEqual(
			expect.arrayContaining([
				'asset-transfer',
				'attack-simulation',
				'digital-signature',
				'firewall',
				'hardening',
				'network-traffic',
				'phishing-email',
				'terminal',
				'vpn',
			]),
		)
	})

	it('registers exactly the five canonical cases with unique identities', () => {
		expect(Object.keys(INVESTIGATED_CASES)).toEqual([...INVESTIGATED_CASE_IDS])

		const slugs = new Set<string>()
		const capabilities = new Set<string>()
		const cwes = new Set<string>()
		for (const caseId of INVESTIGATED_CASE_IDS) {
			const definition = INVESTIGATED_CASES[caseId]
			expect(definition.id).toBe(caseId)
			expect(slugs.has(definition.slug)).toBe(false)
			expect(capabilities.has(definition.capability)).toBe(false)
			expect(cwes.has(definition.cwe)).toBe(false)
			slugs.add(definition.slug)
			capabilities.add(definition.capability)
			cwes.add(definition.cwe)
			expect(SCENARIO_CAPABILITIES).toContain(definition.capability)
		}
		expect(slugs.size).toBe(5)
	})

	it('keeps every closed list free of duplicates', () => {
		for (const caseId of INVESTIGATED_CASE_IDS) {
			const definition = INVESTIGATED_CASES[caseId]
			for (const list of [
				definition.operations,
				definition.controls,
				definition.verifiers,
				definition.fixtures,
				definition.aidSegments,
			]) {
				expect(new Set(list).size).toBe(list.length)
			}
			expect(definition.rubricDimensions).toEqual(['D1', 'D2', 'D3', 'D4'])
		}
	})

	it('accepts a narrowing extension and rejects identifiers the ficha never defined', () => {
		expect(
			validateInvestigatedCaseExtension({
				caseId: 'cwe-321-andinapay',
				form: 'A',
				operations: ['stage_key', 'commit_recovery'],
				verifiers: ['B1', 'Q1'],
			}),
		).toEqual({ ok: true, errors: [] })

		const rejected = validateInvestigatedCaseExtension({
			caseId: 'cwe-321-andinapay',
			form: 'A',
			operations: ['stage_key', 'eval_anything'],
			verifiers: ['B1', 'Q9'],
			fixtures: ['AP-H1', 'invented-fixture'],
		})

		expect(rejected.ok).toBe(false)
		expect(rejected.errors).toEqual(
			expect.arrayContaining([
				'exercise.operations[1]: unsupported identifier "eval_anything"',
				'exercise.verifiers[1]: unsupported identifier "Q9"',
				'exercise.fixtures[1]: unsupported identifier "invented-fixture"',
			]),
		)
	})

	it('rejects an unknown case, an unknown form and unknown extension fields', () => {
		const unknownCase = validateInvestigatedCaseExtension({
			caseId: 'cwe-999-invented',
			form: 'A',
		})
		expect(unknownCase).toEqual({
			ok: false,
			errors: [
				'exercise.caseId: unsupported investigated case "cwe-999-invented"',
			],
		})

		const unknownForm = validateInvestigatedCaseExtension({
			caseId: 'cwe-89-bibliotecaviva',
			form: 'Z',
		})
		expect(unknownForm.errors).toContain('exercise.form: unsupported form "Z"')

		const unknownField = validateInvestigatedCaseExtension({
			caseId: 'cwe-89-bibliotecaviva',
			form: 'A',
			arbitrarySql: 'SELECT 1',
		})
		expect(unknownField.errors).toContain(
			'exercise.arbitrarySql: unknown field',
		)
	})

	it('requires the case capability in the manifest that references it', () => {
		const withCapability = createScenarioManifest(definition, {
			revision: 1,
			status: 'draft',
			capabilities: ['crypto-key-rotation'],
			environment: { profile: 'office-3d', version: '1' },
			engineVersion: 'ecs-1',
			assetCatalogVersion: 'built-in-1',
			seed: 9,
		})
		const exercise = { caseId: 'cwe-321-andinapay', form: 'A' } as const

		expect(validateScenarioEnvelope({ ...withCapability, exercise })).toEqual({
			ok: true,
			errors: [],
		})

		const missingCapability = validateScenarioEnvelope({
			...withCapability,
			capabilities: ['firewall'],
			exercise,
		})
		expect(missingCapability.ok).toBe(false)
		expect(missingCapability.errors).toContain(
			'exercise.caseId: case "cwe-321-andinapay" requires capability "crypto-key-rotation"',
		)
	})
})
