import { describe, expect, it } from 'vitest'

import type { EscenarioPreview } from '../src/shared/types/EscenarioTypes'
import type { ProgresoEscenario } from '../src/visual/features/escenarios-simulados/contexts/ProgresoEstudianteContext'
import {
	estadoDeEscenario,
	resumenProgreso,
} from '../src/visual/features/escenarios-simulados/utils/progresoCurso.js'

function escenario(slug: string): EscenarioPreview {
	return {
		id: slug.length,
		slug,
		titulo: slug,
		descripcion: `${slug} description`,
		categoria: 'general',
	}
}

function intento(
	slug: string,
	terminado: boolean,
	numero = 1,
): ProgresoEscenario {
	return {
		id_progreso: numero,
		id_estudiante: 1,
		slug_escenario: slug,
		nombre_escenario: slug,
		terminado,
		tiempo: terminado ? 120 : null,
	}
}

describe('estadoDeEscenario', () => {
	it('stays available while the student has no attempts on that scenario', () => {
		expect(estadoDeEscenario('a', [intento('b', true)])).toBe('available')
	})

	it('is active when the scenario only has unfinished attempts', () => {
		expect(estadoDeEscenario('a', [intento('a', false)])).toBe('active')
	})

	it('is done when any attempt was finished, even after earlier misses', () => {
		expect(
			estadoDeEscenario('a', [intento('a', false, 1), intento('a', true, 2)]),
		).toBe('done')
	})
})

describe('resumenProgreso', () => {
	it('reports every scenario as pending when nothing was attempted', () => {
		expect(resumenProgreso([escenario('a'), escenario('b')], [])).toEqual({
			completados: 0,
			enProgreso: 0,
			pendientes: 2,
			total: 2,
			porcentaje: 0,
		})
	})

	it('counts each scenario once and rounds the percentage', () => {
		const resumen = resumenProgreso(
			[escenario('a'), escenario('b'), escenario('c')],
			[intento('a', true, 1), intento('b', false, 2)],
		)

		expect(resumen).toEqual({
			completados: 1,
			enProgreso: 1,
			pendientes: 1,
			total: 3,
			porcentaje: 33,
		})
	})

	it('ignores attempts for scenarios outside the catalogue', () => {
		expect(
			resumenProgreso([escenario('a')], [intento('retirado', true)]),
		).toEqual({
			completados: 0,
			enProgreso: 0,
			pendientes: 1,
			total: 1,
			porcentaje: 0,
		})
	})

	it('keeps the percentage at zero for an empty catalogue', () => {
		expect(resumenProgreso([], [])).toEqual({
			completados: 0,
			enProgreso: 0,
			pendientes: 0,
			total: 0,
			porcentaje: 0,
		})
	})
})
