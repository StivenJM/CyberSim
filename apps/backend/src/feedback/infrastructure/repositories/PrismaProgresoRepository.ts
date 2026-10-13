import type { PrismaClient } from '../../../generated/prisma/index.js';
import type { IProgresoRepository } from '../../domain/repositories/IProgresoRepository.js';

export class PrismaProgresoRepository implements IProgresoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async countByEstudianteYEscenario(idEstudiante: number, slugEscenario: string): Promise<number> {
    return this.prisma.progreso.count({
      where: {
        id_estudiante: idEstudiante,
        slug_escenario: slugEscenario,
      },
    });
  }
}
