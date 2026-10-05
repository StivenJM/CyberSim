import { generarCodigoConExpiracion } from "../domain/utils/CodeGenerator.js";
import type { IGroupsRepository } from "../domain/repositories/IGroupsRepository.js";
import type { Curso} from "../domain/models/Curso.js";

export class GenerateGroupCodeUseCase {
  constructor(private repo: IGroupsRepository) {}

  async execute(id_curso: number): Promise<Curso> {
    const { codigo_acceso, codigo_expira } = generarCodigoConExpiracion();

    return await this.repo.updateCursoCodigo(
      id_curso,
      codigo_acceso,
      codigo_expira
    );
  }
}
