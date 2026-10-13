import type {
  Curso,
  CursoCreateInput,
  CursoUpdate,
  DeleteResult,
} from "../models/Curso.js";
import type { MatriculaInput, Matricula } from "../models/Matricula.js";
import type { EstudiantePublic } from "../../../auth/domain/models/Estudiante.js";

export interface IGroupsRepository {
  createCurso(data: CursoCreateInput): Promise<Curso>;
  updateCurso(id: number, data: CursoUpdate): Promise<Curso>;
  deleteCurso(id: number): Promise<DeleteResult>;

  findCursoByCodigo(codigo: string): Promise<Curso | null>;
  existsMatricula(id_curso: number, id_estudiante: number): Promise<boolean>;
  hasAnyMatricula(id_estudiante: number): Promise<boolean>;
  createMatricula(data: MatriculaInput): Promise<Matricula>;
  updateCursoCodigo(
    id_curso: number,
    codigo_acceso: string,
    codigo_expira: Date
  ): Promise<Curso>;
  deleteMatricula(
    id_curso: number,
    id_estudiante: number
  ): Promise<DeleteResult>;
  findCursoById(id_curso: number): Promise<Curso | null>;
  findCursosByProfesor(id_profesor: number): Promise<Curso[]>;
  findCursosByEstudiante(id_estudiante: number): Promise<(Curso & { nombre_profesor: string })[]>;
  findEstudiantesByCurso(id_curso: number): Promise<EstudiantePublic[]>;
}
