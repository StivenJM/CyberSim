import type {
	DefinicionEscenario,
	Escenario,
} from '../shared/types/EscenarioTypes'
import { compileScenario } from './compileScenario'
import { defineScenario } from './defineScenario'

export function compileGeneratedScenario(
	definition: DefinicionEscenario,
): Escenario {
	return compileScenario(
		defineScenario(definition, {
			status: 'validated',
			revision: 1,
			engineVersion: 'ecs-1',
			assetCatalogVersion: 'built-in-1',
			seed: definition.id,
		}),
	)
}
