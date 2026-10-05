import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js"
import type { ProgresoConNombreEscenario } from "../../domain/models/Progreso.js"

export class ObtenerTodosProgresosUseCase {
  constructor(private repo: IProgresoRepository) {}

  async execute(idEstudiante: number): Promise<ProgresoConNombreEscenario[]> {
    return await this.repo.getTodosProgresosEstudiante(idEstudiante)
  }
}
