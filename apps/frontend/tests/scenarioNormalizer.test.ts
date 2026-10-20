import { expect, it } from 'vitest'
import { normalizarZonas } from '../src/visual/features/agent-malvado/presentation/utils/scenarioNormalizer'

it.each([null, undefined])(
	'abre una topología generada con infoAdicional=%s sin inventar activos',
	(infoAdicional) => {
		const zones = [
			{
				oficinas: [
					{
						espacios: [
							{ dispositivos: [{ nombre: 'PC de práctica', activos: [] }] },
						],
					},
				],
			},
		]
		const events = [{ nombreEvento: 'Cierre', infoAdicional }]
		expect(normalizarZonas(zones, events)).toMatchObject([
			{
				oficinas: [
					{
						espacios: [
							{ dispositivos: [{ nombre: 'PC de práctica', activos: [] }] },
						],
					},
				],
			},
		])
	},
)
