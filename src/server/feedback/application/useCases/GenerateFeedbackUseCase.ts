import type { IFeedbackRepository } from "../../domain/repositories/IFeedbackRepository.js";
import type { IFeedbackPersistenceRepository } from "../../domain/repositories/IFeedbackPersistenceRepository.js";
import type { IProgresoRepository } from "../../domain/repositories/IProgresoRepository.js";
import type { FeedbackPayload, FeedbackResponse } from "../../domain/models/Feedback.js";

export class GenerateFeedbackUseCase {
  constructor(
    private readonly feedbackRepository: IFeedbackRepository,
    private readonly feedbackPersistenceRepository: IFeedbackPersistenceRepository,
    private readonly progresoRepository: IProgresoRepository
  ) {}

  async execute(payload: FeedbackPayload): Promise<FeedbackResponse> {
    if (!payload.id_estudiante || !payload.slug_escenario) {
      throw new Error('id_estudiante y slug_escenario son requeridos');
    }

    const intentosActuales = await this.progresoRepository.countByEstudianteYEscenario(
      payload.id_estudiante,
      payload.slug_escenario
    );

    const feedback = await this.feedbackRepository.generateFeedback(payload);

    await this.feedbackPersistenceRepository.save(
      payload.id_estudiante,
      payload.slug_escenario,
      feedback,
      intentosActuales
    );

    return feedback;
  }
}
