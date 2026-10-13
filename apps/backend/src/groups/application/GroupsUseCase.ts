import type { Curso, CursoCreateInput, CursoUpdate, DeleteResult} from "../domain/models/Curso.js";
import type { IGroupsRepository } from "../domain/repositories/IGroupsRepository.js";

export class GroupsUseCase {
    constructor(private repo: IGroupsRepository) {}

    async createCurso(payload: CursoCreateInput): Promise<Curso>{
        return await this.repo.createCurso(payload)
    }

    async updateCurso(id: number, payload: CursoUpdate): Promise<Curso> {
        return await this.repo.updateCurso(id, payload);
    }

    async deleteCurso(id: number): Promise<DeleteResult> {
        return await this.repo.deleteCurso(id);
    }
}