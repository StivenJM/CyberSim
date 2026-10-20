import type { Escenario } from '../shared/types/EscenarioTypes'
import type { ScenarioDefinition } from './defineScenario'
import { validateScenarioDefinition } from './validateScenario'

export function compileScenario(manifest: ScenarioDefinition): Escenario {
	const result = validateScenarioDefinition(manifest)
	if (!result.ok) {
		throw new Error(
			`Scenario "${manifest.slug}" cannot be compiled:\n- ${result.errors.join('\n- ')}`,
		)
	}
	return {
		...manifest,
		presupuestoInicial: manifest.presupuestoInicial ?? 0,
		redes: [],
	}
}
