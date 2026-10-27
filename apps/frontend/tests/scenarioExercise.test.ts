import { describe, expect, it } from 'vitest'

import {
	defineScenario,
	validateScenarioDefinition,
} from '../src/scenarios/index.js'

const definition = {
	id: 11,
	slug: 'andinapay-clave-expuesta',
	titulo: 'Clave expuesta en AndinaPay',
	categoria: 'Criptografía aplicada',
	descripcion: 'Reparar la custodia de claves sin perder la copia histórica.',
	presupuestoInicial: 0,
	zonas: [],
	fases: [{ id: 1, nombre: 'Diagnóstico', completada: false, objetivos: [] }],
	eventos: [],
	ataques: [],
	accionesEsperadas: [],
	apps: [],
} as unknown as Parameters<typeof defineScenario>[0]

describe('investigated scenario definition', () => {
	it('adds the closed capability of the referenced case', () => {
		const scenario = defineScenario(definition, {
			status: 'published',
			exercise: { caseId: 'cwe-321-andinapay', form: 'A' },
		})

		expect(scenario.capabilities).toContain('crypto-key-rotation')
		expect(validateScenarioDefinition(scenario)).toEqual({
			ok: true,
			errors: [],
		})
		expect(scenario.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/)
	})

	it('rejects exercise operations that the ficha never defined', () => {
		const scenario = defineScenario(definition, {
			status: 'published',
			exercise: {
				caseId: 'cwe-321-andinapay',
				form: 'A',
				operations: ['stage_key', 'drop_database'],
			},
		})

		const result = validateScenarioDefinition(scenario)
		expect(result.ok).toBe(false)
		expect(result.errors).toContain(
			'exercise.operations[1]: unsupported identifier "drop_database"',
		)
	})

	it('keeps legacy definitions free of exercise metadata', () => {
		const scenario = defineScenario(definition, { status: 'published' })

		expect(scenario.exercise).toBeUndefined()
		expect(validateScenarioDefinition(scenario)).toEqual({
			ok: true,
			errors: [],
		})
	})
})
