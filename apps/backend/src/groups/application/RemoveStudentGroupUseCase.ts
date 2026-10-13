import type { IGroupsRepository } from "../domain/repositories/IGroupsRepository.js";
import type { DeleteResult } from "../domain/models/Curso.js";

export class RemoveStudentGroupUseCase {
  constructor(private repo: IGroupsRepository) {}

  async execute(id_profesor: number, id_curso: number, id_estudiante: number): Promise<DeleteResult> {
    const curso = await this.repo.findCursoById(id_curso);

    if (!curso) {
      throw new Error("Curso no encontrado");
    }

    if (curso.id_profesor !== id_profesor) {
      throw new Error("No tienes permisos para modificar este curso");
    }

    return await this.repo.deleteMatricula(id_curso, id_estudiante);
  }
}
