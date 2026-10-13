import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js"
import type { EstudiantePublic } from "../../domain/models/Estudiante.js"

export class ObtenerEstudianteProfesorUseCase {
  constructor(private repo: IAuthRepository) {}

  async execute(id_profesor: number): Promise<EstudiantePublic[]> {
    // Validación
    if (!id_profesor || id_profesor <= 0) {
      throw new Error('ID de profesor inválido')
    }
    
    const estudiantes = await this.repo.findEstudiantesByProfesor(id_profesor)
    
    return estudiantes
  }
}
