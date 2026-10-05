import type { PrismaClient } from '../../../../generated/prisma/index.js';
import type { IFeedbackPersistenceRepository } from '../../domain/repositories/IFeedbackPersistenceRepository.js';
import type { FeedbackResponse } from '../../domain/models/Feedback.js';

export class PrismaFeedbackPersistenceRepository implements IFeedbackPersistenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(
    idEstudiante: number,
    slugEscenario: string,
    feedback: FeedbackResponse,
    numIntentos: number
  ): Promise<void> {
    await this.prisma.retroalimentacion_estudiante.create({
      data: {
        id_estudiante: idEstudiante,
        slug_escenario: slugEscenario,
        analisis: feedback.analisis,
        fortaleza: feedback.fortaleza,
        area_mejora: feedback.area_mejora,
        consejo: feedback.consejo,
        num_intentos_al_generar: numIntentos,
      },
    });
  }

  async getNumIntentosAlGenerar(idEstudiante: number, slugEscenario: string): Promise<number | null> {
    const lastFeedback = await this.prisma.retroalimentacion_estudiante.findFirst({
      where: {
        id_estudiante: idEstudiante,
        slug_escenario: slugEscenario,
      },
      orderBy: {
        fecha: 'desc',
      },
      select: {
        num_intentos_al_generar: true,
      },
    });

    return lastFeedback ? lastFeedback.num_intentos_al_generar : null;
  }

  async debeHabilitar(idEstudiante: number, slugEscenario: string, intentosActuales: number): Promise<boolean> {
    const numIntentosGenerar = await this.getNumIntentosAlGenerar(idEstudiante, slugEscenario);
    
    if (numIntentosGenerar === null) {
      return true; // Si no hay feedback previo, se debe habilitar siempre.
    }

    // Se habilita solo si el número de intentos actuales es mayor que cuando se generó el último feedback.
    return intentosActuales > numIntentosGenerar;
  }

  async getLatestFeedback(idEstudiante: number, slugEscenario: string): Promise<FeedbackResponse | null> {
    const lastFeedback = await this.prisma.retroalimentacion_estudiante.findFirst({
      where: {
        id_estudiante: idEstudiante,
        slug_escenario: slugEscenario,
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    if (!lastFeedback) return null;

    return {
      analisis: lastFeedback.analisis,
      fortaleza: lastFeedback.fortaleza,
      area_mejora: lastFeedback.area_mejora,
      consejo: lastFeedback.consejo,
    };
  }
}
