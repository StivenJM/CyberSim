import { compileScenario, scenarioCatalog } from '../../scenarios'
import type {
	Escenario,
	EscenarioPreview,
} from '../../shared/types/EscenarioTypes'

export class NivelController {
	public getEscenarios(): EscenarioPreview[] {
		return scenarioCatalog.list().map((scenario) => ({
			id: scenario.id,
			slug: scenario.slug,
			titulo: scenario.titulo,
			descripcion: scenario.descripcion,
			categoria: scenario.categoria,
		}))
	}

	public cargarEscenario(idEscenario: number): Escenario | undefined {
		const scenario = scenarioCatalog.getById(idEscenario)
		if (scenario) return compileScenario(scenario)
	}
}
