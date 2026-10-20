import type { Progreso, ProgresoInput } from '../../domain/models/Progreso.js'
import type { IProgresoRepository } from '../../domain/repositories/IProgresoRepository.js'

export class GuardarProgresoUseCase {
	constructor(private repo: IProgresoRepository) {}

	async execute(payload: ProgresoInput): Promise<Progreso> {
		if (payload.tiempo !== null && payload.tiempo < 0) {
			throw new Error('El tiempo no puede ser negativo')
		}
		const hasRevision = payload.revision_escenario !== undefined
		const hasHash = payload.content_hash_escenario !== undefined
		if (hasRevision !== hasHash) {
			throw new Error(
				'La revisión y el hash del escenario deben enviarse juntos',
			)
		}

		// Guardar progreso
		return await this.repo.guardarProgresoEstudiante(payload)
	}
}
