import { describe, expect, it } from 'vitest'

import {
	compileGeneratedScenario,
	compileScenario,
	scenarioCatalog,
	validateScenarioDefinition,
} from '../src/scenarios/index.js'

describe('scenario catalog', () => {
	it('contains only unique, valid and published manifests', () => {
		const ids = scenarioCatalog.list().map((scenario) => scenario.id)
		const slugs = scenarioCatalog.list().map((scenario) => scenario.slug)

		expect(new Set(ids).size).toBe(ids.length)
		expect(new Set(slugs).size).toBe(slugs.length)
		for (const scenario of scenarioCatalog.list()) {
			expect(scenario.status).toBe('published')
			expect(validateScenarioDefinition(scenario)).toEqual({
				ok: true,
				errors: [],
			})
		}
	})

	it('resolves the same manifest by id and slug', () => {
		for (const scenario of scenarioCatalog.list()) {
			expect(scenarioCatalog.getById(scenario.id)).toBe(scenario)
			expect(scenarioCatalog.getBySlug(scenario.slug)).toBe(scenario)
		}
	})

	it('compiles a valid manifest into the existing ECS input contract', () => {
		const manifest = scenarioCatalog.list()[0]
		const compiled = compileScenario(manifest)

		expect(compiled.slug).toBe(manifest.slug)
		expect(compiled.zonas).toBe(manifest.zonas)
		expect(compiled.fases).toBe(manifest.fases)
	})

	it('uses the canonical compiler for generated scenarios', () => {
		const source = scenarioCatalog.list()[0]
		const generated = compileGeneratedScenario({
			...source,
			id: 777,
			slug: 'ai-generated-scenario',
			titulo: 'Generated security challenge',
			categoria: 'Generated cybersecurity scenario',
		})

		expect(generated.status).toBe('validated')
		expect(generated.slug).toBe('ai-generated-scenario')
		expect(generated.contentHash).toMatch(/^sha256:/)
	})

	it('rejects broken device and phase references', () => {
		const scenario = structuredClone(scenarioCatalog.list()[0])
		scenario.eventos[0].fase = 999
		scenario.ataques.push({
			nombreAtaque: 'Broken target',
			tiempoNotificacion: 1,
			tipoAtaque: 'Infección de troyano',
			dispositivoAAtacar: 'missing-device',
			descripcion: 'Invalid reference',
			fase: scenario.fases[0].id,
			condicionMitigacion: {
				accion: 'click',
				objeto: 'configuración de workstation',
				val: [],
			},
		})

		const result = validateScenarioDefinition(scenario)

		expect(result.ok).toBe(false)
		expect(result.errors).toEqual(
			expect.arrayContaining([
				'eventos[0].fase: unknown phase 999',
				'ataques[0].dispositivoAAtacar: unknown device "missing-device"',
			]),
		)
	})

	it('rejects scenarios without phases through the public compiler', () => {
		const scenario = structuredClone(scenarioCatalog.list()[0])
		scenario.fases = []
		scenario.eventos = []
		scenario.ataques = []

		expect(() => compileScenario(scenario)).toThrow(
			'fases: must contain at least one phase',
		)
	})

	it('rejects unsupported event types through the public compiler', () => {
		const scenario = structuredClone(scenarioCatalog.list()[0])
		;(scenario.eventos[0] as { tipoEvento: string }).tipoEvento =
			'UNSUPPORTED_EVENT'

		expect(() => compileScenario(scenario)).toThrow(
			'eventos[0].tipoEvento: unsupported event type "UNSUPPORTED_EVENT"',
		)
	})
})
