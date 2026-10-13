import type { IGroupsRepository } from "../domain/repositories/IGroupsRepository.js";
import type { DeleteResult } from "../domain/models/Curso.js";

export class LeaveGroupUseCase {
  constructor(private repo: IGroupsRepository) {}

  async execute(
    id_curso: number,
    id_estudiante: number
  ): Promise<DeleteResult> {

    const exists = await this.repo.existsMatricula(id_curso, id_estudiante);
    if (!exists) {
      throw new Error("No estás matriculado en este curso");
    }

    return await this.repo.deleteMatricula(id_curso, id_estudiante);
  }
}