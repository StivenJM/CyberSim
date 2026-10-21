import { describe, expect, it } from 'vitest'
import { readinessFrom } from '../src/integrations/health.js'

const base = { database: 'ready', coordinator: 'ready' }

describe('readinessFrom', () => {
	it('declara listo cuando la base y la coordinación están disponibles', () => {
		expect(readinessFrom(base)).toMatchObject({ ready: true, state: 'ready' })
	})

	it('no declara listo si la base no está disponible', () => {
		expect(readinessFrom({ ...base, database: 'unavailable' })).toMatchObject({
			ready: false,
			state: 'not_ready',
		})
	})

	it('no declara listo si la coordinación está en mantenimiento', () => {
		expect(readinessFrom({ ...base, coordinator: 'paused' })).toMatchObject({
			ready: false,
			state: 'not_ready',
		})
	})

	it('sigue listo cuando una dependencia opcional está degradada', () => {
		expect(
			readinessFrom({
				...base,
				qdrant: 'unavailable',
				piper: 'unavailable',
				openai: 'requires_configuration',
				smtp: 'requires_configuration',
				verification: 'pending',
			}),
		).toMatchObject({ ready: true, state: 'ready' })
	})

	it('no declara listo si faltan los componentes obligatorios', () => {
		expect(readinessFrom({})).toMatchObject({
			ready: false,
			state: 'not_ready',
		})
	})
})
