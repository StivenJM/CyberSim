import type { IFeedbackPersistenceRepository } from '../../domain/repositories/IFeedbackPersistenceRepository.js';
import type { IProgresoRepository } from '../../domain/repositories/IProgresoRepository.js';
import type { FeedbackResponse } from '../../domain/models/Feedback.js';

export class CheckFeedbackStatusUseCase {
  constructor(
    private readonly feedbackPersistenceRepository: IFeedbackPersistenceRepository,
    private readonly progresoRepository: IProgresoRepository
  ) {}

  async execute(idEstudiante: number, slugEscenario: string): Promise<{
    habilitado: boolean;
    intentosActuales: number;
    intentosAlGenerar: number | null;
    ultimaRetroalimentacion: FeedbackResponse | null;
  }> {
    const intentosActuales = await this.progresoRepository.countByEstudianteYEscenario(
      idEstudiante,
      slugEscenario
    );

    const habilitado = await this.feedbackPersistenceRepository.debeHabilitar(
      idEstudiante,
      slugEscenario,
      intentosActuales
    );

    const intentosAlGenerar = await this.feedbackPersistenceRepository.getNumIntentosAlGenerar(
      idEstudiante, 
      slugEscenario
    );

    const ultimaRetroalimentacion = await this.feedbackPersistenceRepository.getLatestFeedback(
      idEstudiante,
      slugEscenario
    );

    return {
      habilitado,
      intentosActuales,
      intentosAlGenerar,
      ultimaRetroalimentacion
    };
  }
}
