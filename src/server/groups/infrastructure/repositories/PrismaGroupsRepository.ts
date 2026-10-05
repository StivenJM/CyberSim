import type { IGroupsRepository } from "../../domain/repositories/IGroupsRepository.js";
import type {
  Curso,
  CursoCreateInput,
  CursoUpdate,
  DeleteResult,
} from "../../domain/models/Curso.js";
import type {
  MatriculaInput,
  Matricula,
} from "../../domain/models/Matricula.js";
import { prisma } from "../../../auth/infrastructure/db/prisma.js";
import type { EstudiantePublic } from "../../../auth/domain/models/Estudiante.js";

export class PrismaGroupsRepository implements IGroupsRepository {
  async createCurso(data: CursoCreateInput): Promise<Curso> {
    const created = await prisma.curso.create({
      data: {
        id_profesor: data.id_profesor,
        nombre: data.nombre,
        codigo_acceso: null,
        codigo_expira: null,
      },
    });
    return created as Curso;
  }

  async updateCurso(id: number, data: CursoUpdate): Promise<Curso> {
    return (await prisma.curso.update({
      where: { id_curso: id },
      data,
    })) as Curso;
  }

  async deleteCurso(id: number): Promise<DeleteResult> {
    await prisma.curso.delete({
      where: { id_curso: id },
    });

    return {
      success: true,
      message: "Curso eliminado correctamente",
    };
  }

  async findCursoByCodigo(codigo: string): Promise<Curso | null> {
    return await prisma.curso.findUnique({
      where: { codigo_acceso: codigo },
    });
  }

  async existsMatricula(id_curso: number, id_estudiante: number) {
    const found = await prisma.matricula.findFirst({
      where: { id_curso, id_estudiante },
    });
    return !!found;
  }

  async hasAnyMatricula(id_estudiante: number): Promise<boolean> {
    const found = await prisma.matricula.findFirst({
      where: { id_estudiante },
    });
    return !!found;
  }

  async createMatricula(data: MatriculaInput): Promise<Matricula> {
    return (await prisma.matricula.create({ data })) as Matricula;
  }

  async updateCursoCodigo(
    id_curso: number,
    codigo_acceso: string,
    codigo_expira: Date
  ): Promise<Curso> {
    return (await prisma.curso.update({
      where: { id_curso },
      data: { codigo_acceso, codigo_expira },
    })) as Curso;
  }

  async deleteMatricula(
    id_curso: number,
    id_estudiante: number
  ): Promise<DeleteResult> {
    const deleted = await prisma.matricula.deleteMany({
      where: { id_curso, id_estudiante },
    });

    if (deleted.count === 0) {
      throw new Error("El estudiante no está matriculado en este curso");
    }

    return {
      success: true,
      message: "Matrícula eliminada correctamente",
    };
  }

  async findCursoById(id_curso: number): Promise<Curso | null> {
    return await prisma.curso.findUnique({
      where: { id_curso },
    });
  }

  async findCursosByEstudiante(id_estudiante: number): Promise<(Curso & { nombre_profesor: string })[]> {
    const matriculas = await prisma.matricula.findMany({
      where: { id_estudiante },
      include: {
        curso: {
          include: {
            profesor: {
              select: { primernombre: true, primer_apellido: true },
            },
          },
        },
      },
    });

    return matriculas.map((m) => ({
      id_curso: m.curso.id_curso,
      id_profesor: m.curso.id_profesor,
      nombre: m.curso.nombre,
      codigo_acceso: m.curso.codigo_acceso,
      codigo_expira: m.curso.codigo_expira,
      nombre_profesor: `${m.curso.profesor.primernombre} ${m.curso.profesor.primer_apellido}`,
    }));
  }

  async findCursosByProfesor(id_profesor: number): Promise<Curso[]> {
    return (await prisma.curso.findMany({
      where: { id_profesor },
      orderBy: { id_curso: "desc" },
    })) as Curso[];
  }

  async findEstudiantesByCurso(
    id_curso: number
  ): Promise<EstudiantePublic[]> {
    const matriculas = await prisma.matricula.findMany({
      where: { id_curso },
      include: {
        estudiante: {
          select: {
            id_estudiante: true,
            id_usuario_auth: true,
            codigo_unico: true,
            primernombre: true,
            segundo_nombre: true,
            primer_apellido: true,
            segundo_apellido: true,
            usuario_auth: {
              select: { correo_electronico: true },
            },
          },
        },
      },
    });

    return matriculas.map((m) => ({
      ...m.estudiante,
      correo_electronico: m.estudiante.usuario_auth?.correo_electronico ?? '',
      usuario_auth: undefined,
    }));
  }
}
