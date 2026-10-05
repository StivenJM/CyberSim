import type { ProgresoInput, Progreso} from "../../domain/models/Progreso.js"
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js"

export class GuardarProgresoUseCase {
  constructor(
    private repo: IProgresoRepository
  ) {}

  async execute(payload: ProgresoInput): Promise<Progreso> {

    if (payload.tiempo !== null && payload.tiempo < 0) {
      throw new Error('El tiempo no puede ser negativo')
    }

    // Guardar progreso 
    return await this.repo.guardarProgresoEstudiante(payload)
  }
}
